'use strict';

let utils = {
    sendRandomMessage: function (messages) {
        return messages[getRandomInt(0, messages.length - 1)];
    },

    /**
     * Returns a random integer between min (inclusive) and max (inclusive)
     * Using Math.round() will give you a non-uniform distribution!
     */
    getRandomInt: function () {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    isFacebook: function(session){
        return session.message.address.channelId.toLowerCase() === 'facebook'
    },

    isFacebookGeolocation: function(session){
        //Get the entities sent by the user if any
        let entities = session.message.entities;
        return entities
                && entities.length
                && entities[0]
                && entities[0].geo
                && entities[0].geo.latitude
                && entities[0].geo.longitude
                && entities[0].type.toLowerCase() === 'place'
    },

    isEmulator: function(session){
        return session.message.address.channelId.toLowerCase() === 'emulator'
    },

    isSlack: function(session){
        return session.message.address.channelId.toLowerCase() === 'slack'
    },

    isSkype: function(session){
        return session.message.address.channelId.toLowerCase() === 'skype'
    },

    isKik: function(session){
        return session.message.address.channelId.toLowerCase() === 'kik'
    },

    isTelegram: function(session){
        return session.message.address.channelId.toLowerCase() === 'telegram'
    }
}

module.exports = utils;