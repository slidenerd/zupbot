'use strict';
const 
    errorCodes = require('./error'),
    geo = require('../features/geo'),
    RiveScript = require('rivescript'),
    weather = require('../features/weather');

const 
    //To change the value of the topic programmatically from code to weather
    topicWeather = {key: 'topic', value: 'weather'},

    //The name of the subroutine that can find the weather
    weatherSubroutine = 'getWeather',

    //The name of the rive trigger to invoke while displaying results
    weatherTrigger = 'jsweather';

let rs = new RiveScript({debug: true, utf8: true, onDebug: debugHandler});

function initSubroutines(session){
  initWeatherSubroutine(session);
}

function initWeatherSubroutine(session){
  rs.setSubroutine(weatherSubroutine, (rs, args)=>{
    return new rs.Promise((resolve, reject)=>{
      geo.getLocationDetails(args[0])
          .then((cities)=>{
            return weather.findWeather(cities[0].lat, cities[0].lon);
          })
          .then((weatherReport)=>{
            //Save the user input location so that we can show it in the response
            weatherReport.location = args[0]
            //Change the topic to weather
            rs.setUservar(session.userData.user.id, topicWeather.key, topicWeather.value)
            rs.setUservars(session.userData.user.id, weatherReport)
            let reply = rs.reply(session.userData.user.id, weatherTrigger, this);
            resolve(reply);
          })
          .catch((error)=>{
            handleError(error, session)
            reject(error);
          })
        });
    });
}

function handleError(error, session){
    if(error && error.code){
        switch(error.code){
            case errorCodes.cityNotFound:
                session.send('Could not find the city');
                break;
            case errorCodes.cityLookupFailed:
                session.send('network issue while searching city');
                break;
            case errorCodes.weatherLookupFailed:
                session.send('Could not find weather');
                break;
            case errorCodes.weatherNotFound:
                break;
        }
    }
}

function debugHandler(message){
    //do something to print rivescript logs
}

let engine = {
    initSubroutines:        initSubroutines,
    engine:                 rs
}
module.exports = engine;