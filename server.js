// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();

console.log(process.env.REDIRECT_URL)


// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

// This route is hit when a use clicks 'Login' in the website
// We redirect the user to the Spotify login in order to authenticate the user and obtain a grant code
app.get('/spotify/login', function(req, res) {
  // define scopes from Spotify documentation
  var scopes = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize' +
    '?response_type=code' +
    '&client_id=' + process.env.CLIENT_ID +
    (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
    '&redirect_uri=' + encodeURIComponent(process.env.REDIRECT_URL));
});

// Spotify sends a GET request back to this REDIRECT_URL we specified with a grant code in the url query  
// We will send this code back to Spotify to get an access token
app.get('/spotify/callback', async function(req, res) {
  const {code} = req.query
  console.log({code})
  
  const accessToken = await getAccessToken(code)

});

// a method for making a POST request to Spotify to get an access token 
const getAccessToken = async (code) => {
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  
  const headers = {
    headers: {
      Accept: 'application/json',
      'Authorization': 'application/x-www-form-urlencoded',
    },
    auth: {
      username: clientId,
      password: clientSecret,
    },
  };
  const data = {
    grant_type: 'authorization_code',
    code,
    redirect_uri: process.env.REDIRECT_URI // only used for validation - does not actually redirect. Must match redirect URI from first authorization call
  };

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      qs.stringify(data),
      headers
    );
    console.log(response.data.access_token);
    return response.data.access_token;
  } catch (error) {
    console.log(error);
  }
};