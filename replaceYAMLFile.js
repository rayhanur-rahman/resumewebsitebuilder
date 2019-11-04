const AdmZip = require('adm-zip');
const fs = require('fs');
const cwd = process.cwd();
const zippedFile = './Profile.zip';
const newFile = './newData/data.yml';
const oldFile = './Profile/_data/data.yml';

const zip = new AdmZip(zippedFile);

function replaceYAMLFile(zippedF, newF, oldF){
    // extracts everything
    zip.extractAllTo(cwd, true);

    fs.copyFile(newF, oldF, (err) => {
        if (err) throw err;
        console.log('source.txt was copied to destination.txt');
    });
    fs.unlink(zippedF, err =>{
        if (err) {
            console.log(err);
        }else {
            console.log('done async delete')
        }
    });
}
replaceYAMLFile(zippedFile, newFile, oldFile);