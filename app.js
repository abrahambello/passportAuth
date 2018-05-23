var express                 = require('express'),
    morgan                  = require('morgan'),
    app                     = express(),
    mongoose                = require('mongoose'),
    passport                = require('passport'),
    bodyParser              = require('body-parser'),
    User                    = require('./models/user'),
    localStrategy           = require('passport-local'),
    passportLocalMongoose   = require('passport-local-mongoose');

//connect to mongodb
mongoose.connect('mongodb://localhost/auth_demo_app');


app.set('view engine', 'ejs');
app.use(morgan('combined'))
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(require('express-session')({
    secret: "this is my first test on sessions",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());


//serialize and deserialize User
passport.use(new localStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//root route
app.get('/', function(req, res){
    res.render('home');
});

//secret page
app.get('/secret', isLoggedIn, function(req, res){
    res.render('secret');
});

//Auth routes
//register
app.get('/register', function(req, res){
    res.render('register');
});

//handling user register
app.post('/register', function(req, res){
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render('register')
        }
        passport.authenticate('local')(req, res, function(){
            res.redirect('/secret');
        });
    });
});


//log in
app.get('/login', function(req, res){
    res.render('login');
});

//handle user register using middleware
app.post('/login', passport.authenticate('local', {
    successRedirect: '/secret',
    failureRedirect: '/login'
}), function(req, res){
    res.send('login post route');
});

//logout route
app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

//access control middleware
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}

app.listen(3001, function(){
    console.log('App running on port 3001');
});

