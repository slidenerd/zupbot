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
        session.endDialog();
    },

    handleLocation: function (userId, session, lat, lon) {
        let topic = b.rs.getUservar(userId, 'topic');
        if (topic === 'weather') {
            console.log('topic is weather');
            return true;
        }
        else if (topic === 'flipkart') {
            console.log('topic is flipkart');
            return true;
        }
        else if (topic === 'recharge') {
            console.log('topic is deals');
            return true;
        }
        else {
            console.log('no topic is going on currently');
        }
        return false;
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
        session.sendTyping();
        b.rs.replyAsync(userId, session.message.text, b.this)
            .then(function (reply) {
                session.send(reply);
            }).catch(function (error) {
                // something went wrong
                console.log(error);
            });
    },

    getUservars: function (userId) {
        return b.rs.getUservars(userId);
    }
}

module.exports = b;