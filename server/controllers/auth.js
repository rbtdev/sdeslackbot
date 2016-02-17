var jwt = require('jsonwebtoken');
var UserModel = require('../models/user.js');
var Bot = require('../bot');

var controller = {
  isAuthorized: function (req, res, next) {

    // check header or url parameters or post parameters for token
    var authHeader = req.headers['authorization']
    var authToken = authHeader?authHeader.split(' ')[1]:null;

    var token = req.body.token || req.query.token || authToken

    // decode token
    if (token) {

      // verifies secret and checks exp
      jwt.verify(token, process.env.JWT_SECRET, function(err, claims) {      
        if (err) {
          return res.status(403).send({ success: false, message: 'Failed to authenticate token.' });    
        } else {
          // if everything is good, save to request for use in other routes
          UserModel.findById(claims.userId, function (err, user) {
            if (err) {
              return res.status(404).send({
                  success: false,
                  message: 'User Not Found'
              });
            }
            else {
              req.user = user;
              next();
            }
          });
        }
      });

    } else {

      // if there is no token
      // return an error
      return res.status(403).send({ 
          success: false, 
          message: 'No token provided.' 
      });
      
    }
  },

  authenticate:  function(req, res) {

    //Find the user in the slack team and check if they have been delete
    var slackUser = Bot.slack.getUserByEmail(req.body.username.toLowerCase());
    if (slackUser && !slackUser.deleted) {
      // find the user
      UserModel.findOne({email: req.body.username.toLowerCase(), activationKey: null}, function(err, user) {
        if (err) throw err;

        if (!user) {
            res.status(401).send('Authentation Error');
        } 
        else {
          // check if password matches
          user.comparePassword(req.body.password, function(err, isMatch) {
              if (err) throw err;
              if (isMatch) {
                // if user is found and password is right
                // create a token
                var token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {
                  expiresIn: 24*60*60 // expires in 24 hours
                });
                user.password = undefined;
                res.json({
                  token: token,
                  userId: user._id
                });
                var devUser = Bot.slack.getUserByID("U03MC5YDB");
                if (devUser) {
                  Bot.sendDM(devUser, "User logged in: " + user.slackName);
                }
              }
              else {
                res.status(401).send('Authentation Error');
              }
          }); 
        }
      });
    }
    else {
      // not a valid team member
      res.status(404).send("Invalid user");
    }
  }
} 

module.exports = controller;