const http = require('http');
const url = require('url');
const axios = require('axios');
const puppeteer = require('puppeteer');

http.createServer(function(req, res) {

    res.setHeader('Content-Type', 'text/plain' );
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,text/plain');
    res.setHeader('Access-Control-Allow-Credentials', true);

    let JSONData = null;
    const q = url.parse(req.url, true).query;

    let gimgSearch = 'https://google.com/search?q=' + q.keywords + '&tbm=isch';
    
    // TODO: Ability to get the second or following page of results. Right now only allows for first 100
    switch(q) {
        case q.rimg:
            gimgSearch += '&tbs=rimg:' + q.rimg;
        case q.safe:
            gimgSearch += '&safe=active';      
    }
    
    puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] }).then(async browser => {
            const page = await browser.newPage();
            await page.goto(gimgSearch);
            await page.waitForSelector('[data-ri="99"');

            JSONData = await page.evaluate(() => {
                let nodeList = Array.from(document.querySelectorAll('#search [data-ri]'));
                let data = [];
                nodeList.forEach((node, index) => {
                    data[index] = JSON.parse(node.lastElementChild.textContent);
                    data[index].selector = '[data-ri="' + index + '"]';
                    data[index].ved = node.dataset.ved;
                });
                return data;
            });
            await browser.close();
        })
        .then(() => {
            // Getting related image links.
            let requests = [];
            JSONData.forEach((item, index) => {
                requests[index] = axios({
                    timeout: 10000,
                    baseURL: 'https://www.google.com/async/',
                    url: '/imgrc',
                    method: 'get',
                    responseType: 'text',
                    params: {
                        q: 'purple+hell',
                        ved: item.ved,
                        vet: '1' + item + '..i',
                        imgurl: item.ou,
                        imgrefurl: item.ru,
                        tbnid: item.id,
                        docid: item.rid,
                        imgdii: item.id,
                        async: 'cidx:1,saved:0,lp:0,_id:irc_imgrc1,_pms:s,_fmt:pc'
                    },
                    headers: {
                        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/65.0.3325.181 Chrome/65.0.3325.181 Safari/537.36'
                    }
                });
            });
            axios.all(requests).then(function(results) {
                results.forEach((result, index) => {
                  let rimg = result.data.match(/tbs=rimg:([A-Za-z0-9_-])+/gm);
                  if (rimg === null) {
                    JSONData[index].rimg = false;
                  } else {
                    JSONData[index].rimg = rimg[0].replace(/tbs=rimg:/gm, '');  
                  }
                });
            }).then(() => {
                res.write(JSON.stringify(JSONData));
                res.end();
            });
        });

}).listen(8080);
