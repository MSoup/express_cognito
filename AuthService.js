// This may work, but I was told not to rely on libraries if I can

global.fetch = require('node-fetch');
global.navigator = () => null;

const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const poolData = {
   UserPoolId: "us-east-2_nsZqoYwUt",
   ClientId: "6g8ujpf9v6653pe56j5sff5ddi"
};
const pool_region = "us-east-2";

const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

exports.Register = function (body, callback) {
   var name = body.name;
   var email = body.email;
   var password = body.password;
   var attributeList = [];
   
   attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "email", Value: email }));
   userPool.signUp(name, password, attributeList, null, function (err, result) {
     if (err)
         callback(err);
     var cognitoUser = result.user;
     callback(null, cognitoUser);
   })
}


// Controller Code
var authService = require('../Services/AuthService');
exports.register = function(req, res){
    let register = authService.Register(req.body, function(err, result){
    if(err)
        res.send(err);
    res.send(result);
  })
}