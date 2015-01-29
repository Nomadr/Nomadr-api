#Nomadr-api

Nomadr-api is the back-end server side API that serves the [Nomadr Chrome extension](https://github.com/vcolavin/Nomadr). This API is publically available but probably useless for anyone else, although it's available over on [Heroku](http://nomadr-api.herokuapp.com). It is itself served by a Mongo database hosted at Mongolab and several other third-party APIs.

Nomadr-api was written by Fantastic: [Valerie Smith](https://github.com/valeriesmith), [Philip Riley](https://github.com/philril), [Devin Liu](https://github.com/devin-liu), [Alfred Calayag](https://github.com/alfredcalayag), and [Vincent Colavin](https://github.com/vcolavin). 

##Here are some examples.

HTTP Verb | Route | Request Parameters | Example Response
--- | --- | --- | ---
Get | /api | n/a | JSON greeting
Post | /api/users | name, email, destination, desired date | JSON
Get | /api/users/:user_id | 3 | 4
Get | /api/email/:user_email | 3 | 4
Get | /api/wiki/:user_id | 3 | 4
Get | /api/google_photo/:user_id | This route will soon be deprecated; avoid using it | 4
Get | /api/panaramio/:user_id | 3 | 4
Get | /api/weather/:user_id | 3 | 4
Get | /api/time/:user_id | 3 | 4
Get | /api/events/:user_id | 3 | 4
