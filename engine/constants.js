'use strict';

let constants = {
    APP_ID: process.env.MICROSOFT_APP_ID || '92762e6c-5017-4a0c-a0bc-2194d94ca9dd',
    APP_PASSWORD: process.env.MICROSOFT_APP_PASSWORD || 'KgRnrjrxbEQtZHRghbATP7c',
    DB_URI: 'mongodb://zupbot:VIR4Zs1bO2J9x8g4s147bxeQnAQ6gWaWbhHFLSJkMAwM37pPtdNsesH2wWLEFrkG57TOQyWWXdF2ctXDnWM8JQ==@zupbot.documents.azure.com:10250/?ssl=true',
    ENDPOINT_MESSAGES: '/api/messages',
    ENDPOINT_GEO_URI: 'https://devru-latitude-longitude-find-v1.p.mashape.com/latlon.php',
    ENDPOINT_FLIPKART_DEALS: 'https://affiliate-api.flipkart.net/affiliate/offers/v1/dotd/json',
    ENDPOINT_OPEN_WEATHER_MAP: 'http://api.openweathermap.org/data/2.5/weather',
    ERROR_LOADING_BRAIN: [
        'Oops my brains blew up, I will notify my creator immediately',
        'Aaaannd, the lights went out inside my server, I will ask the electricity guy to fix it',
        'Boom, omg, the server exploded on my end. I will notify my creator about this',
        'Ouch, the rat just plucked the wires on the server. Damn! will tell my creator about this, time to call the pied piper',
        'Oh no! The rookie administrator just poured hot coffee on my server by mistake. I will inform my creator about this'
    ],
    INFO_NO_DEALS_FOUND: [
        'Bad luck, did not find any deals for now. But hey, dont lose hope, they come up with something daily',
        'Ah! looks like we were late to the party. All their daily deals are off.',
        'Dang, we just missed it. Deals for today seem to be over.'
    ],
    FLIPKART_AFFILIATE_ID: 'slidenerd',
    FLIPKART_AFFILIATE_TOKEN: 'cb49349872094f7494d802c1efc6b67b',
    FLIPKART_RESPONSE_IMAGE_RESOLUTION: 'default',
    GEO_API_KEY: 'ASgnW8JcttmshvHd0Hf1jUaS5fr9p1PcCxcjsnvgJ0EG00bIdt', 
    INDEX_HTML: 'index.html',
    INTERVAL_FREQUENCY: 5000,
    JS_TRIGGER_DEALS: 'jsdeals',
    JS_TRIGGER_WEATHER: 'jsweather',
    OPEN_WEATHER_MAP_API_KEY: '353263113c293de88e214ced88de05a7',
    PERSIST_DATA_AFTER: 1000*30,
    MESSENGER_CAROUSEL_LIMIT: 15,
    SKYPE_CAROUSEL_LIMIT: 5,
    UNITS_METRIC: 'metric',
    UPGRADE_MESSAGE: 'We just upgraded our service. Find out what we have to offer now by typing \'help\'',
    VAR_FLIPKART_RESULTS_SIZE: 'count',
    VERSION = 1.01
}

module.exports = constants;