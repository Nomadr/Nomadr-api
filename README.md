#nomadr-api

nomadr-api is the back-end server side API that serves the client-side Chrome Extension app, 'nomadr'.

This API uses the express.js framework.

The following routes are currently available:

GET - Return all users
http://nomadr-api.herokuapp.com/api/users

GET - Return one user, finding by id:
http://nomadr-api.herokuapp.com/api/users/:user_id

POST - Create a new user.  Requires 'name', 'email', and 'city' attributes.
http://nomadr-api.herokuapp.com/api/users
