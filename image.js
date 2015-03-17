var fs = require('fs');
var gm = require('gm');
var request = require('request');
var session = require('express-session');
var FormData = require('form-data');
var https = require('https');

exports.view = function(req, res) {
  if (!req.user)
    res.redirect('/');

  var remote_image = 'https://graph.facebook.com/v2.2/' + req.user.id + '/picture?height=600&width=600';

  var localimage = '';

  console.log('logged in user: ', req.user);
  console.log('user picture: ', remote_image);
  res.render('image', { name: req.user.displayName, image: remote_image });
};

exports.create = function(req, res) {
  if (!req.user)
    res.redirect('/');

  console.log('logged in user: ', req.user);
  console.log('post data!: ', req.body);

  // measure execution time
  var end, start;

  var height = 600,
      width  = 600;

  // start timer
  start = new Date();

  // prepare and download image
  var image = 'https://graph.facebook.com/v2.2/' + req.user.id + '/picture?height=600&width=600';
  var stream = request(image);
  // load image
  var img = gm(stream, './tmp-img-'+req.user.id+'.jpg')
  .options({imageMagick: true});

  // crop image
  img.size({bufferStream: true}, function (err, size) {
    if (!err)
    {
      var crop = {
        left: 0,
        top: 0,
        h: size.height,
        w: size.width
      };
      console.log('prep crop', crop, size);

      if (size.width < size.height)
      {
        // taller
        crop.h = size.width;
        crop.top = Math.floor((size.height - size.width) / 2);
      }
      else if (size.width > size.height)
      {
        // wider
        crop.w = size.height;
        crop.left = Math.floor((size.width - size.height) / 2);
      }

      var offset = width / (crop.w/crop.left);

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
      .font('public/fonts/open-sans/OpenSans-ExtraBold.ttf', 128.4)
      .fill('#ffffffff')
      .drawText(offset + 2, height - 10, 'MTD2015')

      .write('public/images/output/' + req.user.id + '.png', function (err) {
        end = new Date();
        if (!err)
        {
          // save time for science
          req.session.time = start.getTime();
          console.log('done! execution took ' + (end.getTime() - start.getTime()) + ' ms.');
          res.json({image: '/images/output/' + req.user.id + '.png'});
        } else {
          console.log('An error occured!', err);
          res.status(500).json({ error: 'could not create image', err: err });
        }
      });
    }
  });
};

exports.upload = function(req, res) {
  if (!req.user)
    res.redirect('/');

  var filename = 'public/images/output/'+req.user.id + '.png'

  // method from here: http://stackoverflow.com/a/24614863
  var form = new FormData(); //Create multipart form
  form.append('file', fs.createReadStream(filename)); //Put file
  form.append('message', "Ready for MTD2015! http://hype.medieteknikdagarna.se"); //Put message
  form.append('no_story', 'true'); // don't publish upload as a feed story
  form.append('privacy', JSON.stringify({'value': 'SELF'})); // make photo private

  var options = {
    method: 'post',
    host: 'graph.facebook.com',
    path: '/me/photos?access_token='+req.user.accessToken,
    headers: form.getHeaders()
  };

  //Do POST request, callback for response
  var request = https.request(options, function (response) {
    console.log('response: ', response);

    var body = '';

    response.on('data', function(chunk) {
      console.log('Data: ', chunk);
      body += chunk;
      // res.json({image: data});
    });

    response.on('end', function() {
      console.log(body);
      res.json({image: JSON.parse(body)});
    });
  });

  //Binds form to request
  form.pipe(request);

  //If anything goes wrong (request-wise not FB)
  request.on('error', function (error) {
    console.log(error);
  });
};
