To install the dev & build environments you need to install node.js: https://nodejs.org/en/

Once node is installed, open the terminal & cd into the 'energize-bridgewater' directory then run the following command to install the required js modules:

• npm install

To setup the dev environment, run:

• npm run watch

from the command line. This will launch a local web server & auto refresh whenever changes are made to files in the 'app' directory.

To build the files for publication run: 

• npm run build

This will compile & minify files & copy them into the 'dist' directory. Contents of the 'dist' directory can be copied to the server.


Case Studies & "What's next" cards:
These pieces are built dynamically, using templates found in the "templates" directory. To add links or edit the text of these, you simply need to edit the JSON files in the "data" directory – there are two files, one for the cards (ards.json) & another for the case studies (case-studies.json). To add a link, simply enter the desired URL in 'url' field, which is currently empty then upload the saved file to the the 'data' directory on the FTP server.