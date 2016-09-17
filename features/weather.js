'use strict';

const
	errorCodes = require('../engine/error'),
	geo = require('./geo'),
	request = require('request'),
	//The name of the subroutine that can find the weather
	topicWeather = {key: 'topic', value: 'weather'},
    weatherSubroutine = 'getWeather',

	//The name of the rive trigger to invoke while displaying results
    weatherTrigger = 'jsweather';

function findWeather(lat, lon){
	return new Promise((resolve, reject)=>{
		request({
			url: 'http://api.openweathermap.org/data/2.5/weather', //URL to hit
			qs: {
				lat: lat, 
				lon: lon,
				units: 'metric',
				appid: '353263113c293de88e214ced88de05a7'
			}, //Query string data
			headers: {'Accept':'application/json'},
			json: true
		}, function(error, response, body){
			if(error) {
				reject({error: error, code: errorCodes.weatherLookupFailed});
			} else {
				let report = parseWeather(body);
				resolve(report);
			}
		});
	});
}

function parseWeather(json){
	if(json.coord 
	&& json.coord.lat
	&& json.coord.lon
	&& json.weather
	&& json.weather.length
	&& json.weather[0]
	&& json.weather[0].description
	&& json.main
	&& json.main.temp
	&& json.wind
	&& json.clouds
	&& json.sys){
	return {
			lat: json.coord.lat,
			lon: json.coord.lon,
			main: json.weather[0].main,
			description: json.weather[0].description,
			temperature: json.main.temp.toFixed(0),
			pressure: json.main.pressure,
			humidity: json.main.humidity,
			seaLevel: json.main.sea_level,
			groundLevel: json.main.grnd_level,
			windSpeed: json.wind.speed,
			windDegree: json.wind.deg,
			clouds: json.clouds.all,
			dt: json.dt,
			countryCode: json.sys.country,
			sunrise: json.sys.sunrise,
			sunset: json.sys.sunset
		}
	}
	
}

function initSubroutine(rs, session){
  rs.setSubroutine(weatherSubroutine, (rs, args)=>{
    return new rs.Promise((resolve, reject)=>{
      geo.getLocationDetails(args[0])
          .then((cities)=>{
            return findWeather(cities[0].lat, cities[0].lon);
          })
          .then((weatherReport)=>{
            //Save the user input location so that we can show it in the response
            if(weatherReport){
                weatherReport.location = args[0]
                //Change the topic to weather
                rs.setUservar(session.userData.user.id, topicWeather.key, topicWeather.value)
                rs.setUservars(session.userData.user.id, weatherReport)
                let reply = rs.reply(session.userData.user.id, weatherTrigger, this);
                resolve(reply);
            }
            else{
                reject(weatherReport);
            }
            
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
                session.send('Could not find weather');
                break;
        }
    }
}

let weather = {
	initSubroutine: initSubroutine
}

module.exports = weather;