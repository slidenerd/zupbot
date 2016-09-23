'use strict';

const
    constants =require('./constants'), 
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

    loadBrain: function (session) {
        b.rs.loadDirectory(b.brainPath,
            (batchNumber) => {
                b.onLoadSuccessful(session)
            },
            (error, batchNumber) => {
                b.onLoadFailed(error, batchNumber, session);
            });
        session.endDialog();
    },

    onDebug: function (message) {
        //print all the triggers on the console
    },

    onLoadSuccessful: function (session) {
        b.brainLoaded = true;
        b.initSubroutines(session)
        b.rs.sortReplies(session);
        b.fetchReply(session);
    },

    initSubroutines: function (session) {
        weather.init(b.rs, session);
        flipkart.init(b.rs, session);
        recharge.init(b.rs, session);
    },

    onLoadFailed: function (error, batchNumber, session) {
        b.brainLoaded = false;
        console.log(error);
        session.send(utils.sendRandomMessage(constants.ERROR_LOADING_BRAIN));
    },

    fetchReply: function (session) {
        session.sendTyping();
        b.rs.replyAsync(session.userData.user.name, session.message.text, b.this)
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