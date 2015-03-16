var fs = require('fs');
var gm = require('gm');
var request = require('request');

exports.view = function(req, res){
  if (!req.user)
    res.redirect('/');

  console.log('logged in user: ', req.user);
  res.render('loggedin', { name: req.user.displayName });
};

exports.create = function(req, res) {
  console.log('post data!: ', req.body);

  var height = 600,
      width  = 600;

  // load image
  var img = gm('assets/images/img.jpg')
  .options({imageMagick: true});

  // crop image
  img.size(function (err, size) {
    if (!err)
    {
      var crop = {
        left: 0,
        top: 0,
        h: size.height,
        w: size.width
      };
      // console.log('prep crop', crop, size);

      if (size.width < size.height)
      {
        // console.log('taller');
        crop.h = size.width;
        crop.top = Math.floor((size.height - size.width) / 2);
      }
      else if (size.width > size.height)
      {
        // console.log('wider');
        crop.w = size.height;
        crop.left = Math.floor((size.width - size.height) / 2);
      }
      else
      {
        // console.log('equal');
      }
      // console.log('crop: ', crop);

      var offset = width / (crop.w/crop.left);

      // console.log('offset', offset);

      img.crop(crop.w, crop.h, crop.left, crop.top)
      .resize(width)
      // grayscale using standard Rec.709
      .recolor('0.2126 0.7152 0.0722, 0.2126 0.7152 0.0722, 0.2126 0.7152 0.0722')
      // rgb values 0 = 0, 1 = 255
      // .recolor('0.96 0 0, 0 0.51 0, 0 0 0.14')
      .recolor('1 0 0, 0 0.47 0, 0 0 0')
      // brighten!
      .recolor('2 0 0, 0 2 0, 0 0 2')
      // write MTD2015
      .font('assets/fonts/open-sans/OpenSans-ExtraBold.ttf', 128.4)
      .fill('#ffffffff')
      .drawText(offset + 2, height - 10, 'MTD2015')

      .write('output/result.png', function (err) {
        if (!err)
          console.log('done');
        else
          console.log('An error occured!', err);
      });
    }
  });

};
