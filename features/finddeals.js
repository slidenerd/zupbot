'use strict';

const
    builder = require('../core/'),
    dealSubroutine = 'getDealsOfTheDayFromFlipkart' ,
    dealTrigger = 'jsdeals',
    request = require('request'),
    //The name of the subroutine that can find the weather
	topicDeals = {key: 'topic', value: 'deals'};
    
function init(rs, session){
	rs.setSubroutine(dealSubroutine, (rs, args)=>{
		return new rs.Promise((resolve, reject)=>{
			report(resolve, reject, rs, args, session);
		});
	});
}    

function getDealsOfTheDayFromFlipkart(){
    var headers = {
        'Fk-Affiliate-Id': 'slidenerd',
        'Fk-Affiliate-Token': 'cb49349872094f7494d802c1efc6b67b'
    };

    var options = {
        url: 'https://affiliate-api.flipkart.net/affiliate/offers/v1/dotd/json',
        headers: headers,
        json: true
    };

    return new Promise((resolve, reject)=>{
		request(options, (error, response, body)=>{
			callback(resolve, reject, error, response, body)
		});
	});
}

function callback(resolve, reject, error, response, body){
    if (!error && response.statusCode == 200) {
        let deals = parse(body);
        resolve(deals);
    }
    else{
        reject(error);
    }
}

function parse(json){
    let deals = [];
    if(json && json.dotdList && json.dotdList.length){
        for(let current of json.dotdList){
            let deal = {
                title: current.title,
                description: current.description,
                url: current.url
            }
            for(let image of current.imageUrls){
                if(image.resolutionType === 'mid'){
                    deal.imageUrl = image.url;
                    break;
                }
            }
            deals.push(deal);
        }
    }
    return deals;
}

function report(resolve, reject, rs, args, session){
	getDealsOfTheDayFromFlipkart()
    .then((deals)=>{
        if(deals){
            //Change the topic to deals
			let userId = session.userData.user.id;
			rs.setUservar(userId, topicDeals.key, topicDeals.value)
            let attachments = []
            for(let deal of deals){
                attachments.push(
                    new builder.HeroCard(session)
                    .title(deal.title)
                    .subtitle(deal.description)
                    .images([
                        builder.CardImage.create(session, deal.imageUrl)
                            .tap(builder.CardAction.showImage(session, deal.imageUrl)),
                    ])
                    .buttons([
                        builder.CardAction.openUrl(session, deal.url, 'Flipkart')
                    ])
                )
            }
            let description = deals.map((deal)=>{
                return deal.description;
            }).join(',');
            rs.setUservar(userId, 'description', description)
            let msg = new builder.Message(session)
            .attachments(attachments);
            session.send(msg);
			return rs.replyAsync(userId, dealTrigger, this);
        }
        else{
            //Change the topic to deals
			let userId = session.userData.user.id;
			session.send('Did not find any deals :(');
            resolve('done');
        }
    })
    .then((reply)=>{
        resolve(reply);
    })
    .catch((error)=>{
        console.log(error);
        reject(error);
    })
}

let deals = {
    init: init
}
module.exports = deals