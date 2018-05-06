const {google} = require('googleapis');
var fs = require('fs');
const oauth2Client = new google.auth.OAuth2(
  "76509178569-4vcu07diovm2q3ej8iqs3t4l3m9m5q7u.apps.googleusercontent.com",
  "u86ue4C0de3RngInR_PnDxAf",
  "http://localhost:3000/app"
);

const drive = google.drive({
  version: 'v2',
  auth: oauth2Client
});

exports.uploadFileGdrive = function (file) {
    fs.readFile(file.path, function (err, data) {
        if (err){
            return(err, null);
        } else{
            var fileMetadata = {
                'name': file.originalFilename
            };
            
            var media = {
                mimeType: 'image/jpeg',
                body: data
            };
            
            drive.files.create({
                resource: fileMetadata,
                media: media,
                fields: 'id'
                }, function (err, file) {
                if (err) {
                    // Handle error
                    return(err, null);
                } else {
                    image_url = "https://drive.google.com/uc?export=view&id=" + file.id
                    return(err, image_url);
                }
            });
        }       
    })
}