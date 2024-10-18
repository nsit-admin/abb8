let express = require('express'),
  multer = require('multer'),
  mongoose = require('mongoose'),
  router = express.Router();

// Multer File upload settings
const DIR = './public/';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR);
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(' ').join('-');
    cb(null, fileName)
  }
});

var upload = multer({
  storage: storage,
  // limits: {
  //   fileSize: 1024 * 1024 * 5
  // },
  fileFilter: (req, file, cb) => {
    if (file.mimetype == "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Only .docx format allowed!'));
    }
  }
});

// User model
let User = require('../models/User');

router.post('/upload', upload.array('avatar', 6), (req, res, next) => {
  const reqFiles = []
  const url = req.protocol + '://' + req.get('host')
  for (var i = 0; i < req.files.length; i++) {
    reqFiles.push(url + '/public/' + req.files[i].filename)
  }

  const user = new User({
    _id: new mongoose.Types.ObjectId(),
    avatar: reqFiles,
    name: req.files[0].filename,
  });
  user.save().then(result => {
    res.status(201).json({
      message: "Done upload!",
      userCreated: {
        _id: result._id,
        avatar: result.avatar,
        name: result.name
      }
    })
  }).catch(err => {
      res.status(500).json({
        error: err
      });
  })
})

router.get("/list-files", (req, res, next) => {
  User.find().then(data => {
    res.status(200).json({
      message: "User list retrieved successfully!",
      users: data
    });
  });
});

module.exports = router;