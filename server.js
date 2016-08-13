/* Book Marker Warm Up (18.3.1)
 * backend
 * ==================== */ 

// dependencies
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var logger = require('morgan');
var cheerio = require('cheerio');
var request = require('request');

// configure our app for morgan and body parser
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: false
}));

// static file support with public folder
app.use(express.static('public/'));

// mongojs configuration
var mongojs = require('mongojs');
var databaseUrl = "scraper";
var collections = ["news"];

// hook our mongojs config to the db var
var db = mongojs(databaseUrl, collections);
db.on('error', function(err) {
  console.log('Database Error:', err);
});



// Routes
// ======

// simple index route
app.get('/', function(req, res) {
  res.send(index.html);
});

request ('http://www.reddit.com/', function(err, res, body) {
  var  $ = cheerio.load(body);
  var results = [];

  $('.title').each(function(i, element) {
    var title = $(this).find('a').text();
    var link = $(this).find('a').attr('href');
    console.log(title);
    
    results.push({
      title: title,
      url: link
    });
  });
  console.log(results);

});

// TODO: Fill in each route so that the server performs
// the proper mongojs functions for the site to function
// -/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/


// Post a newsUpdate to the mongoose database
app.post('/submit', function(req, res) {

  // save the request body as an object called newsUpdate
  var newsUpdate = req.body;

  // if we want the object to have a boolean value of false, 
  // we have to do it here, because the ajax post will convert it 
  // to a string instead of a boolean
  newsUpdate.read = false;

  // save the newsUpdate object as an entry into the news collection in mongo
  db.news.insert(newsUpdate, function(err, saved) {
    // show any errors
    if (err) {
      console.log(err);
    } 
    // otherwise, send the response to the client (for AJAX success function)
    else {
      res.send(saved);
    }
  });
});


// find all news marked as read
app.get('/read', function(req, res) {
  // go into the mongo collection, and find all docs where "read" is true
  db.news.find({'read':true}, function(err, found) {
    // show any errors
    if (err) {
      console.log(err);
    } 
    // otherwise, send the news we found to the browser as a json
    else {
      res.json(found);
    }
  });
});


// find all news marked as unread
app.get('/unread', function(req, res) {
  // go into the mongo collection, and find all docs where "read" is false
  db.news.find({'read':false}, function(err, found) {
    // show any errors
    if (err) {
      console.log(err);
    } 
    // otherwise, send the news we found to the browser as a json
    else {
      res.json(found);
    }
  });
});


// mark a newsUpdate as having been read
app.get('/markread/:id', function(req, res) {
  // Remember: when searching by an id, the id needs to be passed in 
  // as (mongojs.ObjectId(IDYOUWANTTOFIND))

  // update a doc in the news collection with an ObjectId matching
  // the id parameter in the url
  db.news.update({
    '_id': mongojs.ObjectId(req.params.id)
  }, {
    // set "read" to true for the newsUpdate we specified
    $set: {
      'read':true
    }
  }, 
  // when that's done, run this function
  function(err, edited) {
    // show any errors
    if (err) {
      console.log(err);
      res.send(err);
    } 
    // othewise, send the result of our update to the browser
    else {
      console.log(edited);
      res.send(edited);
    }
  });
});


// mark a newsUpdate as having been read
app.get('/markunread/:id', function(req, res) {
  // Remember: when searching by an id, the id needs to be passed in 
  // as (mongojs.ObjectId(IDYOUWANTTOFIND))

  // update a doc in the news collection with an ObjectId matching
  // the id parameter in the url
  db.news.update({
    '_id': mongojs.ObjectId(req.params.id)
  }, {
    // set "read" to false for the newsUpdate we specified
    $set: {
      'read':false
    }
  }, 
  // when that's done, run this function
  function(err, edited) {
    // show any errors
    if (err) {
      console.log(err);
      res.send(err);
    } 
    // othewise, send the result of our update to the browser
    else {
      console.log(edited);
      res.send(edited);
    }
  });
});


// listen on port 3000
app.listen(3000, function() {
  console.log('App running on port 3000!');
});
