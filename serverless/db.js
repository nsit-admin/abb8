const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
let isConnected;
module.exports = connectToDatabase = () => {
    if (isConnected) {
        console.log('=> using existing database connection');
        return Promise.resolve();
    }
    console.log('=> using new database connection');
    // return mongoose.connect(`mongodb+srv://mongo:mongo@cluster0.sp01d.mongodb.net/dms`).then(db => {
    //     isConnected = db.connections[0].readyState;
    // });

    return mongoose.connect('mongodb+srv://abb8_prod:abb8_prod@cluster0.oji6b.mongodb.net/dms').then(db => {
        isConnected = db.connections[0].readyState;
    });
};