/* eslint-disable no-console */
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Hbs = require('handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');

const Handlebars = require('express-handlebars').create({
  layoutsDir: path.join(__dirname, "views/layouts"),
  partialsDir: path.join(__dirname, "views/partials"),
  defaultLayout: 'layout',
  extname: 'hbs',
  handlebars:allowInsecurePrototypeAccess(Hbs)
});
const session=require('express-session');

//linking config file
dotenv.config({ path: './config.env' });


//connecting mongoose
async function connectMongoose() {
  await mongoose.connect(process.env.DATABASE_LOCAL);
  console.log('DB connection successfull');
}
connectMongoose().catch(err => console.log(err));


const app = express();



//setting routes
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');


// view engine setup
app.set('views', path.join(__dirname, 'views/locals'));
app.set('view engine', 'hbs');
app.engine('hbs', Handlebars.engine);


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//setting session
const cookieLimit = 1000 * 3600 * 24 * 14; //limit set to 14 days
app.use(session({
  secret: 'thisismysecretkeyjdhfjsdhfshf546',
  saveUninitialized: true,
  cookie: { maxAge: cookieLimit },
  resave: false,

}));

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});


app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
