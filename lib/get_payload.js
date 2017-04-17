var fs = require('fs');
var join = require('path').join;
var resolve = require('path').resolve;
var isImage = require(__dirname + '/is-image');
var objectAssign = require('object-assign');

module.exports = function(paths, userOptions, callback) {
  fs.readdir(resolve(paths.photos), function(err, files) {

    if (err) throw err;

    var photoObjects = [];

    files.forEach(function(file) {
      var photoObject = {};

      if (isImage(file)) {

        photoObject.src = join('photos', file);
        if (paths.thumbs) photoObject.thumb = join('thumb', file);
        if (paths.previews) photoObject.downloadUrl = join('downloads', file);

        photoObjects.push(photoObject);
      }
    });

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

    var payload = objectAssign(optionalSettings, userOptions, mandatorySettings);
    console.log(payload);

    callback(payload);
  });
};
