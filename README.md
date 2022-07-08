# lpb-esmame-scriptgens
some scripts to do some basic xml manipulation to create xml for emulation station from MAME.

## Overview
These node scripts can be used to generate useful EmulationStation xml files from files provided from MAME - with the intention of making (my) life easier when running with MAME's monthly updates.

These scripts have been tested with the 0.245 (https://www.mamedev.org/?p=514) version of MAME.

## Warning
These are scrappy and quickly put together, if anyone is interested in running them, please be aware of this and backup any data first! YOU HAVE BEEN WARNED!
Most paths and filenames should be defined in the top of each js file.

## Scripts
M2ESgamelist.js - generates a central gamelist.xml that is primarily arcade machines (adjustable by changing sourcefile/manufacturer variables)
M2ESsoftwareLists.js - generates a gameslist.xml for each software list machine.
M2ESsystems.js - generates a es_systems.cfg for each software list machine.

## License
Shield: [![CC BY-NC-SA 4.0][cc-by-nc-sa-shield]][cc-by-nc-sa]

This work is licensed under a
[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License][cc-by-nc-sa].

[![CC BY-NC-SA 4.0][cc-by-nc-sa-image]][cc-by-nc-sa]

[cc-by-nc-sa]: http://creativecommons.org/licenses/by-nc-sa/4.0/
[cc-by-nc-sa-image]: https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png
[cc-by-nc-sa-shield]: https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg