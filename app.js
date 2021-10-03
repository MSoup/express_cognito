var express = require('express');
var app = express();

var request = require('request');
var jwt = require('jsonwebtoken');

// process.env.VARIABLE to access .env variables
require('dotenv').config()


// Build cognito URL while establishing global variables
BASE_URL = process.env.BASE_URL + 'login?';
CLIENT_ID = process.env.CLIENT_ID;
RESPONSE_TYPE = 'code';
SCOPE = 'openid';
REDIRECT_URI = process.env.REDIRECT_URI;
COGNITO_LOGIN_PORTAL_URL = `${BASE_URL}client_id=${CLIENT_ID}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}&redirect_uri=${REDIRECT_URI}`

// Build known JWKs
REGION = "us-east-2"
USERPOOL_ID = "us-east-2_nsZqoYwUt"
JWKS_PUBLIC = `https://cognito-idp.${REGION}.amazonaws.com/${USERPOOL_ID}/.well-known/jwks.json`
let validCerts;

request(JWKS_PUBLIC, { json: true }, (err, res, body) => {
    if (err) { console.log(err) };
    if (res.statusCode === 200) { validCerts = body.keys }
    else { console.log("res status code wasnt 200") }
})

// return of a json object from fat-arrow function
// const checkKid = (kid) => ({

// });

// currying, please don't do
// const createFunctionForKidChecking = (kidToCheck) => (kid) =>  kid === kidToCheck/

// function as parameter to iterator with implicit return
// const mapNumToString = (num) => num.toString();
// [1,2,3].map(mapNumToString)

// TODO: Verifying incoming token
function verifyToken(token) {
    const decodedJwt = jwt.decode(token, { complete: true });
    let payload = decodedJwt.payload;

    const kidToCheck = payload.kid;

    const correctCert = validCerts.find(cert => cert.kid === kidToCheck);
    
    if(!correctCert) {
        return false
    }

    const options = {
        algorithms: 'RS256',
        audience: CLIENT_ID,
        issuer: "https://cognito-idp.us-east-2.amazonaws.com/us-east-2_nsZqoYwUt",
        
    }

    
    // Verify the token is actually legitimate
    jwt.verify(token, correctCert, options);

    try {
        jwt.verify(token, correctCert, options);
        return true;
    }
    catch (err) {
        return false;
    }
    // user pool ID should match payload[aud]
    // if (CLIENT_ID !== payload.aud) {
    //     throw new Error("Invalid audience: " + payload.aud)
    // }

    // if (payload.iss !== `https://cognito-idp.${REGION}.amazonaws.com/${USERPOOL_ID}`) {
    //     throw new Error("Invalid issuer: " + payload.iss)
    // }

}

const getTokens = async (code) => {
    // As per https://docs.aws.amazon.com/cognito/latest/developerguide/token-endpoint.html
    body = {
        grant_type: "authorization_code",
        client_id: CLIENT_ID,
        scope: SCOPE,
        redirect_uri: REDIRECT_URI,
        code: code,
    }

    // Sample request
    // POST https://mydomain.auth.us-east-1.amazoncognito.com/oauth2/token&
    //                    Content-Type='application/x-www-form-urlencoded'&
    //                    Authorization=Basic aSdxd892iujendek328uedj
                       
    //                    grant_type=authorization_code&
    //                    client_id=djc98u3jiedmi283eu928&
    //                    code=AUTHORIZATION_CODE&
    //                    redirect_uri=com.myclientapp://myclient/redirect

    headers = {
            'Content-Type': "application/x-www-form-urlencoded",
        }
    url = `${process.env.BASE_URL}/oauth2/token`

    options = {
        url: url,
        // json: true,
        // headers: headers,
        form: body,
        method: 'POST',
    }

    // https://github.com/request/request

    // console.log({options, body, url})

    function callback(err, res, body) {
        if (!err && res.statusCode == 200) {
            console.log(body);
            return body
        }
        const {statusCode, headers} = res;

        console.log({body})
        console.log({statusCode})
        console.log({headers})
        console.log({err})

        throw new Error("Could not get token for some reason..");
    }

    // POST oauth2/token endpoint
    try {
        const res = await request(options, callback);
    } catch {

    }
}

// Serving "/" -> redirect to Cognito hosted UI
app.get('/', (req, res) => res.redirect(COGNITO_LOGIN_PORTAL_URL));

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
    verifyToken(tokens.id_token);
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

