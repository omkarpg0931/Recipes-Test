var cloudinary = require('cloudinary')
var fs = require('fs');
var models = require("../db/models");

cloudinary.config({ 
    cloud_name: 'dcwnshkpa', 
    api_key: '694527287488792', 
    api_secret: 'ZiCfm6-hrKQVDOzuFnPh3qzmiwU' 
});

exports.uploadFiletodrive = function (file, id) {
    cloudinary.uploader.upload(file.path, function(result) {
        models.recipe.update(
            {"image_url": result.url},
            {
                where : {
                  id : id
                }
            }
        )
    });
}