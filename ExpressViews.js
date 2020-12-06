var express = require('express');
var session = require('express-session');
const { connect } = require('http2');
var app = express();
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: true}));
app.set( 'view engine', 'pug');
app.set('views', './views');
var mysql = require("mysql");
const { parse } = require('path');
const { response } = require('express');

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
    /*
    if(req.session.loggedin) {
        response.send('Welcome back, ' + req.session.username);
    } else {
        response.send('Please login to view this page!');
    }
    */
    con.query(sql, function (err, data, fields) {
        if (err) throw err;
        res.render('home', {userData: data});
    });
});


// Login authentication 
app.post('/login', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var sql = 'SELECT * FROM Users WHERE userLogin = ? AND userPassw = ?'
    console.log("--- INSIDE /LOGIN POST ---")

    // Checks if form was filled out
    if (username && password) {
        //Checks if input matches database
        con.query(sql, [username, password], function(err, data, fields) {
            if (data.length > 0) {
                req.session.loggedin = true;
                req.session.username = username;
                //this line needs to change to preferences
                console.log(data[0].pref)
                if (data[0].pref == undefined){
                    res.redirect('/preferences');
                } else {
                    res.redirect('/home')
                }
            } else {
                res.send("Incorrect Username and/or Password");
            }
            res.end();
        });
    } else {
        res.send('Please enter Username and Password!');
        res.end();
    }
});

app.post('/deleteUser/:id', function (req, res) {
    con.query("DELETE FROM `Users` WHERE `id`=?", [req.body.id], function (err, results, fields) {
       if (err) throw err;
       console.log("results = " + results)
       res.redirect('/admin');
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

app.post('/deleteUser/:id', function (req, res) {
    console.log(req.body);
    con.query("DELETE FROM `Users` WHERE `id`=?", [req.body.id], function (err, results, fields) {
       if (err) throw err;
       res.end('User has been deleted!');
    });
});

app.get('/admin', function(req, res, next) {
    var sql='SELECT * FROM Users';

    con.query(sql, function (err, data, fields) {
        if (err) throw err;
        res.render('admin', {userData: data});
    });
});

/*app.get('/updateUser', function (req, res) {
    console.log(req.body);
    var sql = "UPDATE Users (id,firstN,lastN,email,userLogin,userPassw) VALUES(null, '" + req.body.firstN + "', '" + req.body.lastN + "','" + req.body.email + "','" + req.body.userLogin + "','" + req.body.userPassw + "')";
    con.query('UPDATE `Users` SET `fistN`=?,`lastN`=?,`email`=?,`userLogin`=?,`userPassw`=? where `id`=?', [req.body.firstN, req.body.lastN, req.body.email, req.body.userLogin, req.body.userPassw, req.body.id], function (error, results, fields) {
        con.query(sql, function (err) {
            if (err) throw err
            res.render('updateUser', {
                title: 'Data Saved',
                message: 'The user was created successfully!'
            })
        });
 });;
 });*/
 app.get('/updateUser2/:id', function (req, res) {
        con.query('UPDATE `Users` SET `fistN`=?,`lastN`=?,`email`=?,`userLogin`=?,`userPassw`=? where `id`=?', [req.body.id,req.body.firstN, req.body.lastN, req.body.email, req.body.userLogin, req.body.userPassw, req.body.id], function (error, results, fields) {
            if (error) throw error;
            res.end("User has been updated");
          });
      });
 app.get('/updateUser/:id', function(req, res){
    res.render('updateUser')
});

app.listen(3000);