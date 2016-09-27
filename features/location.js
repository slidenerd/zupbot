'use strict';
//The name of the subroutine that can find the weather
const
    builder = require('../core/'),
    locationSubroutine = askLocation.name

function init(rs, userId, session) {
    rs.setSubroutine(locationSubroutine, (rs, args) => {
        return new rs.Promise((resolve, reject) => {
            askLocation(userId, session);
            resolve();
        });
    });
}

function askLocation(userId, session) {
    let replyMessage = new builder.Message(session).text('testing')
    replyMessage.sourceEvent({
        facebook: {
            quick_replies: [{
                content_type:"text",
                title:"Red",
                payload:"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_RED",
                image_url:"https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Button_Icon_Red.svg/300px-Button_Icon_Red.svg.png"
            },            
            {
                content_type:"text",
                title:"Blue",
                payload:"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_BLUE",
                image_url:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Button_Icon_Blue.svg/768px-Button_Icon_Blue.svg.png"
            }]
        }
    });
    console.log(replyMessage);
    session.send(replyMessage);
}

let location = {
    init: init
}
module.exports = location;
