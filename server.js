
// BASE SETUP
// =============================================================================

// connect to the database



var mongoose = require('mongoose')

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

router.route('/users/:user_id')

.get(function(request, response){
  // console.log('REQUEST BODY: ' + request.body)
  User.findById(request.params.user_id, function(error, user){
  // User.find({'email': request.params.email}, function(error, user){
    if (error)
      response.send(error)
    // else
      response.json(user)
  })
})





// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
