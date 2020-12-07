var express = require('express');
//var session = require('express-session');
const { connect } = require('http2');
const nodemailer = require('nodemailer');
var app = express();
const session = require('express-session')
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: true}));
app.set( 'view engine', 'pug');
app.set('views', './views');

var mysql = require("mysql");
const { parse } = require('path');
const { response } = require('express');
const e = require('express');

var con = mysql.createConnection({
    host: "45.55.136.114",
    user: "PWW_F202",
    password: "csc4350Time",
    database: "PWW_F202"
});

/* --- Session for user login --- */ 
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());


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

app.post('/submitDep', function(req,res){
    console.log(req.body)
    
    var sql = "Insert into Departments (id,depName,depDes) VALUES(null, '"+ req.body.depName + "', '" + parseInt(req.body.depDes) + "')";
    con.query(sql, function (err){
        if(err) throw err
        res.render('addDepartment' ,{title: 'Data Saved', message: 'Department Created'});
    })
})

app.get('/home', function(req, res, next) {
    var sql='SELECT * FROM Users';    
    con.query(sql, function (err, data, fields) {
        if (err) throw err;
        res.render('home', {userData: data});
    });
});

var username;
// Login authentication 
app.post('/login', function(req, res) {
    username = req.session;
    username.user = req.body.username;
    var password = req.body.password;
    var sql = 'SELECT * FROM Users WHERE userLogin = ? AND userPassw = ?'
    console.log("--- INSIDE /LOGIN POST ---")
    //console.log("Brandon Test" + username.user)
    var user = username.user

    // Checks if form was filled out
    if (username.user && password) {
        //Checks if input matches database
        //console.log(username.user + "Hello this is brandon Test")
        con.query(sql, [JSON.stringify(username.user), password], function(err, data, fields) {
            res.redirect('/preferences');
        });
    } else {
        res.send('Please enter Username and Password!');
        res.end();
    }
});



app.use(express.static('public'));
app.get('/',function(req,res){
    req.session.viewCount +=1;
    console.log("hello" + req.session.viewCount);
    res.render('index',{viewCount:req.session.viewCount})
});
app.get('/login', function(req, res){
    res.render('login')
});

app.get('/register', function(req, res){
    res.render('register')
});

app.get('/preferences', function(req, res){
    res.render('preferences')
    username = req.session;
    console.log("Hello this is a test in register " + username.user)
});

app.get('/departments', function(req, res, next){
    var sql = 'SELECT * FROM Departments';
    con.query(sql, function(err,data, fields){
        if(err) throw err;
        res.render('departments',{departmentData:data})
    })
});

app.get('/addDepartment', function(req, res){
    res.render('addDepartment')
});

app.get('/deleteUser', function(req, res){
    res.render('deleteUser')
});

app.get('/admin', function(req, res, next) {
    var sql='SELECT * FROM Users';

   /* if(req.session.leggedin) {
        response.send('Welcome back, ' + req.session.username);
    } else {
        response.send('Please login to view this page!');
    }*/
    
    con.query(sql, function (err, data, fields) {
        if (err) throw err;
        res.render('admin', {userData: data});
    });
});

function sendEmail(){
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth:{
            user : 'aucompspartan@gmail.com',
            pass : '!Baseball101',
        }
    })
    let mailObject = {
        from: 'brandonlangys@gmail.com',
        to: 'brandonlangys@gmail.com',
        subject: 'Testing',
        Text : 'it works'
    };

    transporter.sendMail(mailObject, function(err, data){
        if(err){
            console.log('error')
        }else{
            console.log('email sent')
        }
    })
}
//sendEmail();




app.listen(3000);