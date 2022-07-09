const fs = require('fs');

const sourcePath = 'I:/MAMEdata/roms/images/';
const destPath = 'I:/emulationStation/.emulationStation/images/';

fs.readdir(sourcePath, function (err, files) {

    files.forEach(function (file) {

        if (file.indexOf('-thumb') != -1) {
            let destImageFileName = file.replace('-thumb', '');
            let destImage = destPath + 'images/' + destImageFileName;
            if (!fs.existsSync(destImage)) {
                fs.copyFile(sourcePath + file, destImage, function (err) {
                    if (err) throw err;
                    console.log('transferred thumb ' + destImage);
                });
            }
        };

        if (file.indexOf('-marquee') != -1) {
            let destImageFileName = file.replace('-marquee', '');
            let destImage = destPath + 'logos/' + destImageFileName;
            if (!fs.existsSync(destImage)) {
                fs.copyFile(sourcePath + file, destImage, function (err) {
                    if (err) throw err;
                    console.log('transferred logo ' + destImage);
                });
            }
        };

        if (file.indexOf('-image') != -1) {
            let destImageFileName = file.replace('-image', '');
            let destImage = destPath + 'snaps/' + destImageFileName;
            if (!fs.existsSync(destImage)) {
                fs.copyFile(sourcePath + file, destImage, function (err) {
                    if (err) throw err;
                    console.log('transferred snap ' + destImage);
                });
            }
        };

    });
});