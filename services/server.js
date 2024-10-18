let express = require('express'),
  mongoose = require('mongoose'),
  cors = require('cors'),
  bodyParser = require('body-parser'),
  dbConfig = require('./database/db'),
  socket = require('socket.io'),
  jwt_decode = require('jwt-decode');
const userRoute = require('./routes/authenticate.route')

// MongoDB Setup
mongoose.Promise = global.Promise;
mongoose.connect(dbConfig.db, {
  useNewUrlParser: true
}, function () {
  var io = socket(server, {
    cors: {
      origin: '*',
    }
  });

  io.on('connection', function (socket) {
    socket.on('new user', function(data) {
      socket.join(data.room);
      io.in(data.room).emit('usernames', {user:data.user, email:data.email, room:data.room});
   });

    socket.on('message', function (data) {
      io.in(data.room).emit('new message', { user: data.user, message: data.message, time: data.Time , email:data.email, room:data.room});
    });

    socket.on('typing', function (data) {
      socket.broadcast.to(data.room).emit('user typing', { user: data.user, message: 'is typing ...!!' });
    });
    socket.on('create notification', function(data){  
      var msg= data; 
      socket.broadcast.emit('new notification',msg); 
      console.log(msg); 
    });

    socket.on('disconnect', function(data) {
      // io.in(data.room).emit('usernames', email);
  })
  

  });
}).then(() => {
    console.log('Database sucessfully connected')
  },
   error => {
     console.log('Database could not be connected: ' + error)
   }
  )




// Setup Express.js
const app = express();
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: false
}));
app.use(cors());



function authChecker(req, res, next) {
  try {
    jwt_decode(req.headers.token).email
    next();
  }
  catch (ex) {
    if (req.path === '/api/login' || req.path === '/api/register' || req.path === '/api/update-user'|| req.path.indexOf('forgot-pass') > 0  || req.path.indexOf('/validateRstPwdToken') > 0 || req.path.indexOf('/change-password') > 0 || req.path.indexOf('socket') > 0) {
      next();
    }
    else {
      try{
        jwt_decode(req.headers.authorization).email
        next();
      }
      catch (ex) {
          res.status(500);
          res.send('You are not authorized to access this! ');
        } 
    }
  }
   
}
app.use(authChecker);




// Make Images "Uploads" Folder Publicly Available
// app.use('/public', express.static('public'));


// API Route
app.use('/api', userRoute)

const port = process.env.PORT || 8080;
const server = app.listen(port, 'localhost', () => {
  console.log('Connected to port ' + port)
})


Error
app.use((req, res, next) => {
  // Error goes via `next()` method
  setImmediate(() => {
    next(new Error('Something went wrong'));
  });
});

app.use(function (err, req, res, next) {
  console.error(err.message);
  if (!err.statusCode) err.statusCode = 500;
  res.status(err.statusCode).send(err.message);
});