const http = require('http');
const url = require('url');
const axios = require('axios');
const puppeteer = require('puppeteer');

http.createServer(function(req, res) {

	res.setHeader('Content-Type', 'text/json');
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET');

	if( req.url.match('keywords') ) {
		function cleanMetadata(data) {
			let newData = [];
			data.forEach((item, index) => {
				newData[ index ] = {
					ou: item.ou,
					oh: item.oh,
					ow: item.ow,
					tu: item.tu,
					th: item.th,
					tw: item.tw,
					rimg: item.rimg,
					ru: item.ru,
					pt: item.pt,
					st: item.st,
					s: item.s
				};
			});
			return newData;
		}

		function isNotEmpty(str) {
			return !( !str || 0 === str.length || typeof str === 'undefined' );
		}

		let responseData = null;

		const q = url.parse(req.url, true).query;

		q.keywords = q.keywords.replace(/\s+/gm, '+');
		let gimgSearch = 'https://google.com/search?q=' + q.keywords + '&tbm=isch';

		if( isNotEmpty(q.safe) ) gimgSearch += '&safe=active';
		if( isNotEmpty(q.rimg) ) gimgSearch += '&tbs=rimg:' + q.rimg;

		puppeteer.launch({ args: [ '--no-sandbox', '--disable-setuid-sandbox' ] }).then(async browser => {
			const page = await browser.newPage();
			await page.goto(gimgSearch);
			await page.waitFor(1000);
			responseData = await page.evaluate(() => {
				let nodeList = Array.from(document.querySelectorAll('#search [data-ri]'));
				let data = [];
				nodeList.forEach((node, index) => {
					data[ index ] = JSON.parse(node.lastElementChild.textContent);
					data[ index ].ved = node.dataset.ved;
				});
				return data;
			});
			await browser.close();
		})
		.then(() => {
			// Getting related image links.
			let requests = [];
			responseData.forEach((item, index) => {
				requests[ index ] = axios({
					timeout: 10000,
					baseURL: 'https://www.google.com/async/',
					url: '/imgrc',
					method: 'get',
					responseType: 'text',
					params: {
						q: q.keywords,
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
					if( rimg === null ) {
						responseData[ index ].rimg = false;
					} else {
						responseData[ index ].rimg = rimg[ 0 ].replace(/tbs=rimg:/gm, '');
					}
				});
			}).then(() => {
				responseData = cleanMetadata(responseData);
				res.write(JSON.stringify(responseData));
				res.end();
			});
		});
	} else {
		res.end();
	}
}).listen(8080);
