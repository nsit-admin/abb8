'use strict';

/**
 * This is a bot that acts as a basic hello world
 */

// --------------- Helpers that build all of the responses -----------------------


function elicitSlot(sessionAttributes, intentName, slots, slotToElicit, message) {
  return {
    sessionAttributes,
    dialogAction: {
      type: 'ElicitSlot',
      intentName,
      slots,
      slotToElicit,
      message,
    },
  };
}

function confirmIntent(sessionAttributes, intentName, slots, message) {
  return {
    sessionAttributes,
    dialogAction: {
      type: 'ConfirmIntent',
      intentName,
      slots,
      message,
    },
  };
}

function close(sessionAttributes, fulfillmentState, message) {
  return {
    sessionAttributes,
    dialogAction: {
      type: 'Close',
      fulfillmentState,
      message,
    },
  };
}

function delegate(sessionAttributes, slots) {
  return {
    sessionAttributes,
    dialogAction: {
      type: 'Delegate',
      slots,
    },
  };
}

// ---------------- Helper Functions --------------------------------------------------

function buildValidationResult(isValid, violatedSlot, messageContent) {
  return {
    isValid,
    violatedSlot,
    message: { contentType: 'PlainText', content: messageContent },
  };
}

// this function is what builds the introduction

function standardSection(intentRequest, callback) {
  const sessionAttributes = intentRequest.sessionAttributes || {};
  const slots = intentRequest.currentIntent.slots;
  console.log('Values are => ', slots)

  var nextSlot = '';
  var content = '';

  if (intentRequest.currentIntent.slots.contractType == null) {
    content = 'What is the type of contract ? [Type TECH or NON-TECH]';
    nextSlot = 'contractType';
  } else if (intentRequest.currentIntent.slots.contractNbr == null) {
    content = 'What is the Contract Number? [ENTER NUMBERS]? ';
    nextSlot = 'contractNbr';
  } else if (intentRequest.currentIntent.slots.contractNm == null) {
    content = 'What is the Contract Name? ';
    nextSlot = 'contractNm';
  } else if (intentRequest.currentIntent.slots.svcOferd == null) {
    content = 'Describe the service offered? ';
    nextSlot = 'svcOferd';
  } else if (intentRequest.currentIntent.slots.effDt == null) {
    content = 'When it is effective? ';
    nextSlot = 'effDt';
  } else if (intentRequest.currentIntent.slots.expDt == null) {
    content = 'What is the expiration date? ';
    nextSlot = 'expDt';
  } else if (intentRequest.currentIntent.slots.totalVal == null) {
    content = 'What is the total value of this contract?       ';
    nextSlot = 'totalVal';
  } else if (intentRequest.currentIntent.slots.svcOfered == null) {
    content = 'Services offered on-site? Yes or No ';
    nextSlot = 'svcOfered';
  } else{
    callback(close(sessionAttributes, 'Fulfilled',
    { contentType: 'PlainText', content: 'Standard Section is completed!!! <br> To continue with next section type <b>Section II</b> or type <b>Good Bye</b> to exit' }));
      
  }



  callback(elicitSlot(sessionAttributes, intentRequest.currentIntent.name,
    slots, nextSlot, { contentType: 'PlainText', content: content }));

  // callback(close(sessionAttributes, 'Fulfilled',
  // { contentType: 'PlainText', content: counterResponse }));
}


function servicesSection(intentRequest, callback) {
  const sessionAttributes = intentRequest.sessionAttributes || {};
  const slots = intentRequest.currentIntent.slots;
  console.log('Values are => ', slots)

  var nextSlot = '';
  var content = '';

  if (intentRequest.currentIntent.slots.ariba == null) {
    content = 'Are we using Ariba? Yes or No ';
    nextSlot = 'ariba';
  } else if (intentRequest.currentIntent.slots.svcAddress == null) {
    content = 'What is the location of the contract? [Enter full address]  ';
    nextSlot = 'svcAddress';
  } else if (intentRequest.currentIntent.slots.expenseReim == null) {
    content = 'Any expenses to be reimbursed? Yes or No ';
    nextSlot = 'expenseReim';
  } else if (intentRequest.currentIntent.slots.invAddress == null) {
    content = 'What is the invoice address? ';
    nextSlot = 'invAddress';
  } else {
    console.log(intentRequest.currentIntent.slots);
    console.log(intentRequest.alternativeIntents[0].slots);
    callback(close(sessionAttributes, 'Fulfilled',
    { contentType: 'PlainText', content: 'Section II is completed!!! Thanks for using Abbrevia8 assistant' }));
  }



  callback(elicitSlot(sessionAttributes, intentRequest.currentIntent.name,
    slots, nextSlot, { contentType: 'PlainText', content: content }));

  // callback(close(sessionAttributes, 'Fulfilled',
  // { contentType: 'PlainText', content: counterResponse }));
}

// this function is what builds the wrap-up of a conversation

function endConversation(intentRequest, callback) {
  const sessionAttributes = intentRequest.sessionAttributes || {};

  var counterResponse = 'Thanks for checking in. Have a nice day! ';

  callback(close(sessionAttributes, 'Fulfilled',
    { contentType: 'PlainText', content: counterResponse }));

}

// this function is what builds the response to a request for help

function getHelp(intentRequest, callback) {
  const sessionAttributes = intentRequest.sessionAttributes || {};

  var counterResponse = 'This is the Hello World chatbot. ' +
    'Please let me know how I can help by responding with something like ' +
    'Hello or Goodbye.';

  callback(close(sessionAttributes, 'Fulfilled',
    { contentType: 'PlainText', content: counterResponse }));

}

// this function is what validates what information has been provided

function validateSomething(intentRequest, callback) {
  const sessionAttributes = intentRequest.sessionAttributes || {};
  const slots = intentRequest.currentIntent.slots;

  //const slotData = intentRequest.currentIntent.slots.xxx;

  var passedValidation = false;

  // check the data passed validation then provide a valid callback
  if (passedValidation) {

    callback(delegate(sessionAttributes, intentRequest.currentIntent.slots));

  } else {

    // format error message to be returned
    var errorMessage = 'No Data Provided';
    //const errorSlot = 'TBD';

    // call helper function to format JSON for error response
    const validationResult = buildValidationResult(false, errorSlot, errorMessage);
    console.log("Validation Result: " + JSON.stringify(validationResult));

    callback(elicitSlot(sessionAttributes, intentRequest.currentIntent.name,
      slots, validationResult.violatedSlot, validationResult.message));

  }
}

// --------------- Intents -----------------------

/**
 * Called when the user specifies an intent for this skill.
 */
function dispatch(intentRequest, callback) {
  // console.log(JSON.stringify(intentRequest, null, 2));
  console.log(`dispatch userId=${intentRequest.userId}, intentName=${intentRequest.currentIntent.name}`);

  const intentName = intentRequest.currentIntent.name;
  const intentSource = intentRequest.invocationSource;

  // Dispatch to the skill's intent handlers
  if (intentName === 'welcomeSection') {
    console.log("common section => ", intentRequest);
    return standardSection(intentRequest, callback);
  } else if (intentName === 'services') {
    console.log("services section => ", intentRequest);
    return servicesSection(intentRequest, callback);
  }
  // } else if (intentName === 'Thanks') {
  //   console.log("received thank you from user.");
  //   return endConversation(intentRequest, callback);
  // } else if (intentName === 'Help') {
  //   console.log("user requested help.");
  //   return getHelp(intentRequest, callback);
  // }

  throw new Error(`Intent with name ${intentName} not supported`);
}

// --------------- Main handler -----------------------

function loggingCallback(response, originalCallback) {
  console.log(JSON.stringify(response, null, 2));
  originalCallback(null, response);
}

// Route the incoming request based on intent.
// The JSON body of the request is provided in the event slot.
exports.handler = (event, context, callback) => {
  try {
    // By default, treat the user request as coming from the America/New_York time zone.
    // process.env.TZ = 'America/New_York';
    // console.log(`event.bot.name=${event.bot.name}`);

    // // remember to enter your bot name here
    // if (event.bot.name != 'HelloWorld') {
    //      console.log('Invalid Bot Name');
    // }
    dispatch(event, (response) => loggingCallback(response, callback));
  } catch (err) {
    console.log("error =>", err);
    callback(err);
  }
};