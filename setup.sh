#!/bin/bash

if [[ $EUID -ne 0 ]]; then
    echo "ERROR: THIS SCRIPT SHOULD BE RAN AS ROOT" 1>&2
    exit 1
fi

boolPrompt() {
    # $1 = Var Name
    # $2 = Var Prompt
    # Usage = boolPrompt VAR_NAME PROMPT

    local PROMPT_ANSWER=""
    local PROMPT_VALIDATE="n"
    
    while [ "${PROMPT_VALIDATE}" == "n" ]
    do
        local BOOL="false"

        echo -e "\n"    
        echo -e "${2}"
        echo -e "Enter (y)es or (n)o\n"
        
        read PROMPT_ANSWER 
    
        if [[ "${PROMPT_ANSWER}" == "y" ]]; then
            local BOOL="true"
        fi

        clear 
        echo -e "\n"  
        echo -e "Are you sure you meant to enter ${PROMPT_ANSWER} for ${1}"
        echo -e "Enter (y)es or (n)o\n"
        
        read PROMPT_VALIDATE
         
        if [[ "${PROMPT_VALIDATE}" != "y" ]]; then  
            local PROMPT_VALIDATE="n"
        fi
        clear
    done   

    local  __return_var=$1
    local  return_val=${BOOL}
    eval $__return_var="'$return_val'"
}

stringPrompt() {
    # $1 = Var Name
    # $2 = Var Prompt
    # Usage = stringPrompt VAR_NAME PROMPT

    local PROMPT_ANSWER=""
    local PROMPT_VALIDATE="n"
    
    while [ "${PROMPT_VALIDATE}" == "n" ]
    do

        echo -e "\n"    
        echo -e "${2}"
      
        read PROMPT_ANSWER 
    
        clear
        echo -e "\n"  
        echo -e "Are you sure you meant to enter ${PROMPT_ANSWER} for ${1}"
        echo -e "Enter (y)es or (n)o\n"
        
        read PROMPT_VALIDATE
         
        if [[ "${PROMPT_VALIDATE}" != "y" ]]; then              
            local PROMPT_VALIDATE="n"
        fi
        clear
    done   

    local  __return_var=$1
    local  return_val=${PROMPT_ANSWER}
    eval $__return_var="'$return_val'"
}

boolPrompt LOCAL "Are you testing locally or don't want / can't use HTTPS. (Not running from a FQDN)"

if [${LOCAL}];
    then
    sed -i "s/\"local\": false/\"local\": true/g" config.json
    else
    stringPrompt ACME_EMAIL "Enter your email. (me@email.com)"
    stringPrompt FQDN_DOMAIN "Please enter a fully qualified domain name.\nThe domain name should have valid DNS records for both the domain and the www. subdomain.\nFailure to validate DNS will cause this script to fail. (mywebsite.com)"
    sed -i "s/__ACME_EMAIL__/${ACME_EMAIL}/g" config.json
    sed -i "s/__FQDN_DOMAIN__/${FQDN_DOMAIN}/g" config.json
fi

boolPrompt RESTRICT "Do you want to restrict requests to this api to only a specific domain? (Only mycoolapp.com can call this api)"

if [${RESTRICT}];
    then
    stringPrompt ALLOW_ORIGIN_DOMAIN "Which domain should be allowed to request from this api?"
    else
    ALLOW_ORIGIN_DOMAIN="*"
fi

sed -i "s/__ALLOW_ORIGIN_DOMAIN__/${ALLOW_ORIGIN_DOMAIN}/g" config.json

# Packages needed for chromium
clear
echo -e "Installing Dependencies \n"

sudo apt-get update 
sudo apt-get install -y nodejs npm gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 \
libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 \
libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 \
libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 \
ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget

# Install modules
clear
npm install

# Install Systemd Service
clear
echo -e "Installing Application \n"

PUB_IP=$(curl http://ipecho.net/plain; echo)
PWD=$(pwd | sed 's/\//\\\//g')
NODE=$(which node | sed 's/\//\\\//g')
START_COMMAND="${NODE} ${PWD}\/index.js"

# Systemd service
sed -i "s/__PWD__/${PWD}/g" gimgmetadata.service
sed -i "s/__START_COMMAND__/${START_COMMAND}/g" gimgmetadata.service

cp gimgmetadata.service /lib/systemd/system/gimgmetadata.service
systemctl enable gimgmetadata.service
systemctl start gimgmetadata.service

# Information
clear
echo -e "Scraper Installed :)"
echo -e "\nTest it online at:"
echo -e "http://${PUB_IP}/?keywords=saturn+rain"
echo -e "\nOr locally at:"
echo -e "http://localhost/?keywords=saturn+rain"
exit 0
