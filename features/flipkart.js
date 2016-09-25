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
function init(rs, userId, session) {
    rs.setSubroutine(subroutineName, (rs, args) => {
        return new rs.Promise((resolve, reject) => {
            report(resolve, reject, rs, args, userId, session);
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

//TODO detect source if its skype or facebook and render different content for each
function report(resolve, reject, rs, args, userId, session) {
    getDealsOfTheDayFromFlipkart()
        .then((deals) => {
            if (deals) {

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

function handlePlatforms(userId, channelId, session, rs, deals) {
    let attachments = []
    if (channelId.toLowerCase() === 'facebook') {
        //Build cards containing all the data
        for (let deal of deals) {
            attachments.push(
                new builder.HeroCard(session)
                    .title(deal.title)
                    .subtitle(deal.subtitle)
                    .images([
                        builder.CardImage.create(session, deal.imageUrl)
                            .tap(builder.CardAction.openUrl(session, deal.url)),
                    ])
                    .buttons([
                        builder.CardAction.openUrl(session, deal.url, "View On Flipkart")
                    ])
            )
        }
    }
    else {
        //Build cards containing all the data
        for (let deal of deals) {
            attachments.push(
                new builder.HeroCard(session)
                    .title(deal.title)
                    .subtitle(deal.subtitle)
                    .images([
                        builder.CardImage.create(session, deal.imageUrl)
                            .tap(builder.CardAction.openUrl(session, deal.url)),
                    ])
                    .buttons([
                        builder.CardAction.openUrl(session, deal.url, "View On Flipkart")
                    ])
            )
        }
    }
    rs.setUservar(userId, constants.VAR_FLIPKART_RESULTS_SIZE, deals.length)
    let msg = new builder.Message(session)
        .attachmentLayout(builder.AttachmentLayout.carousel)
        .attachments(attachments);
    session.send(msg);
    return rs.replyAsync(userId, constants.JS_TRIGGER_DEALS, this);
}

let deals = {
    init: init
}
module.exports = deals