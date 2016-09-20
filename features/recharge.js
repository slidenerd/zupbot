'use strict';

const
	errorCodes = require('../engine/error'),
	request = require('request'),
	//The name of the subroutine that can find the weather
	topicRecharge = {key: 'topic', value: 'recharge'},
    rechargeSubroutine = 'findOperatorInfo',

	//The name of the rive trigger to invoke while displaying results
    rechargeTrigger = 'jsoperatorinfo';

function init(rs, session){
	rs.setSubroutine(rechargeSubroutine, (rs, args)=>{
		return new rs.Promise((resolve, reject)=>{
			report(resolve, reject, rs, args, session);
		});
	});
}

function findOperatorInfo(mobileNumber){

	let options = {
		url: 'https://joloapi.com/api/findoperator.php', //URL to hit
		qs: {
			userid: 'slidenerd', 
			key: '258443870341474',
			mob: mobileNumber,
			type: 'json'
		}, //Query string data
		// headers: {'Accept':'application/json'},
		// json: true
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
		if(report && report.status === 'FAILED'){
			reject(report.error);
		}
		else{
			resolve(report);
		}
		
	} else {
		reject(error);
	}
}

function parse(json){
	return json;
}

function report(resolve, reject, rs, args, session){
	findOperatorInfo(args[0])
	.then((json)=>{
		//Save the user input location so that we can show it in the response
		//Change the topic to weather
		console.log(json);
		let userId = session.userData.user.id;
		rs.setUservar(userId, topicRecharge.key, topicRecharge.value)
		rs.setUservars(userId, json)
		return rs.replyAsync(userId, rechargeTrigger, this);
	})
	.then((reply)=>{
		console.log(reply)
		resolve(reply);
	})
	.catch((error)=>{
		console.log(error)
		reject(error);
	})
}

let recharge = {
	init: init
}
module.exports = recharge;