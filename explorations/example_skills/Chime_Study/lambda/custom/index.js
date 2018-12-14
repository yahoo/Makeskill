// Copyright 2018, Oath Inc.
// Licensed under the terms of the MIT license. See LICENSE file in project root for terms.


//* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');

// var testingOnSim = false;

/* IMAGES */
// var mainImage = 'https://78.media.tumblr.com/e7ca842afc03800da5fed907c87ba3d6/tumblr_pd0sep06GM1r3tjgwo1_r1_1280.png';
// var mainImgBlurBG = 'https://78.media.tumblr.com/5723619a976fb2e7405fc82daf0c79a6/tumblr_pd0sk8lAMe1r3tjgwo1_1280.png';

/* INTENT HANDLERS */

// V1
const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Welcome to yahoo mail, What are you looking for?';

    // builds back ground image
    // const myBGImage = new Alexa.ImageHelper()
    //   .addImageInstance('https://78.media.tumblr.com/5723619a976fb2e7405fc82daf0c79a6/tumblr_pd0sk8lAMe1r3tjgwo1_1280.png')
    //   .getImage();

   // builds main image
   // const myImage = new Alexa.ImageHelper()
   //    .addImageInstance('https://78.media.tumblr.com/e7ca842afc03800da5fed907c87ba3d6/tumblr_pd0sep06GM1r3tjgwo1_r1_1280.png')
   //    .getImage();

   // var myContent = '<font size="5"> Try asking </font> <br/> <font size="6"> <b><i>\" When is my flight? \"</i></b> </font>';
   // '<font size="4"> Try asking </font> <br> <font size="7"> <b><i>\" When is my flight? \"</i></b> </font>'

   // const primaryText = new Alexa.RichTextContentHelper()
   //    .withPrimaryText(myContent)
   //    .getTextContent();

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt('For example, you can ask me when your flight departs? or what are my flights?')
     //  .addRenderTemplateDirective({
     //   type: 'BodyTemplate2',
     //   token: 'string',
     //   backButton: 'HIDDEN',
     //   image: myImage,
     //   backgroundImage: myBGImage,
     //   title: 'Yahoo! Mail',
     //   textContent: primaryText,
     // })
      .getResponse();
  },
};

// test
// const InprogressMyFlightsHandler = {
//   canHandle(handlerInput) {
//     const request = handlerInput.requestEnvelope.request;
//
//     return request.type === 'IntentRequest'
//       && request.intent.name === 'MyFlightsIntent'
//       && request.dialogState !== 'COMPLETED'; // started or in_progress
//   },
//   handle(handlerInput) {
//     const currentIntent = handlerInput.requestEnvelope.request.intent;
//      // const currentSlot = currentIntent.slots[slotName];
//      let prompt = 'Answer the question';
//
//      if()
//             // console.log('test');
//             return handlerInput.responseBuilder
//               .speak(prompt)
//               .addDelegateDirective(currentIntent)
//               // .addElicitSlotDirective(currentSlot.name)
//               // .getResponse();ective(currentSlot.name)
//               .getResponse()
//
//             },
// };

// started or in_progress
const InprogressFindMusicEventHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;

    return request.type === 'IntentRequest'
      && request.intent.name === 'FlightTimeIntent'
      && request.dialogState !== 'COMPLETED'; // started or in_progress
  },
  handle(handlerInput) {
    const currentIntent = handlerInput.requestEnvelope.request.intent;
     // const currentSlot = currentIntent.slots[slotName];
     let prompt = 'Answer the question';
            // console.log('test');
            return handlerInput.responseBuilder

              .addDelegateDirective(currentIntent)
              // .addElicitSlotDirective(currentSlot.name)
              // .getResponse();ective(currentSlot.name)
              .getResponse()

            },
};

const CompletedFindMusicEventHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;

    return request.type === 'IntentRequest'
      && request.intent.name === 'FlightTimeIntent';
    //  && request.dialogState === 'COMPLETED';
  },
  async handle(handlerInput) {
    const filledSlots = handlerInput.requestEnvelope.request.intent.slots;

    // values of slots that were filled, required slots are Event Types, Genres, and US Cities.
    // const slotValues = getSlotValues(filledSlots);

    const speechOutput = `I've notified Samantha via email`;
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt('Would you like to know your boarding time as well?')
      .getResponse();

    return fooHandler.handle(HandlerInput);
  },
};

// test
// const fooHandler = {
//   canHandle(handlerInput) {
//     const request = handlerInput.requestEnvelope.request;
//
//     return request.type === 'IntentRequest';
//     //  && request.dialogState === 'COMPLETED';
//   },
//   async handle(handlerInput) {
//
//     // values of slots that were filled, required slots are Event Types, Genres, and US Cities.
//     // const slotValues = getSlotValues(filledSlots);
//     // Your boarding time is at six A.M. Pacific Standard Time
//     const speechOutput = `Would you like to know your boarding time?`;
//     return handlerInput.responseBuilder
//       .speak(speechOutput)
//       .getResponse();
//   },
// };

// const BoardingHandler = {
//   canHandle(handlerInput) {
//     const request = handlerInput.requestEnvelope.request;
//
//     return request.type === 'IntentRequest'
//       && request.intent.name === 'BoardingIntent'
//       && request.dialogState !=== 'COMPLETED';
//   },
//   async handle(handlerInput) {
//     const filledSlots = handlerInput.requestEnvelope.request.intent.slots;
//
//     // values of slots that were filled, required slots are Event Types, Genres, and US Cities.
//     // const slotValues = getSlotValues(filledSlots);
//
//     const speechOutput = `Your boarding time is at six A.M. Pacific Standard Time`;
//     return handlerInput.responseBuilder
//       .speak(speechOutput)
//       .getResponse();
//   },
// };


const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'help is hopeless.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt('help yo self')
      // .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      // .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

// CONSTANTS

function supportsDisplay(handlerInput) {
    var hasDisplay =
        handlerInput.requestEnvelope.context &&
        handlerInput.requestEnvelope.context.System &&
        handlerInput.requestEnvelope.context.System.device &&
        handlerInput.requestEnvelope.context.System.device.supportedInterfaces &&
        handlerInput.requestEnvelope.context.System.device.supportedInterfaces.Display
    return hasDisplay;
}


// function bodyTemplateMaker(pBodyTemplateType, pHandlerInput, pImg, pTitle, pText1, pText2, pText3, pOutputSpeech, pReprompt, pHint, pBackgroundIMG, pEndSession) {
//     const response = pHandlerInput.responseBuilder;
//     const image = imageMaker("", pImg);
//     const richText = richTextMaker(pText1, pText2, pText3);
//     const backgroundImage = imageMaker("", pBackgroundIMG);
//     const title = pTitle;
//
//     response.addRenderTemplateDirective({
//         type: pBodyTemplateType,
//         backButton: 'visible',
//         image,
//         backgroundImage,
//         title,
//         textContent: richText,
//     });
//
//     if (pHint)
//         response.addHintDirective(pHint);
//
//     if (pOutputSpeech)
//         response.speak(pOutputSpeech);
//
//     if (pReprompt)
//         response.reprompt(pReprompt)
//
//     if (pEndSession)
//         response.withShouldEndSession(pEndSession);
//
//     return response.getResponse();
// }
//
// function imageMaker(pDesc, pSource) {
//     const myImage = new Alexa.ImageHelper()
//         .withDescription(pDesc)
//         .addImageInstance(pSource)
//         .getImage();
//
//     return myImage;
// }
//
// function richTextMaker(pPrimaryText, pSecondaryText, pTertiaryText) {
//     const myTextContent = new Alexa.RichTextContentHelper();
//
//     if (pPrimaryText)
//         myTextContent.withPrimaryText(pPrimaryText);
//
//     if (pSecondaryText)
//         myTextContent.withSecondaryText(pSecondaryText);
//
//     if (pTertiaryText)
//         myTextContent.withTertiaryText(pTertiaryText);
//
//     return myTextContent.getTextContent();
// }
//
// function plainTextMaker(pPrimaryText, pSecondaryText, pTertiaryText) {
//     const myTextContent = new Alexa.PlainTextContentHelper()
//         .withPrimaryText(pPrimaryText)
//         .withSecondaryText(pSecondaryText)
//         .withTertiaryText(pTertiaryText)
//         .getTextContent();
//
//     return myTextContent;
// }

const requiredSlots = [
  'dates',
  'airlines',
  'destinations',
  'd_airports',
];

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    InprogressFindMusicEventHandler,
    CompletedFindMusicEventHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
