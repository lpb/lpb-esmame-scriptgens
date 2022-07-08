//convert mame xml files to emulationstation xml files
//mame xml in src dir
//es xml in xml dir

let fs = require("fs");
let parseString = require("xml2js").parseString;
const { create } = require('xmlbuilder2');
const dirPath = '../../mame/hash/';
const softwareDirPath = './';

console.log('Reading MAME hashes...');
fs.readdir(dirPath, function (err, files) {

    files.forEach(function (file) {
        let fileParts = file.split('.');
        let readFile = fileParts[0];
        console.log('Reading ' + file);

        fs.readFile(dirPath + file, function (err, data) {
            parseString(data, function (err, result) {
                console.log('Generating data');
                if (result && result.softwarelist) {
                    var softwareList = result.softwarelist;
                    var gameList = [];

                    for (const [key, value] of Object.entries(softwareList.software)) {

                        var game = {
                            'name': '',
                            'path': '',
                            'publisher': '',
                            'region': '',
                            'desc': '',
                            'image': '',
                            'thumbnail': '',
                            'marquee': '',
                            'releasedate': '',
                            'rating' : '0'
                        };

                        for (const [key1, value1] of Object.entries(value)) {
                            if (value1.name) {
                                game.path = softwareDirPath + value1.name + '.zip';
                                // game.path = value1.name;
                            } else {
                                switch (key1) {
                                    case 'description':
                                        let nameParts = value1[0].match(/\((.*?)\)/);
                                        let region = false;
                                        if (nameParts) {
                                            switch (nameParts[0]) {
                                                case '(Euro)':
                                                    region = 'eu'
                                                    break;
                                                case '(USA)':
                                                    region = 'us'
                                                    break;
                                            }
                                        }
                                        game.region = region ? region : '';
                                        game.name = value1[0].replace(/\((.*?)\)/g, '').trim();
                                        break;
                                    case 'publisher':
                                        game.publisher = value1[0];
                                        game.developer = value1[0];
                                        break;
                                    case 'year':
                                        game.releasedate = value1[0] + '0101T000000';
                                        break;
                                }
                            }

                        }

                        gameList.push(game);

                    }

                    const obj = {
                        gameList: {
                            game: gameList
                        }
                    };
                    const doc = create().ele(obj).dec({
                        'encoding': 'UTF-8',
                        standalone: true
                    });
                    let xmlData = doc.end({
                        prettyPrint: true
                    });

                    let fileDir = './output/xml/' + readFile;

                    if (!fs.existsSync(fileDir)) {
                        fs.mkdirSync(fileDir);
                    }

                    fs.writeFile(fileDir + '/gameList.xml', xmlData, err => {
                        if (err) {
                            console.error(err)
                            return
                        }
                        console.log('Saving ' + fileDir + '/gameList.xml');
                    });

                } else {
                    console.log('error with', file);
                }

            });

        });

    });
});