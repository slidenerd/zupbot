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
    }
}

module.exports = utils;