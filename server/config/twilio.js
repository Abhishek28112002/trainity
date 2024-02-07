const accountSid = "AC16b3360da6c50ce8f5323ff579698a1b";
const authToken = "81412339ce1ffff173039a36e408da60";
const client = require("twilio")(accountSid, authToken);

module.exports = client;
