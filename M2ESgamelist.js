// const path = require('path')
// const glob = require('glob');
const fs = require('fs');
const xml2js = require('xml2js');

const xmlSource = '../../mame/listxml.xml';
// const xmlSource = '../../mame/mini.xml';
const fileDir = './';
let machinesArray = [];

fs.readFile(xmlSource, function (err, data) {
    var parser = new xml2js.Parser({
        explicitArray: false
    });
    parser.parseString(data, function (err, xml) {
        //grab the machine names and publishers from the xml

        for (const [key, value] of Object.entries(xml.mame.machine)) {
            let thisMachine = [];

            //do some filtering of the main data.
            if (!value.$.cloneof &&
                !value.$.ismechanical &&
                value.$.sourcefile &&
                value.$.sourcefile.indexOf('hh_') == -1 &&
                value.$.sourcefile.indexOf('bfm_') == -1 &&
                value.$.sourcefile.indexOf('nokia_') == -1 &&
                value.$.sourcefile.indexOf('roland_') == -1 &&
                value.$.sourcefile.indexOf('novag_') == -1 &&
                value.$.sourcefile.indexOf('igs_') == -1 &&
                value.$.sourcefile.indexOf('generalplus_') == -1 &&
                value.$.sourcefile.indexOf('novadesitec_') == -1 &&
                value.$.sourcefile.indexOf('mephisto_') == -1 &&
                value.$.sourcefile.indexOf('spg2xx_') == -1 &&
                value.$.sourcefile.indexOf('src/') == -1 &&
                value.$.sourcefile.indexOf('nbmj') == -1 &&
                value.$.sourcefile.indexOf('nichild') == -1 &&
                value.$.sourcefile.indexOf('aristmk') == -1 &&
                value.$.sourcefile.indexOf('msx') == -1 &&
                value.$.sourcefile.indexOf('wms.cpp') == -1 &&
                value.$.sourcefile.indexOf('peplus.cpp') == -1 &&
                value.$.sourcefile.indexOf('mpu4vid.cpp') == -1 &&
                value.$.sourcefile.indexOf('norautp.cpp') == -1 &&
                value.$.sourcefile.indexOf('astropc.cpp') == -1 &&
                value.$.sourcefile.indexOf('goldstar.cpp') == -1 &&
                value.$.sourcefile.indexOf('meritm.cpp') == -1 &&
                value.manufacturer.indexOf('<unknown>') == -1 &&
                value.manufacturer.indexOf('Acorn') == -1 &&
                value.manufacturer.indexOf('ACT') == -1 &&
                value.manufacturer.indexOf('Alba') == -1 &&
                value.manufacturer.indexOf('Alcatel') == -1 &&
                value.manufacturer.indexOf('Alesis') == -1 &&
                value.manufacturer.indexOf('Amatic') == -1 &&
                value.manufacturer.indexOf('Amcoe') == -1 &&
                value.manufacturer.indexOf('Amstrad plc') == -1 &&
                value.manufacturer.indexOf('Apple Computer') == -1 &&
                value.manufacturer.indexOf('AT&T') == -1 &&
                value.manufacturer.indexOf('Atlus') == -1 &&
                value.manufacturer.indexOf('Atronic') == -1 &&
                value.manufacturer.indexOf('BFM') == -1 &&
                value.manufacturer.indexOf('Blitz System') == -1 &&
                value.manufacturer.indexOf('bootleg') == -1 &&
                value.manufacturer.indexOf('C.M.C.') == -1 &&
                value.manufacturer.indexOf('Cadillac Jack') == -1 &&
                value.manufacturer.indexOf('Cal Omega Inc.') == -1 &&
                value.manufacturer.indexOf('Casio') == -1 &&
                value.manufacturer.indexOf('Coinmaster') == -1 &&
                value.manufacturer.indexOf('Commodore') == -1 &&
                value.manufacturer.indexOf('Daewoo') == -1 &&
                value.manufacturer.indexOf('Digital Equipment Corporation') == -1 &&
                value.manufacturer.indexOf('Digital Microsystems') == -1 &&
                value.manufacturer.indexOf('Digital Research Computers') == -1 &&
                value.manufacturer.indexOf('dreamGEAR') == -1 &&
                value.manufacturer.indexOf('E-mu Systems') == -1 &&
                value.manufacturer.indexOf('EFO SA') == -1 &&
                value.manufacturer.indexOf('Electronic Devices') == -1 &&
                value.manufacturer.indexOf('Electronic Projects') == -1 &&
                value.manufacturer.indexOf('Ensoniq') == -1 &&
                value.manufacturer.indexOf('Fidelity Electronics') == -1 &&
                value.manufacturer.indexOf('Fisher-Price') == -1 &&
                value.manufacturer.indexOf('Fujitsu') == -1 &&
                value.manufacturer.indexOf('Fun World') == -1 &&
                value.manufacturer.indexOf('Funworld') == -1 &&
                value.manufacturer.indexOf('Game Plan') == -1 &&
                value.manufacturer.indexOf('Global VR') == -1 &&
                value.manufacturer.indexOf('Goldstar') == -1 &&
                value.manufacturer.indexOf('Grayhound Electronics') == -1 &&
                value.manufacturer.indexOf('Greyhound Electronics') == -1 &&
                value.manufacturer.indexOf('Hewlett Packard') == -1 &&
                value.manufacturer.indexOf('Yamaha') == -1 &&
                value.manufacturer.indexOf('Video Klein') == -1 &&
                value.manufacturer.indexOf('V-System Co.') == -1 &&
                value.manufacturer.indexOf('USSR') == -1 &&
                value.manufacturer.indexOf('Tiger Electronics') == -1 &&
                value.manufacturer.indexOf('Thomson') == -1 &&
                value.manufacturer.indexOf('Texas Instruments') == -1 &&
                value.manufacturer.indexOf('Tandy Radio Shack') == -1 &&
                value.manufacturer.indexOf('TAD Corporation') == -1 &&
                value.manufacturer.indexOf('Status Games') == -1 &&
                value.manufacturer.indexOf('Sinclair Research Ltd') == -1 &&
                value.manufacturer.indexOf('SMS Manufacturing Corp.') == -1 &&
                value.manufacturer.indexOf('Sharp') == -1 &&
                value.manufacturer.indexOf('Shaanxi Province Computer Factory') == -1 &&
                value.manufacturer.indexOf('JungleTac') == -1 &&
                value.manufacturer.indexOf('Philips') == -1 &&
                value.manufacturer.indexOf('Intel') == -1 &&
                value.manufacturer.indexOf('Performance Designed Products') == -1 &&
                value.manufacturer.indexOf('NSI International') == -1 &&
                value.manufacturer.indexOf('JAKKS Pacific') == -1 &&
                value.manufacturer.indexOf('<generic>') == -1 &&
                value.driver.$.status != 'preliminary' && 
                value.description.indexOf(' in 1') == -1 &&
                value.description.indexOf('Mahjong') == -1 &&
                value.description.indexOf('Poker') == -1 &&
                value.description.indexOf('bootleg') == -1 &&
                value.description.indexOf('Plug & Play') == -1 &&
                value.description.indexOf('Handheld') == -1 &&
                value.description.indexOf('prototype') == -1 &&
                value.description.indexOf('BIOS') == -1) {
                let romName = value.$.name;
                let sysBoard = value.$.sourcefile
                for (const [key1, value1] of Object.entries(value)) {
                    // console.log(value1);
                    switch (key1) {
                        case 'description':
                            thisMachine['name'] = value1;
                            thisMachine['rom'] = romName;
                            thisMachine['collection'] = "I:\\mameData\\roms\\" + romName + ".zip";
                            thisMachine['board'] = sysBoard;
                            break;
                        case 'manufacturer':
                            thisMachine['publisher'] = value1 ? value1 : '';
                            break;
                        case 'year':
                            thisMachine['year'] = value1 ? value1 : '';
                            break;
                        case 'input':
                            thisMachine['players'] = value1.$.players;
                            break;
                    }
                }
                machinesArray.push(thisMachine);
                // console.log(thisMachine);
            }
        }
    });

    //construct new machines.csv structure
    let dataOut = '';
    machinesArray.forEach(function (machine) {
        dataOut += `"` + machine['name'] + `","` + machine['rom'] + `","` + machine['board'] + `","` + machine['publisher'] + `","` + machine['year'] + `","` + machine['collection'] + `"\r\n`;
    });

    //construct new gamelist.xml structure
    let content = `<?xml version="1.0" encoding="UTF-8"?>
    <gameList>`

    machinesArray.forEach(function (machine) {
        content += `
            <game>
                <path>./` + machine['rom'] + `.zip</path>
                <name>` + machine['name'] + `</name>
                <lang>en</lang>
                <region>us</region>
            </game>`;
    });

    content += `
    </gameList>`;

    // console.log(dataOut);
    // console.log(content);

    fs.writeFile(fileDir + '/machines.csv', dataOut, err => {
        if (err) {
            console.error(err)
            return
        }
    });

    fs.writeFile(fileDir + '/gamelist.xml', content, err => {
        if (err) {
            console.error(err)
            return
        }
    });

});