var express = require('express');
var router = express.Router();
var passport = require('passport');

// load our files
var site = require('./site');
var image = require('./image');

router.get('/', site.index);
router.get('/image', image.view);
router.post('/image', image.create);

// auth-related routes

// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
//     /auth/facebook/callback
router.get('/auth/facebook',
  passport.authenticate('facebook', {scope: 'publish_actions'}));
// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
router.get('/auth/facebook/callback',
  passport.authenticate('facebook', {successRedirect: '/image',
                                     failureRedirect: '/login'}));
router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

module.exports = router;
