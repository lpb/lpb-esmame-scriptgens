const fs = require('fs');
const xml2js = require('xml2js');

const xmlSource = './data/mame2561g1r.xml';
const metaSource = './data/Metadata.xml';
const mameMetaSource = './data/Mame.xml';

const UsagePath = './data/mame/roms/';
const destRootDir = './output/';
const gameListDir = destRootDir + 'gamelist/';
const collectionDir = destRootDir + 'collections/';

const dataSourceDir = 'I:/MAMEdata/';
const romsSrc = dataSourceDir + 'roms/';
const imageSrc = dataSourceDir + 'Extras/snap/';
const marqueeSrc = dataSourceDir + 'Extras/marquees/';
const thumbnailSrc = dataSourceDir + 'Extras/flyers/';
const manualSrc = dataSourceDir + 'Extras/manuals/';

const mediaBasePath = '~/.emulationstation/';
const machineRomsPath = 'roms/';
const machineImagesPath = 'media/images/';
const machineMarqueesPath = 'media/logos/';
const machineManualsPath = 'media/manuals/';
const machineThumbnailsPath = 'media/thumbs/';

const destBasePath = destRootDir;
const destRomsPath = destBasePath + machineRomsPath;
const destImagesPath = destBasePath + machineImagesPath;
const destMarqueesPath = destBasePath + machineMarqueesPath;
const destThumbnailsPath = destBasePath + machineThumbnailsPath;
const destManualsPath = destBasePath + machineManualsPath;
const missingThumbnailImage = mediaBasePath + 'media/no-image.png';

let machinesArray = [];
let metaData = [];
let mameMetaData = [];

const doMedia = true; //disable media transfer
const doRoms = false; //disable rom relocation
const overWriteMedia = false; //overwrite existing media files
const doLists = true; //disable collection list generation
const makeJSON = true; //makes an optional json file of the main machine xml data

const escapeHTML = str => str.replace(/[&<>'"]/g,
    tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    } [tag]));

function processText(text) {
    if ((text) && (text != "")) {
        if (Array.isArray(text)) {
            let newText = [];
            text.forEach(element => newText.push(escapeHTML(element)));
            return newText;
        }
        return escapeHTML(text);
    } else {
        return '';
    }
}

function checkInArrayFor(arrayToCheck, namesToCheck) {
    let returnMatch = false;
    if (!Array.isArray(namesToCheck)) {
        namesArrayCheck = [namesToCheck];
    } else {
        namesArrayCheck = namesToCheck;
    }

    for (i = 0; i < arrayToCheck.length; i++) {
        for (j = 0; j < namesArrayCheck.length; j++) {
            if (arrayToCheck[i].toLowerCase().indexOf(namesArrayCheck[j].toLowerCase()) > -1) {
                return true
            };
        }
    }
    return returnMatch;
}

async function doFileTransfer(process, fileName, source, destination, finalPath) {

    if (fs.existsSync(source)) {
        //console.log('from: ' + source);
        if (process) {
            if (!fs.existsSync(destination) || overWriteMedia) {
                //console.log('to: ' + destination);
                fs.copyFileSync(source, destination, fs.constants.COPYFILE_EXCL);
            }
            return finalPath;
        } else {
            return finalPath;
        }
    } else {
        if (source.includes('manual') || source.includes('roms')) {
            return false;
        } else {
            return missingThumbnailImage;
        }
    }

}

const mdata = fs.readFileSync(metaSource);
var mparser = new xml2js.Parser({
    explicitArray: false
});
mparser.parseString(mdata, function (err, xml) {
    let metaEntries = xml.LaunchBox.Game;
    console.log('Now processing metadata...');
    for (const [key, value] of Object.entries(metaEntries)) {
        if (value.Platform == 'Arcade') {
            metaData.push(value);
        }
    }
});

const mmdata = fs.readFileSync(mameMetaSource);
var mmparser = new xml2js.Parser({
    explicitArray: false
});
mmparser.parseString(mmdata, function (err, xml) {
    let mameMetaEntries = xml.LaunchBox.MameFile;
    console.log('Now processing mameMetadata...');
    for (const [key, value] of Object.entries(mameMetaEntries)) {
        mameMetaData.push(value);
    }
});

fs.readFile(xmlSource, function (err, data) {
    var parser = new xml2js.Parser({
        explicitArray: false
    });

    console.log('Now processing xml...');
    parser.parseString(data, function (err, xml) {
        let mameMachines = xml.mame.game;

        for (const [key, value] of Object.entries(mameMachines)) {

            let thisMachine = {
                filename: value.$.name,
                name: value.description,
                publisher: value.manufacturer ? value.manufacturer.split("/") : false,
                year: value.year,
                genre: value.category ? value.category.split("/") : false,
                players: value.nplayers,
                source: value.$.sourcefile.split("/"),
                language: false
            };

            machinesArray.push(thisMachine);
        };

        //
        // build gamelist.xml
        //
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

            mameMetaData.forEach(function (gameMetaM) {
                if (gameMetaM.FileName == machine.filename) {
                    switch (gameMetaM.Language) {
                        case 'English':
                            machine.language = 'en';
                        case 'Japanese':
                            machine.language = 'jp';
                        case 'Korean':
                            machine.language = 'co';
                        case 'Spanish':
                            machine.language = 'es';
                        case 'Italian':
                            machine.language = 'it';
                        case 'German':
                            machine.language = 'de';
                        default:
                            machine.language = 'en';
                    }
                }
            });

            // do image finding and relocating for snaps
            let image_finalPath = mediaBasePath + machineImagesPath + machine.filename + '.png';
            if (doMedia) {
                let image_sourcePath = imageSrc + machine.filename + '.png';
                let image_destFile = destImagesPath + machine.filename + '.png';
                machine.image = doFileTransfer(doMedia, machine.filename, image_sourcePath, image_destFile, image_finalPath);
            } else {
                machine.image = image_finalPath;
            }

            //do image finding and relocating for thumb/boxart
            let thumb_finalPath = mediaBasePath + machineThumbnailsPath + machine.filename + '.png';
            if (doMedia) {
                let thumb_sourcePath = thumbnailSrc + machine.filename + '.png';
                let thumb_destFile = destThumbnailsPath + machine.filename + '.png';
                machine.thumbnail = doFileTransfer(doMedia, machine.filename, thumb_sourcePath, thumb_destFile, thumb_finalPath);
            } else {
                machine.thumbnail = thumb_finalPath;
            }

            //do image finding and relocating for logos
            let logo_finalPath = mediaBasePath + machineMarqueesPath + machine.filename + '.png';
            if (doMedia) {
                let logo_sourcePath = marqueeSrc + machine.filename + '.png';
                let logo_destFile = destMarqueesPath + machine.filename + '.png';
                machinesArray[index]['marquee'] = doFileTransfer(doMedia, machine.filename, logo_sourcePath, logo_destFile, logo_finalPath);
            } else {
                machine.marquee = logo_finalPath;
            }

            //do file finding and relocating for manuals
            let manual_finalPath = mediaBasePath + machineManualsPath + machine.filename + '.pdf';
            if (doMedia) {
                let manual_sourcePath = manualSrc + machine.filename + '.pdf';
                let manual_destFile = destManualsPath + machine.filename + '.pdf';
                machine.manual = doFileTransfer(doMedia, machine.filename, manual_sourcePath, manual_destFile, manual_finalPath);
            } else {
                machine.manual = manual_finalPath;
            }

            arcadeList += `
            <game>
                <path>./` + (machine.filename) + `.zip</path>
                <name>` + processText(machine.name) + `</name>
                <desc>` + processText(thisMetaGameDataDesc) + `</desc>
                <rating>` + (thisMetaGameDevRating) + `</rating>
                <publisher>` + processText(machine.publisher) + `</publisher>
                <developer>` + processText(thisMetaGameDataDev) + `</developer>
                <image>` + machine.image + `</image>
                <marquee>` + machine.marquee + `</marquee>
                <thumbnail>` + machine.thumbnail + `</thumbnail>
                <manual>` + machine.manual + `</manual>
                <releasedate>` + (machine.year) + `0101</releasedate>
                <genre>` + processText(machine.genre) + `</genre>
                <players>` + (machine.players) + `</players>
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
            fs.writeFile(destRootDir + 'machines.json', jsonData, err => {
                if (err) {
                    console.error(err)
                    return
                }
            });
        }

        //
        // build collections
        //
        console.log('Generating collections...');
        let wantedLists = [{
                name: 'atari',
                publisher: 'Atari',
                notpublisher: ['Atari license'],
                notsource: ['jaguar']
            },
            {
                name: 'atlus',
                publisher: 'Atlus'
            },
            {
                name: 'astrocade',
                source: 'astrocde'
            },
            {
                name: 'ballymidway',
                publisher: 'Bally Midway',
                notsource: ['astrocde', 'balsente']
            },
            {
                name: 'ballysente',
                source: 'balsente'
            },
            {
                name: 'capcom',
                publisher: 'Capcom',
                notsource: ['cps1', 'cps2', 'cps3', 'zn']
            },
            {
                name: 'capcom-cps1',
                publisher: 'Capcom',
                source: ['cps1']
            },
            {
                name: 'capcom-cps2',
                publisher: 'Capcom',
                source: ['cps2']
            },
            {
                name: 'capcom-cps3',
                publisher: 'Capcom',
                source: ['cps3']
            },
            {
                name: 'capcom-zn',
                publisher: 'Capcom',
                source: ['zn']
            },
            {
                name: 'century',
                publisher: 'Century Electronics'
            },
            {
                name: 'cinematronics',
                publisher: 'Cinematronics'
            },
            {
                name: 'comad',
                publisher: 'Comad',
                notsource: ['nmk16']
            },
            {
                name: 'gaelco',
                publisher: 'Gaelco'
            },
            {
                name: 'gottlieb',
                publisher: 'Gottlieb'
            },
            {
                name: 'dataeast',
                publisher: 'Data East',
                notsource: ['decocass']
            },
            {
                name: 'dataeast-deco',
                publisher: 'Data East',
                source: ['decocass']
            },
            {
                name: 'exidy',
                publisher: 'Exidy',
            },
            {
                name: 'hudson',
                publisher: 'Hudson'
            },
            {
                name: 'irem',
                publisher: 'Irem'
            },
            {
                name: 'jaleco',
                publisher: 'Jaleco'
            },
            {
                name: 'kaneko',
                publisher: 'Kaneko'
            },
            {
                name: 'konami',
                publisher: 'Konami',
                notsource: ['konamigx', 'konamigq', 'konamigv', 'konamigs', 'djmain', 'firebeat']
            },
            {
                name: 'konami-g',
                publisher: 'Konami',
                source: ['konamigx', 'konamigq', 'konamigv', 'konamigs']
            },
            {
                name: 'midway',
                publisher: 'Midway',
                notpublisher: 'Bally Midway',
                notsource: ['astrocde', 'balsente']
            },
            {
                name: 'namco',
                publisher: 'Namco',
                notsource: ['namcos1', 'namcos11', 'namcos12', 'namcos2', 'namcos21', 'namcos21_c67', 'namcos22', 'namcona1', 'namconb1', 'namcofl', 'cave', 'kungfur']
            },
            {
                name: 'namco-stype',
                publisher: 'Namco',
                source: ['namcos1', 'namcos2', 'namcos11', 'namcos12', 'namcos21', 'namcos21_c67', 'namcos22']
            },
            {
                name: 'namco-na',
                publisher: 'Namco',
                source: ['namcona1', 'namconb1']
            },
            {
                name: 'nintendo',
                publisher: ['Nintendo', 'Nintendo of America']
            },
            {
                name: 'psikyo',
                publisher: 'Psikyo'
            },
            {
                name: 'sega',
                publisher: 'Sega',
                notsource: ['megaplay', 'meritm', 'model1', 'model2', 'model3', 'segaorun', 'segaxbd', 'segaybd', 'segas32', 'stv']
            },
            {
                name: 'sega-model1',
                publisher: 'Sega',
                source: ['model1']
            },
            {
                name: 'sega-model2',
                publisher: 'Sega',
                source: ['model2']
            },
            {
                name: 'sega-model3',
                publisher: 'Sega',
                source: ['model3']
            },
            {
                name: 'sega-sscaler',
                publisher: 'Sega',
                source: ['segaorun', 'segaxbd', 'segaybd', 'segas32']
            },
            {
                name: 'sega-stv',
                publisher: 'Sega',
                source: ['stv']
            },
            {
                name: 'seta',
                publisher: 'Seta'
            },
            {
                name: 'seibu',
                publisher: 'Seibu Kaihatsu'
            },
            {
                name: 'stern',
                publisher: 'Stern Electronics'
            },
            {
                name: 'snk',
                publisher: 'SNK',
                notsource: ['neogeo']
            },
            {
                name: 'snk-neogeo',
                publisher: 'SNK',
                source: ['neogeo']
            },
            {
                name: 'taito',
                publisher: 'Taito',
                notsource: ['taito_b', 'taito_f1', 'taito_f2', 'taito_f3', 'taitogn', 'naomi', 'taito_z', 'taito_l', 'taitojc', 'zn', 'undrfire', 'slapshot', 'ddenlovr', 'superchs', 'groundfx', 'neogeo', 'nmk16']
            },
            {
                name: 'taito-typex',
                publisher: 'Taito',
                source: ['taito_b', 'taito_f1', 'taito_f2', 'taito_f3', 'taito_z', 'taito_l', 'superchs', 'groundfx']
            },
            {
                name: 'tecmo',
                publisher: 'Tecmo'
            },
            {
                name: 'technos',
                publisher: 'Technos Japan'
            },
            {
                name: 'tehkan',
                publisher: 'Tehkan'
            },
            {
                name: 'toaplan',
                publisher: 'Toaplan'
            },
            {
                name: 'universal',
                publisher: 'Universal'
            },
            {
                name: 'videosystem',
                publisher: 'Video System Co.'
            },
            {
                name: 'williams',
                publisher: 'Williams'
            },
            {
                name: 'zaccaria',
                publisher: 'Zaccaria'
            },
            {
                name: 'astrocade',
                source: ['astrocde']
            },
            {
                name: 'naomi',
                source: ['naomi']
            },
            {
                name: 'neogeo',
                source: ['neogeo']
            },
            {
                name: 'nmk',
                source: ['nmk16']
            },
            {
                name: 'pgm',
                source: ['pgm']
            },
            {
                name: 'vegas3dfx',
                source: ['seattle']
            }
        ];

        wantedLists.forEach((collection) => {
            let collectionBuilder = machinesArray;
            let collectionContent = '';
            let collectionCount = 0;

            collectionBuilder.forEach((machine) => {
                machine.pubMatch = false;
                machine.srcMatch = true;

                //check for matching publishers
                if (collection.publisher) {
                    if (checkInArrayFor(machine.publisher, collection.publisher)) {
                        machine.pubMatch = true;
                    }
                } else {
                    machine.pubMatch = true;
                }

                //check for matching 'not' publishers
                if (collection.notpublisher) {
                    if (checkInArrayFor(machine.publisher, collection.notpublisher)) {
                        machine.pubMatch = false;
                    }
                }

                //check for matching 'sourcefiles'
                if (collection.source) {
                    if (!checkInArrayFor(machine.source, collection.source)) {
                        machine.srcMatch = false;
                    }
                }

                if (collection.notsource) {
                    // console.log(collection.notsource);
                    if (checkInArrayFor(machine.source, collection.notsource)) {
                        machine.srcMatch = false;
                    }
                }

                if (machine.pubMatch && machine.srcMatch) {
                    collectionCount++;
                    collectionContent += UsagePath + machine.filename + `.zip\r\n`;
                }

            });

            fs.writeFile(collectionDir + '/custom-' + collection.name + '.cfg', collectionContent, err => {
                if (err) {
                    console.error(err)
                    return
                }
                console.log('writing ' + collection.name + ' collection with ' + collectionCount + ' entries');
            });

        });

    });

});