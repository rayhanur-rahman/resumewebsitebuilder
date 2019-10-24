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
    return new Promise( (resolve, reject) => {
        request.post('https://0x0.st', function (err, resp, body) {
        if (err) {
            console.log('Error!');
            reject(err);
        } else {
            resolve(body);
        }
    }).form().append('file', fs.createReadStream('util.js'));
    } );
}

async function test(){
    var x = await upload();
    console.log(x);
}

test();