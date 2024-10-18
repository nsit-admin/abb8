const mongoose = require('mongoose');
const fs = require('fs');
const certFileBuf = fs.readFileSync('./rds-combined-ca-bundle.pem');
mongoose.Promise = global.Promise;
let isConnected;
module.exports = connectToDocDatabase = () => {
    if (isConnected) {
        console.log('=> using existing database connection');
        return Promise.resolve();
    }
    var options = {
        sslCA: certFileBuf
        };
    console.log('=> using new database connection');
    return mongoose.connect(`mongodb://abb8admin:abw1na88b@docdb-2020-11-02-18-24-05.cluster-crnqukf1gw1j.us-east-1.docdb.amazonaws.com:27017`, options).then(db => {
        isConnected = db.connections[0].readyState;
    });
};
