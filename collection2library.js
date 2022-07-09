const fs = require('fs');

const dirPath = './collections/';
const romPath = './MAMEdata/roms/';
const destPath = './roms/';

fs.readdir(dirPath, function (err, files) {

    files.forEach(function (file) {
        let fileParts = file.split('.');
        let readFile = fileParts[0];
        let fileData = false;
        let collectionBaseName = readFile.replace(romPath, '');
        console.log('reading collection', file);

        fs.readFile(dirPath + file, 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                return;
            }
            fileData = data.toString().split("\n");

            let content = `<?xml version="1.0" encoding="UTF-8"?>
            <gameList>`

            fileData.forEach(function (itemEntry) {
                content += `
                <game>
                    <path>` + itemEntry + `</path>
                    <name>` + itemEntry.replace(romPath, '') + `</name>
                    <lang>en</lang>
                    <region>us</region>
                </game>`;
            });

            content += `
            </gameList>`;

            // console.log(content);
            
            listPath = destPath + collectionBaseName.replace('custom-', '');
            // console.log(listPath);

            if (!fs.existsSync(listPath)){
                fs.mkdirSync(listPath);
            }

            fs.writeFile(listPath + '/' + 'gamelist.xml', content, err => {
                if (err) {
                    console.error(err)
                    return
                }
            });

        });


    });

});