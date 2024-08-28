const axios = require('axios');
require('dotenv').config();

const sendSMS = async (phoneNumber, otp) => {
  const options = {
    method: 'POST',
    url: process.env.TELESIGN_VOICE_URL,
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'X-RapidAPI-Key': process.env.TELESIGN_API_KEY,
      'X-RapidAPI-Host': 'telesign-telesign-voice-verify-v1.p.rapidapi.com'
    },
    data: new URLSearchParams({
      phone_number: phoneNumber,
      verify_code: otp
    })
  };

  try {
    const response = await axios.request(options);
    console.log('SMS sent:', response.data);
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
};

module.exports = sendSMS;
