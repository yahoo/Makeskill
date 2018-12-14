#!/usr/bin/env node
// Copyright 2018, Oath Inc.
// Licensed under the terms of the MIT license. See LICENSE file in project root for terms.

const argv = require("yargs").argv;
const async = require("async");
const fs = require("fs-extra");
const { google } = require("googleapis");
const googlePerm = require("./lib/google-permissions");
const ixHelpers = require("./lib/interaction-model-helpers");
const readline = require("readline");
const uniqBy = require("lodash.uniqby");
const capitalize = require("lodash.capitalize");

const config = JSON.parse(fs.readFileSync(argv.config));
const invocationName = config.invocationName;
const sheetId = config.sheetId;
const vuiSheet = config.vuiSheet;
const multimodalCards = config.multimodalCards;
const customEntities = config.customEntities;
const slotPrompts = config.slotPrompts;

const lambdaFolder = config.lambdaFolder;
const modelsFolder = config.modelsFolder;

const debug = argv.d;
const BATCH_LOOKUP = {
  A: 2, B: 3, C: 4, D: 5, E: 6, F: 7, G: 8, H: 9, I: 10, J: 11, K: 12, L: 13,
  M: 14, N: 15, O: 16, P: 17, Q: 18, R: 19, S: 20, T: 21, U: 22, V: 23, W: 24,
  X: 25, Y: 26, Z: 27,
};


function main() {
  async.waterfall(
    [
      prepSkillFiles,
      readSpreadsheet,
      parseSpreadsheet,
      prepareData,
      createSkillFiles,
    ],
    function(error) {
      if (error) {
        console.log("Error: " + error);
      }
    }
  );
}

/**
 * Opens streams for lambda and interaction model files that will be compatible
 * with AWS Lambda and Alexa Skills Kit respectively.
 *
 * @param {function} prepSkillFilesCB The callback for prepSkillFiles
 */
function prepSkillFiles(prepSkillFilesCB) {

  if (multimodalCards && multimodalCards != "") {
    fs
      .createReadStream("./input/new-baseline-multimodal-lambda.js")
      .pipe(fs.createWriteStream(lambdaFolder + "/index.js"));
  } else {
    fs
      .createReadStream("./input/new-baseline-lambda.js")
      .pipe(fs.createWriteStream(lambdaFolder + "/index.js"));
  }

  fs
    .createReadStream("./input/baseline-interaction-model.json")
    .pipe(fs.createWriteStream(modelsFolder + "/en-US.json"));
  prepSkillFilesCB(null);
}

/**
 * Based on Google Spreadsheet credentials and sheet ID, reads a given G Spreadsheet.
 *
 * @param {function} readSpreadsheetCB The callback for readSpreadsheet
 */
function readSpreadsheet(readSpreadsheetCB) {
  fs.readFile(config.googleSecret, readSpreadsheetCB);
}

/**
 * Parses a Google Spreadsheet to prepare for Skill batch creation
 *
 * @param {Object} content Content of the Google Spreadsheet with Skill attributes
 * @param {function} parseSpreadsheetCB The callback for parseSpreadsheet
 */
function parseSpreadsheet(content, parseSpreadsheetCB) {
  googlePerm.authorize(JSON.parse(content), function parseBatches(auth) {
    const sheets = google.sheets("v4");

    if (multimodalCards && customEntities) {
      const request = {
        spreadsheetId: sheetId,
        ranges: [
          vuiSheet + "!A1:Z1000",
          multimodalCards + "!A2:Z1000",
          customEntities + "!A2:Z1000",
        ],
        auth: auth,
      };

      sheets.spreadsheets.values.batchGet(request, function(err, response) {
        if (err) {
          console.error(err);
          return;
        }

        let vuiRows =
          response.data &&
          response.data.valueRanges &&
          response.data.valueRanges[0] &&
          response.data.valueRanges[0].values;

        let echoDisplayRows =
          response.data &&
          response.data.valueRanges &&
          response.data.valueRanges[1] &&
          response.data.valueRanges[1].values;

        let customEntityRows =
          response.data &&
          response.data.valueRanges &&
          response.data.valueRanges[2] &&
          response.data.valueRanges[2].values;

        parseSpreadsheetCB(null, vuiRows, echoDisplayRows, customEntityRows, null);
      });
    } else if (multimodalCards && customEntities && customPromptRows) {
      const request = {
        spreadsheetId: sheetId,
        ranges: [
          vuiSheet + "!A1:Z1000",
          multimodalCards + "!A2:Z1000",
          customEntities + "!A2:Z1000",
          slotPrompts + "!A2:Z1000",//DN
        ],
        auth: auth,
      };

      sheets.spreadsheets.values.batchGet(request, function(err, response) {
        if (err) {
          console.error(err);
          return;
        }

        let vuiRows =
          response.data &&
          response.data.valueRanges &&
          response.data.valueRanges[0] &&
          response.data.valueRanges[0].values;

        let echoDisplayRows =
          response.data &&
          response.data.valueRanges &&
          response.data.valueRanges[1] &&
          response.data.valueRanges[1].values;

        let customEntityRows =
          response.data &&
          response.data.valueRanges &&
          response.data.valueRanges[2] &&
          response.data.valueRanges[2].values;

        let customPromptRows =
          response.data &&
          response.data.valueRanges &&
          response.data.valueRanges[3] &&
          response.data.valueRanges[3].values;

        parseSpreadsheetCB(null, vuiRows, echoDisplayRows, customEntityRows, customPromptRows);
      });
    } else if (multimodalCards) { //&& !customEntities && !customPromptRows
      const request = {
        spreadsheetId: sheetId,
        ranges: [vuiSheet + "!A1:Z1000", multimodalCards + "!A2:Z1000"], //slotPrompts + "!A3:Z1000"
        auth: auth,
      };

      sheets.spreadsheets.values.batchGet(request, function(err, response) {
        if (err) {
          console.error(err);
          return;
        }

        let vuiRows =
          response.data &&
          response.data.valueRanges &&
          response.data.valueRanges[0] &&
          response.data.valueRanges[0].values;

        let echoDisplayRows =
          response.data &&
          response.data.valueRanges &&
          response.data.valueRanges[1] &&
          response.data.valueRanges[1].values;

        // let customPromptRows =
        //   response.data &&
        //   response.data.valueRanges &&
        //   response.data.valueRanges[2] &&
        //   response.data.valueRanges[2].values;

        parseSpreadsheetCB(null, vuiRows, echoDisplayRows, null, null); //customPromptRows
      });
    } else if (!multimodalCards && customEntities && slotPrompts) {
      const request = {
        spreadsheetId: sheetId,
        ranges: [vuiSheet + "!A1:Z1000", customEntities + "!A2:Z1000", slotPrompts + "!A2:Z1000"],
        auth: auth,
      };

      sheets.spreadsheets.values.batchGet(request, function(err, response) {
        if (err) {
          console.error(err);
          return;
        }

        let vuiRows =
          response.data &&
          response.data.valueRanges &&
          response.data.valueRanges[0] &&
          response.data.valueRanges[0].values;

        let customEntityRows =
          response.data &&
          response.data.valueRanges &&
          response.data.valueRanges[1] &&
          response.data.valueRanges[1].values;

        let customPromptRows =
          response.data &&
          response.data.valueRanges &&
          response.data.valueRanges[2] &&
          response.data.valueRanges[2].values;

        parseSpreadsheetCB(null, vuiRows, null, customEntityRows, customPromptRows);
      });
    } else if (!multimodalCards && customEntities && !slotPrompts) {
      const request = {
        spreadsheetId: sheetId,
        ranges: [vuiSheet + "!A1:Z1000", customEntities + "!A2:Z1000"],
        auth: auth,
      };

      sheets.spreadsheets.values.batchGet(request, function(err, response) {
        if (err) {
          console.error(err);
          return;
        }

        let vuiRows =
          response.data &&
          response.data.valueRanges &&
          response.data.valueRanges[0] &&
          response.data.valueRanges[0].values;

        let customEntityRows =
          response.data &&
          response.data.valueRanges &&
          response.data.valueRanges[1] &&
          response.data.valueRanges[1].values;

        parseSpreadsheetCB(null, vuiRows, null, customEntityRows, null);
      });
    } else {
      const request = {
        spreadsheetId: sheetId,
        ranges: [vuiSheet + "!A1:Z1000"], //slotPrompts + "!A3:Z1000"
        auth: auth,
      };

      sheets.spreadsheets.values.batchGet(request, function(err, response) {
        if (err) {
          console.error(err);
          return;
        }

        let vuiRows =
          response.data &&
          response.data.valueRanges &&
          response.data.valueRanges[0] &&
          response.data.valueRanges[0].values;

        // let customPromptRows =
        //   response.data &&
        //   response.data.valueRanges &&
        //   response.data.valueRanges[1] &&
        //   response.data.valueRanges[1].values;

        parseSpreadsheetCB(null, vuiRows, null, null, null); //customPromptRows
      });
    }
  });
}

/**
 * Prepares the data structures for the interaction model based on
 * Spreadsheet values
 *
 * @param {Object} vuiRows VUI row items within a Google Spreadsheet
 * @param {Object} echoDisplayRows Echo Show/Spot row items within a Google Spreadsheet
 * @param {Object} customEntityRows Custom Entity row items within a Google Spreadsheet
 * @param {Object} customPromptRows Custom Prompt row items within a Google Spreadsheet
 * @param {function} prepDataCB The callback for prepareData
 */
function prepareData(vuiRows, echoDisplayRows, customEntityRows, customPromptRows, prepDataCB) {
  const batch = argv.batch ? argv.batch : config.defaultBatchLetter;
  let intents = [];
  let utterances = [];
  let prompts = [];
  let responses = [];
  let types = [];

  if (vuiRows.length == 0) {
    console.log("No data found.");
  } else {
    let tempResponses = [];

    if (customEntityRows) {
      for (let u = 0; u < customEntityRows.length; u++) {
        types.push({
          name: "Makeskill_" + capitalize(customEntityRows[u][0]),
          values: customEntityRows[u][1],
        });
      }
    }

    if (customPromptRows) {
      for (let u = 0; u < customPromptRows.length; u++) {
        prompts.push({
          slot: "Makeskill_" + capitalize(customPromptRows[u][0]), //slotnames
          promptResponses: customPromptRows[u][1], //slot prompts
        });
      }
    }


    for (let i = 1; i < vuiRows.length; i++) {
      let vuiRow = vuiRows[i];
      let intent = vuiRow[0];

      intents.push(intent);
      utterances.push(vuiRow[1]);

      let imageName = "";

      if (multimodalCards && multimodalCards != "") {
        for (let y = 0; y < echoDisplayRows.length; y++) {
          if (intent === echoDisplayRows[y][0]) {
            imageName = echoDisplayRows[y][BATCH_LOOKUP[batch] - 1];
            break;
          } else {
            imageName = "";
          }
        }
      }

      tempResponses.push({
        text: vuiRow[BATCH_LOOKUP[batch]],
        image: imageName,
      });
    }

    responses = uniqBy(tempResponses, "text");

    prepDataCB(null, batch, intents, utterances, prompts, types, responses);
  }
}

/**
 * Creates the Skill files, calls upon helper functions that rely on the
 * interaction model.
 *
 * @param {String} batch The Skill batch to export
 * @param {Array} intents The intents for the Skill batch
 * @param {Array} prompts The prompts for the Skill batch DN
 * @param {Array} utterances The utterances for the Skill
 * @param {Array} types The entity types for the Skill
 * @param {Object} responses The desired responses for the Skill batch
 * @param {function} createSkillFilesCB The callback for createSkillFiles
 */
function createSkillFiles(
  batch,
  intents,
  utterances,
  prompts,
  types,
  responses,
  createSkillFilesCB
) {
  let interaction = {};

  for (let x = 0; x < intents.length; x++) {
    if (interaction[intents[x]] === undefined) {
      interaction[intents[x]] = [utterances[x]];
    } else {
      interaction[intents[x]].push(utterances[x]);
    }
  }

  interaction["Types"] = types;
  interaction["Prompts"] = prompts;

  if (debug) {
    console.log("Proto Option: ", batch);
    console.log("**INTERACTIONS LENGTH", Object.keys(interaction).length);
    console.log("**INTENTS ARRAY", intents);
    console.log("**UTTERANCES ARRAY", utterances);
    console.log("**PROMPTS ARRAY", prompts);
  }

  createInteractionModel(interaction);
  createLambda(interaction, responses);

  console.log("makeskill: created batch " + batch + " files.");

  createSkillFilesCB(null);
}

/**
 * Helper function: creates the interaction model in JSON format for
 * the Alexa Skills Kit
 *
 * @param {Object} interaction The data structure comprising of intents, types, prompts
 */
function createInteractionModel(interaction) {
  let myTypes = interaction["Types"];
  let myPrompts = interaction["Prompts"];

  delete interaction.Types;
  delete interaction.Prompts;

  let myInteractions = interaction;
  let ixModelStr = "";

  ixHelpers.renderLanguageModel(myInteractions, myTypes);
  ixHelpers.renderDialog(myInteractions, myPrompts);
  ixHelpers.renderPrompts(myInteractions, myPrompts);

  // Close interaction model
  ixModelStr += "  }\n";
  ixModelStr += "}"; //interaction model end brace
  fs.appendFileSync(modelsFolder + "/en-US.json", ixModelStr);
}


/**
 * Helper function to create responses for an Alexa Skill
 *
 * @param {Object} interaction The data structure pairing utterances to intents
 * @param {Array} responses The desired responses (VUI) for the Skill batch
 */
function createLambda(interaction, responses) {
  let lambdaStr = "";
  let intentName = "";
  let intentHandler = "";
  let intentHandlers = [];

  for (let i = 0; i < Object.keys(interaction).length; i++) {

    if (responses[i]) {
      if (debug) {
        console.log("this response", responses[i].text);
      }

      let responseText = responses[i].text.trim();

/*
      let slots = responseText.match(/[^{}]+(?=\})/g);
      if (slots) {
        slots.forEach(slot => {
          slot = slot.replace("A.", "");
          lambdaStr +=
            "  var " +
            slot +
            " = this.event.request.intent.slots." +
            slot +
            ".value;\n";
        });
      }
      responseText = responseText.replace(/{/g, "${");
      responseText = responseText.replace(/A./g, "");

      lambdaStr += "  var say = `" + responseText + "`;\n";
      */

      // Check for voice-only
      if (responses[i].image == undefined || responses[i].image == "") {


        intentName = Object.keys(interaction)[i];
        intentHandler = intentName + "Handler";
        intentHandlers.push(intentHandler);

        lambdaStr += "\nconst " + intentHandler + " = {\n";
        lambdaStr += "  canHandle(handlerInput) {\n";
        lambdaStr += "    return handlerInput.requestEnvelope.request.type === 'IntentRequest'\n";
        lambdaStr += "      && handlerInput.requestEnvelope.request.intent.name === '" + intentName + "';\n";
        lambdaStr += "  },\n";
        lambdaStr += "  handle(handlerInput) {\n";
        lambdaStr += "    const speechText = '" + responseText + "';\n";

        lambdaStr += "    return handlerInput.responseBuilder\n";
        lambdaStr += "      .speak(speechText)\n";
        lambdaStr += "      .withSimpleCard('" + responseText + "', speechText)\n";
        lambdaStr += "      .getResponse();\n";
        lambdaStr += "  },\n";
        lambdaStr += "};\n";


        /*
        lambdaStr +=
          "  this.response.speak(say);\n  this.emit(':responseReady');\n};\n\n";
        */

      // Early multimodality
      } else {

        /*
        lambdaStr += '  var content = {\n    "hasDisplaySpeechOutput" : say,\n';
        lambdaStr += '    "templateToken" : "makeskillBodyTemplate",\n';
        lambdaStr += '    "askOrTell" : ":tell",\n    "imageUrl" : "';
        lambdaStr += responses[i].image + '"\n';
        lambdaStr += "  };\n  renderTemplate.call(this, content);\n};\n\n";
        */
      }
    }
  }

  lambdaStr += "\nexports.handler = skillBuilder\n";
  lambdaStr += "  .addRequestHandlers(\n";
  lambdaStr += "    LaunchRequestHandler,\n";
  lambdaStr += "    HelpIntentHandler,\n";
  lambdaStr += "    CancelAndStopIntentHandler,\n";
  lambdaStr += "    SessionEndedRequestHandler,\n";

  for (let n = 0; n < Object.keys(intentHandlers).length; n++) {
    if (n < Object.keys(intentHandlers).length - 1) {
      lambdaStr += "    " + intentHandlers[n] + ",\n";
    }
    else {
      lambdaStr += "    " + intentHandlers[n] + "\n";
    }
  }

  lambdaStr += "  )\n";
  lambdaStr += "  .addErrorHandlers(ErrorHandler)\n";
  lambdaStr += "  .lambda();\n";
  fs.appendFileSync(lambdaFolder + "/index.js", lambdaStr);

}


main();
