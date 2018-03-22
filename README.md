To install the dev & build environments you need to install node.js: https://nodejs.org/en/

Once node is installed, open the terminal & cd into the 'energize-bridgewater' directory then run the following command to install the required js modules:

• npm install

To setup the dev environment, run:

• npm run watch

from the command line. This will launch a local web server & auto refresh whenever changes are made to files in the 'app' directory.

To build the files for publication run: 

• npm run build

This will compile & minify files & copy them into the 'dist' directory. Contents of the 'dist' directory can be copied to the server.



