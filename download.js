'use strict'

const Fs = require('fs')  
const Path = require('path')  
const Axios = require('axios')

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
    writer.on('finish', resolve)
    writer.on('error', reject)
    console.log('downloaded');
  })
}

downloadImage('https://transfer.sh/BQvqT/data.yml', './images', 'data.yml')  

module.exports = {
  downloadImage: downloadImage
};