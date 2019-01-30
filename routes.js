//controllers
var Video = require('./controllers/Video');

const path = './sample_video.mp4';


var APIRoutes = function(router) {

    router.get('/', Video.GetVideos);
    
    router.get('/uploadvideos', Video.CreateVideos);
    router.get('/videos', Video.All);
    router.get('/video/view/:id', Video.View);
    router.post('/sendform',Video.UploadVideos);
    router.post('/process_video', async function(req, res){
        
        
        
    })
    
    return router;
}

module.exports = APIRoutes;