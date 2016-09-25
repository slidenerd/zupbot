'use strict';

const
    constants = require('./constants'),
    flipkart = require('../features/flipkart'),
    RiveScript = require('rivescript'),
    recharge = require('../features/recharge'),
    utils = require('./utils'),
    weather = require('../features/weather');

let b = {
    brainPath: './brain/',
    brainLoaded: false,
    rs: new RiveScript({ debug: true, utf8: true, onDebug: this.onDebug }),

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
        session.endDialog();
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
        weather.init(b.rs, userId, session);
        flipkart.init(b.rs, userId, session);
        recharge.init(b.rs, userId, session);
    },

    onLoadFailed: function (error, batchNumber, session) {
        b.brainLoaded = false;
        console.log(error);
        session.send(utils.sendRandomMessage(constants.ERROR_LOADING_BRAIN));
    },

    fetchReply: function (userId, session) {
        if (!b.handlePlatformSpecificEntities(userId, session)) {
            session.sendTyping();
            b.rs.replyAsync(userId, session.message.text, b.this)
                .then(function (reply) {
                    session.send(reply);
                }).catch(function (error) {
                    // something went wrong
                    console.log(error);
                });
        }
    },

    handlePlatformSpecificEntities: function (userId, session) {
        //Get the channel such as facebook, skype, slack etc
        let channelId = session.message.address.channelId
        //Get the entities sent by the user if any
        let entities = session.message.entities;
        if (channelId.toLowerCase() === 'facebook') {
            /*
            Location attachments from Facebook are currently found under entities
            session.message.entities[ { geo: 
             { elevation: 0,
               latitude: 19.05646514892578,
               longitude: 72.90384674072266,
               type: 'GeoCoordinates' },
            type: 'Place' } ]
            
            */
            if (entities
                && entities.length
                && entities[0]
                && entities[0].geo
                && entities[0].geo.latitude
                && entities[0].geo.longitude
                && entities[0].type.toLowerCase() === 'place') {
                b.handleFacebookGeolocation(userId, session, entities[0].geo.latitude, entities[0].geo.longitude);
                return true;
            }
        }
        return false;
    },
    handleFacebookGeolocation: function (userId, session, lat, lon) {
        //Get the channel such as facebook, skype, slack etc
        let channelId = session.message.address.channelId
        //Get the entities sent by the user if any
        let entities = session.message.entities;
        let topic = b.rs.getUservar(userId, 'topic');
        if (topic === 'weather') {
            session.send('topic is weather');
        }
        else if (topic === 'deals') {
            session.send('topic is deals');
        }
        else if (topic === 'recharge') {
            session.send('topic is deals');
        }
        else {
            session.send('no topic is going on currently');
        }
    },

    getUservars: function (userId) {
        return b.rs.getUservars(userId);
    }
}

module.exports = b;