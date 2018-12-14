#!/usr/bin/env node
// Copyright 2018, Oath Inc.
// Licensed under the terms of the MIT license. See LICENSE file in project root for terms.

const argv = require("yargs").argv;
const async = require("async");
const fs = require("fs-extra");
const { google } = require("googleapis");
const googlePerm = require("./lib/google-permissions");
const readline = require("readline");
const uniqBy = require("lodash.uniqby");
const capitalize = require("lodash.capitalize");

const config = JSON.parse(fs.readFileSync(argv.config));
const invocationName = config.invocationName;
const sheetId = config.sheetId;
const vuiSheet = config.vuiSheet;
const multimodalCards = config.multimodalCards;
const customEntities = config.customEntities;

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
  let old_node_folder_dest = lambdaFolder + '/sdk_node_modules';
  let new_node_folder_dest = lambdaFolder + '/node_modules';

  // Using early Alexa SDK until new Alexa Core resolved for directives

  fs.remove(new_node_folder_dest, err => {
    if (err) return console.error(err)
  })

  fs.copy('input/alexa_sdk/', lambdaFolder, err => {
    if (err) return console.error(err);

    fs.rename(old_node_folder_dest, new_node_folder_dest, function (err) {
      if (err) throw err;
      fs.stat(new_node_folder_dest, function (err, stats) {
        if (err) throw err;
      });
    });
  });


  if (multimodalCards && multimodalCards != "") {
    fs
      .createReadStream("./input/baseline-multimodal-lambda.js")
      .pipe(fs.createWriteStream(lambdaFolder + "/index.js"));
  } else {
    fs
      .createReadStream("./input/baseline-lambda.js")
      .pipe(fs.createWriteStream(lambdaFolder + "/index.js"));
  }

  fs
    .createReadStream("./input/baseline-interaction-model.json")
    .pipe(fs.createWriteStream(modelsFolder + "/en-US.json"));
  prepSkillFilesCB(null);
}

/**
 * Based on Google Sheet credentials and sheet ID, reads a given G Spreadsheet.
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

        parseSpreadsheetCB(null, vuiRows, echoDisplayRows, customEntityRows);
      });
    } else if (multimodalCards && !customEntities) {
      const request = {
        spreadsheetId: sheetId,
        ranges: [vuiSheet + "!A1:Z1000", multimodalCards + "!A2:Z1000"],
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

        parseSpreadsheetCB(null, vuiRows, echoDisplayRows, null);
      });
    } else if (!multimodalCards && customEntities) {
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

        parseSpreadsheetCB(null, vuiRows, null, customEntityRows);
      });
    } else {
      const request = {
        spreadsheetId: sheetId,
        ranges: [vuiSheet + "!A1:Z1000"],
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

        parseSpreadsheetCB(null, vuiRows, null, null);
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
 * @param {function} prepDataCB The callback for prepareData
 */
function prepareData(vuiRows, echoDisplayRows, customEntityRows, prepDataCB) {
  const batch = argv.batch ? argv.batch : config.defaultBatchLetter;
  let intents = [];
  let utterances = [];
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

    prepDataCB(null, batch, intents, utterances, types, responses);
  }
}

/**
 * Creates the Skill files, calls upon helper functions that rely on the
 * interaction model.
 *
 * @param {String} batch The Skill batch to export
 * @param {Array} intents The intents for the Skill batch
 * @param {Array} utterances The utterances for the Skill
 * @param {Array} types The entity types for the Skill
 * @param {Object} responses The desired responses for the Skill batch
 * @param {function} createSkillFilesCB The callback for createSkillFiles
 */
function createSkillFiles(
  batch,
  intents,
  utterances,
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

  if (debug) {
    console.log("Proto Option: ", batch);
    console.log("**INTERACTIONS LENGTH", Object.keys(interaction).length);
    console.log("**INTENTS ARRAY", intents);
    console.log("**UTTERANCES ARRAY", utterances);
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
 * @param {Object} interaction The data structure pairing utterances to intents
 */
function createInteractionModel(interaction) {
  for (
    let keys = Object.keys(interaction), i = 0, end = keys.length - 1;
    i < end;
    i++
  ) {
    let key = keys[i],
      value = interaction[key];
    let utt = "" + interaction[key];
    let formattedUtt = "";
    let intentStr = "";
    let typesStr = "";
    let intentRemain = "";
    let origUtt = "";

    utt = utt.split(",");

    for (let x = 0; x < utt.length; x++) {
      if (x < utt.length - 1) {
        origUtt += '"' + utt[x] + '", ';

        if (utt[x].includes("A.")) {
          updatedUtt = utt[x].replace("A.", "");
          formattedUtt += '"' + updatedUtt + '", ';
        } else {
          formattedUtt += '"' + utt[x] + '", ';
        }
      } else {
        origUtt += '"' + utt[x] + '" ';

        if (utt[x].includes("A.")) {
          updatedUtt = utt[x].replace("A.", "");
          formattedUtt += '"' + updatedUtt + '"';
        } else {
          formattedUtt += '"' + utt[x] + '"';
        }
      }
    }

    let slots = origUtt.match(/[^{}]+(?=\})/g);
    let slotNames = [];
    slotNames = uniqBy(slots);

    intentStr = '        {\n          "name": "' + keys[i] + '",\n';
    intentStr += '          "samples": [' + formattedUtt + "],\n";
    intentStr += '          "slots": [\n';

    slotNames.forEach((slotName, index, arr) => {
      intentStr += "            {\n";

      // AMAZON default supported slot
      if (slotName.includes("A.")) {
        slotName = slotName.replace("A.", "");
        intentStr += '               "name": "' + slotName + '",\n';
        intentStr +=
          '               "type": "AMAZON.' + slotName.toUpperCase() + '"\n';
      // Custom Makeskill slot
      } else {
        intentStr += '               "name": "' + slotName + '",\n';
        intentStr +=
          '               "type": "Makeskill_' + capitalize(slotName) + '"\n';
      }

      if (index < arr.length - 1) {
        intentStr += "            },\n";
      } else {
        intentStr += "            }\n";
      }
    });

    if (i < end - 1) {
      intentStr += "          ]\n        },\n";
    } else {
      intentStr += "          ]\n        }\n       ],\n";
    }

    fs.appendFileSync(modelsFolder + "/en-US.json", intentStr);
  }

  typesStr = '       "types": [\n';

  for (let y = 0; y < interaction["Types"].length; y++) {
    let typeName = interaction["Types"][y].name;
    let typeValues = interaction["Types"][y].values.split(", ");
    typesStr += "         {\n";
    typesStr += '           "name": "' + typeName + '",\n';
    typesStr += '           "values": [\n';

    for (let x = 0; x < typeValues.length; x++) {
      typesStr += "              {\n";
      typesStr += '               "name": {\n';
      typesStr += '                  "value": "' + typeValues[x] + '"\n';
      typesStr += "                }\n";

      if (x < typeValues.length - 1) {
        typesStr += "              },\n";
      } else {
        typesStr += "              }\n";
      }
    }
    typesStr += "           ]\n";

    if (y < interaction["Types"].length - 1) {
      typesStr += "         },\n";
    } else {
      typesStr += "         }\n";
    }
  }

  typesStr += "        ],\n";

  fs.appendFileSync(modelsFolder + "/en-US.json", typesStr);

  intentRemain =
    '       "invocationName": "' + invocationName + '"\n    }\n  }\n}';

  fs.appendFileSync(modelsFolder + "/en-US.json", intentRemain);
}

/**
 * Helper function to create responses for an Alexa Skill
 *
 * @param {Object} interaction The data structure pairing utterances to intents
 * @param {Array} responses The desired responses (VUI) for the Skill batch
 */
function createLambda(interaction, responses) {
  let lambda = "";

  for (let i = 0; i < Object.keys(interaction).length - 1; i++) {
    lambda = "handlers." + Object.keys(interaction)[i];

    if (responses[i]) {
      if (debug) {
        console.log("this response", responses[i].text);
      }

      let responseText = responses[i].text;
      let slots = responseText.match(/[^{}]+(?=\})/g);

      lambda += " = function () {\n";

      if (slots) {
        slots.forEach(slot => {
          slot = slot.replace("A.", "");
          lambda +=
            "  var " +
            slot +
            " = this.event.request.intent.slots." +
            slot +
            ".value;\n";
        });
      }

      responseText = responseText.replace(/{/g, "${");
      responseText = responseText.replace(/A./g, "");

      lambda += "  var say = `" + responseText + "`;\n";

      // Check for voice-only
      if (responses[i].image == undefined || responses[i].image == "") {
        lambda +=
          "  this.response.speak(say);\n  this.emit(':responseReady');\n};\n\n";
      // Early multimodality
      } else {
        lambda += '  var content = {\n    "hasDisplaySpeechOutput" : say,\n';
        lambda += '    "templateToken" : "makeskillBodyTemplate",\n';
        lambda += '    "askOrTell" : ":tell",\n    "imageUrl" : "';
        lambda += responses[i].image + '"\n';
        lambda += "  };\n  renderTemplate.call(this, content);\n};\n\n";
      }
    }
    fs.appendFileSync(lambdaFolder + "/index.js", lambda);
  }
}

main();
