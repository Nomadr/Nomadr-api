// BASE SETUP
// =============================================================================

// connect to the database
var geocoder = require('geocoder')
var googleKey = process.env.GOOGLE_API
// NOTE TO VINCENT! ASK PHIL FOR EVENTBRIGHT KEY TO PUT IN HEROKU
var eventBrightKey = process.env.EVENTBRIGHT_API
console.log("eventbright key: "+eventBrightKey)

var aeroKey = process.env.AERO_API
console.log('aerokey '+aeroKey)

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

//  POST USER:
router.route('/users')

.post(function(request, response) {

  var postUser = function(coordinates) {

    // The regex capitalizes the name and city properly.
    var user            = new User();
    user.name           = request.body.name.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    user.email          = request.body.email.toLowerCase();
    user.city           = request.body.city.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    user.departureDate  = request.body.departureDate
    user.geocoordinates = coordinates;

    user.save(function(error){
      if (error)
        response.send(error)
      else
        response.json({
          message:  'User created!',
          user:     user
        })
    })
  }

  var getUserGeocoordinates = function(city) {
    geocoder.geocode(city, function(results, status){
      // console.log(status.results[0].geometry.location)
      if (true) {
        var latLg = status.results[0].geometry.location
        // var latLongString = latLg
        // console.log(latLg.lat + "," + latLg.lng+"")
        var coords = (latLg.lat + "," + latLg.lng)
        // barf
        postUser(coords)
      } else {
        console.log('Geocode was not successful for the following reason: ' + status);
      }
    })
  }
  getUserGeocoordinates(request.body.city)
})

//  GET SPECIFIC USER
router.route('/users/:user_id')

.get(function(request, response){
  User.findById(request.params.user_id, function(error, user){
    if (error)
      response.send(error)
    // else
      response.json(user)
  })
})

//  GET USER BY EMAIL
//  Accepts user_email as params and returns a user object.
//  Note: email attribute is unique to all users.
router.route('/emails/:user_email')

.get(function(request, response){
  User.findOne({ email:request.params.user_email.toLowerCase()}, function(error, user){
    if (error)
      response.send(error)
    // else
      response.json(user)
  })
})


// ROUTES FOR EACH API:
//______________________________________________________________________

//WIKI ROUTE:
router.route('/wiki/:user_id')
  .get(function(request, response){
    User.findById(request.params.user_id, function(error, user){
      if (error)
        response.send(error)
      else
        console.log(user.city)
        var userCity = user.city // NEED TO TURN THIS INTO QUERY STRING (IF IT'S A CITY WITH TWO WORDS (CANT HAVE SPACES))
            http({
              url:'http://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&redirects&titles='+user.city+'&continue=',
              method:"GET"},
              function(error, res, body){
                var wiki_data = JSON.parse(body)
                var wiki_page_key = Object.keys(wiki_data.query.pages)
                var wiki_content = wiki_data.query.pages[wiki_page_key].extract
                response.json({wiki_content: wiki_content})
            })
    })
  })

// GOOGLE PHOTO ROUTE:

router.route('/google_photo/:user_id')
  .get(function(request, response){
    User.findById(request.params.user_id, function(error, user){
      if (error)
        response.send(error)
      else
        console.log(user.geocoordinates)
        var latLong = user.geocoordinates
          http({
            url:'https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=AIzaSyAsmkkWTdFUhw8rXGd_Qa4rwTo-Bv80F_A&location='+latLong+'&radius=50000﻿',
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

// PANARAMIO PHOTO ROUTE:

router.route('/panaramio/:user_id')
  .get(function(request, response){
    User.findById(request.params.user_id, function(error, user){
      if (error)
        response.send(error)
      else
        console.log(user.geocoordinates)
        var lat     = user.geocoordinates.split(",")[0]
        var lng     = user.geocoordinates.split(",")[1]

        var latMin  = (parseFloat(lat) - 0.5).toString()
        var latMax  = (parseFloat(lat) + 0.5).toString()
        var lngMin  = (parseFloat(lng) - 0.5).toString()
        var lngMax  = (parseFloat(lng) + 0.5).toString()

          http({
            url:'http://www.panoramio.com/map/get_panoramas.php?set=public&from=0&to=20&minx='+lngMin+'&miny='+latMin+'&maxx='+lngMax+'&maxy='+latMax+'&size=original&mapfilter=false',
            method:"GET"
          },function(error, res, body){
            console.log(JSON.parse(body).photos[0].photo_file_url)
            var photoArr = JSON.parse(body).photos
            var filteredPhotos = []

            for (var i = 0; i < photoArr.length; i++) {
              if (photoArr[i].width > 1000 && photoArr[i].width < 2000) {
                filteredPhotos.push(photoArr[i])
              }
            }
            var photoListCollection = []
            for (var i=0;i<filteredPhotos.length;i++){
              photoListCollection.push({
                photo_title:  filteredPhotos[i].photo_title,
                photo_url:    filteredPhotos[i].photo_file_url,
                owner_name:   filteredPhotos[i].owner_name,
                owner_url:    filteredPhotos[i].owner_url
              })
            }



            response.json({photos: photoListCollection})
          })
    })
  })

//WEATHER ROUTE:

router.route('/weather/:user_id')
  .get(function(request, response) {
    User.findById(request.params.user_id, function(error, user){
      var city = user.city
      http({
        url: 'http://api.openweathermap.org/data/2.5/weather?q='+city+'',
        method: "GET"
      }, function(error, res, body){
        response.json({weather: JSON.parse(body)})
      })
    })
  })

//TIME ROUTE:

router.route('/time/:user_id')
  .get(function(request, response) {

    User.findById(request.params.user_id, function(error, user){
      var coordArr = user.geocoordinates.split(",")
      var lat = coordArr[0]
      var lng = coordArr[1]
      http({
        url: 'http://api.geonames.org/timezoneJSON?lat='+lat+'&lng='+lng+'&username=fantastic_nomadr',
        method: "GET"
      }, function(error, res, body){
        // FFFFF
        response.json({time: JSON.parse(body).time.substring(11)})
      })
    })
  })


//EVENTBRIGHT ROUTE
router.route('/events/:user_id')
  .get(function(request, response){
    console.log("hey")
    User.findById(request.params.user_id, function(error, user){
      console.log(user)
      http({
        url: 'https://www.eventbrite.com/json/event_search?app_key='+eventBrightKey+'&city='+user.city+'&date=This+month', //change this date to be their entered departure date?
        method: "GET"
      }, function(error, res, body){
        console.log(res)
        console.log(body)
        //debug this: what to send back? on the front end, we want event name wrapped in url
        response.json({events: body.events})
      })
    })
  })

//FLIGHTS ROUTE
  router.route('/flights/:user_id')
    .get(function(request, response){
      console.log("hey")
      function getFirstCode() {
        User.findById(request.params.user_id, function(error, user){
          var coordArr = user.geocoordinates.split(",")
          var lat = coordArr[0]
          var lng = coordArr[1]
          http({
            url: "https://airport.api.aero/airport/nearest/" + lat + "/"+lng+"?maxAirports=1&user_key=" + aeroKey
          }, function(error, res, body){
            console.log(body)
            function callback(x) {
              return x
            }
            var parsedCallBack = eval(body)

            response.json(parsedCallBack.airports[0].code)
          })
        })
      }

      var firstPort = getFirstCode()
      console.log(firstPort)

      // console.log(getFirstCode())

      // User.findById(request.params.user_id, function(error, user){
      //   console.log(user)
      //   http({
      //     url: 'https://www.eventbrite.com/json/event_search?app_key='+eventBrightKey+'&city='+user.city+'&date=This+month', //change this date to be their entered departure date?
      //     method: "GET"
      //   }, function(error, res, body){
      //     console.log(res)
      //     console.log(body)
      //     //debug this: what to send back? on the front end, we want event name wrapped in url
      //     response.json({events: body.events})
      //   })
      // })

      // var first_city = http({
      //   url: "https://airport.api.aero/airport/nearest/" +  + "/"-122.4167?maxAirports=2&user_key=28053d9717e2740e4c43f56584118599"
      // })
  })

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
