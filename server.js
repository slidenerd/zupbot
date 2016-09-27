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
    debug = require('debug')('server.js'),
    restify = require('restify'),
    utils = require('./engine/utils');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    debug('%s listening to %s', server.name, server.url);
});

// Create chat bot
let connector = new builder.ChatConnector({
    appId: constants.APP_ID,
    appPassword: constants.APP_PASSWORD
});
let bot = new builder.UniversalBot(connector);
server.post(constants.ENDPOINT_MESSAGES, connector.listen());

// Serve a static web page
// server.get(/.*/, restify.serveStatic({
// 	'directory': '.',
// 	'default': 'index.html'
// }));
debug(__dirname);
server.get('/.*/', restify.serveStatic({

    //Ensure that people can only access the files within the public directory and none of the protected server files
    directory: __dirname + '/public',
    default: constants.INDEX_HTML,
    match: /^((?!server.js).)*$/   // we should deny access to the application source
}));

//=========================================================
// Bots Middleware
//=========================================================

// Anytime the major version is incremented any existing conversations will be restarted.

var dialogVersionOptions = {
    version: 1.0,
    resetCommand: /^reset/i
};
bot.use(builder.Middleware.dialogVersion(dialogVersionOptions));


//=========================================================
// Bots Global Actions
//=========================================================

// bot.endConversationAction('goodbye', 'Goodbye :)', { matches: /^goodbye/i });
// bot.beginDialogAction('help', '/help', { matches: /^help/i });

//=========================================================
// Bots Dialogs
//=========================================================
bot.use(builder.Middleware.firstRun({ version: 1.0, dialogId: '/firstRun' }));

bot.dialog('/', (session) => {
    console.log(session.message.user.id)
    console.log(session.message.user.name)
    //each time the user chats, mark their last active time.
    let lastActive = new Date();

    //create a timeout to persist their data after they have been inactive for a while
    let timeout = setInterval(() => {

        // get the current time when this callback is triggered
        let currentTime = new Date(session.message.timestamp);

        //Find the difference between the time user last had a conversation with our bot
        //And the time this callback was triggered
        let difference = Math.abs(currentTime.getTime() - lastActive.getTime());

        //If the time difference is greater than the amount of delay
        //Get all the information discussed with the user and update the database
        if (difference > constants.PERSIST_DATA_AFTER) {

            //If we have a valid user id at this point, we ll get the user information
            let userId = session.userData.user._id;
            if (userId) {

            }

            //Remove the interval to avoid triggering it till the next interaction
            clearInterval(timeout);
        }
    }, constants.INTERVAL_FREQUENCY);
    handleWithBrains(session);
    console.log(session.message.sourceEvent);
});

function handleWithBrains(session) {
    //if our rive triggers have not been loaded, load them into memory
    if (!brain.isBrainLoaded()) {
        session.beginDialog('/loadBrain');
    }
    else {
        let userId = session.userData.user._id;
        brain.fetchReply(userId, session);
    }
}

//TODO send greeting,  get started button, persistent menu
bot.dialog('/firstRun', (session) => {
    let userObject = extractUserObject(session);
    if (utils.isFacebook(session)) {

    }
    else if (utils.isEmulator(session)) {

    }
    else if (utils.isSkype(session)) {

    }
    // We dont want a person whose name is null, simple as that
    if (userObject._id && userObject.userName) {
        //Add this object to be tracked across our session
        session.userData.user = userObject;
        //Query to check if this user ID already exists in the mongo db database
        let query = { _id: userObject._id }
        //If the userID exists, modify it, else insert a fresh user object into the database
        //Dont use the database for emulator requests
        if (!utils.isEmulator(session)) {
            crud.upsert(query, userObject, (error, document) => {
                if (error) {
                    console.error(error);
                }
                else {
                    debug('document added ' + document);
                }
            })
        }
    }
    handleWithBrains(session);
    session.endDialog();
});

bot.dialog('/loadBrain', (session) => {
    let userId = session.userData.user._id;
    brain.loadBrain(userId, session);
    session.endDialog();
});

function extractUserObject(session) {
    //Create a new user object to be stored in the mongo db database
    //Add an _id that acts as the primary key
    //Add the name of our user

    let user = session.message.user;
    let address = session.message.address;
    return {
        _id: user.id,
        botId: address.bot.id,
        botName: address.bot.name,
        channelId: address.channelId,
        convId: address.conversation.id,
        convName: address.conversation.name,
        convIsGroup: address.conversation.isGroup,
        userName: user.name
    }
}

//reset the whole session
bot.use(function (session, next) {
  if (session.message.text === 'poop') {
    session.perUserInConversationData = {};
    session.userData = {};
    session.conversationData = {};
  }
  if (!session.userData.firstRun) {
    session.userData.firstRun = true;
    session.beginDialog('/firstRun');
  } else {
    next();
  }
});