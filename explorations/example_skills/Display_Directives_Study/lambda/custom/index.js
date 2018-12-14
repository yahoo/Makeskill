// Copyright 2018, Oath Inc.
// Licensed under the terms of the MIT license. See LICENSE file in project root for terms.


/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');


const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    // const speechOutput = "<audio src='https://s3.amazonaws.com/ask-soundlibrary/home/amzn_sfx_doorbell_chime_02.mp3'/> You are the fairest one";
if (supportsDisplay(handlerInput) ) {

     const myImage = new Alexa.ImageHelper()
       .addImageInstance('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAL9tbpFVHQ2n_-M4UGcsmoAMcvjTkD9AxZvVHe9XLwW214SJ_')
       .getImage();

     // const mainImage = new Alexa.ImageHelper()
     //   .addImageInstance('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAL9tbpFVHQ2n_-https://www.dropbox.com/s/i8x0imjdr31c2z5/MainImage_340x340.png?dl=0')
     //   .getImage();

     const primaryText = new Alexa.RichTextContentHelper()
       .withPrimaryText(speechOutput)
       .getTextContent();

     return handlerInput.responseBuilder.addRenderTemplateDirective({
       type: 'BodyTemplate1',
       token: 'string',
       backButton: 'HIDDEN',
       // Image: mainImage, // not necess for bt1
       backgroundImage: myImage,
       title: "Magic Mirror test",
       textContent: primaryText,
     });

}
   const myBGImage = new Alexa.ImageHelper()
      //.addImageInstance('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAL9tbpFVHQ2n_-M4UGcsmoAMcvjTkD9AxZvVHe9XLwW214SJ_')
      .addImageInstance('http://technology.inquirer.net/files/2017/10/the-most-famous-windows-wallpaper-ever-turns-20-505668-2.jpg')
      .getImage();

   const mainImage = new Alexa.ImageHelper()
      .addImageInstance('https://dl.dropboxusercontent.com/s/1c31073mh6uyjt8/MainImage_340x380.png?dl=0')
      .getImage();

   // var inline = "TEST <img src='https://78.media.tumblr.com/dd522f6ea75ea147fe600c8be6d129f2/tumblr_pd0snc5B1l1r3tjgwo1_250.png' width='100' height='50' alt='Yahoo! Mail' />";
   //
   const primaryText = new Alexa.RichTextContentHelper()
      .withPrimaryText('<font size="7"> You are the fairest one of them all. 	<action token="2347"> history </action> <br/> Cause baby its you. 	<br/> 	<br/>Youre the one I love. Youre the one that I need. </font>')
      .getTextContent();


   // Setting inline image tag to be converted to richtext
   // var inline = "HEYYYYYY";
   // "TEST <img src='https://78.media.tumblr.com/dd522f6ea75ea147fe600c8be6d129f2/tumblr_pd0snc5B1l1r3tjgwo1_250.png' width='340' height='140' alt='Yahoo! Mail' />";
   //
   // const richInline = new Alexa.RichTextContentHelper()
   //    .withPrimaryText(inline)
   //    .getTextContent();


   return handlerInput.responseBuilder
     .speak('Magic Mirror Yall')
     .addRenderTemplateDirective({
       type: 'BodyTemplate2',
       token: 'string',
       backButton: 'HIDDEN',
       image: mainImage,
       backgroundImage: myBGImage,
       title: '<font size="5"> Just Do It </font>',
       // title: richInline,
       textContent: primaryText,
     })
     //.withSimpleCard(speechOutput)
     .getResponse();
 },
};

const HelloWorldIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'HelloWorldIntent';
  },
  handle(handlerInput) {
    const speechText = 'You are the fairest one!';

    const primaryText = new Alexa.RichTextContentHelper()
       .withPrimaryText('You are the fairest one of them all')
       .getTextContent();

    const mainImage = new Alexa.ImageHelper()
       .addImageInstance('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAL9tbpFVHQ2n_-https://www.dropbox.com/s/i8x0imjdr31c2z5/MainImage_340x340.png?dl=0')
       .getImage();

    const myBGImage = new Alexa.ImageHelper()
       .addImageInstance('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAL9tbpFVHQ2n_-M4UGcsmoAMcvjTkD9AxZvVHe9XLwW214SJ_')
       .getImage();

    return handlerInput.responseBuilder
      .speak(speechText)
      .addRenderTemplateDirective({
        type: 'BodyTemplate2',
        token: 'string',
        backButton: 'HIDDEN',
        // image: mainImage,
        backgroundImage: myBGImage,
        title: 'Magic Mirror Test',
        // title: richInline,
        textContent: primaryText,
      })
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can say hello to me!';

    const myBGImage = new Alexa.ImageHelper()
       .addImageInstance('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAL9tbpFVHQ2n_-M4UGcsmoAMcvjTkD9AxZvVHe9XLwW214SJ_')
       .getImage();

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
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
      .withSimpleCard('Hello World', speechText)
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

// returns true if the skill is running on a device with a display function supportsDisplay {
function supportsDisplay(handlerInput) {
    var hasDisplay =
        handlerInput.requestEnvelope.context &&
        handlerInput.requestEnvelope.context.System &&
        handlerInput.requestEnvelope.context.System.device &&
        handlerInput.requestEnvelope.context.System.device.supportedInterfaces &&
        handlerInput.requestEnvelope.context.System.device.supportedInterfaces.Display
    return hasDisplay;
}

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    HelloWorldIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
