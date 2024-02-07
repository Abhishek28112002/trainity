const twilioClient = require("../config/twilio");
const twilioNum = "+12132386878";
const fast2sms = require("fast-two-sms");

const OTP = require("../models/Otp");

const sendOTP = async (phone, email) => {
  let fast2phone = phone.substring(3);
  const otp = Math.floor(100000 + Math.random() * 900000);

  try {
    // const messages = await twilioClient.messages.create({
    //   body: `Trainity (OTP for Login): ${otp}`,
    //   from: twilioNum,
    //   to: phone,
    // });
    let msgOptions = {
      authorization:
        "nWdP2FBmQpGCzqfrIA49XT67E01bgZVMNasRjKlyw3JH8ikxhuzCwM0bEQ4O6hNYGFqm1xVJislKg7nW",
      message: `Trainity (OTP for Login): ${otp}`,
      numbers: [fast2phone],
    };
    await fast2sms.sendMessage(msgOptions);
    let existOtp = await OTP.deleteOne({ email: email });
    const otpDoc = await OTP.create({
      value: otp,
      email,
      phone,
    });
    return {
      otp,
      otpID: otpDoc._id,
    };
  } catch (err) {
    console.log(err);
    return {
      error: "Something went wrong",
    };
  }
};

// (async () => {
//   const res = await sendOTP("+919983293065", "adityaagr00@gmail.com");
//   console.log(res);
// })();

module.exports = {
  sendOTP,
};
