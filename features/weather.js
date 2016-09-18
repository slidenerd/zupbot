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

function init(rs, session){
	rs.setSubroutine(weatherSubroutine, (rs, args)=>{
		return new rs.Promise((resolve, reject)=>{
			report(resolve, reject, rs, args, session);
		});
	});
}

function findWeather(lat, lon){

	let options = {
		url: 'http://api.openweathermap.org/data/2.5/weather', //URL to hit
		qs: {
			lat: lat, 
			lon: lon,
			units: 'metric',
			appid: '353263113c293de88e214ced88de05a7'
		}, //Query string data
		headers: {'Accept':'application/json'},
		json: true
	}

	return new Promise((resolve, reject)=>{
		request(options, (error, response, body)=>{
			callback(resolve, reject, error, response, body)
		});
	});
}

function callback(resolve, reject, error, response, body){
	if(!error && response.statusCode == 200) {
		let report = parse(body);
		resolve(report);
	} else {
		reject({error: error, code: errorCodes.weatherLookupFailed});
	}
}

function parse(json){
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

function report(resolve, reject, rs, args, session){
	geo.getLocationDetails(args[0])
	.then((cities)=>{
		return findWeather(cities[0].lat, cities[0].lon);
	})
	.then((weatherReport)=>{
		//Save the user input location so that we can show it in the response
		if(weatherReport){
			weatherReport.location = args[0]
			//Change the topic to weather
			let userId = session.userData.user.id;
			rs.setUservar(userId, topicWeather.key, topicWeather.value)
			rs.setUservars(userId, weatherReport)
			return rs.replyAsync(userId, weatherTrigger, this);
		}
		else{
			reject(weatherReport);
		}
	})
	.then((reply)=>{
		resolve(reply);
	})
	.catch((error)=>{
		handleError(error, session)
		reject(error);
	})
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
	init: init
}

module.exports = weather;