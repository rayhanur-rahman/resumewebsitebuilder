require('dotenv').config();
var MongoClient = require('mongodb').MongoClient;

var MongoHelper = {
    connectToMongo: function () {
        return MongoClient.connect(process.env.MONGODB_URI, {
            useUnifiedTopology: true
        }).then(client => {
            console.log('mongo connection establised');
            return client;
        }).catch(err => {
            console.log(err);
            return null;
        });
    },
    selectDb: function (client) {
        var dbo = client.db(process.env.DBNAME);
        console.log('db selected');
        return dbo;
    },
    insertObjectToCollection: function (dbo, object) {
        var collection = dbo.collection(process.env.COLLECTIONNAME);
        if (this.findObject(dbo, object) == null)
            return collection.insertOne(object).then(res => console.log('inserted')).catch(err => console.log(err));
    },
    findObject: function (dbo, object) {
        var collection = dbo.collection(process.env.COLLECTIONNAME);
        return collection.findOne(object).then(res => {
            return res;
        }).catch(err => {
            console.log(err);
            return null;
        });
    }
}

module.exports = {
    MongoHelper: MongoHelper
};