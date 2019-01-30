var moment = require('moment');
var models = require('../models');
var numeral = require('numeral');
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);

var Request = require("request");
var Video = {};

Video.GetVideos = function(req, res){
    return res.render('../views/Videos/getvideos', {query: req.query});
}
Video.CreateVideos = function(req, res){
    return res.render('../views/Videos/createnew');
}
Video.UploadVideos = function(req, res){
    var name = req.body.title;
    var sampleFile = req.files.video;
    var sampleFilename =  `${moment().milliseconds()}_${req.files.video.name}`;
    var filePath = 'upload/' + sampleFilename;

    console.log("VIDEO FILE UPLOAD", sampleFile);
    
    
  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv(filePath, function(err) {
    if (err){
        console.log("VIDEO ERROR", err);
      return res.json({success: false, message: 'Error occurred while uploading vido'});
    }
     //create the new project
     var data = req.body;
     data['name'] = name;
     data['url'] = filePath;

             console.log(data);
             models.Video.create(data).then(function(video){
                return res.json({success: true, message: 'Upload successful'});
             }).catch(function(err){
                 var errorMessage = "Failed to Upload";
                 if(err.errors[0].message){
                     errorMessage = err.errors[0].message;
                 }
                 return res.json({success: false, message: errorMessage});
             }); 

    
});
}


Video.View =  function(req, res){
  var id = req.params.id;
  models.Video.findByPk(id)
  .then(async function(video){
      if(!video) return res.send('Video not found');
    console.log(video.url);

    var file =  await readFile(video.url);
      var  inputContent = file.toString('base64');
      console.log("RSULT IS",inputContent)
        Request.post({
            "headers": { "content-type": "application/json" },
            "url": "https://videointelligence.googleapis.com/v1/videos:annotate?key=AIzaSyAdp9dlIKdBH4M4wLnUh03nKI200p54JHw",
            "body": JSON.stringify({
                "inputContent": inputContent,
                "features": ["LABEL_DETECTION"]
            })
        }, (error, response, body) => {
            if(error) {
                return res.send({success:false, data:error})
                //return res.render('../views/Videos/viewdetails',{data: "error"});
            }

            var firstBody =  body;
            
            var report_name = JSON.parse(body);
            console.log(report_name);
            

            var URL = `https://videointelligence.googleapis.com/v1/operations/${report_name.name}`;
            setTimeout(function(){
                var options = { 
                    method: 'GET',
                    url: URL,
                    qs: { key: 'AIzaSyAdp9dlIKdBH4M4wLnUh03nKI200p54JHw' },
                    headers: {} 
                };
    
                Request(options, function (error, response, body) {
                    if (error) throw new Error(error);
    
                    console.log(body);
                    return res.send(body);
                });
            }, 5000)

        })

      
  }).catch(function(err){
      return res.send('Error occurred');
  })
}



Video.All = function(req, res){
 

  models.Video.findAndCountAll().then(function(videos){
  
      return res.json({success: true, message: 'Processed', data: videos});
  }).catch(function(err){
      return res.json({success: false, message: 'Error occurred'});
  })
}

module.exports = Video;