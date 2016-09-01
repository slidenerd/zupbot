'use strict';
const 
    geo = require('../features/geo'),
    RiveScript = require('rivescript'),
    weather = require('../features/weather');

const weatherTrigger = 'weatherreport31eaf2426f3411e68b7786f30ca893d3';
let rs = new RiveScript({debug: true, utf8: true, onDebug: debugHandler});

function initSubroutines(session){
  initWeatherSubroutine(session);
}

function initWeatherSubroutine(session){
  rs.setSubroutine("getWeather", (rs, args)=>{
    return new rs.Promise((resolve, reject)=>{
      geo.getLocationDetails(args[0])
          .then((cities)=>{
              return weather.findWeather(cities[0].lat, cities[0].lon);
          })
          .then((weatherReport)=>{
            rs.setUservars(session.userData.user.id, weatherReport)
            rs.setUservar(session.userData.user.id,'degreesymbol', '\u00B0')
            let reply = rs.reply(session.userData.user.id, weatherTrigger, this);
            resolve(reply);
          })
          .catch((error)=>{
            reject(error);
          })
        });
    });
}

function debugHandler(message){
    //do something to print rivescript logs
}

let engine = {
    initSubroutines: initSubroutines,
    engine:           rs
}
module.exports = engine;