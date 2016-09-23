'use strict';

const
    builder = require('../core/'),
    constants = require('../engine/constants'),
    utils = require('../engine/utils'),
    //The name of the subroutine that can find deals
    subroutineName = getDealsOfTheDayFromFlipkart.name,
    request = require('request')

/**
 * Main entry point in this file
 */
function init(rs, session) {
    rs.setSubroutine(subroutineName, (rs, args) => {
        return new rs.Promise((resolve, reject) => {
            report(resolve, reject, rs, args, session);
        });
    });
}

function getDealsOfTheDayFromFlipkart() {
    var headers = {
        'Fk-Affiliate-Id': constants.FLIPKART_AFFILIATE_ID,
        'Fk-Affiliate-Token': constants.FLIPKART_AFFILIATE_TOKEN
    };

    var options = {
        url: constants.ENDPOINT_FLIPKART_DEALS,
        headers: headers,
        json: true
    };

    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            callback(resolve, reject, error, response, body)
        });
    });
}

function callback(resolve, reject, error, response, body) {
    if (!error && response.statusCode == 200) {
        let deals = parse(body);
        resolve(deals);
    }
    else {
        reject(error);
    }
}

function parse(json) {
    let deals = [];
    if (json && json.dotdList && json.dotdList.length) {
        for (let current of json.dotdList) {
            let deal = {
                title: current.title,
                description: current.description,
                url: current.url
            }
            for (let image of current.imageUrls) {
                if (image.resolutionType === constants.FLIPKART_RESPONSE_IMAGE_RESOLUTION) {
                    deal.imageUrl = image.url;
                    break;
                }
            }
            deals.push(deal);
        }
    }
    return deals;
}

function report(resolve, reject, rs, args, session) {
    getDealsOfTheDayFromFlipkart()
        .then((deals) => {
            //Get the user id
            let userId = session.userData.user._id;
            console.log(userId);
            if (deals) {

                //Change the topic to deals
                rs.setUservar(userId, constants.TOPIC, constants.TOPIC_DEALS)
                let attachments = []

                //Build cards containing all the data
                for (let deal of deals) {
                    attachments.push(
                        new builder.HeroCard(session)
                            .title(deal.title)
                            .subtitle(deal.description)
                            .images([
                                builder.CardImage.create(session, deal.imageUrl)
                            ])
                            .tap(builder.CardAction.openUrl(session, deal.url)))
                }
                rs.setUservar(userId, constants.VAR_FLIPKART_RESULTS_SIZE, deals.length)
                let msg = new builder.Message(session)
                    .attachments(attachments);
                session.send(msg);
                return rs.replyAsync(userId, constants.JS_TRIGGER_DEALS, this);
            }
            else {
                session.send(utils.sendRandomMessage(constants.INFO_NO_DEALS_FOUND));
                resolve(true);
            }
        })
        .then((reply) => {
            resolve(reply);
        })
        .catch((error) => {
            console.log(error);
            reject(error);
        })
}

let deals = {
    init: init
}
module.exports = deals