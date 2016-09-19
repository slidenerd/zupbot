'use strict';

const
    deals = require('../features/finddeals'),
    RiveScript = require('rivescript'),
    recharge = require('../features/recharge'),
    weather = require('../features/weather');

let b = {
    brainPath: './brain/',
    brainLoaded: false,
    rs: new RiveScript({debug: true, utf8: true, onDebug: this.onDebug}),
    
    isBrainLoaded: function(){
        return b.brainLoaded;
    },

    setBrainLoaded: function(loaded){
        b.brainLoaded = loaded;
    },

    loadBrain: function(session){
        b.rs.loadDirectory(b.brainPath, 
            (batchNumber) => {
                b.onLoadSuccessful(session)
                }, 
            (error, batchNumber)=>{
                b.onLoadFailed(error, batchNumber, session); 
            });
        session.endDialog();
    },

    onDebug: function(message){

    },

    onLoadSuccessful: function(session){
        b.brainLoaded = true;
        b.initSubroutines(session)
        b.rs.sortReplies(session);
        b.fetchReply(session);
    },

    initSubroutines: function(session){
        weather.init(b.rs, session);
        deals.init(b.rs, session);
        recharge.init(b.rs, session);
    },

    onLoadFailed: function(error, batchNumber, session){
        b.brainLoaded =false;
        console.log(error);
        session.send('Oops, my brain blew up, I am not sure why but I guess my creator knows.');
    },

    fetchReply: function(session){
        session.sendTyping();
        b.rs.replyAsync(session.userData.user.name, session.message.text, b.this)
        .then(function(reply) {
            session.send(reply);    
        }).catch(function(error){
            // something went wrong
            console.log(error);
        }); 
    }
}

module.exports = b;