var fs = require('fs');
var _ = require('lodash');
var join = require('path').join;
var resolve = require('path').resolve;

var self = module.exports = {

  walk: function(paths, done) {
    console.log(paths.photos);
    fs.readdir(paths.photos, function(err, files) {

      if (err) throw err;

      var photoObjects = [];

      var pending = files.length;
      console.log('pending:', pending);
      console.log('photo objects:', photoObjects.length);
      if (!pending) return done(null, []);

      files.forEach(function(file) {

        file = join(paths.photos, file);
        fs.stat(file, function(err, stat) {
          if (stat && stat.isDirectory()) {
            var paths = { photos: file, thumbs: null, previews: null }
            self.walk(paths, function(err, res) {
              photoObjects = photoObjects.concat(res);
              if (!--pending) done(null, photoObjects);
            });
          } else {

            var ext = file.split('.');
            var photoObject = {};

            if (ext.length > 1 && ext[ext.length - 1] === 'jpg') {

              photoObject.src = ['photos'].concat(file.split('/').slice(-2)).reduce(function(path, e) {
                return path = join(path,e);
              });
              //if (paths.thumbs) photoObject.thumb = join('thumbs', file);
              //if (paths.previews) photoObject.downloadUrl = join('downloads', file);

              photoObjects.push(photoObject);
              if (!--pending) done(null, photoObjects);
            } else {
              if (!--pending) done(null, photoObjects);
            }
          }
        });
      });
    });
  },

  payload: function(paths, userOptions, callback) {

    self.walk(paths, function(err, photoObjects) {

      var mandatorySettings = {
        dynamic: true,
        dynamicEl: photoObjects,
        closable: false,
        escKey: true,
        showAfterLoad: true,
      };

      var optionalSettings = {
        download: true,
        hideBarsDelay: 2000,
        showThumbByDefault: false,
        pause: 4000,
        pullCaptionUp: true,
        thumbnail: !!paths.thumbs
      };
      
      var payload = _.assign(optionalSettings, userOptions, mandatorySettings);
      return callback(payload);

    });
  }
}
