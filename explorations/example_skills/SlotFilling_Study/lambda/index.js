// Copyright 2018, Oath Inc.
// Licensed under the terms of the MIT license. See LICENSE file in project root for terms.


/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');

/* INTENT HANDLERS */

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Welcome to Muse Match, I can help you find local music events. What kind of music event are you looking for?';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt('What music events are you interested in? Raves, concerts, or festivals?')
      // .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

// started or in_progress
const InprogressFindMusicEventHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;

    return request.type === 'IntentRequest'
      && request.intent.name === 'FindMusicEventIntent'
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
      && request.intent.name === 'FindMusicEventIntent';
    //  && request.dialogState === 'COMPLETED';
  },
  async handle(handlerInput) {
    const filledSlots = handlerInput.requestEnvelope.request.intent.slots;

    // values of slots that were filled, required slots are Event Types, Genres, and US Cities.
    // const slotValues = getSlotValues(filledSlots);

    const speechOutput = `The music was within you this whole, just kidding hard coding a single response is easier`;

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .getResponse();
  },
};


const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'This is Muse. I can help you find a music event. Just say open Muse again.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt('You probably have not given me a music event type yet, examples include jazz, hard rock, and techno.')
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

const requiredSlots = [
  'US_Cities',
  'Genres',
  'Event_Types',
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
