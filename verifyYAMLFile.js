'use strict'

const Fs = require('fs')  
const Path = require('path')  
const Axios = require('axios')
const yamlLint = require('yaml-lint');


async function downloadImage (imgURL, dir, destFile) {  
  const url = imgURL
  const path = Path.resolve(__dirname, dir, destFile)
  const writer = Fs.createWriteStream(path)

  const response = await Axios({
    url,
    method: 'GET',
    responseType: 'stream'
  })

  response.data.pipe(writer)

  return new Promise((resolve, reject) => {
     writer.on('finish', resolve('file downloaded successfully'))
     writer.on('error', reject('file was not downloaded'))
  })
}


var x = downloadImage('https://transfer.sh/BQvqT/data.yml', './newData', 'data.yml')

x.then (value =>{
    console.log(value);
    setTimeout(function(){
        var contents = Fs.readFileSync('./newData/data.yml', 'utf8');
        yamlLint.lint(contents).then(() => {
          console.log('Valid YAML file.');
        }).catch((error) => {
          console.error('Invalid YAML file.', error);
        });
      },3000);
      var extension = Path.extname('./newData/data.yml')
      if (extension === '.yml'){
        console.log('correct extension')
      } else {
        console.log('incorrect extension')
      }
      console.log(extension)
}).catch(err=>{
    console.log(err);
});