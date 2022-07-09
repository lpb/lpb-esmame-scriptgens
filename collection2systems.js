const fs = require('fs');

const dirPath = './collections/';
const romPath = './MAMEdata/roms/';
const destPath = './roms/';

let content = '';

fs.readdir(dirPath, function (err, files) {

    files.forEach(function (file) {
        let fileParts = file.split('.');
        let readFile = fileParts[0];
        let fileData = false;
        let collectionBaseName = readFile.replace(romPath, '');
        // console.log('reading collection', file);
        

        fs.readFile(dirPath + file, 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                return;
            }
            fileData = data.toString().split("\n");
            rawName = collectionBaseName.replace('custom-', '');
            listPath = destPath + rawName;

            content += `<system>
                <name>` + rawName + `</name>
                <fullname>` + rawName + `</fullname>
                <path>~\\..\\MAMEdata\\roms\\</path>
                <extension>.zip</extension>
                <command>%HOME%\\..\\mame\\mame.exe "%BASENAME%"</command>
                <platform>arcade</platform>
                <theme>` + rawName + `</theme>
            </system>`;

            // console.log(content);

            fs.writeFile('es_systems.cfg', content, err => {
                if (err) {
                    console.error(err)
                    return
                }
            });

        });


    });

});