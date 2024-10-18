let express = require('express'),
    mongoose = require('mongoose'),
    router = express.Router(),
    jwt = require('jsonwebtoken'),
    bcrypt = require('bcryptjs'),
    axios = require('axios'),
    nodemailer = require('nodemailer'),
    utils = require('../utils/common');
htmldiff = require('../models/diff');
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

// User model
let User = require('../models/User');
let workspace = require('../models/workspace');
let tags = require('../models/Tags');
let Message = require('../models/Messages');
let Merge = require('../models/Merge');
let Notification = require('../models/Notifications');
let DocumentAnalytics = require('../models/DocumentAnalytics');

router.post('/register', (req, res) => {

    const user = new User({
        _id: new mongoose.Types.ObjectId(),
        fname: req.body.fname,
        lname: req.body.lname,
        email: req.body.email.toLowerCase(),
        password: utils.encrypt(req.body.password),
        mobileno: req.body.mobileno,
        ctname: req.body.ctname,
        status: 'R'
    });
    User.find({ email: req.body.email.toLowerCase() }).then(data => {
        if (data.length === 0) {
            user.save().then(result => {
                var token_payload = {
                    email: result.email,
                    name: result.FULLNAME,
                };
                const encEmail = Buffer.from(user.email).toString('base64');
                const registerHtml = `<html>
                <body><div>Dear ${user.fname} ${user.lname},
                <p>Welcome to Abbrevia8. Your account ${user.email} has been successfully created.  <br><br> 
                Please validate your email to activate your account.
                http://ec2-34-195-101-215.compute-1.amazonaws.com/login?act=true&id=${encEmail}<br><br> Thanks, <br> Abbrevia8 Admin Team <br><br>
                Note: This is a system generated e-mail, please do not reply to it. <br>
                <br><br>* This message is intended only for the person or entity to which it is addressed and may contain confidential and/or privileged information. 
                If you have received this message in error, please notify the sender immediately and delete this message from your system *</div></body></html>`;
                var msg = {
                    to: user.email,
                    from: 'register@mazosol.com',
                    html: registerHtml,
                    subject: 'Welcome to ABB8 - Activate Account',
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

router.put("/update-user", (req, res, next) => {
    User.findOneAndUpdate({ email: req.body.email }, req.body).then(data => {
        res.status(200).json({
            message: "User data updated successfully",
        });
    }).catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

router.put("/delete-document", (req, res, next) => {

    Document.findOneAndUpdate({ _id: req.body.doc_id }, req.body).then(data => {
        res.status(200).json({
            message: "Document Deleted successfully",
        });
    }).catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

router.post("/login", (req, res, next) => {
    User.find({ email: req.body.email, password: utils.encrypt(req.body.password) }).then(data => {
        if (data.length === 0) {
            res.status(401).json({
                message: "Username or Password wrong",
                users: data
            });
        } else {
            res.status(200).json({
                message: "User is available in the database",
                users: data,
                token: jwt.sign(data[0].toJSON(), 'secret')
            });
        }
    });
});

router.get("/forgot-pass", (req, res, next) => {
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
            const forgotPwdLink = `http://ec2-34-195-101-215.compute-1.amazonaws.com/reset-pass?id=${token}`;
            const forgotEmailHtml = `<html><head><title>Reset Password Email</title></head><body><div>
      Dear Abbrevia8 User,<p>We have received your request for reset password. <br> 
      kindly use this <b><a href=${forgotPwdLink}>LINK</a></b> to reset your password</p><br>
      <br>This link is valid for 24 hours from the time of your request initiation for password recovery.<br>
      <br> Thanks, <br> Abbrevia8 Admin Team <br>
      <br>Note: This is a system generated e-mail, please do not reply to it. <br><br>
      <br>* This message is intended only for the person or entity to which it is addressed and may contain confidential and/or privileged information. 
      If you have received this message in error, please notify the sender immediately and delete this message from your system *</div></body></html>`;
            var msg = {
                to: user.email,
                from: 'reset@mazosol.com',
                html: forgotEmailHtml,
                subject: 'Reset Abbrevia8 Password',
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
    });
});

router.post("/merge", (req, res, next) => {
    let data = htmldiff(req.body.leftHtml, req.body.rightHtml);
    res.status(200).json({
        message: "document merged successfully",
        merged: data
    });
});


router.post("/validateRstPwdToken", (req, res, next) => {
    if (req.body.token) {
        const data = jwt.verify(req.body.token, 'secret');
        User.find({ email: data.email }).then(resp => {
            if (resp && resp.length > 0) {
                res.status(200).json({
                    status: 200,
                    email: data.email,
                    message: "Token is Valid!"
                });
            } else {
                res.status(500).json({
                    message: "Link is invalid"
                });
            }
        });
    }
});

router.post("/change-password", (req, res, next) => {
    if (req.body.token && req.body.email && req.body.email === jwt.decode(req.body.token, 'secret').email) {
        User.findOneAndUpdate({ email: req.body.email }, { password: utils.encrypt(req.body.password) })
            .then(() => res.status(200).json({ status: 200, message: "Password changed Successfully!" }))
            .catch(err => res.status(500).json(err))
    }
});

router.post("/validate-token", (req, res, next) => {
    const authHeader = req.headers.authorization;
    const jwtToken = authHeader ? authHeader.split('Bearer ')[1] : '';
    const data = jwt.verify(jwtToken, 'secret');
    User.find({ email: data.email, password: utils.encrypt(data.password) }).then(data => {
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

// workspace modal

router.post("/workspace/create", (req, res, next) => {
    var cont = 'pabbu_cp@mazosol.com,sathesh@mazosol.com,nandha@mazosol.com,arun@irie.tech'.split(',');
    new workspace({
        _id: new mongoose.Types.ObjectId(),
        w_name: req.body.w_name,
        w_desc: req.body.w_desc,
        w_tags: req.body.w_tags,
        w_contribtors: [req.body.w_owner],
        status: 'Active',
        created_dt: req.body.created_dt,
        created_by: req.body.created_by,
        w_owner: req.body.w_owner,
        w_version: "Master"
    }).save().then(result => {
        res.status(200).json({
            message: "Workspace has been created successfully",
            data: result,
        });
    }).catch(err => {
        res.status(500).json({
            error: err
        });
    });
});


router.put("/workspace/clone", (req, res, next) => {
    workspace.findByIdAndUpdate({ _id: req.body._id }, { w_contribtors: req.body.contributors }, function (err, result) {
        if (err) {
            return res.status(500).send({ msg: err.message });
        } else {
            if (result) {
                res.status(200).json({
                    message: "workspace has been updated"
                });
                return res = true;
            } else {
                res.status(401).json({
                    message: "Unable to update the workspace"
                });
            }
        }
    });
});

router.get("/workspaces", (req, res, next) => {
    workspace.find({
        $or: [
            { $and: [{ w_owner: req.query.email }, { w_version: "Master" }, { status: "Active" }] },
            { $and: [{ w_contribtors: req.query.email }, { w_version: { $nin: ["Master"] } }, { status: "Active" }] },
        ]
    }).sort({ modified_dt: -1 }).find(function (err, result) {
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


router.get("/user", (req, res, next) => {
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

//get all userdetails
router.get("/users", (req, res, next) => {
    User.find({ 'status': "A" }, function (err, result) {
        if (err) {
            res.status(500).json({
                message: "No user available",
                users: result
            });
        } else {
            res.status(200).json({
                users: result
            });
        }
    });
});

//Sort workspace

router.get("/workspace/sort", (req, res, next) => {
    var sortOrder = req.query.sort == 'created' ? { created_dt: -1 } : { modified_dt: -1 }
    var sortOrder = req.query.sort == 'created' ? { created_dt: -1 } : { modified_dt: -1 }
    workspace.find({
        $or: [
            { $and: [{ w_owner: req.query.email }, { w_version: "Master" }, { status: "Active" }] },
            // { $and: [{ w_owner: req.query.email }, { w_version: "Master" }, { status: "Archived" }] },
            { $and: [{ w_contribtors: req.query.email }, { w_version: { $nin: ["Master"] } }, { status: "Active" }] },

        ]
    }).sort(sortOrder).find(function (err, data) {
        if (err) {
            res.status(500).json({
                message: err,
                workspaces: data
            });
        } else {
            if (data) {
                res.status(200).json({
                    message: "Workspacelist sorted successfully",
                    sortedlist: data
                });
            } else {
                res.status(401).json({
                    message: "Unable to sort the workspaces",
                    workspaces: data
                });
            }
        }
    });
});

//searchworkspaceOrTag 
router.post("/searchWorkspaceOrTag", (req, res, next) => {

    const searchField = new RegExp(req.body.searchKey, 'im');
    workspace.find({
        $or: [
            { $and: [{ w_name: { $regex:  searchField } } , { status: "Active" }, { w_version: "Master" }, { w_owner: req.body.email } ] },
            { $and: [{ w_name: { $regex:  searchField } } , { status: "Active" }, { w_version: { $nin: ["Master"] } }, { w_contribtors: req.body.email } ] } ,
            { $and: [{ w_tags: { $regex:  searchField } } , { status: "Active" }, { w_version: "Master" }, { w_owner: req.body.email } ] },
            { $and: [{ w_tags: { $regex:  searchField } } , { status: "Active" }, { w_version: { $nin: ["Master"] } }, { w_contribtors: req.body.email } ] }
        ]
    }, function (err, resultList) {
        if (err) {
            return res.status(500).send({ msg: err.message });
        } else {
            if (!resultList) {
                res.status(401).json({
                    message: "No workspace document available!!"
                });
            } else {
                return res.status(200).send(resultList);
            }
        }
    });
});

//updateWorkspaceById
router.post("/updateWorkspaceById", (req, res, next) => {
    workspace.findByIdAndUpdate({ _id: req.body._id }, { status: req.body.status }, function (err, result) {
        if (err) {
            return res.status(500).send({ msg: err.message });
        } else {
            if (result) {
                res.status(200).json({
                    message: "workspace status has been updated"
                });
                return res = true;
            } else {
                res.status(401).json({
                    message: "Unable to update the workspace status"
                });
            }
        }
    });
});



// Document model
let Document = require('../models/Document');

router.get("/list-documents", (req, res, next) => {

    Document.find({ workspaceId: req.query.id }).then(data => {
        let result;
        if (data && data.length > 0) {
            result = data.map(doc => ({ _id: doc._id, documentName: doc.documentName, modified_dt: doc.modified_dt, created_by: doc.created_by, modified_by: doc.modified_by, editCount: doc.editCount, merge_status: doc.merge_status }));
        } else {
            result = data
        }
        res.status(200).json({
            data: result
        });
    }).catch(err => {
        res.status(500).json({
            error: err
        });
    });
});
router.get("/document-details", (req, res, next) => {
    Document.find({ _id: req.query.id }).then(data => {
        res.status(200).json({
            data: data,
        });
    }).catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

router.post('/upload-document', (req, res) => {
    const payload = req.body.map(docs => {
        if (docs.workspaceVersion != 'Master') {
            return { ...docs, _id: new mongoose.Types.ObjectId(), editCount: 1, modified_by: docs.created_by, modified_dt: docs.created_dt, merge_status: 'Completed', master_workspace_id: docs.w_master_id, }
        } else {
            return { ...docs, _id: new mongoose.Types.ObjectId(), editCount: 0, modified_by: docs.created_by, modified_dt: docs.created_dt }
        }
    });
    Document.insertMany(payload).then(result => {
        if (req.body[0].workspaceVersion != 'Master') {
            //saveMergeVersion(result, {}, result.documentHtml);
            const reqPayload = result.map(docs => ({
                document_name: docs.documentName,
                document_html: docs.documentHtml,
                document_id: docs._id,
                master_document_id: '',
                workspace_id: docs.workspaceId,
                master_workspace_id: docs.master_workspace_id,
                created_by: docs.created_by,
                created_dt: docs.created_dt,
                document_status: 'New'
            }));
            Merge.insertMany(reqPayload).then(data => {
                // console.log('req data', data);
                res.status(200).json({
                    message: "Document uploaded successfully.",
                });
            }).catch(err => { });
        } else {
            res.status(200).json({
                message: "Document uploaded successfully.",
            });
        }
    }).catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

const { fork } = require('child_process');

router.put("/editDocument", (req, res, next) => {

    var editCount = req.body.isFinalSave ? (req.body.editCount) + 1 : req.body.editCount;

    if (req.query.id) {
        let updated = {
            documentHtml: req.body.documentHtml,
            editCount: editCount,
            modified_by: req.body.modified_by,
            modified_dt: req.body.modified_dt,
        };
        Document.findOneAndUpdate({ _id: req.query.id }, updated)
            .then(() => {
                if (req.body.isFinalSave) {
                    setMergeStatus(req);
                    //  setNotification(req,req.body.owner_email,'Document');
                    new Notification({
                        _id: new mongoose.Types.ObjectId(),
                        n_sender: req.body.modified_by,
                        n_desc: 'Document in this version ' + req.body.w_name + ' has changes compared to Master',
                        n_receiver: req.body.owner_email,
                        n_type: 'Document',
                        created_dt: updated.modified_dt,
                    }).save();
                    let emailData = {
                        'receiver': req.body.owner_email,
                        'subject': 'Document in this version ' + req.body.w_name + ' has changes compared to Master'
                    }
                    sendEmailtoReceiver(emailData, 'Document');
                }
                res.status(200).json({ status: 200, message: "Docuement Edited Successfully!" })
            })
            .catch(err => res.status(500).json(err))
    }
    let updatedDate = {
        modified_dt: req.body.modified_dt
    }
    workspace.findOneAndUpdate({ _id: req.body.workspaceId }, updatedDate)
        .then(() => { })
});

async function setMergeStatus(req) {
    await workspace.findById(req.body.workspaceId).then(data => {
        if (data.w_version != 'Master') {
            startMergeProcess(req.body)
        }
    }).catch(err => {
        res.status(500).json({
            error: err
        });
    });
}


async function startMergeProcess(workSpaceDetails) {
    await Document.findOneAndUpdate({ _id: workSpaceDetails._id }, { merge_status: 'Inprogress' }).then(data => {
        // fork another process
        // const process = fork('./utils/worker');
        // process.send({ data: workSpaceDetails });
        // // listen for messages from forked process
        // process.on('message', (message) => {
        //     console.log(message);
        // });
        delete workSpaceDetails.documentHtml;
        // console.log(workSpaceDetails)
        axios.post('https://0v311sanod.execute-api.us-east-1.amazonaws.com/dev/merge', workSpaceDetails);
        // axios.post('https://5u92zgks3f.execute-api.us-east-1.amazonaws.com/prod/merge', workSpaceDetails); //PROD
        // axios.post('http://localhost:3000/dev/merge', workSpaceDetails);
    }).catch(err => {
        res.status(500).json({
            error: err
        });
    });
}

router.get("/list-workspaces", (req, res, next) => {

    workspace.find({
        $or: [
            { $and: [{ w_owner: req.query.email }, { w_version: "Master" }, { status: "Active" }] },
            { $and: [{ w_contribtors: req.query.email }, { w_version: { $nin: ["Master"] } }] },
        ]
    }).sort({ created_dt: 1 }).then(data => {
        if (data && data.length > 0) {
            const last30DaysWorkspaces = data.filter(w => (w.created_dt && new Date(w.created_dt).getTime() >= new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000)));
            let distict_dates = [...new Set(last30DaysWorkspaces.map((res) => {
                if (res.created_dt) {
                    return res.created_dt.substring(0, 10);
                }

            }))];
            //count each date frequency
            let chartData = distict_dates.map(a => {
                return [
                    a,
                    last30DaysWorkspaces.filter((a1) => {
                        if (a1.created_dt) {
                            return a1.created_dt.startsWith(a);
                        }
                    }).length,
                ]

            })
            const totalWorkspaces = data.length;
            const openWorkspaces = data.filter(w => (w.status && w.status.toUpperCase() === 'ACTIVE')).length + (data.w_contribtors ? data.w_contribtors.length : 0);
            res.status(200).json({
                data: data,
                chartData: {
                    title: 'Area Chart',
                    type: 'AreaChart',
                    data: chartData
                },
                totalWorkspaces: totalWorkspaces,
                openWorkspaces: openWorkspaces
            });
        } else {
            res.status(200).json({
                data: data,
                chartData: [],
                totalWorkspaces: 0,
                openWorkspaces: 0
            });
        }
    }).catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

router.get("/tags", (req, res, next) => {
    tags.find({ tagName: { '$regex': req.query.tags } }).then(data => {
        res.status(200).json({
            data: data,
        });
    }).catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

router.post("/tags", (req, res, next) => {
    const options = { ordered: false };
    tags.collection.createIndex({ "tagName": 1 }, { unique: true });
    tags.collection.insertMany(req.body, options)
        .then(result => {
            res.status(200).json({
                message: "Tag added successfully",
                data: result,
            });
        }).catch(err => {
            res.status(500).json({
                error: err
            });
        });
});

router.get('/workspace-by-id', (req, res) => {
    workspace.findById(req.query.id).then(data => {
        res.status(200).json({
            data: data,
        });
    }).catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

router.get('/merged-documents', (req, res) => {
    Merge.find({ workspace_id: req.query.id }).then(data => {
        res.status(200).json({
            data: data,
        });
    }).catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

router.put('/save-merged-document', (req, res) => {
    document = {
        documentHtml: req.body.document_html,
        modified_by: req.body.modified_by,
        modified_dt: req.body.modified_dt
    }
    if (req.body.master_document_id) {
        Document.findOneAndUpdate({ _id: req.body.master_document_id }, document, { upsert: true }).then(data => {
            // console.log('data findOneAndUpdate', data);
            mergeNotification(req, res);
        }).catch(err => {
            res.status(500).json({
                error: err
            });
        });
    } else {
        new Document({
            _id: new mongoose.Types.ObjectId(),
            workspaceId: req.body.master_workspace_id,
            documentName: req.body.document_name,
            documentHtml: req.body.document_html,
            editCount: 0,
            created_by: req.body.created_by,
            created_dt: req.body.created_dt,
            modified_by: req.body.modified_by,
            modified_dt: req.body.modified_dt
        }).save().then(result => {
            // console.log('data save-merged-document', result);
            mergeNotification(req, res);
        }).catch(err => {
            res.status(500).json({
                error: err
            });
        });
    }
});
async function mergeNotification(req, res) {
    let contributors = req.body.notification_receiver;
    await contributors.forEach(function (receiver) {
        //   setNotification(req,receiver,'workspace');
        new Notification({
            _id: new mongoose.Types.ObjectId(),
            n_sender: req.body.modified_by,
            n_desc: 'Version ' + req.body.notification_w_version + ' has merged to Master',
            n_receiver: receiver,
            n_type: 'Merge',
            created_dt: req.body.modified_dt,
        }).save();
        let emailData = {
            'receiver': receiver,
            'subject': 'Version ' + req.body.notification_w_version + ' has merged to Master'
        }
        sendEmailtoReceiver(emailData, 'Merge');
        res.status(200).json({
            message: "Document merged successfully",
        });
    });
}

//save new messages
router.post('/message', function (req, res) {
    const message = new Message({
        Name: req.body.name,
        email: req.body.email,
        message: req.body.message,
        w_name: req.body.w_name,
        doc_name: req.body.doc_name,
        date: req.body.date,
        time: req.body.time
    });
    message.save(function (err, newUser) {
        if (err) {
            res.json(err);
        } else {
            res.status(200).json({
                message: "Message has been saved successfully",
            });
        }
    });
});

//get messages by WorkSpace- Document Name
router.get('/getMessages/workspaceNameBydocumentName', (req, res) => {
    reqDoc = req.query.docName;
    docArr = reqDoc.split(':');
    Message.find({ w_name: docArr[0], doc_name: docArr[1] }).sort({ time: -1 }).then(data => {
        res.status(200).json({
            data: data,
        });
    }).catch(err => {
        res.status(500).json({
            error: err
        });
    });
})

//getWorkspaceByWorkspaceName
router.get('/getWorkspaceByWorkspaceName', (req, res) => {
    workspace.find({ w_name: req.query.workspaceName }).then(data => {
        res.status(200).json({
            data: data,
        });
    }).catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

//share workspace
router.post("/workspace/share", (req, res, next) => {
    var cont = req.body.w_contribtors;
    var version = req.body.w_version;
    var email = [];
    email = req.body.w_contribtors;
    email.forEach(function (element) {
        var emailnew = element;
        User.find({ email: emailnew }).then(data => {
            if (data.length === 0) {
                const newUserEmailHtml = `<html><head><title>New user</title></head><body><div>
          Dear Abbrevia8 User,<p>Welcome to Abbrevia8. * new workspace has been shared with you <br><br>
          Please register using <a href="http://ec2-34-195-101-215.compute-1.amazonaws.com">Abbrevia8</a> to get access to your workspace and start collaborating
          <br> Thanks, <br> Abbrevia8 Admin Team <br>
          <br>Note: This is a system generated e-mail, please do not reply to it. <br><br>
          </div></body></html>`;
                var msg = {
                    to: emailnew,
                    from: 'abb8@mazosol.com',
                    html: newUserEmailHtml,
                    subject: 'Welcome to ABB8 - Workspace shared',
                };
                smtpTransport.sendMail(msg, function (err) { });
            }
        });
    });
    new workspace({
        _id: new mongoose.Types.ObjectId(),
        w_name: req.body.w_name,
        w_desc: req.body.w_desc,
        w_owner: req.body.w_owner,
        owner_name: req.body.owner_name,
        w_tags: req.body.w_tags,
        w_contribtors: cont,
        w_version: version,
        status: req.body.status,
        created_dt: req.body.created_dt,
        created_by: req.body.created_by,
        w_master_id: req.body.id,
    }).save().then(result => {
        Document.find({ workspaceId: req.body.id }).then(res => {
            if (res.length > 0) {
                res.forEach(d => {
                    new Document({
                        _id: new mongoose.Types.ObjectId(),
                        workspaceId: result._id,
                        documentName: d.documentName,
                        documentHtml: d.documentHtml,
                        editCount: 0,
                        created_by: d.created_by,
                        created_dt: d.created_dt,
                        modified_by: d.modified_by,
                        modified_dt: d.modified_dt
                    }).save()
                })
            }
        })
        email.forEach(function (receiver) {
            //   setNotification(req,receiver,'workspace');
            new Notification({
                _id: new mongoose.Types.ObjectId(),
                n_sender: req.body.w_owner,
                n_desc: req.body.owner_name + ' shared workspace ' + req.body.w_name + ' with you',
                n_receiver: receiver,
                n_type: 'workspace',
                created_dt: req.body.created_dt,
            }).save();
            let emailData = {
                'receiver': receiver,
                'subject': req.body.owner_name + ' shared workspace ' + req.body.w_name + ' with you'
            }
            sendEmailtoReceiver(emailData, 'workspace');
        });

        res.status(200).json({
            message: "Workspace has been created successfully",
            data: result,
        });
    }).catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

router.get("/getMergeStatus", (req, res, next) => {
    Document.find({ workspaceId: req.query.id }).then(data => {
        let result;
        if (data && data.length > 0) {
            const InprogressDoc = data.filter(doc => doc.merge_status === 'Inprogress');
            if (InprogressDoc.length == 0) {
                result = 'Completed'
            } else {
                result = 'Inprogress'
            }
        } else {
            result = 'Inprogress'
        }
        res.status(200).json({
            mergeStatus: result
        });
    }).catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

router.post("/documentDetails", (req, res, next) => {
    Document.find({ workspaceId: { $in: req.body } }).sort({ modified_dt: 1 }).then(data => {
        if (data && data.length > 0) {
            const last30Documents = data.filter(d => (d.editCount > 0 && d.modified_dt && new Date(d.modified_dt).getTime() >= new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000)));
            let distict_dates = [...new Set(last30Documents.map((res) => {
                if (res.modified_dt) {
                    return res.modified_dt.substring(0, 10);
                }

            }))];
            //count each date frequency
            let chartData = distict_dates.map(a => {
                return [
                    a,
                    last30Documents.filter((a1) => {
                        if (a1.modified_dt) {
                            return a1.modified_dt.startsWith(a);
                        }
                    }).length,
                ]

            })
            const totalDocumentsEdited = last30Documents.length;
            const totalDocuments = data.length;
            res.status(200).json({
                data: data,
                chartData: {
                    title: 'Area Chart',
                    type: 'AreaChart',
                    data: chartData
                },
                totalDocumentsEdited: totalDocumentsEdited,
                totalDocuments: totalDocuments
            });
        } else {
            res.status(200).json({
                data: data,
                chartData: [],
                totalDocumentsEdited: 0,
                totalDocuments: 0
            });
        }
    }).catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

//notification
router.get("/notification/shared", (req, res, next) => {
    Notification.find({
        n_receiver: req.query.email

    }, function (err, result) {
        if (err) {
            res.status(500).json({
                message: "No workspace available",
                notifications: result
            });
        } else {
            res.status(200).json({
                message: "Workspace listed successfully",
                notifications: result
            });
        }
    });
});

function sendEmailtoReceiver(emailData, type) {
    let newUserEmailHtml = '';
    if (type == 'workspace')
        newUserEmailHtml = `<html><head><title>New Workspace Shared with You</title></head><body><div>
        Dear Abbrevia8 User,<p>Welcome to Abbrevia8. * new workspace has been shared with you.
        Please visit <a href="http://ec2-34-195-101-215.compute-1.amazonaws.com">Abbrevia8</a> to access your space and start collaborating. 
        <br> Thanks, <br> Abbrevia8 Admin Team <br>
        <br>Note: This is a system generated e-mail, please do not reply to it. <br><br>
        </div></body></html>`;
    else if (type == 'Document')
        newUserEmailHtml = `<html><head><title>Master has some changes</title></head><body><div>
        Dear Abbrevia8 User,<p>* Your changes are merged with the master version. Please visit <a href="http://ec2-34-195-101-215.compute-1.amazonaws.com">Abbrevia8</a> to review the changes.
        <br> Thanks, <br> Abbrevia8 Admin Team <br>
        <br>Note: This is a system generated e-mail, please do not reply to it. <br><br>
        </div></body></html>`;
    else if (type == 'Merge')
        newUserEmailHtml = `<html><head><title>Version has Merged to Master</title></head><body><div>
        Dear Abbrevia8 User,<p> * Your changes are merged with the master version. Please visit <a href="http://ec2-34-195-101-215.compute-1.amazonaws.com">Abbrevia8</a> to review the changes.
        <br> Thanks, <br> Abbrevia8 Admin Team <br>
        <br>Note: This is a system generated e-mail, please do not reply to it. <br><br>
        </div></body></html>`;
    var msg = {
        to: emailData.receiver,
        from: 'abb8@mazosol.com',
        html: newUserEmailHtml,
        subject: emailData.subject,
    };
    smtpTransport.sendMail(msg, function (err) { });
}

// async function setNotification(req, receiver,type) {
//     await new Notification({
//         _id: new mongoose.Types.ObjectId(),
//         n_sender: req.body.w_owner,
//         n_desc: req.body.owner_name + ' shared ' + req.body.w_version,
//         n_receiver: receiver,
//         n_type: type,
//         created_dt: req.body.created_dt,
//     }).save();
// }


router.get("/getDocumentMergeStatus", (req, res, next) => {
    Document.findById({ _id: req.query.id }).then(data => {
        let result;
        if (data && data.merge_status === 'Inprogress') {
            result = 'Inprogress'
        } else {
            result = 'Completed'
        }
        res.status(200).json({
            mergeStatus: result
        });
    }).catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

router.post("/updateWorkspaceMergeStatus", (req, res, next) => {
    workspace.findByIdAndUpdate({ _id: req.body._id }, { w_merge_status: req.body.w_merge_status }, function (err, result) {
        if (err) {
            return res.status(500).send({ msg: err.message });
        } else {
            if (result) {
                return res.status(200).json({
                    message: "workspace merge status has been updated"
                });
            } else {
                return res.status(401).json({
                    message: "Unable to update the workspace merge status"
                });
            }
        }
    });
});

router.post("/inactiveExistingMerges", (req, res, next) => {
    Merge.updateMany({ master_workspace_id: req.body.id, master_document_id: { $nin: ["", undefined] } }, { status: req.body.status }, function (err, result) {
        if (err) {
            return res.status(500).send({ msg: err.message });
        } else {
            if (result) {
                return res.status(200).json({
                    message: "merge status has been updated"
                });
            } else {
                return res.status(401).json({
                    message: "Unable to update the merge status"
                });
            }
        }
    });
});

router.post("/resyncChanges", (req, res, next) => {
    Document.find({ workspaceId: req.body.id, merge_status: 'Completed' }, function (err, result) {
        if (err) {
            return res.status(500).send({ msg: err.message });
        } else {
            var list = [];
            if (result && result.length > 0) {
                list.push()
                result.forEach(element => {
                    element.w_name = req.body.w_name;
                    startMergeProcess(element);
                });
                return res.status(200).json({
                    message: "Resync merge has been started"
                });
            } else {
                return res.status(401).json({
                    message: "Unable to start resync"
                });
            }
        }
    });
});


router.get("/getDocAnalytics", (req, res, next) => {
    DocumentAnalytics.find({ workspaceId: req.query.workspaceId }).then(data => {
        res.status(200).json({
            data: data,
        });
    }).catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

router.post('/saveDocAnalytics', function (req, res) {
    DocumentAnalytics.find({ document_id: req.body.document_id }).then(data => {
        if (data && data.length > 0) {
            updateDocAnalytics(req, res);
        } else {
            saveDocAnalytics(req, res);
        }
    }).catch(err => {
        res.status(500).json({
            error: err
        });
    });

});

function updateDocAnalytics(req, res) {
    DocumentAnalytics.updateMany({ document_id: req.body.document_id }, { document_action_status: req.body.document_action_status }, function (err, result) {
        if (err) {
            return res.status(500).send({ msg: err.message });
        } else {
            if (result) {
                return res.status(200).json({
                    message: "Document Analytics has been updated"
                });
            } else {
                return res.status(401).json({
                    message: "Unable to update the Document Analytics"
                });
            }
        }
    });
}

function saveDocAnalytics(req, res) {

    const documentAnalytics = new DocumentAnalytics({
        _id: new mongoose.Types.ObjectId(),
        documentName: req.body.documentName,
        workspaceId: req.body.workspaceId,
        document_action_status: req.body.document_action_status,
        w_name: req.body.w_name,
        created_dt: req.body.created_dt,
        modified_dt: req.body.modified_dt,
        document_id: req.body.document_id
    });
    documentAnalytics.save(function (err) {
        if (err) {
            res.json(err);
        } else {
            res.status(200).json({
                message: "Analytics Saved successfully",
            });
        }
    });

}

module.exports = router;