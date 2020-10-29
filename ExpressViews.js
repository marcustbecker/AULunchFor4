var express = require('express');
var app = express();
app.set( 'view engine', 'pug');
app.set('views', './views');

app.use(express.static('public'));

app.get('/home', function(req, res){
    res.render('home')
});

app.get('/login', function(req, res){
    res.render('login')
});

app.get('/register', function(req, res){
    res.render('register')
});

app.get('/preferences', function(req, res){
    res.render('preferences')
});

app.listen(3000);