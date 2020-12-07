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
    database: "PWW_F202",
    multipleStatements: true
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

app.get('/home', function(req, res) {
    var sql='SELECT * FROM `Groups`';
    con.query(sql, function (err, data) {
        if (err) throw err;
        if(data.length){
            var groupId = data[0].id;
            var leader = data[0].Leader;
            var mem2 = data[0].Member2;
            var mem3 = data[0].Member3;
            var mem4 = data[0].Member4;
        }
        var sql2="SELECT * FROM Users WHERE id="+leader+" OR id='"+mem2+"' OR id='"+mem3+"' OR id='"+mem4+"'";
        con.query(sql2, function (err, data2) {
            res.render('home', {userData: data2});
        });
    });
    
});

// Login authentication 
app.post('/login', function(req, res) {
    var sess = req.session
    //username = req.session;
    //UserId = req.session;
    var username = req.body.username;
    var password = req.body.password;
    var sql="SELECT id, firstN, lastN, userLogin, email, isAdmin FROM `Users` WHERE `userLogin`='"+username+"' and userPassw ='"+password+"'";
    if (username && password) {
        con.query(sql, function(err, results) {
            if(results.length){
                req.session.userId = results[0].id;
                req.session.firstName = results[0].firstN;
                req.session.lastName = results[0].lastN;
                req.session.userLogin = results[0].userLogin;
                req.session.email = results[0].email;
                req.session.isAdmin = results[0].isAdmin;
                console.log("Logged in")
                var sql2="SELECT * FROM `Users_Departments` WHERE `user_id`="+req.session.userId;
                console.log("results===" + req.session.userId)
                con.query(sql2, function(err, results2) {
                    if(req.session.isAdmin === 1){
                        res.redirect('/admin');
                    } else if (req.session.isAdmin === 0){
                        if(results2.length){
                            res.redirect('/home')
                        }else{
                            res.redirect('/preferences')
                        }
                    }
                })
                
            }else{
                res.render('login',{message : "Wrong Credentials"});
            }
        });
    } else {
        res.send('Please enter Username and Password!');
        res.end();
    }
});

var auth = function(req, res, next) {
    if (req.session.isAdmin)
        return next();
    else
        return res.sendStatus(401);
};

app.post('/logout', function(req, res, next) {
    var sess = req.session.destroy();
    res.redirect('login');
});

app.post('/deleteUser/:id', function (req, res) {
    con.query("DELETE FROM `Users` WHERE `id`=?", [req.body.id], function (err, results, fields) {
       if (err) throw err;
       console.log("results = " + results)
       res.redirect('/admin');
    });
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

app.post('/updateDepartment', function(req,res){
    console.log(req.body.check)
    var sql = "INSERT into Users_Departments (user_id, department_id) VALUES('" + req.session.userId + "', '" + req.body.check + "')"
    con.query(sql, function (err, data, fields) {
        if (err) throw err;
        res.redirect('home');
    });
})

app.get('/preferences', function(req, res){
    var sql = 'SELECT * FROM Departments'; 
    con.query(sql, function (err, data, fields) {
        if (err) throw err;
        res.render('preferences', {departmentData: data});
    });
    var username = req.session.userLogin;
    var userID = req.session.userId;
    console.log("Hello this is a test in login " + username);
    console.log("Hello this is a test in login " + userID);
});

app.get('/departments', auth, function(req, res, next){
    var sql = 'SELECT * FROM Departments';
    con.query(sql, function(err,data, fields){
        if(err) throw err;
        res.render('departments',{departmentData:data})
    })
});

app.get('/addDepartment', auth, function(req, res){
    res.render('addDepartment')
});

app.post('/deleteUser/:id', function (req, res) {
    console.log(req.body);
    con.query("DELETE FROM `Users` WHERE `id`=?", [req.body.id], function (err, results, fields) {
       if (err) throw err;
       res.end('User has been deleted!');
    });
});

app.get('/admin', auth, function(req, res, next) {
    var sql='SELECT * FROM Users';
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

app.post('/comments', function(req,res){
    console.log(req.body);
    //res.send(req.body.met);
    var sql = "Insert into Feedback (id,met,comments) VALUES(null, '"+ req.body.met + "', '"+ req.body.comments + "')";
    con.query(sql, function (err){
        if (err) throw err
        res.redirect("home");
        
    })
});

app.get('/feedback', auth, function(req, res, next) {
    var sql='SELECT * FROM Feedback';
    con.query(sql, function (err, data, fields) {
        if (err) throw err;
        var met = 0;
        var notMet = 0;
        for( var val in data){
            if(data[val].met == 'Yes'){
                met++;
            }
            else if(data[val].met == 'No'){
                notMet++;
            }
        }
        res.render('feedback', {feedback: data, met: met, notMet: notMet});
    });
});

app.get('/groups', auth, function(req, res){
    var sql = "SELECT * FROM Groups";
    con.query(sql, function (err, data){
        if (err) throw err;
        res.render('groups', {groupData: data})
    })
});

app.listen(3000);