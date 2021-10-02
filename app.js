var express = require('express');
var app = express();
const request = require('request');
var jwt = require('jsonwebtoken');

// Import .env sensitive data
require('dotenv').config()

// Build cognito URL
base_url = process.env.BASE_URL + 'login?';
client_id = process.env.CLIENT_ID;
response_type = 'code';
scope='openid';
redirect_uri=process.env.REDIRECT_URI;
finalURL = `${base_url}client_id=${client_id}&response_type=${response_type}&scope=${scope}&redirect_uri=${redirect_uri}`

// Build known JWKs
region = "us-east-2"
userPoolId = "us-east-2_nsZqoYwUt"
jwks = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`
// Valid kids stored here
valid_kids = []

request(jwks, {json: true}, (err, res, body) => {
    if (err) {console.log(err)};
    if (res.statusCode == 200) { body.keys.forEach(key => valid_kids.push(key.kid))}
    else { console.log("res status code wasnt 200")}
})

// Verifying incoming token
function verifyToken(token) {
    const decodedJwt = jwt.decode(token, {complete: true});
    let payload = decodedJwt.payload;
    // user pool ID should match payload[aud]
    if (client_id != payload.aud) {
        throw new Error("Invalid audience: " + payload.aud)
    }

    if (payload.iss != `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`) {
        throw new Error("Invalid issuer: " + payload.iss)
    }

    if (valid_kids.indexOf(payload.kid) !== -1) {
        return true
    }
    else {
        throw new Error("Invalid payload.kid: " + payload.kid)
    }
}

function getTokens(code) {
    body = {
        client_id: process.env.CLIENT_ID,
        grant_type: "authorization_code",
        redirect_uri: process.env.REDIRECT_URI,
        scope: 'openid',
        code: code,
    }

    headers = {
            'Content-Type': "application/x-www-form-urlencoded",
        }
    url = `${base_url}/oauth2/token`
    
    options = {
        url: url,
        json: true,
        headers: headers,
        body: body,
        method: 'POST',
    }

    function callback(err, res, body) {
        if (!err && res.statusCode == 200) {
            console.log(body);
            return body
        }

        console.log("res: " + body)
        console.log("res: " + res.statusCode)
        console.log("res: " + err)

        throw new Error("Could not get token for some reason..");
    }

    // POST oauth2/token endpoint
    request(options, callback);
}

// response = requests.post(f'{SITE_URL}/oauth2/token', data=data, headers=headers)
// response.raise_for_status()
// credentials = response.json()


// Serving "/" -> redirect to Cognito hosted UI
app.get('/', (req, res) => res.redirect(finalURL));

// Login from "/" => Callback Redirect URI 
app.get('/portal/cognito/redirect', function(req, res) {
    console.log("Successfully redirected");
    // code is to be exchanged for tokens
    code = req.query.code 
    console.log(code);

    // TODO: Exchange code for Tokens
    
    const tokens = getTokens(code)
    console.log(tokens);

    // TODO: Authenticate Token
    res.send("Hello. Please handle redirect using the code above");
});

app.get('/authenticated', function(req, res) {

})

// This is how to read the token when passed to endpoint
// 	console.log(req.headers)
// let idTokenFromClient = req.headers.authorization;

// Serve static files
app.use(express.static('public/js'));

module.exports = app;

