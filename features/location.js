'use strict';
//The name of the subroutine that can find the weather
const
    builder = require('../core/'),
    locationSubroutine = askLocation.name

function init(rs, userId, session) {
    rs.setSubroutine(locationSubroutine, (rs, args) => {
        return new rs.Promise((resolve, reject) => {
            let replyMessage = askLocation(userId, session);
            resolve(replyMessage);
        });
    });
}

//TODO quick replies arent being sent, needs a fix
function askLocation(userId, session) {
    let replyMessage = new builder.Message(session).text('testing')
    replyMessage.sourceEvent({
        facebook: {
            quick_replies: [{
                content_type:"text",
                title:"Red",
                payload:"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_RED"
            },            
            {
                content_type:"text",
                title:"Blue",
                payload:"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_BLUE"
            }]
        }
    });
    return replyMessage;
}

let location = {
    init: init
}
module.exports = location;
