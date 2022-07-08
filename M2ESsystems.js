const path = require('path')
const glob = require('glob');
const fs = require('fs');
const xml2js = require('xml2js');
const { Console } = require('console');

const xmlSource = '../../mame/hash/';
const outputSource = './output/';
let systemsArray = [];

var files = glob.sync(xmlSource + '*.xml');
var counter = 0;

console.log('Reading source hash files...');
files.forEach(function (f) {
    //read all the system xml files from MAME
    fs.readFile(f, function (err, data) {
        var parser = new xml2js.Parser({
            explicitArray: false
        });
        // console.log('reading ' + f);
        parser.parseString(data, function (err, xml) {
            //grab the system names and descriptions from the xml
            if (xml && xml.softwarelist) {
                let machineData = xml.softwarelist.$;
                systemsArray.push(machineData);
            }
        });
        counter++;
        if (counter === files.length) {
            console.log('generating system list');
            //construct new systems.cfg structure
            content = `<?xml version="1.0" encoding="UTF-8"?>
                <systemList>`

            systemsArray.forEach(function (system) {
                content += `
                    <system>
                        <name>` + system.name + `</name>
                        <fullname>` + system.description + `</fullname>
                        <path>~\\..\\MAMEdata\\software\\` + system.name + `</path>
                        <extension>.zip</extension>
                        <command>%HOME%\\..\\mame\\mame.exe ` + system.name + ` "%BASENAME%"</command>
                        <platform>` + system.name + `</platform>
                        <theme>` + system.name + `</theme>
                    </system>`;
            });

            content += `
                </systemList>`

            //write systems data to file
            fs.writeFile(outputSource + 'software_systems.cfg', content, err => {
                if (err) {
                    console.error(err)
                    return
                }
                console.log('saving new systems file');
            })

        }
    });
});