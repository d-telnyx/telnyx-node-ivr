<div align="center">

# Telnyx Node IVR App

![Telnyx](logo-dark.png)

A small sample app that covers basic use cases with Telnyx's Voice and Messaging APIs

</div>


## Pre-Reqs

You will need to set up:

* [Telnyx Account](https://telnyx.com/sign-up)
* [Telnyx Phone Number](https://portal.telnyx.com/#/app/numbers/my-numbers) enabled with:
  * [Telnyx Call Control Application](https://portal.telnyx.com/#/app/call-control/applications)
  * [Telnyx Outbound Voice Profile](https://portal.telnyx.com/#/app/outbound-profiles)
  * [Telnyx Messaging Profile](https://portal.telnyx.com/#/app/messaging)
* [Node Installed with NPM](https://nodejs.org/en/)
* Ability to receive webhooks (with something like [ngrok](https://ngrok.com/))
* At least ["level-2" verification](https://portal.telnyx.com/#/app/account/verifications) to successfully transfer calls.

## Installation

Clone the repo and run `npm install` to get started

## Usage

The following environmental variables need to be set

| Variable            | Description                                                                  |
|:--------------------|:-----------------------------------------------------------------------------|
| `TELNYX_API_KEY`    | Your [Telnyx API Key](https://portal.telnyx.com/#/app/api-keys)              |
| `TELNYX_PUBLIC_KEY` | Your [Telnyx Public Key](https://portal.telnyx.com/#/app/account/public-key) |

### .env file

This app uses the excellent [dotenv](https://www.npmjs.com/package/dotenv) package to manage environment variables.

Make a copy of [`.env.sample`](./.env.sample) and save as `.env` and update the variables to match your creds.

```
TELNYX_API_KEY=
TELNYX_PUBLIC_KEY=
```

## Callback URLs For Telnyx Applications

You will set these in your [Call Control Application](https://portal.telnyx.com/#/app/call-control/applications) and [Messaging Profile](https://portal.telnyx.com/#/app/messaging)

| Callback Type                                  | URL                                   |
|:-----------------------------------------------|:--------------------------------------|
| Messaging Callback (used for status updates)   | `<your-url>/message/callbacks/status` |
| Inbound Voice Callback (used for call control) | `<your-url>/voice/telnyx-webhook`     |

## Run The Server
Run the following command to start the server

```
npm start
```

You are now ready to call your Telynx phone number that is associated with the application

## App Overview

* This is the Raleigh Take-out IVR Tree
* Prompted to choose genre of food
* Once genre has been chosen, 2nd tree to chose specific restaurant
* Get a follow up message "confirming" your order

## Next Steps

* Add example with [TeXML](https://developers.telnyx.com/docs/v2/call-control/texml-setup)
* Better context-handling (which gather is which)
* Better logic management (if statements in a switch are gross)
    * Perhaps switch on context instead of event?
* Expandable configuration file (load a `.json` or `.yml` file with prompts)
* Better edge-case testing for better UX
  * Responding smartly when user hangsup at unexpected times

---

