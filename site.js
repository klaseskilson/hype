exports.index = function(req, res){
  console.log('logged in user: ', req.user);
  if (req.user) {
    res.redirect('/image');
  } else {
    res.render('index');
  }
};
