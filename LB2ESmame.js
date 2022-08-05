const fs = require('fs');
const xml2js = require('xml2js');

const xmlSource = 'I:/Launchbox/Metadata/Mame.xml';
const metaSource = 'I:/Launchbox/Metadata/Metadata.xml';
const MAMEdataPath = 'I:/MAMEdata/';

const rootESPath = 'I:/emulationStation/.emulationstation/';
const romPath = MAMEdataPath + 'roms/';
const snapsPath = MAMEdataPath + 'Extras/snap/snap/';
const logosPath = MAMEdataPath + 'Extras/marquees/marquees/';
const titlesPath = MAMEdataPath + 'Extras/flyers/flyers/';
const manualsPath = MAMEdataPath + 'Extras/manuals/manuals/';

const fileDir = '../.emulationstation/gamelists/mame/';
const collectionDir = '../.emulationstation/collections/';

const machineImagesPath = 'media/snaps/';
const machineMarqueesPath = 'media/logos/';
const machineManualsPath = 'media/manuals/';
const machineThumbnailsPath = 'media/images/';

const doMedia = true; //disable media transfer
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
            if(value.Platform=='Arcade') {
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
                        thisMachine.Source == 'megaplay.cpp'
                        ) {
                            //don't include anything that matches this above chunk of conditionals...
                    } else {
                        let newLanguage = 'en'; //some defaults just in case
                        let newPlayers = '1';
        
                        switch (thisMachine.Language) {
                            case 'English':
                                newLanguage = 'en';
                                break;
                            case 'Japanese':
                                newLanguage = 'jp';
                                break;
                        }
                        switch (true) {
                            case (thisMachine.PlayMode.indexOf('1P') != -1):
                                newPlayers = '1';
                                break;
                            case (thisMachine.PlayMode.indexOf('2P') != -1):
                                newPlayers = '2';
                                break;                        
                        }
        
                        let newEntry = {
                            filename: thisMachine.FileName,
                            name: thisMachine.Name,
                            publisher: thisMachine.Publisher,
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

                if(doMedia) {
                    //do image finding and relocating for snaps
                    console.log('Begin snaps transfer');
                    machinesArray.forEach(function (machine) {
                        let sourcePath = snapsPath + machine.filename + '.png';
                        let destPath = rootESPath + machineImagesPath + machine.filename + '.png';
                        if (fs.existsSync(sourcePath)) {
                            if(overWriteMedia) {
                                if (fs.existsSync(destPath)) {
                                    fs.copyFile(sourcePath, destPath, function (err) {
                                        if (err) throw err
                                        // console.log('Successfully transferred snap '+machine.filename);
                                    })
                                }
                            }
                        }
                    });
        
                    //do image finding and relocating for titles
                    console.log('Begin thumb transfer');
                    machinesArray.forEach(function (machine) {
                        let sourcePath = titlesPath + machine.filename + '.png';
                        let destPath = rootESPath + machineThumbnailsPath + machine.filename + '.png';
                        if (fs.existsSync(sourcePath)) {
                            if (fs.existsSync(sourcePath)) {
                                if(overWriteMedia) {
                                    if (fs.existsSync(destPath)) {
                                        fs.copyFile(sourcePath, destPath, function (err) {
                                            if (err) throw err
                                            // console.log('Successfully transferred title '+machine.filename);
                                        })
                                    }
                                }
                            }
                        }
                    });
        
                    //do image finding and relocating for logos
                    console.log('Begin marquee transfer');
                    machinesArray.forEach(function (machine) {
                        let sourcePath = logosPath + machine.filename + '.png';
                        let destPath = rootESPath + machineMarqueesPath + machine.filename + '.png';
                        if (fs.existsSync(sourcePath)) {
                            if (fs.existsSync(sourcePath)) {
                                if(overWriteMedia) {
                                    if (fs.existsSync(destPath)) {
                                        fs.copyFile(sourcePath, destPath, function (err) {
                                            if (err) throw err
                                            // console.log('Successfully transferred logo '+machine.filename);
                                        })
                                    }
                                }
                            }
                        }
                    });

                    //do file finding and relocating for manuals
                    console.log('Begin manuals transfer');
                    machinesArray.forEach(function (machine, index) {
                        machinesArray[index].manual = false;
                        let sourcePath = manualsPath + machine.filename + '.pdf';
                        let destFile = machineManualsPath + machine.filename + '.pdf';
                        let destPath = rootESPath + destFile;
                        if (fs.existsSync(sourcePath)) {
                            machinesArray[index].manual = destFile;  
                            if (fs.existsSync(sourcePath)) {
                                if(overWriteMedia) {
                                    if (fs.existsSync(destPath)) {
                                        fs.copyFile(sourcePath, destPath, function (err) {
                                            if (err) throw err
                                            machinesArray[index].manual = destFile; 
                                            // console.log('Successfully transferred manual ' + machine.filename + ' for machine ' + machinesArray[index].name);
                                        })
                                    }
                                } else {
                                    machinesArray[index].manual = destFile; 
                                }
                            }
                        }
                    });
                }                                

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
                        if ( gameMetaD.Name == machine.name) {
                            thisMetaGameDataDesc = gameMetaD.Overview ? gameMetaD.Overview.replace(/\n\s*\n/g, '\n') : '';
                            thisMetaGameDataDev = gameMetaD.Developer ? gameMetaD.Developer : '';
                            thisMetaGameDevRating = gameMetaD.CommunityRatingCount ? gameMetaD.CommunityRatingCount : '0';
                            return;
                        }
                    })

                    arcadeList += `
                        <game>
                            <path>` + romPath + machine.filename + `.zip</path>
                            <name>` + machine.name + `</name>
                            <desc>` + thisMetaGameDataDesc + `</desc>
                            <rating>` + thisMetaGameDevRating + `</rating>
                            <publisher>` + machine.publisher + `</publisher>
                            <developer>` + thisMetaGameDataDev + `</developer>
                            <image>~/.emulationstation/` + machineImagesPath + machine.filename + `.png</image>
                            <marquee>~/.emulationstation/` + machineMarqueesPath + machine.filename + `.png</marquee>
                            <thumbnail>~/.emulationstation/` + machineThumbnailsPath + machine.filename + `.png</thumbnail>
                            <manual>~/.emulationstation/` + machine.manual + `</manual>
                            <releasedate>` + machine.year + `0101</releasedate>
                            <genre>` + machine.genre + `</genre>
                            <players>` + machine.players + `</players>
                            <lang>` + machine.language + `</lang>
                        </game>`;
                });
        
                arcadeList += `
                </gameList>`;
        
                console.log('Writing gamelist.xml with ' + gameCount + ' entries');
                fs.writeFile(fileDir + 'gamelist.xml', arcadeList, err => {
                    if (err) {
                        console.error(err)
                        return
                    }
                });
        
                // want an export of data as json format - because reasons?
                if(makeJSON) {
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
                    let wantedLists = [
                        { name: 'atari',        publisher: 'Atari',         notsource: ['jaguar'] },
                        { name: 'acclaim',      publisher: 'Acclaim' },
                        { name: 'atlus',        publisher: 'Atlus' },
                        { name: 'ballymidway',  publisher: 'Bally Midway',  notsource: ['astrocde'] },
                        { name: 'ballysente',   publisher: 'Bally/Sente' },
                        { name: 'capcom',       publisher: 'Capcom',        notsource: ['cps1','cps2','cps3','zn'] },
                        { name: 'capcom-cps1',  publisher: 'Capcom',        source: ['cps1'] },
                        { name: 'capcom-cps2',  publisher: 'Capcom',        source: ['cps2'] },
                        { name: 'capcom-cps3',  publisher: 'Capcom',        source: ['cps3'] },
                        { name: 'capcom-zn',    publisher: 'Capcom',        source: ['zn'] },
                        { name: 'century',      publisher: 'Century Electronics' },
                        { name: 'cinematronics',publisher: 'Cinematronics' },
                        { name: 'comad',        publisher: 'Comad',         notsource: ['nmk16'] },
                        { name: 'gaelco',       publisher: 'Gaelco' },
                        { name: 'gottlieb',     publisher: 'Gottlieb' },
                        { name: 'dataeast',     publisher: 'Data East',     notsource: ['decocass'] },
                        { name: 'dataeast-deco',publisher: 'Data East',     source: ['decocass'] },
                        { name: 'exidy',        publisher: 'Exidy' },
                        { name: 'hudson',       publisher: 'Hudson' },
                        { name: 'irem',         publisher: 'Irem' },
                        { name: 'jaleco',       publisher: 'Jaleco'},
                        { name: 'kaneko',       publisher: 'Kaneko'},
                        { name: 'konami',       publisher: 'Konami',        notsource: ['konamigx','konamigq','konamigv','konamigs','djmain','firebeat'] },
                        { name: 'konami-g',     publisher: 'Konami',        source: ['konamigx','konamigq','konamigv','konamigs'] },
                        { name: 'midway',       publisher: 'Midway',        notpublisher: 'Bally Midway',       notsource: ['astrocde'] },
                        { name: 'namco',        publisher: 'Namco',         notsource: ['namcos1', 'namcos11', 'namcos12', 'namcos2', 'namcos21', 'namcos21_c67', 'namcos22']},
                        { name: 'namco-stype',  publisher: 'Namco',         source: ['namcos1', 'namcos2', 'namcos11', 'namcos12', 'namcos21', 'namcos21_c67', 'namcos22']},
                        // { name: 'namco-na',     publisher: 'Namco',         source: ['namcona1','namconb1'] },
                        // { name: 'namco-s12',    publisher: 'Namco',         source: ['namcos1', 'namcos2'] },
                        // { name: 'namco-s1112',  publisher: 'Namco',         source: ['namcos11', 'namcos12'] },
                        // { name: 'namco-s2122',  publisher: 'Namco',         source: ['namcos21', 'namcos21_c67', 'namcos22'] },
                        { name: 'nintendo',     publisher: 'Nintendo' },
                        { name: 'psikyo',       publisher: 'Psikyo' },
                        { name: 'sega',         publisher: 'Sega',          notsource: ['megaplay','meritm','model1','model2','model3','segaorun','segaxbd','segaybd','segas32','stv'] },
                        { name: 'sega-model1',  publisher: 'Sega',          source: ['model1'] },
                        { name: 'sega-model2',  publisher: 'Sega',          source: ['model2'] },
                        { name: 'sega-model3',  publisher: 'Sega',          source: ['model3'] },
                        { name: 'sega-sscaler', publisher: 'Sega',          source: ['segaorun','segaxbd','segaybd','segas32'] },
                        { name: 'sega-stv',     publisher: 'Sega',          source: ['stv'] },
                        { name: 'seta',         publisher: 'Seta' },
                        { name: 'seibu',        publisher: 'Seibu Kaihatsu' },
                        { name: 'stern',        publisher: 'Stern Electronics' },
                        { name: 'snk',          publisher: 'SNK',           notsource: ['neogeo'] },
                        { name: 'snk-neogeo',   publisher: 'SNK',           source: ['neogeo'] },
                        { name: 'taito',        publisher: 'Taito',         notsource: ['taito_b','taito_f1','taito_f2','taito_f3','taitogn','naomi','taito_z','taito_l','taitojc','zn','undrfire','slapshot','ddenlovr','superchs','groundfx','neogeo','nmk16'] },
                        { name: 'taito-typex',  publisher: 'Taito',         source: ['taito_b','taito_f1','taito_f2','taito_f3','taito_z','taito_l','superchs','groundfx'] },
                        // { name: 'taito-f',      publisher: 'Taito',         source: ['taito_f1','taito_f2','taito_f3'] },
                        // { name: 'taito-l',      publisher: 'Taito',         source: ['taito_l'] },
                        // { name: 'taito-z',      publisher: 'Taito',         source: ['taito_z'] },
                        // { name: 'taito-gnet',   publisher: 'Taito',         source: ['taitogn'] },
                        { name: 'tecmo',        publisher: 'Tecmo' },
                        { name: 'technos',      publisher: 'Technos' },
                        { name: 'tehkan',       publisher: 'Tehkan' },
                        { name: 'toaplan',      publisher: 'Toaplan' },
                        { name: 'universal',    publisher: 'Universal' },
                        { name: 'videosystem',  publisher: 'Video System Co.' },
                        { name: 'williams',     publisher: 'Williams' },
                        { name: 'zaccaria',     publisher: 'Zaccaria' },

                        { name: 'astrocade',    source: ['astrocde'] },
                        { name: 'naomi',        source: ['naomi'] },
                        { name: 'neogeo',       source: ['neogeo'] },
                        { name: 'nmk',          source: ['nmk16'] },
                        { name: 'pgm',          source: ['pgm'] },
                        { name: 'atari 3dfx',   source: ['seattle']}
                    ];
            
                    console.log('Generating collection lists...');
                    wantedLists.forEach(function (collection) {
                        let collectionContent = '';
                        let collectionCount = 0;
            
                        machinesArray.forEach(function (machine) {
                            let pubmatch = (collection.publisher || collection.notpublisher) ? false : true;
                            let srcmatch = (collection.source || collection.notsource) ? false : true;

                            //publisher match, ok!
                            if ( collection.publisher && machine.publisher.indexOf(collection.publisher) != -1) {
                                pubmatch = true;
                            }
                            //if source match, ok!
                            if ( collection.source && collection.source.includes(machine.source.replace('.cpp','')) ) {
                                srcmatch = true;
                            }
                            //if source don't match, uh oh!
                            if ( collection.source && !collection.source.includes(machine.source.replace('.cpp',''))) {
                                srcmatch = false;
                            }                    
                            //not publisher match, uh oh!
                            if ( collection.notpublisher && machine.publisher.indexOf(collection.notpublisher) != -1) {
                                pubmatch = false;
                            }
                            
                            if( collection.notsource ) {
                                if(collection.notsource.includes(machine.source.replace('.cpp',''))) {
                                    //notsource match, uh oh!
                                    srcmatch = false;
                                } else {
                                    //notsource not match, yay!
                                    srcmatch = true;
                                }
                            }

                            if(pubmatch && srcmatch) {
                                collectionCount++;
                                collectionContent += romPath + machine.filename + `.zip\r\n`;
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

                }

                console.log('All done!');
            });
        });

    });
});

return;

