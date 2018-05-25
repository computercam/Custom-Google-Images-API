#!/bin/bash

if [[ $EUID -ne 0 ]]; then
    echo "ERROR: THIS SCRIPT SHOULD BE RAN AS ROOT" 1>&2
    exit 1
fi

# Packages needed for chromium
echo -e "Installing Dependencies \n"

sudo apt-get update 
sudo apt-get install -y nodejs npm gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 \
libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 \
libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 \
libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 \
ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget

# Install modules
npm install

# Install Systemd Service
echo -e "Installing Application \n"

PUB_IP='$(curl http://ipecho.net/plain; echo)'
PWD=$(pwd | sed 's/\//\\\//g')
NODE=$(which node | sed 's/\//\\\//g')
START_COMMAND="${NODE} ${PWD}\/index.js"

sed -i "s/__PWD__/${PWD}/g" gimgmetadata.service
sed -i "s/__START_COMMAND__/${START_COMMAND}/g" gimgmetadata.service

cp gimgmetadata.service /lib/systemd/system/gimgmetadata.service
systemctl enable gimgmetadata.service
systemctl start gimgmetadata.service

# Information
echo -e "Scraper Installed :)"
echo -e "\nTest it online at:"
echo -e "http://${PUB_IP}/?keywords=saturn+rain"
echo -e "\nOr locally at:"
echo -e "http://localhost/?keywords=saturn+rain"
exit 0
