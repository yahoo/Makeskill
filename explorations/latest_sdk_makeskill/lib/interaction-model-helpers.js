#!/usr/bin/env node
// Copyright 2018, Oath Inc.
// Licensed under the terms of the MIT license. See LICENSE file in project root for terms.

const argv = require("yargs").argv;
const async = require("async");
const fs = require("fs-extra");
const { google } = require("googleapis");
const googlePerm = require("./google-permissions");
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

//////////////
//
// INTERACTION MODEL RENDERER
// Helper Functions
//
//////////////

exports.renderLanguageModel = function renderLanguageModel(myInteractions, myTypes) {
  let ixModelStr = "";

  if (debug) {
    console.log("render language model");
    console.log(myInteractions);
    console.log(myTypes);
  }
  renderMyIntents(myInteractions);
  renderMyTypes(myTypes);

  // Invocation name
  if (slotPrompts === undefined) {
    ixModelStr =
        '      "invocationName": "' + invocationName + '"\n    }\n';  //  }\n}'; Have to add both dialog and prompt model to interaction model DN
  } else {
    ixModelStr =
        '      "invocationName": "' + invocationName + '"\n    },\n';  //  }\n}'; Have to add both dialog and prompt model to interaction model DN
  }

  fs.appendFileSync(modelsFolder + "/en-US.json", ixModelStr);
}


function renderMyIntents(myInteractions) {
  let intentStr = "";

  for (
    let keys = Object.keys(myInteractions), i = 0, end = keys.length;
    i < end;
    i++
  ) {
    let origUtt = "";
    let formattedUtt = "";
    let slots = "";
    let slotNames = [];

    let key = keys[i],
      value = myInteractions[key];
    let utt = "" + myInteractions[key];

    utt = utt.split(",");

    origUtt = formatUtterance(utt).Original;
    formattedUtt = formatUtterance(utt).Formatted;

    slots = origUtt.match(/[^()]+(?=\))|[^{}]+(?=\})/g); // grabs slots denoted by both () and {}
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
          '               "type": "Makeskill_' + capitalize(slotName) + '",\n';
        intentStr +=
          '               "sample": "{' + slotName + '}"\n';
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
      intentStr += "          ]\n        }\n";
    }

    fs.appendFileSync(modelsFolder + "/en-US.json", intentStr);
  }
}

function renderMyTypes(myTypes) {
  let typesStr = "";
  typesStr = '      ], \n      "types": [\n';

  for (let y = 0; y < myTypes.length; y++) {
    let typeName = myTypes[y].name;
    let typeValues = myTypes[y].values.split(", ");
    typesStr += "        {\n";
    typesStr += '          "name": "' + typeName + '",\n';
    typesStr += '          "values": [\n';

    for (let x = 0; x < typeValues.length; x++) {
      typesStr += "            {\n";
      typesStr += '              "name": {\n';
      typesStr += '                "value": "' + typeValues[x] + '"\n';
      typesStr += "              }\n";

      if (x < typeValues.length - 1) {
        typesStr += "            },\n";
      } else {
        typesStr += "             }\n";
      }
    }
    typesStr += "           ]\n";

    if (y < myTypes.length - 1) {
      typesStr += "         },\n ";
    } else {
      typesStr += "         }\n";
    }
  }

  typesStr += "      ],\n";

  fs.appendFileSync(modelsFolder + "/en-US.json", typesStr);
}


exports.renderDialog = function renderDialog(myInteractions, myPrompts) {
  let dialogStr = "";
  let reqSlots = [];
  let optSlots = [];
  let dialogintentNames = [];
  let formattedUtt = "";
  let origUtt = "";

  for (
    let keys = Object.keys(myInteractions), i = 0, end = keys.length;
    i < end;
    i++
  ) {

      let key = keys[i],
        value = myInteractions[key];

      let utt = "" + myInteractions[key];

      utt = utt.split(",");
      origUtt = formatUtterance(utt).Original;
      formattedUtt = formatUtterance(utt).Formatted;

      optSlots.push(origUtt.match(/[^()]+(?=\))/g)); // pushes optional slots denoted by () to optSlots
      reqSlots.push(origUtt.match(/[^{}]+(?=\})/g)); // pushes required slots denoted by {} to reqSlots
      dialogintentNames.push(keys[i]); // pushes intent names used for dialog model

      if (myPrompts.length === 0) {
        fs.appendFileSync(modelsFolder + "/en-US.json", dialogStr);
      } else {

        dialogStr = '    "dialog": {  \n';
        dialogStr += '      "intents": [\n';

        for (let z = 0; z < myPrompts.length; z++) {
          dialogStr += '        {\n';
          dialogStr += '          "name": "' + dialogintentNames[z] + '",\n'; //intent name(s)
          dialogStr += '          "confirmationRequired": false,\n'; // confirmation value can be set to either true or false, set to false
          dialogStr += '          "prompts": {},\n';
          dialogStr += '          "slots": [\n';

          let uniqloReqSlots = uniqBy(reqSlots[z]); // grabs the unique required slots from reqSlots to avoid duplicates
          for (let x = 0; x < uniqloReqSlots.length; x++) {
            dialogStr += "            {\n";
            dialogStr += '             "name": "'+ reqSlots[z][x] +'",\n'; // grabs req slotname matching current intent
            dialogStr += '             "type": "Makeskill_' + capitalize(uniqloReqSlots[x]) +'",\n'; // grab slottype slotTypeName capitalize(reqSlots[z][x])
            dialogStr += '             "confirmationRequired": false,\n'; // confirmation value can be set to either true or false, set to false
            dialogStr += '             "elicitationRequired": true,\n'; // confirmation value can be set to either true or false, set to true
            dialogStr += '             "prompts": {\n';
            dialogStr += '                "elicitation": "Elicit.Intent-' + dialogintentNames[z] + '.IntentSlot-' + capitalize(reqSlots[z][x]) + '"\n';
            dialogStr += "              }\n";

            if (x < (uniqloReqSlots.length)- 1) {
              dialogStr += "            }, \n";
            } else {
              dialogStr += "            }\n";
            }
          }

          dialogStr += "          ]\n";

          if (z < myPrompts.length - 1) {
            dialogStr += "        },\n";
          } else {
            dialogStr += "         }\n";
          }
        }

        dialogStr += "        ]\n";
        dialogStr += "      },\n";

    }
  }
  fs.appendFileSync(modelsFolder + "/en-US.json", dialogStr);

}

exports.renderPrompts = function renderPrompts(myInteractions, myPrompts) {
  let promptStr = "";
  let allSlots = getSlots(myInteractions);
  let reqSlots = allSlots.Required;
  let dialogIntentNames = allSlots.DialogIntentNames;

  if (myPrompts.length === 0) {
    fs.appendFileSync(modelsFolder + "/en-US.json", promptStr);
  } else {

    promptStr += '    "prompts": [ \n';

    for (let z = 0; z < myPrompts.length; z++) {

      let uniqlopReqSlots = uniqBy(reqSlots[z]);
      for (let x = 0; x < uniqlopReqSlots.length; x++) {
        promptStr += "      {\n";
        promptStr += '        "id": "Elicit.Intent-' + dialogIntentNames[z] + '.IntentSlot-' + capitalize(reqSlots[z][x]) + '",\n'; //intent name// dialogintentNames[z]

        let currPrompt; // current Prompt on


        for (let j = 0; j < myPrompts.length; j++){
          let mdk = [];
          for(let n = 0; n < uniqlopReqSlots.length ; n++){
            mdk.push("Makeskill_" + capitalize(uniqlopReqSlots[n])); // adds in extra formatting for Makeskill typing
          }

          if(mdk[x] === myPrompts[j].slot){ // if they match then grab prompt
            currPrompt = myPrompts[j].promptResponses;
            break;
          } else {
            // console.log("Current prompt error");
          }
        }

        promptStr += '        "variations": [ \n';
        promptStr += "          {\n";
        promptStr += '            "type": "SSML",\n'; // SSML or PlainText
        promptStr += '            "value": "<speak>' + currPrompt + '</speak>"\n'; // grab prompt response
        promptStr += "          }\n";
        promptStr += '        ]\n';

        if (x < (myPrompts.length)- 1) {
          promptStr += "      },\n";
        } else {
          promptStr += "      }\n";
        }
      }
    }

    promptStr += "    ]\n";

    fs.appendFileSync(modelsFolder + "/en-US.json", promptStr);
  }
}


function formatUtterance(utterance) {
  let utt = [];
  let origUtt = "";
  let updatedUtt = "";
  let formattedUtt = "";

  for (let x = 0; x < utterance.length; x++) {
    if (x < utterance.length - 1) {
      origUtt += '"' + utterance[x] + '", ';

      if (utterance[x].includes("A.")) {
        updatedUtt = utterance[x].replace("A.", "");
        formattedUtt += '"' + updatedUtt + '", ';
      } else {
        formattedUtt += '"' + utterance[x] + '", ';
      }
    } else {
      origUtt += '"' + utterance[x] + '" ';

      if (utterance[x].includes("A.")) {
        updatedUtt = utterance[x].replace("A.", "");
        formattedUtt += '"' + updatedUtt + '"';
      } else {
        formattedUtt += '"' + utterance[x] + '"';
      }
    }
  }

  utt["Original"] = origUtt;
  utt["Formatted"] = formattedUtt;

  return utt;
}

function getSlots(myInteractions) {
  let allSlots = [];
  let reqSlots = [];
  let optSlots = [];
  let dialogIntentNames = [];
  let formattedUtt = "";
  let origUtt = "";

  for (
    let keys = Object.keys(myInteractions), i = 0, end = keys.length;
    i < end;
    i++
  ) {

      let key = keys[i],
        value = myInteractions[key];

      let utt = "" + myInteractions[key];

      utt = utt.split(",");
      origUtt = formatUtterance(utt).Original;
      formattedUtt = formatUtterance(utt).Formatted;

      optSlots.push(origUtt.match(/[^()]+(?=\))/g)); // pushes optional slots denoted by () to optSlots
      reqSlots.push(origUtt.match(/[^{}]+(?=\})/g)); // pushes required slots denoted by {} to reqSlots
      dialogIntentNames.push(keys[i]); // pushes intent names used for dialog model
  }

  allSlots["Optional"] = optSlots;
  allSlots["Required"] = reqSlots;
  allSlots["DialogIntentNames"] = dialogIntentNames;

  return allSlots;
}
