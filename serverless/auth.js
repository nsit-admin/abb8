const serverless = require('serverless-http');
const connectToDatabase = require('./db');
const User = require('./models/User');
const workspace = require('./models/workspace');
let express = require('express'),
    mongoose = require('mongoose'),
    jwt = require('jsonwebtoken'),
    bodyParser = require('body-parser'),
    nodemailer = require('nodemailer');
const app = express();
var email = process.env.MAILER_EMAIL_ID || 'abb8@mazosol.com';
var pass = process.env.MAILER_PASSWORD || 'Abb8@mazo';
var smtpTransport = nodemailer.createTransport({
    host: "smtpout.secureserver.net",
    secure: true,
    secureConnection: false,
    tls: {
        ciphers: 'SSLv3'
    },
    requireTLS: true,
    port: 465,
    debug: true,
    auth: {
        user: email,
        pass: pass
    }
});

app.use(bodyParser.json({ strict: false }));

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.post('/register', (req, res) => {
    connectToDatabase();
    const user = new User({
        _id: new mongoose.Types.ObjectId(),
        fname: req.body.fname,
        lname: req.body.lname,
        email: req.body.email.toLowerCase(),
        password: req.body.password,
        mobileno: req.body.mobileno,
        ctname: req.body.ctname,
        status: 'A'
    });
    User.find({ email: req.body.email }).then(data => {
        if (data.length === 0) {
            user.save().then(result => {
                var token_payload = {
                    email: result.email,
                    name: result.FULLNAME,
                };
                const registerHtml = `<html><head>
        <title>Welcome to ABB8</title></head>
        <body><div><h3>Dear ${user.fname} ${user.lname},</h3>
        <p>We have registered yourself with our application. 
        Kindly use below credentials to login to the application <br><br> 
        User ID: ${user.email}<br><br><h1>
        http://abb8-dev.s3-website-us-east-1.amazonaws.com</h1><br><br>Please change the password when you first login to the application <br><br> Thanks, <br> Abb8 Admin Team <br><br>
        Note: This is a system generated e-mail, please do not reply to it. <br>
        <br><br>* This message is intended only for the person or entity to which it is addressed and may contain confidential and/or privileged information. 
        If you have received this message in error, please notify the sender immediately and delete this message from your system *</div></body></html>`;
                var msg = {
                    to: user.email,
                    from: 'register@srkdigitech.com',
                    html: registerHtml,
                    subject: 'Welcome to ABB8 - Registration',
                };
                smtpTransport.sendMail(msg, function (err) {
                    if (err) { return res.status(500).send({ msg: err.message }); } else {
                        return res.status(200).send({
                            status: 201,
                            message: "user registered successfully!",
                            userCreated: {
                                _id: result._id,
                                avatar: result.avatar,
                                name: result.fname + result.lname,
                                token: jwt.sign(token_payload, 'secret')
                            }
                        });
                    }
                });
            }).catch(err => {
                res.status(500).json({
                    error: err
                });
            });
        } else {
            res.status(200).json({
                status: 202,
                message: "The e-mail address " + req.body.email + " is already registered.",
                users: data
            });
        }
    });

})

app.post("/login", (req, res, next) => {
    connectToDatabase();
    User.find({ email: req.body.email, password: req.body.password }).then(data => {
        if (data.length === 0) {
            res.status(401).json({
                message: "Username or Password wrong",
                users: data
            });
        } else {
            res.status(200).json({
                message: "valid user creds",
                users: data,
                token: jwt.sign(data[0].toJSON(), 'secret')
            });
        }
    }).catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

app.get("/forgot-pass", (req, res, next) => {
    connectToDatabase();
    User.findOne({ email: req.query.email }, function (err, user) {
        if (!user) {
            res.status(401).json({
                message: "Email doesnt exists",
                users: user
            });
        } else {
            const token = jwt.sign({
                email: user.email
            }, 'secret', { expiresIn: '24h' });
            const forgotPwdLink = `http://abb8-dev.s3-website-us-east-1.amazonaws.com/reset-pass?id=${token}`;
            const forgotEmailHtml = `<html><head><title>Reset Password Email</title></head><body><div>
      <h3>Dear Abb8 User,</h3><br><br><p>We have received your request for reset password. <br> 
      kindly use this <b><a href=${forgotPwdLink}>LINK</a></b> to reset your password</p><br>
      <br>This link is valid for 24 hours from the time of your request initiation for password recovery.<br>
      <br> Thanks, <br> Abb8 Admin Team <br>
      <br>Note: This is a system generated e-mail, please do not reply to it. <br><br>
      <br>* This message is intended only for the person or entity to which it is addressed and may contain confidential and/or privileged information. 
      If you have received this message in error, please notify the sender immediately and delete this message from your system *</div></body></html>`;
            var msg = {
                to: user.email,
                from: 'reset@srkdigitech.com',
                html: forgotEmailHtml,
                subject: 'Reset Abb8 Password',
            };
            smtpTransport.sendMail(msg, function (err) {
                if (err) { return res.status(500).send({ msg: err.message }); } else {
                    return res.status(200).send({
                        status: 201,
                        message: "Email Sent Succesfully!"
                    });
                }
            });
        }
    }).catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

app.post("/merge", (req, res, next) => {
    let data = htmldiff(req.body.leftHtml, req.body.rightHtml);
    res.status(200).json({
        message: "document merged successfully",
        merged: data
    });
});


app.post("/validateRstPwdToken", (req, res, next) => {
    connectToDatabase();
    if (req.body.token) {
        const data = jwt.verify(req.body.token, 'secret');
        User.find({ email: data.email }).then(data => {
            res.status(200).json({
                status: 200,
                email: data.email,
                message: "Token is Valid!"
            });
        }).catch(err => {
            res.status(500).json({
                error: err
            });
        });
    }
});

app.post("/change-password", (req, res, next) => {
    connectToDatabase();
    var email = jwt.decode(req.body.token, 'secret').email;
    if (req.body.token && req.body.password) {
        User.findOneAndUpdate({ email: email }, { password: req.body.password })
            .then(() => res.status(200).json({ status: 200, message: "Password changed Successfully!" }))
            .catch(err => res.status(500).json(err))
    }
});

app.post("/validate-token", (req, res, next) => {
    connectToDatabase();
    const authHeader = req.headers.authorization;
    const jwtToken = authHeader ? authHeader.split('Bearer ')[1] : '';
    const data = jwt.verify(jwtToken, 'secret');
    User.find({ email: data.email, password: data.password }).then(data => {
        if (data && data.length > 0) {
            res.status(200).json({
                message: "User token is valid",
                users: data,
            });
        } else {
            res.status(401).json({
                message: "Invalid user token",
                users: data
            });
        }
    });
});


app.post("/workspace/create", (req, res, next) => {
    connectToDatabase();
    new workspace({
        _id: new mongoose.Types.ObjectId(),
        w_name: req.body.w_name,
        w_desc: req.body.w_desc,
        w_tags: req.body.w_tags,
        status: 'Active',
        created_dt: req.body.created_dt,
        w_owner: req.body.w_owner
    }).save().then(result => {
        res.status(200).json({
            message: "Workspace created succesfully"
        });
    });
});

app.get("/workspaces", (req, res, next) => {
    connectToDatabase();
    workspace.find({ $or: [{ 'status': "Active" }, { 'status': "Archived" }] }, function (err, result) {
        if (err) {
            res.status(500).json({
                message: "No workspace available",
                workspaces: result
            });
        } else {
            res.status(200).json({
                message: "Workspace listed successfully",
                workspaces: result
            });
        }
    });
});

//get loggedin userdetails

app.get("/user", (req, res, next) => {
    connectToDatabase();
    User.findOne({ email: req.query.email }, function (err, user) {
        if (!user) {
            res.status(401).json({
                message: "Email doesnt exists",
                users: user
            });
        } else {
            res.send(user);
        }
    });
});

//Sort workspace

app.get("/workspace/sort", (req, res, next) => {
    connectToDatabase();
    workspace.find({ $or: [{ 'status': "Active" }, { 'status': "Archived" }] }).sort({ created_dt: -1 }).find(function (err, data) {

        if (err) {
            res.status(500).json({
                message: "Failed",
                workspaces: data
            });
        } else {
            res.status(200).json({
                message: "Workspacelist sorted successfully",
                sortedlist: data
            });
        }
    });
});

//workspaceSearch  

//workspaceSearch
app.get("/searchWorkSpace-tag", (req, res, next) => {
    connectToDatabase();
    const searchField = new RegExp(req.query.searchtxt, 'i');
    workspace.find({
        $and: [
            { $or: [{ w_name: { $all: [searchField] } }, { w_tags: { $all: [searchField] } }] },
            { $or: [{ status: "Active" }, { status: "Archived" }] }
        ]
    }, function (err, resultList) {
        if (!resultList) {
            res.status(401).json({
                message: "NO list available"
            });
        } else {
            return res.status(200).send(resultList);
        }
    });
});

//updateWorkSpace

app.post("/updateWorkSpaceById", (req, res, next) => {
    connectToDatabase();
    workspace.findByIdAndUpdate({ _id: req.body._id }, { status: req.body.status }, function (err, result) {
        if (result) {
            res.status(200).json({
                message: "workspace status has been updated"
            });
            return res = true;
        } else {
            res.status(401).json({
                message: "Unable to update the status"
            });
        }
    });
});


module.exports.handler = serverless(app);