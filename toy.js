var Transfer = require('transfer-sh')
 
/* Encrypt and Upload */
//upload 

new Transfer('./bot.yml')
  .upload()
  .then(function (link) { console.log(link) })
  .catch(function (err) { console.log(err) })


//download
const http = require('https');
const fs = require('fs');

const file = fs.createWriteStream("file.yml");
const request = http.get("https://transfer.sh/DotXl/bot.yml", function(response) {
  response.pipe(file);
});