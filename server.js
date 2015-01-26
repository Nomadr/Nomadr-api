// BASE SETUP
// =============================================================================

// connect to the database


var googleKey = process.env.GOOGLE_API
console.log("KEY "+process.env.GOOGLE_API)
var mongoose = require('mongoose')
var http = require('request')

mongoose.connect(process.env.MONGO_URL)

var User = require('./app/models/user')

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function(request, response, next) {
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.get('/', function(request, response, next) {
  // Handle the get for this route
});
app.post('/', function(request, response, next) {
 // Handle the post for this route
});



var port = process.env.PORT || 9090;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

router.use(function(request, response, next){
  console.log('Something is happening')
  next();
})

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(request, response) {
    response.json({ message: 'hooray! welcome to our api!' });
});


// User routes
// -------------------

// creates /api/users route
// we only have a users route for now

//ALL USERS
router.route('/users')

.post(function(request, response) {
  console.log('doing a get request')
  console.log(request)

  var user = new User();
  user.name   = request.body.name;
  user.email  = request.body.email;
  user.city   = request.body.city;

  user.save(function(error){
    if (error)
      response.send(error)
    // TODO: ERROR HANDLING AT THE DATABASE

    response.json({ message: 'User created!'})
  })
})

router.route('/users/:user_id')

.get(function(request, response){
  User.findById(request.params.user_id, function(error, user){
    if (error)
      response.send(error)
    // else
      response.json(user)
  })
})

// ROUTES FOR EACH API:

//WIKI ROUTE
router.route('/wiki/:user_id')
  .get(function(request, response){
    User.findById(request.params.user_id, function(error, user){
      if (error)
        response.send(error)
      else
        console.log(user.city)
        var userCity = user.city
            http({
              url:'http://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&titles='+user.city+'&continue=',
              method:"GET"},
              function(error, res, body){
                var wiki_data = JSON.parse(body)
                var wiki_page_key = Object.keys(wiki_data.query.pages)
                var wiki_content = wiki_data.query.pages[wiki_page_key].extract
                response.json({wiki_content: wiki_content})
            })
    })
  })

//PHOTO ROUTE

router.route('/google_photo/:user_id')
  .get(function(request, response){
    User.findById(request.params.user_id, function(error, user){
      if (error)
        response.send(error)
      else
        console.log(user.city)
        var userCity = user.city //Have this pull lat long (rather than city) from db and plug into url.
        var latLong = '25.766943, -80.195289' //this is dummy data
          http({
            url:'https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=AIzaSyAsmkkWTdFUhw8rXGd_Qa4rwTo-Bv80F_A&location='+ latLong +'&radius=50000﻿',
            method:"GET"
          },function(error, res, body){
            var arr = JSON.parse(body).results
            var photoArr = []
            for (var i=0;i<arr.length;i++){
              if (arr[i].photos !== undefined){
                if (arr[i].photos[0]['width'] > 1000) {
                  photoArr.push(arr[i].photos[0]['photo_reference'])
                }
              }
            }
            var photoUrlArr = []
            for (var i=0;i<photoArr.length;i++){
              photoUrlArr.push('https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference='+photoArr[i]+'&key='+googleKey+'')
            }
            response.json({photos: photoUrlArr})
          })
    })
  })



// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
