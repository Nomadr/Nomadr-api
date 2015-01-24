
// BASE SETUP
// =============================================================================

// connect to the database



var mongoose = require('mongoose')

var User = require('./app/models/user')

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

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

// more routes for our API will happen here

// User routes
// -------------------

// creates /api/users route
// we only have a users route for now

router.route('/users')
route.route('/users/:user_id')


.post(function(request, response) {
  console.log('doing a get request')
  console.log(request)

  var user = new User();
  user.name = request.body.name;

  user.save(function(error){
    if (error)
      response.send(error)
    // TODO: ERROR HANDLING AT THE DATABASE

    // console.log(response)
    // console.log(error)
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

// .get(function(request, response){
//   console.log('doing a get request')
//   User.findById(function(error, users){
//     if (error)
//       response.send(error)
//     // else
//       response.json(users)
//   })
// })





// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
