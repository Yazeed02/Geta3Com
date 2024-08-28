const { google } = require('googleapis');
const readline = require('readline');

const CLIENT_ID = '795963005542-eomc93hfl62p4grvf8548rvb75tpomlb.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const getAccessToken = async () => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.send'],
  });
  console.log('Authorize this app by visiting this url:', authUrl);

  const open = (await import('open')).default;
  await open(authUrl);

  rl.question('Enter the code from that page here: ', (code) => {
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      console.log('Your refresh token:', token.refresh_token);
      rl.close();
    });
  });
};

getAccessToken();
