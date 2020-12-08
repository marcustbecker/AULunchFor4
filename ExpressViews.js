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

app.post('/registerUser', function(req,res){
    console.log(req.body);
    var sql = 'SELECT * FROM Departments'; 
    con.query(sql, function (err, data, fields) {
        if (err) throw err;
        res.render('register', {departmentData: data});
    });
    var sql = "Insert into Users (id,firstN,lastN,email,userLogin,userPassw,department,isActive) VALUES(null, '"+ req.body.firstN + "', '"+ req.body.lastN + "','"+ req.body.email + "','"+ req.body.userLogin + "','"+ req.body.userPassw + "','" + req.body.department + "','Yes')";
    con.query(sql, function (err){
        if (err) throw err
    })
});

app.post('/submitDep', function(req,res){
    console.log(req.body)
    
    var sql = "Insert into Departments (id,depName,depDes) VALUES(null, '"+ req.body.depName + "', '" + req.body.depDes + "')";
    con.query(sql, function (err){
        if(err) throw err
        res.render('addDepartment' ,{title: 'Data Saved', message: 'Department Created'});
    })
})

app.get('/home', function(req, res) {
    var sql="SELECT * FROM `Groups` WHERE Leader='"+req.session.userId+"' OR Member2='"+req.session.userId+"' OR Member3='"+req.session.userId+"' OR Member4='"+req.session.userId+"'";
    con.query(sql, function (err, data) {
        if (err) throw err;
        if(data.length){
            var groupId = data[0].id;
            var leader = data[0].Leader;
            var mem2 = data[0].Member2;
            var mem3 = data[0].Member3;
            var mem4 = data[0].Member4;
        }else{
            res.send("Waiting for group to be made...");
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
                res.render('login',{errMessage : "Wrong Credentials"});
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
    con.query("DELETE FROM Users WHERE id=?", [req.body.id], function (err, results, fields) {
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
    var sql = 'SELECT * FROM Departments';
    con.query(sql, function(err,data, fields){
        if(err) throw err;
        res.render('register',{departmentData:data})
    })
});

app.get('/preferences', function(req, res){
    var sql = 'SELECT * FROM Departments'; 
    con.query(sql, function (err, data, fields) {
        if (err) throw err;
        res.render('preferences', {departmentData: data});
    });
    username = req.session.username;
    userID = req.session.userID;
    console.log("Hello this is a test in login " + username);
    console.log("Hello this is a test in login " + userID);
});

app.post('/updateDepartment', function(req, res) {
    userID = req.session.userId;
    var departments = req.body;
    
    con.query("DELETE FROM `Users_Departments` WHERE `user_id`=?", [req.session.userId], function (err, data, fields) {
        if (err) throw err;
     });

    for(i = 0; i < departments.check.length; i++) {
        console.log(departments.check[i]);
        var SQLin = "INSERT into Users_Departments (user_id, department_id) VALUES('" + userID + "', '" + departments.check[i] + "')";
        con.query(SQLin, function (err, data, fields) {
            if (err) throw err;
        });
    }
    res.redirect('/home');
});

app.post('/formGroups', function(req, res) {
    con.query("SELECT * FROM 'Users_Departments'", function (err, data, fields) {
        if (err) throw err;
    });
});

app.get('/groups', function(req, res){
    var sql = "SELECT * FROM Groups";
    con.query(sql, function (err, data){
        if (err) throw err;
        res.render('groups', {groupData: data})
    })
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

app.get('/sendEmail', function(req,res){
    con.query("SELECT * from Users WHERE isActive='Yes'", function(err, data, fields) {

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth:{
                user : 'aucompspartan@gmail.com',
                pass : '!Baseball101',
            }
        })
        var arr = [];
        for(var val in data){
            arr.push(data[val].email);
        }
        let mailOptions = {
            from: 'brandonlangys@gmail.com',
            to: arr,
            subject: 'Reminder that Lunch for 4 Meeting is coming up!',
            text : 'Get your groups in and stay active!'
        };

        transporter.sendMail(mailOptions, function(err, data){
            if(err){
                console.log('error')
            }else{
                console.log('email sent')
            }
        });
    });
});

app.post('/comments', function(req,res){
    console.log(req.body);
    //res.send(req.body.met);
    var sql = "UPDATE Groups SET met='"+req.body.met+"', comments='"+ req.body.comments+"' WHERE Leader="+req.session.userId;
    con.query(sql, function (err){
        if (err){
            res.redirect('home');
        } else{
            res.redirect('home');
        }
    })
});

app.post('/isActive', function(req,res){
    console.log(req.body.isActive);
    var sql = "UPDATE Users SET isActive='"+req.body.isActive+"' WHERE id="+req.session.userId;
    con.query(sql, function (err){
        if (err){
            res.redirect('home');
        } else{
            res.redirect('home');
        }
    })
});

app.get('/feedback', auth, function(req, res, next) {
    var sql='SELECT * FROM Groups';
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
app.post('/logout', function(req, res, next) {
    var sess = req.session.destroy();
    res.redirect('login');
});
app.listen(3000);