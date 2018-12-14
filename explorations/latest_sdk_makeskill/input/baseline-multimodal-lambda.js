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


function supportsDisplay() {
  var hasDisplay =
    this.event.context &&
    this.event.context.System &&
    this.event.context.System.device &&
    this.event.context.System.device.supportedInterfaces &&
    this.event.context.System.device.supportedInterfaces.Display

  return hasDisplay;
}

function isSimulator() {
  var isSimulator = !this.event.context; //simulator doesn't send context
  return isSimulator;
}

function renderTemplate (content) {

  //create a template for each screen you want to display.
  //This example has one that I called "factBodyTemplate".
  //define your templates using one of several built in Display Templates
  //https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/display-interface-reference#display-template-reference


   switch(content.templateToken) {
       case "makeskillBodyTemplate":
           var response = {
             "version": "1.0",
             "response": {
               "directives": [
                 {
                   "type": "Display.RenderTemplate",
                   "template": {
                       "type": "BodyTemplate1",
                       "title": "",
                       "token": "TOKEN",
                       "backgroundImage": {
                           "sources": [
                               {
                                   "url": content.imageUrl
                               }
                           ]
                       },
                       "textContent": {
                       },
                       "backButton": "HIDDEN"
                   }
                 }
               ],
               "outputSpeech": {
                 "type": "SSML",
                 "ssml": "<speak>"+content.hasDisplaySpeechOutput+"</speak>"
               },
               "reprompt": {
                 "outputSpeech": {
                   "type": "SSML",
                   "ssml": "<speak>"+content.hasDisplayRepromptText+"</speak>"
                 }
               },
               "shouldEndSession": content.askOrTell==":tell",
               "card": {
                 "type": "Simple",
                 "title": content.simpleCardTitle,
                 "content": content.simpleCardContent
               }
             },
             "sessionAttributes": content.sessionAttributes
           }
           this.context.succeed(response);
           break;

       default:
          this.response.speak("Thanks for chatting, goodbye");
          this.emit(':responseReady');
   }

}


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
