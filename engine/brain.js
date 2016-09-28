'use strict';
//Toogle debugging on RiveScript object when you need to debug
const
    constants = require('./constants'),
    flipkart = require('../features/flipkart'),
    location = require('../features/location'),
    recharge = require('../features/recharge'),
    RiveScript = require('rivescript'),
    utils = require('./utils'),
    weather = require('../features/weather');

let b = {
    brainPath: './brain/',
    brainLoaded: false,
    rs: new RiveScript({ debug: false, utf8: true, onDebug: this.onDebug }),

    isBrainLoaded: function () {
        return b.brainLoaded;
    },

    setBrainLoaded: function (loaded) {
        b.brainLoaded = loaded;
    },

    loadBrain: function (userId, session) {
        b.rs.loadDirectory(b.brainPath,
            (batchNumber) => {
                b.onLoadSuccessful(userId, session)
            },
            (error, batchNumber) => {
                b.onLoadFailed(error, batchNumber, session);
            });
    },

    onDebug: function (message) {
        //print all the triggers on the console
    },

    onLoadSuccessful: function (userId, session) {
        b.brainLoaded = true;
        b.initSubroutines(userId, session)
        b.rs.sortReplies();
        b.fetchReply(userId, session);
    },

    initSubroutines: function (userId, session) {
        flipkart.init(b.rs, userId, session);
        location.init(b.rs, userId, session);
        recharge.init(b.rs, userId, session);
        weather.init(b.rs, userId, session);
    },

    onLoadFailed: function (error, batchNumber, session) {
        b.brainLoaded = false;
        console.log(error);
        session.send(utils.sendRandomMessage(constants.ERROR_LOADING_BRAIN));
    },

    /*
    Location attachments from Facebook are currently found under entities
    session.message.entities[ { geo: 
     { elevation: 0,
       latitude: 19.05646514892578,
       longitude: 72.90384674072266,
       type: 'GeoCoordinates' },
    type: 'Place' } ]
    
    */
    fetchReply: function (userId, session) {
        if (utils.isFacebook(session) && utils.isFacebookGeolocation(session)) {
            b.handleFacebookGeolocation(userId, session, entities[0].geo.latitude, entities[0].geo.longitude);
        }
        else {
            session.sendTyping();
            b.rs.replyAsync(userId, session.message.text, b.this)
                .then(function (reply) {
                    session.send(reply);
                }).catch(function (error) {
                    // something went wrong
                    if(error && error.ignore){
                        //things that we want to ignore such as quick replies
                    }
                    else{
                        console.log(error);
                    }
                    
                });
        }
    },

    handleFacebookGeolocation: function (userId, session, lat, lon) {
        //Get the channel such as facebook, skype, slack etc
        let channelId = session.message.address.channelId
        //Get the entities sent by the user if any
        let entities = session.message.entities;
        let topic = b.rs.getUservar(userId, 'topic');
        if (topic === 'weather') {
            weather.handleUploadedFacebookGeolocation(b.rs, userId, session, lat, lon)
        }
        else {
            //what to with location when none of the topics are on
        }
    },

    getUservars: function (userId) {
        return b.rs.getUservars(userId);
    }
}

module.exports = b;