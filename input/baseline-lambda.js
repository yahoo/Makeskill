'use strict';
var Alexa = require('alexa-sdk');

var languageStrings = {
    'en': {
        'translation': {
            'WELCOME' : "DemoBot.  I am a demo for Makeskill",
            'HELP'    : "Ask me anything",
            'ABOUT'   : "This is a prototype of Makeskill",
            'STOP'    : "Exiting DemoBot"
        }
    }
};

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);

    // alexa.appId = 'amzn1.echo-sdk-ams.app.1234';
    ///alexa.dynamoDBTableName = 'YourTableName'; // creates new table for session.attributes
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        var say = this.t('WELCOME');
        this.emit(':ask', say, say);
    },

    'AboutIntent': function () {
        this.emit(':tell', this.t('ABOUT'));
    },

    // DEFAULT INTENTS

    'AMAZON.YesIntent': function () {
      var say = 'Nothing here.';
      this.emit(':ask', say);
    },

    'AMAZON.NoIntent': function () {
        this.emit('AMAZON.StopIntent');
    },
    'AMAZON.HelpIntent': function () {
        this.emit(':ask', this.t('HELP'));
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t('STOP'));
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t('STOP'));
    }

};
