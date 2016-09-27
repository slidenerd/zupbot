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
    let replyMessage = new builder.Message(session)
    replyMessage.sourceEvent({
        facebook: {
            "message": {
                "text": "Please share your location:",
                "quick_replies": [
                    {
                        "content_type": "location",
                    }
                ]
            }
        }
    });
    session.send(replyMessage);
}

let location = {
    init: init
}
module.exports = location;
