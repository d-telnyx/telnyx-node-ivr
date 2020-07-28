const express  = require('express');
const config = require('./config');

const telnyx = require('telnyx')(config.TELNYX_API_KEY);
const router = module.exports = express.Router();

const toBase64 = data => (new Buffer.from(data)).toString('base64');
const fromBase64 = data => (new Buffer.from(data, 'base64')).toString();

const callRouter = async (req, res) => {
  res.sendStatus(200); // Play nice and respond to webhook
  const event = req.body.data;
  const context = event.payload.client_state ?
      fromBase64(event.payload.client_state) : '';
  const call = new telnyx.Call({call_control_id: event.payload.call_control_id});
  switch (event.event_type) {
    case 'call.initiated':
      if (event.payload.direction === 'incoming') {
        await handleInitiated(call);
      }
      break;
    case 'call.answered':
      if (context === 'incomingCall') {
        await handleAnswered(call);
      }
      break;
    case 'call.gather.ended':
      if (context === 'initPrompt') {
        await handleInitGather(call, event);
      }
      else if(context === 'pizza') {
        await handlePizza(call, event);
      }
      else if(context === 'burgers') {
        await handleBurgers(call, event);
      }
      else {
        console.log(context);
      }
      break;
    case 'call.hangup':
      if (context) {
        // at this point the outbound transfered call will not have context
        // We only care if the OG caller hangsup
        await handleHangup(call, event, context);
      }
      break;
    default:
      console.log(event.event_type);
      break;
  }
}

const handleInitiated = async call => {
  try {
    const context = toBase64('incomingCall')
    await call.answer({client_state: context});
  }
  catch (e) {
    console.log('Error answering the call');
    console.log(e.message);
  }
}

const createGather = async (call, prompt, context) => {
  try {
    await call.gather_using_speak({
      payload: prompt,
      invalid_payload: 'Options are 1 or 2',
      maximum_digits: 1,
      valid_digits: '12',
      client_state: toBase64(context),
      voice: 'male',
      language: 'en-US'
    });
  }
  catch (e) {
    console.log('Error creating gather on call');
    console.log(e);
  }
}

const createTransfer = async (call, to, context) => {
  try {
    await call.transfer({
      to: to,
      client_state: toBase64(context)
    });
  }
  catch (e) {
    console.log('Error transferring the call');
    console.log(e);
  }
}

const createHangup = async call => {
  try {
    await call.hangup();
  }
  catch (e) {
    console.log('Error hanging up the call');
    console.log(e);
  }
}

const handleAnswered = async call => {
  const prompt = 'Hello and welcome to the Raleigh Take-out service, press 1 for pizza or 2 for burgers';
  const context = 'initPrompt';
  await createGather(call, prompt, context);
}

const handleInitGather = async (call, event) => {
  const isPizza = (event.payload.digits === '1');
  const isBurgers = (event.payload.digits === '2');
  if (isPizza) {
    const prompt = 'Pizza it is, press 1 for Mellow Mushroom or 2 for Hungry Howies';
    const context = 'pizza';
    await createGather(call, prompt, context);
  }
  else if (isBurgers){
    const prompt = 'Burgers it is, press 1 for char-grill or 2 for Burger-Fi';
    const context = 'burgers';
    await createGather(call, prompt, context);
  }
  else {
    console.log('user hungup, (handleInitGather)');
  }
}

const handlePizza = async (call, event) => {
  const isMellow = (event.payload.digits === '1');
  const isHungry = (event.payload.digits === '2');
  if (isMellow) {
    await createTransfer(call, '+19198323499', 'Mellow Mushroom');
  }
  else if (isHungry) {
    await createTransfer(call, '+19197823434', 'Hungry Howies');
  }
  else {
    console.log('user hungup, (handlePizza)');
  }
}

const handleBurgers = async (call, event) => {
  const isGrill = (event.payload.digits === '1');
  const isFi = (event.payload.digits === '2');
  if (isGrill) {
    await createTransfer(call,'+19197812945', 'Char-grill');
  }
  else if (isFi) {
    await createTransfer(call,'+19199993700', 'Burger-Fi');
  }
  else {
    console.log('user hungup, (handleBurgers)');
  }
}

const handleHangup = async (call, event, context) => {
  // We can do better than this, but it works for now
  const locations = ['Burger-Fi', 'Char-grill', 'Hungry Howies', 'Mellow Mushroom'];
  const text = (locations.includes(context)) ?
      `Thanks for your order from ${context}!` :
      `Sorry you didn't place an order`
    const messageData = {
      'from': event.payload.to,
      'to': event.payload.from,
      'text': text
    };
  try {
    const res = await telnyx.messages.create(messageData);
    console.log(`Sent message with ID: ${res.data.id}`);
    return res;
  }
  catch (e) {
    console.log('Error sending SMS');
    console.log(messageData);
    console.log(e);
  }
}

router.route('/telnyx-webhook')
  .post(callRouter)