'use strict';
//The name of the subroutine that can find the weather
const
    builder = require('../core/'),
    locationSubroutine = askLocation.name

function init(rs, userId, session) {
    rs.setSubroutine(locationSubroutine, (rs, args) => {
        return new rs.Promise((resolve, reject) => {
            askLocation(userId, session);
            reject({ignore: true});
        });
    });
}

//TODO quick replies arent being sent, needs a fix
function askLocation(userId, session) {
    let replyMessage = new builder.Message(session).text('can you please share your location?')
    replyMessage.sourceEvent({
        facebook: {
            quick_replies: [{
                content_type:"location"
            }]
        }
    });
    session.send(replyMessage);
}

let location = {
    init: init
}
module.exports = location;
