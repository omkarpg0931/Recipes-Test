var createError = require('http-errors');
var express = require('express');
var path = require('path');
var expressValidator = require('express-validator');
var logger = require('morgan');
var bodyParser = require('body-parser');

var usersRouter = require('./routes/users');
var recipesRouter = require('./routes/recipes');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(express.static(path.join(__dirname, 'app')));

app.get('/favicon.ico', (req, res) => res.status(204));

// basic route
app.get('/', function(req, res) {
	res.redirect('/#/login');
});

app.use('/api/user', usersRouter);
app.use('/api/recipe', recipesRouter);

app.get('/', function(req, res) {
  res.sendfile('./app/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
