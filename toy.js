var Transfer = require('transfer-sh');
var fs = require('fs');
var request = require('request');

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
        var dbo = client.db('heroku_wvfjdtzx');
        console.log('db connected');
        return dbo;

    }).catch(err => {
        console.log(err);
    });
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
    return collection.findOne({name: 'Alice'}).then(res => {
        return res;
    }).catch(err => console.log(err));
}

async function dosth() {
    var dbo = await connectToMongo();
    await createCollection(dbo);
    await insert(dbo);
    console.log(await find(dbo));
    console.log('xxx');
}

dosth();