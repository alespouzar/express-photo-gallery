var fs = require('fs');
var Router = require('router');
var static = require('serve-static');
var directoryExists = require('directory-exists').sync;
var getPayload = require(__dirname + '/lib/get_payload');
var getRecursivePayload = require(__dirname + '/lib/get_recursive_payload');
var getS3Payload = require(__dirname + '/lib/get_s3_payload');
var resolveModulePath = require(__dirname + '/lib/resolve_module_path');
var mustache = require('mustache');
var template = fs.readFileSync(__dirname + '/lib/template.html').toString();
var url = require('url');
mustache.parse(template);

module.exports = function(photoPath, options) {
  var app = Router();

  options = options || {};

  var paths = {
    photos: photoPath,
    previews: null,
    thumbs: null,
  };

  var urlObj = url.parse(photoPath);
  var s3 = (urlObj.protocol === 's3:');

  if (s3) {
    paths.bucket = urlObj.hostname;
  }

  if (!s3) {

    if (!directoryExists(photoPath)) throw new Error('Must provide valid path for photos');

    if (directoryExists(photoPath + '/preview')) {
      paths.previews = photoPath + '/preview';
    }

    if (directoryExists(photoPath + '/thumb')) {
      paths.thumbs = photoPath + '/thumb';
    }

    app.use('/photos', static(paths.previews || photoPath));
    if (paths.thumbs) app.use('/thumb', static(paths.thumbs));
    if (paths.previews) app.use('/downloads', static(photoPath));

  }

  app.use(static(resolveModulePath('lightgallery') + '/dist'));
  app.use('/js', static(resolveModulePath('lg-zoom') + '/dist'));
  app.use('/js', static(resolveModulePath('lg-thumbnail') + '/dist'));
  app.use('/js', static(resolveModulePath('lg-fullscreen') + '/dist'));
  app.use('/js', static(resolveModulePath('lg-hash') + '/dist'));
  app.use('/js', static(resolveModulePath('lg-autoplay') + '/dist'));

  app.get('/', function(req, res) {

    if (s3) {

      getS3Payload(paths.bucket, options, function(payload) {
        res.send(mustache.render(template, {
          title: options.title || 'Photo Gallery',
          data: JSON.stringify(payload)
        }));
      });

    } else {

      getPayload(paths, options, function(payload) {
        res.send(mustache.render(template, {
          title: options.title || 'Photo Gallery',
          album: options.album || null,
          data: JSON.stringify(payload)
        }));
      });

    }

  });

  return app;
};
