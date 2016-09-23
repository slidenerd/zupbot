'use strict';
/*-----------------------------------------------------------------------------
This Bot uses the Bot Connector Service but is designed to showcase whats 
possible on Facebook using the framework. The demo shows how to create a looping 
menu how send things like Pictures, Bubbles, Receipts, and use Carousels. It also
shows all of the prompts supported by Bot Builder and how to receive uploaded
photos, videos, and location.

# RUN THE BOT:

    You can run the bot locally using the Bot Framework Emulator but for the best
    experience you should register a new bot on Facebook and bind it to the demo 
    bot. You can run the bot locally using ngrok found at https://ngrok.com/.

    * Install and run ngrok in a console window using "ngrok http 3978".
    * Create a bot on https://dev.botframework.com and follow the steps to setup
      a Facebook channel. The Facebook channel config page will walk you through 
      creating a Facebook page & app for your bot.
    * For the endpoint you setup on dev.botframework.com, copy the https link 
      ngrok setup and set "<ngrok link>/api/messages" as your bots endpoint.
    * Next you need to configure your bots MICROSOFT_APP_ID, and
      MICROSOFT_APP_PASSWORD environment letiables. If you're running VSCode you 
      can add these letiables to your the bots launch.json file. If you're not 
      using VSCode you'll need to setup these letiables in a console window.
      - MICROSOFT_APP_ID: This is the App ID assigned when you created your bot.
      - MICROSOFT_APP_PASSWORD: This was also assigned when you created your bot.
    * Install the bots persistent menus following the instructions outlined in the
      section below.
    * To run the bot you can launch it from VSCode or run "node app.js" from a 
      console window. 

# INSTALL PERSISTENT MENUS

    Facebook supports persistent menus which Bot Builder lets you bind to global 
    actions. These menus must be installed using the page access token assigned 
    when you setup your bot. You can easily install the menus included with the 
    example by running the cURL command below:

        curl -X POST -H "Content-Type: application/json" -d @persistent-menu.json 
        "https://graph.facebook.com/v2.6/me/thread_settings?access_token=PAGE_ACCESS_TOKEN"
    
-----------------------------------------------------------------------------*/

const
    builder = require('./core/'),
    brain = require('./engine/brain'),
    constants = require('./engine/constants'),
    crud = require('./db/crud'),
    restify = require('restify');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});
let lastActive, timeout, userId;

// Create chat bot
let connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
let bot = new builder.UniversalBot(connector);
server.post(constants.ENDPOINT_MESSAGES, connector.listen());

// Serve a static web page
// server.get(/.*/, restify.serveStatic({
// 	'directory': '.',
// 	'default': 'index.html'
// }));
console.log(__dirname);
server.get('/.*/', restify.serveStatic({
    directory: __dirname + '/public',
    default: constants.INDEX_HTML,
    match: /^((?!server.js).)*$/   // we should deny access to the application source
}));

//=========================================================
// Bots Middleware
//=========================================================

// Anytime the major version is incremented any existing conversations will be restarted.
bot.use(builder.Middleware.dialogVersion({ version: 1.0, resetCommand: /^reset/i }));

//=========================================================
// Bots Global Actions
//=========================================================

// bot.endConversationAction('goodbye', 'Goodbye :)', { matches: /^goodbye/i });
// bot.beginDialogAction('help', '/help', { matches: /^help/i });

//=========================================================
// Bots Dialogs
//=========================================================
bot.dialog('/',
    [(session, args, next) => {
        lastActive = new Date();
        timeout = setInterval(intervalCallback, 5000);
        if (!session.userData.user) {
            session.beginDialog('/initUser')
        }
        else {
            next();
        }
    }, (session, results) => {
        if (!brain.isBrainLoaded()) {
            session.beginDialog('/loadBrain');
        }
        else {
            brain.fetchReply(session);
        }
    }]
);

bot.dialog('/initUser', initUser);

function initUser(session) {
    session.userData.user = {
        id: session.message.user.id,
        name: session.message.user.name
    }
    let userObject = {
        _id: session.userData.user.id,
        name: session.userData.user.name
    }
    crud.upsert({ _id: session.userData.user.id }, userObject, (error, document) => {
        if (error) {
            console.error('error');
        }
        else {
            console.log('document added ' + document);
        }
    })
    userId = session.userData.user.id;
    session.endDialog();
}

bot.dialog('/loadBrain', brain.loadBrain);


function intervalCallback() {
    let currentTime = new Date();
    if (lastActive) {
        let timeDiff = Math.abs(currentTime.getTime() - lastActive.getTime());
        if (timeDiff > 1000 * 30) {
            if (userId) {
                console.log(brain.getUservars(userId))
            }
            clearInterval(timeout);
        }
    }
}