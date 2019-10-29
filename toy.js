var Transfer = require('transfer-sh');
var fs = require('fs');
var request = require('request');
var MongoHelper = require('./mongo-helper.js').MongoHelper;

function upload() {
    return new Transfer('./user-mock-data.yml')
        .upload()
        .then(function (link) {
            console.log(`File uploaded successfully at ${link}`);
            return 'succ';
        })
        .catch(function (err) {
            console.log('error');
            return 'xxx';
        });
}

function upload() {
    return new Promise((resolve, reject) => {
        request.post('https://0x0.st', function (err, resp, body) {
            if (err) {
                console.log('Error!');
                reject(err);
            } else {
                resolve(body);
            }
        }).form().append('file', fs.createReadStream('util.js'));
    });
}

async function test() {
    var x = await upload();
    console.log(x);
}

require('dotenv').config();


// Retrieve
var MongoClient = require('mongodb').MongoClient;


// Connect to the db
function connectToMongo() {
    return MongoClient.connect(process.env.MONGODB_URI, { useUnifiedTopology: true }).then(client => {
        console.log('mongo connection establised');
        return client;

    }).catch(err => {
        console.log(err);
    });
}

function selectDb(client){
    var dbo = client.db(process.env.DBNAME);
    console.log('db selected');
    return dbo;
}

function createCollection(dbo){
    return dbo.createCollection('dogs').then(result => {
        console.log('collection created!');
    }).catch(err => {
        console.log('error');
    });
}

function insert(dbo){
    var collection = dbo.collection('dogs');
    return collection.insertOne({name: 'Darth', id: 3}).then(res => console.log('inserted')).catch(err => console.log(err));
}

function find(dbo){
    var collection = dbo.collection('dogs');
    return collection.findOne({name: 'kkk'}).then(res => {
        return res;
    }).catch(err => console.log(err));
}

async function dosth() {
    var client = await connectToMongo();
    var dbo = await selectDb(client);
    await createCollection(dbo);
    await insert(dbo);
    console.log(await find(dbo));
    console.log('xxx');
}

dosth();
console.log('fff');


var App = {
    foo: function(a,b) {
        return a+b;
    },
    bar: function(a,b) {
        return this.foo(a,b);
    },
    yay: function(a){
        if (a%2 == 0) return a;
        else return null;
    }
}

