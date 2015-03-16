exports.index = function(req, res){
  console.log('logged in user: ', req.user);
  if (req.user) {
    res.render('loggedin', { name: req.user.name.givenName });

  } else {
    res.render('index', { title: 'Route Separation Example' });
  }
};
