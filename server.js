// BASE SETUP
// =============================================================================

// connect to the database


var googleKey = process.env.GOOGLE_API
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

.get(function(request, response){
  console.log('doing a get request')
  User.find(function(error, users){
    if (error)
      response.send(error)
    // else
      response.json(users)
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

// Routes to access other APIs.

router.route('/city/:city_name')
.get(function(request, response){
  // http({
  //   method: 'GET',
  //   url:    'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
  //   headers: {
  //     "User-Agent":"request",
  //     "Authorization":googleKey
  //   },
  //   params:
  //     {
  //       key:        googleKey,
  //       radius:     '5000',
  //       location:   '-33.8670522,151.1957362'
  //     }
  // }, function(error, response, body){
  //   console.log(body)
  // }
  // )
  console.log("Requesting city data")
  var city = request.params.city_name
  var latLong = '48.859650,2.343455'

  http({
    url:'http://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&titles='+city+'&continue=',
    method:"GET"
    // contentType: "application/json"
    },function(error, response, body){
      // console.log(body)
    // console.log(JSON.stringify(body))
    var wiki_data = JSON.parse(body)
    var wiki_page_key = Object.keys(wiki_data.query.pages)
    var wiki_content = wiki_data.query.pages[wiki_page_key].extract
    // console.log(wiki_key[0])
    // console.log(wiki_data.query.pages[wiki_page_key].extract)
    console.log(wiki_content)
  })

  http({
    url:'https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=AIzaSyAsmkkWTdFUhw8rXGd_Qa4rwTo-Bv80F_A&location='+ latLong +'&radius=5000﻿',
    method:"GET"
  },function(error, response, body){
    var photoKey = JSON.parse(body).results[4].photos[0].photo_reference
    // DONT NEED TO MAKE THIS API CALL? JUST USE THE URL BELOW AS THE BACKGROUND IMAGE...
    http({
      url: 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference='+photoKey+'&key='+googleKey,
      method: 'GET'
    },function(error, response, body){
      //This is an actualy photo file. Can we get an URL?
      // console.log(body)
      console.log('photo will render when we fix it')
    }
    )
  })

  // response.json({message: "success!" + request.params.city_name})

  // TODO: Package your json and send the data here.
})



// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
