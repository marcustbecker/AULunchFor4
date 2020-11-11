var express = require('express');
const { connect } = require('http2');
var app = express();
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: true}));
app.set( 'view engine', 'pug');
app.set('views', './views');

var mysql = require("mysql");
const { parse } = require('path');

var con = mysql.createConnection({
    host: "45.55.136.114",
    user: "PWW_F202",
    password: "csc4350Time",
    database: "PWW_F202"
});

con.connect(function(err) {
    if (err) throw err;
    console.log('Database is connected successfully!');
});

app.post('/submit', function(req,res){
    console.log(req.body);
    var sql = "Insert into Users (id,firstN,lastN,email,userLogin,userPassw) VALUES(null, '"+ req.body.firstN + "', '"+ req.body.lastN + "','"+ req.body.email + "','"+ req.body.userLogin + "','"+ req.body.userPassw + "')";
    con.query(sql, function (err){
        if (err) throw err
        res.render('register', {title: 'Data Saved',
        message: 'The user was created successfully!'})

    })
});

app.get('/home', function(req, res, next) {
    var sql='SELECT * FROM Users';
    con.query(sql, function (err, data, fields) {
        if (err) throw err;
        res.render('home', {userData: data});
    });
});


app.use(express.static('public'));

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