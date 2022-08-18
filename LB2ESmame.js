const fs = require('fs');
const xml2js = require('xml2js');

const xmlSource = 'I:/Launchbox/Metadata/Mame.xml';
const metaSource = 'I:/Launchbox/Metadata/Metadata.xml';
const dataSourceDir = 'I:/MAMEdata/';
const destRootDir = 'I:/emulationStation-Arcade/.emulationstation/';
const UsagePath = './mamedata/roms/'; //for collection lists
// const UsageRomPAth = 'I:/MAMEdata/roms/';

const romsSrc = dataSourceDir + 'roms/';
const snapsSrc = dataSourceDir + 'Extras/snap/snap/';
const logosSrc = dataSourceDir + 'Extras/marquees/marquees/';
const titlesSrc = dataSourceDir + 'Extras/flyers/flyers/';
const manualsSrc = dataSourceDir + 'Extras/manuals/manuals/';

const gameListDir = destRootDir + 'gamelists/mame/';
const collectionDir = destRootDir + 'collections/';

const mediaBasePath = '~/.emulationstation/';
const machineRomsPath = './';
const machineImagesPath = 'media/snaps/';
const machineMarqueesPath = 'media/logos/';
const machineManualsPath = 'media/manuals/';
const machineThumbnailsPath = 'media/images/';

const destBasePath = destRootDir;
const destRomsPath = destBasePath + machineRomsPath;
const destImagesPath = destBasePath + machineImagesPath;
const destMarqueesPath = destBasePath + machineMarqueesPath;
const destThumbnailsPath = destBasePath + machineThumbnailsPath;
const destManualsPath = destBasePath + machineManualsPath;

const missingThumbnailImage = mediaBasePath + 'media/no-image.png';

const doMedia = false; //disable media transfer
const doRoms = false; //disable rom relocation
const overWriteMedia = false; //overwrite existing media files
const doLists = true; //disable collection list generation
const makeJSON = true; //makes an optional json file of the main machine xml data

let machinesArray = [];
let metaData = [];

//load metadata xml
console.log('Reading ' + metaSource + ' (can take a while)');
fs.readFile(metaSource, function (err, data) {
    var parser = new xml2js.Parser({
        explicitArray: false
    });
    console.log('Please wait...');
    parser.parseString(data, function (err, xml) {
        let metaEntries = xml.LaunchBox.Game;
        // console.log(metaEntries);
        console.log('Now processing xml...');
        for (const [key, value] of Object.entries(metaEntries)) {
            if (value.Platform == 'Arcade') {
                metaData.push(value);
            }
        }

        console.log('Reading ' + xmlSource + ' (can take a while)');
        fs.readFile(xmlSource, function (err, data) {
            var parser = new xml2js.Parser({
                explicitArray: false
            });
            console.log('Please wait...');
            parser.parseString(data, function (err, xml) {
                let mameMachines = xml.LaunchBox.MameFile;
                console.log('Now processing xml...');
                for (const [key, value] of Object.entries(mameMachines)) {
                    let thisMachine = value;

                    if (
                        thisMachine.CloneOf ||
                        thisMachine.IsMechanical == 'true' ||
                        thisMachine.IsBootleg == 'true' ||
                        thisMachine.IsMature == 'true' ||
                        thisMachine.IsQuiz == 'true' ||
                        thisMachine.IsFruit == 'true' ||
                        thisMachine.IsCasino == 'true' ||
                        thisMachine.IsPlayChoice == 'true' ||
                        thisMachine.IsMahjong == 'true' ||
                        thisMachine.IsNonArcade == 'true' ||
                        thisMachine.Publisher == '<unknown>' ||
                        thisMachine.PlayMode == 'Device' ||
                        thisMachine.Genre == 'System / Device' ||
                        thisMachine.Status == 'preliminary' ||
                        (thisMachine.Genre.indexOf('Compilation') != -1) ||
                        (thisMachine.Genre.indexOf('Multiplay') != -1) ||
                        (thisMachine.Genre.indexOf('MultiGame') != -1) ||
                        (thisMachine.Genre.indexOf('Rhythm') != -1) ||
                        (thisMachine.Genre.indexOf('Mahjong') != -1) ||
                        (thisMachine.Genre.indexOf('Hanafuda') != -1) ||
                        (thisMachine.Genre.indexOf('Shougi') != -1) ||
                        thisMachine.Source == 'vsnes.cpp' ||
                        thisMachine.Source == 'megaplay.cpp' ||
                        thisMachine.Source == 'tumbleb.cpp'
                    ) {
                        //don't include anything that matches this above chunk of conditionals...
                    } else {
                        let newLanguage = 'en'; //some defaults just in case
                        let newPlayers = '1';

                        if(thisMachine.Language) {
                            switch (thisMachine.Language) {
                                case 'English':
                                    newLanguage = 'en';
                                    break;
                                case 'Japanese':
                                    newLanguage = 'jp';
                                    break;
                            }
                        }

                        if(thisMachine.PlayMode) {
                            switch (true) {
                                case (thisMachine.PlayMode.indexOf('1P') != -1):
                                    newPlayers = '1';
                                    break;
                                case (thisMachine.PlayMode.indexOf('2P') != -1):
                                    newPlayers = '2';
                                    break;
                            }
                        }

                        let newEntry = {
                            filename: thisMachine.FileName,
                            name: thisMachine.Name,      publisher: thisMachine.Publisher,
                            year: thisMachine.Year,
                            genre: thisMachine.Genre,
                            language: newLanguage,
                            players: newPlayers,
                            source: thisMachine.Source,
                            manual: false
                        }
                        machinesArray.push(newEntry);
                    }
                };

                function doFileTransfer(process, type, source, destination, finalPath) {
                        if (fs.existsSync(source)) {
                            //console.log('from: ' + source);
                            if(process) {
                                if (!fs.existsSync(destination) || overWriteMedia) {
                                    //console.log('to: ' + destination);
                                    fs.copyFile(source, destination, function (err) {
                                        if (err) throw err
                                        //console.log('Successfully transferred ' + type + ': ' + destination);
                                        return finalPath;
                                    })
                                } else {
                                    return finalPath;
                                }
                            } else {
                                return finalPath;
                            }
                        } else {
                            if (type == 'path' || type == 'manual') {
                                return false;
                            } else {
                                return missingThumbnailImage;
                            }
                        }

                }

                //do image finding and relocating for snaps
                console.log('Begin snaps to images transfer');
                machinesArray.forEach(function (machine, index) {
                    let type = 'image';
                    let sourcePath = snapsSrc + machine.filename + '.png';
                    let destFile = destImagesPath + machine.filename + '.png';
                    let finalPath = mediaBasePath + machineImagesPath + machine.filename + '.png';
                    machinesArray[index][type] = doFileTransfer(doMedia, type, sourcePath, destFile, finalPath);
                });

                //do image finding and relocating for thumb/boxart
                console.log('Begin thumbnails transfer');
                machinesArray.forEach(function (machine, index) {
                    let type = 'thumbnail';
                    machinesArray[index].thumbnail = false;
                    let sourcePath = titlesSrc + machine.filename + '.png';
                    let destFile = destThumbnailsPath + machine.filename + '.png';
                    let finalPath = mediaBasePath + machineThumbnailsPath + machine.filename + '.png';
                    machinesArray[index][type] = doFileTransfer(doMedia, type, sourcePath, destFile, finalPath);
                });

                //do image finding and relocating for logos
                console.log('Begin marquee to logo transfer');
                machinesArray.forEach(function (machine, index) {
                    let type = 'marquee';
                    let sourcePath = logosSrc + machine.filename + '.png';
                    let destFile = destMarqueesPath + machine.filename + '.png';
                    let finalPath = mediaBasePath + machineMarqueesPath + machine.filename + '.png';
                    machinesArray[index][type] = doFileTransfer(doMedia, type, sourcePath, destFile, finalPath);
                });

                //do file finding and relocating for manuals
                console.log('Begin manuals transfer');
                machinesArray.forEach(function (machine, index) {
                    let type = 'manual';
                    machinesArray[index].manual = false;
                    let sourcePath = manualsSrc + machine.filename + '.pdf';
                    let destFile = destManualsPath + machine.filename + '.pdf';
                    let finalPath = mediaBasePath + machineManualsPath + machine.filename + '.pdf';
                    machinesArray[index][type] = doFileTransfer(doMedia, type, sourcePath, destFile, finalPath);
                });

                //do file finding and relocating for roms
                console.log('Begin roms transfer');
                machinesArray.forEach(function (machine, index) {
                    let type = 'path';
                    let sourcePath = romsSrc + machine.filename + '.zip';
                    let destFile = destRomsPath + machine.filename + '.zip';
                    let finalPath = machineRomsPath + machine.filename + '.zip';
                    machinesArray[index][type] = doFileTransfer(doRoms, type, sourcePath, destFile, finalPath);
                    //machinesArray[index][type] = UsageRomPAth + machine.filename + '.zip';
                });


                console.log('Generating gamelist.xml');
                //construct new 'all' gamelist.xml structure
                let arcadeList = `<?xml version="1.0" encoding="UTF-8"?>
                <gameList>`

                let gameCount = 0;

                machinesArray.forEach(function (machine) {
                    gameCount++;
                    let thisMetaGameDataDesc = machine.name;
                    let thisMetaGameDataDev = '';
                    let thisMetaGameDevRating = '0';

                    metaData.forEach(function (gameMetaD) {
                        if (gameMetaD.Name == machine.name) {
                            thisMetaGameDataDesc = gameMetaD.Overview ? gameMetaD.Overview.replace(/\n\s*\n/g, '\n') : '';
                            thisMetaGameDataDev = gameMetaD.Developer ? gameMetaD.Developer : '';
                            thisMetaGameDevRating = gameMetaD.CommunityRatingCount ? gameMetaD.CommunityRatingCount : '0';
                            return;
                        }
                    })

                    arcadeList += `
                    <game>
                        <path>` + machine.path + `</path>
                        <name>` + machine.name + `</name>
                        <desc>` + thisMetaGameDataDesc + `</desc>
                        <rating>` + thisMetaGameDevRating + `</rating>
                        <publisher>` + machine.publisher + `</publisher>
                        <developer>` + thisMetaGameDataDev + `</developer>
                        <image>` + machine.image + `</image>
                        <marquee>` + machine.marquee + `</marquee>
                        <thumbnail>` + machine.thumbnail + `</thumbnail>
                        <manual>` + machine.manual + `</manual>
                        <releasedate>` + machine.year + `0101</releasedate>
                        <genre>` + machine.genre + `</genre>
                        <players>` + machine.players + `</players>
                        <lang>` + machine.language + `</lang>
                    </game>`;
                });

                arcadeList += `
                </gameList>`;

                console.log('Writing gamelist.xml with ' + gameCount + ' entries');
                fs.writeFile(gameListDir + 'gamelist.xml', arcadeList, err => {
                    console.log('writing gamelist here : ' + gameListDir);
                    if (err) {
                        console.error(err)
                        return
                    }
                });

                // want an export of data as json format - because reasons?
                if (makeJSON) {
                    let jsonData = JSON.stringify(machinesArray);
                    console.log('writing a json file with all the machines infos');
                    fs.writeFile('machines.json', jsonData, err => {
                        if (err) {
                            console.error(err)
                            return
                        }
                    });
                }

                if (doLists) {
                    //specifiy data to create collections for here

                    // let wantedLists = [
                    //     {   name: 'naomi',      source: ['naomi']   },
                    //     {   name: 'aleck64',    source: ['aleck64']   },
                    //     {   name: 'seta',       source: ['seta']   },
                    //     {   name: 'atomiswave', source: ['atomiswave']   },
                    //     {   name: 'model1',     source: ['model1']   },
                    //     {   name: 'model2',     source: ['model2']   },
                    //     {   name: 'model3',     source: ['model3']   },
                    //     {   name: 'stv',        source: ['stv']   },
                    // ];

                    let wantedLists = [ 
                            {   name: 'atari',          publisher: 'Atari',         notsource: ['jaguar']   },
                            {   name: 'atlus',          publisher: 'Atlus'  },
                            {   name: 'ballymidway',    publisher: 'Bally Midway',  notsource: ['astrocde'] },
                            {   name: 'ballysente',     publisher: 'Bally/Sente'    },
                            {   name: 'capcom',         publisher: 'Capcom',        notsource: ['cps1', 'cps2', 'cps3', 'zn']   },
                            {   name: 'capcom-cps1',    publisher: 'Capcom',        source: ['cps1']    },
                            {   name: 'capcom-cps2',    publisher: 'Capcom',        source: ['cps2']    },
                            {   name: 'capcom-cps3',    publisher: 'Capcom',        source: ['cps3']    },
                            {   name: 'capcom-zn',      publisher: 'Capcom',        source: ['zn'] },
                            {   name: 'century',        publisher: 'Century Electronics'  },
                            {   name: 'cinematronics',  publisher: 'Cinematronics'  },
                            {   name: 'comad',          publisher: 'Comad',         notsource: ['nmk16'] },
                            {   name: 'gaelco',         publisher: 'Gaelco'  },
                            {   name: 'gottlieb',       publisher: 'Gottlieb'  },
                            {   name: 'dataeast',       publisher: 'Data East',     notsource: ['decocass'] },
                            {   name: 'dataeast-deco',  publisher: 'Data East',     source: ['decocass'] },
                            {   name: 'exidy',          publisher: 'Exidy'  },
                            {   name: 'hudson',         publisher: 'Hudson'  },
                            {   name: 'irem',           publisher: 'Irem'  },
                            {   name: 'jaleco',         publisher: 'Jaleco'  },
                            {   name: 'kaneko',         publisher: 'Kaneko'  },
                            {   name: 'konami',         publisher: 'Konami',        notsource: ['konamigx', 'konamigq', 'konamigv', 'konamigs', 'djmain', 'firebeat'] },
                            {   name: 'konami-g',       publisher: 'Konami',        source: ['konamigx', 'konamigq', 'konamigv', 'konamigs'] },
                            {   name: 'midway',         publisher: 'Midway',        notpublisher: 'Bally Midway',       notsource: ['astrocde'] },
                            {   name: 'namco',          publisher: 'Namco',         notsource: ['namcos1', 'namcos11', 'namcos12', 'namcos2', 'namcos21', 'namcos21_c67', 'namcos22', 'namcona1', 'namconb1', 'namcofl', 'cave', 'kungfur'] },
                            {   name: 'namco-stype',    publisher: 'Namco',         source: ['namcos1', 'namcos2', 'namcos11', 'namcos12', 'namcos21', 'namcos21_c67', 'namcos22'] },
                            {   name: 'namco-na',       publisher: 'Namco',         source: ['namcona1', 'namconb1'] },
                            {   name: 'nintendo',       publisher: 'Nintendo'  },
                            {   name: 'psikyo',         publisher: 'Psikyo'  },
                            {   name: 'sega',           publisher: 'Sega',          notsource: ['megaplay', 'meritm', 'model1', 'model2', 'model3', 'segaorun', 'segaxbd', 'segaybd', 'segas32', 'stv'] },
                            {   name: 'sega-model1',    publisher: 'Sega',          source: ['model1'] },
                            {   name: 'sega-model2',    publisher: 'Sega',          source: ['model2'] },
                            {   name: 'sega-model3',    publisher: 'Sega',          source: ['model3'] },
                            {   name: 'sega-sscaler',   publisher: 'Sega',          source: ['segaorun', 'segaxbd', 'segaybd', 'segas32'] },
                            {   name: 'sega-stv',       publisher: 'Sega',          source: ['stv'] },
                            {   name: 'seta',           publisher: 'Seta'  },
                            {   name: 'seibu',          publisher: 'Seibu Kaihatsu'  },
                            {   name: 'stern',          publisher: 'Stern Electronics'  },
                            {   name: 'snk',            publisher: 'SNK',           notsource: ['neogeo'] },
                            {   name: 'snk-neogeo',     publisher: 'SNK',           source: ['neogeo'] },
                            {   name: 'taito',          publisher: 'Taito',         notsource: ['taito_b', 'taito_f1', 'taito_f2', 'taito_f3', 'taitogn', 'naomi', 'taito_z', 'taito_l', 'taitojc', 'zn', 'undrfire', 'slapshot', 'ddenlovr', 'superchs', 'groundfx', 'neogeo', 'nmk16'] },
                            {   name: 'taito-typex',    publisher: 'Taito',         ource: ['taito_b', 'taito_f1', 'taito_f2', 'taito_f3', 'taito_z', 'taito_l', 'superchs', 'groundfx'] },
                        // { name: 'taito-f',      publisher: 'Taito',         source: ['taito_f1','taito_f2','taito_f3'] },
                        // { name: 'taito-l',      publisher: 'Taito',         source: ['taito_l'] },
                        // { name: 'taito-z',      publisher: 'Taito',         source: ['taito_z'] },
                        // { name: 'taito-gnet',   publisher: 'Taito',         source: ['taitogn'] },
                            {   name: 'tecmo',          publisher: 'Tecmo'  },
                            {   name: 'technos',        publisher: 'Technos'  },
                            {   name: 'tehkan',         publisher: 'Tehkan'  },
                            {   name: 'toaplan',        publisher: 'Toaplan'  },
                            {   name: 'universal',      publisher: 'Universal'  },
                            {   name: 'videosystem',    publisher: 'Video System Co.'  },
                            {   name: 'williams',       publisher: 'Williams'  },
                            {   name: 'zaccaria',       publisher: 'Zaccaria'  },
                            {   name: 'astrocade',      source: ['astrocde'] },
                            {   name: 'naomi',          source: ['naomi'] },
                            {   name: 'neogeo',         source: ['neogeo'] },
                            {   name: 'nmk',            source: ['nmk16'] },
                            {   name: 'pgm',            source: ['pgm'] },
                            {   name: 'vegas3dfx',      source: ['seattle'] }
                    ];

                    console.log('Generating collection lists...');
                    wantedLists.forEach(function (collection) {
                        let collectionContent = '';
                        let collectionCount = 0;

                        machinesArray.forEach(function (machine) {
                            let pubmatch = (collection.publisher || collection.notpublisher) ? false : true;
                            let srcmatch = (collection.source || collection.notsource) ? false : true;

                            //publisher match, ok!
                            if (collection.publisher && machine.publisher.indexOf(collection.publisher) != -1) {
                                pubmatch = true;
                            }
                            //if source match, ok!
                            if (collection.source && collection.source.includes(machine.source.replace('.cpp', ''))) {
                                srcmatch = true;
                            }
                            //if source don't match, uh oh!
                            if (collection.source && !collection.source.includes(machine.source.replace('.cpp', ''))) {
                                srcmatch = false;
                            }
                            //not publisher match, uh oh!
                            if (collection.notpublisher && machine.publisher.indexOf(collection.notpublisher) != -1) {
                                pubmatch = false;
                            }

                            if (collection.notsource) {
                                if (collection.notsource.includes(machine.source.replace('.cpp', ''))) {
                                    //notsource match, uh oh!
                                    srcmatch = false;
                                } else {
                                    //notsource not match, yay!
                                    srcmatch = true;
                                }
                            }

                            if (pubmatch && srcmatch) {
                                collectionCount++;
                                collectionContent += UsagePath + machine.filename + `.zip\r\n`;
                            }
                        });

                        //write collection to file
                        fs.writeFile(collectionDir + '/custom-' + collection.name + '.cfg', collectionContent, err => {
                            if (err) {
                                console.error(err)
                                return
                            }
                            console.log('writing ' + collection.name + ' collection with ' + collectionCount + ' entries');
                        });
                    });

                    console.log('All done!');                    
                }

            });
        });

    });
});

return;