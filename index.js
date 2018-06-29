const http = require('http')
const url = require('url')
const axios = require('axios')
const puppeteer = require('puppeteer')

function cleanMetadata (data) {
  let newData = []
  data.forEach((item, index) => {
    newData[index] = {
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
    }
  })
  return newData
}

function cleanSbi (url) {
  return url.replace(/^((.+\/[^.]+)(\.jpg|\.gif|\.jpeg|\.png|\.bmp|tiff))(.+)$/g, '$1')
}

function isNotEmpty (str) {
  return !(!str || str.length === 0 || typeof str === 'undefined')
}

function parseQuery (q) {
  let str = 'https://google.com/search?q='
  if (isNotEmpty(q.sbi)) {
    q.sbi = cleanSbi(q.sbi)
    str += encodeURIComponent(q.sbi) + '&tbm=isch'
  } else {
    q.keywords = q.keywords.replace(/\s+/gm, '+')
    if (isNotEmpty(q.keywords)) str += q.keywords + '&tbm=isch'
    if (isNotEmpty(q.rimg)) str += '&tbs=rimg:' + q.rimg
  }
  if (isNotEmpty(q.safe)) str += '&safe=active'
  return str
}

let responseData = ''

http
  .createServer(function (req, res) {
    res.setHeader('Content-Type', 'text/json')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET')

    if (req.url.match(/keywords|sbi/gm)) {
      const q = url.parse(req.url, true).query
      let gimgSearch = parseQuery(q)

      puppeteer
        .launch({ headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox'] })
        .then(async browser => {
          const page = await browser.newPage()

          // the initial search
          await page.goto(gimgSearch, { waitUntil: 'load' })

          // Grab the images on the page
          responseData = await page.evaluate(() => {
            let nodeList = Array.from(
              document.querySelectorAll('#search [data-ri]')
            )
            let data = []
            nodeList.forEach((node, index) => {
              data[index] = JSON.parse(node.lastElementChild.textContent)
              data[index].ved = node.dataset.ved
            })
            return data
          })

          let errors = await page.evaluate(() => {
            // check to make sure there wasn't an error
            let err = document.body.innerText
            err = err.match(/not\ match|doesn\'t\ refer|image\ is\ not\ publicly/gm)
            if (err !== null) {
              return true
            }
          })

          // If there were no errors, continue
          if (errors !== true) {
            // Search by image was specified
            if (isNotEmpty(q.sbi)) {
              // If sbi, search the page for a link regarding search by image images
              gimgSearch = await page.evaluate(() => {
                let err = document.body.innerText
                // if it doesn't exist, throw an error
                err = err.match(/not\ match|doesn\'t\ refer|image\ is\ not\ publicly/gm)
                if (err === null) {
                  let href = document.querySelector('#topstuff > .card-section a').getAttribute('href')
                  return 'https://www.google.com' + href
                } else {
                  return false
                }
              })
              // If we were able to find a link to search by image feature, continue
              if (gimgSearch !== false) {
                await page.goto(gimgSearch, { waitUntil: 'domcontentloaded' })
                let findNext = await page.evaluate(() => {
                  // Evaluate the page for link regarding visually similar images
                  let err = document.body.innerText
                  err = err.match(/not\ match|doesn\'t\ refer|image\ is\ not\ publicly/gm)
                  if (err === null) {
                    let next = { href: false, keywords: false }
                    // Check if the visually similar link exists
                    let el = document.querySelector('.iu-card-header')
                    if (el !== null) {
                      next.href = el.getAttribute('href')
                    } else {
                      // if it doesn't we can use the keywords instead
                      let el = document.querySelector('#topstuff > .card-section')
                      if (el !== null) {
                        next.keywords = el.lastChild.querySelector('a').getAttribute('href')
                        next.keywords = next.keywords.match(/q=([^&]+)/g)[0].replace(/q=/g, '')
                      }
                    }
                    return next
                  } else {
                    return false
                  }
                })
                // We have either keywords or a link to follow
                if (findNext !== false && findNext.keywords !== false && findNext.href !== false) {
                  if (findNext.keywords !== false) {
                    gimgSearch = parseQuery({ keywords: findNext.keywords })
                  } else {
                    gimgSearch = 'https://www.google.com' + findNext.href
                  }
                  // go to the page
                  await page.goto(gimgSearch, { waitUntil: 'load' })
                  let responseDataSBI = await page.evaluate(() => {
                    let nodeList = Array.from(
                      document.querySelectorAll('#search [data-ri]')
                    )
                    let data = []
                    // get the images
                    nodeList.forEach((node, index) => {
                      data[index] = JSON.parse(node.lastElementChild.textContent)
                      data[index].ved = node.dataset.ved
                    })
                    return data
                  })
                  // add the SBI images to the original set
                  responseData = responseData.concat(responseDataSBI)
                }
              }
            }
          }
          await browser.close()
        })
        .then(() => {
          // Getting related image links.
          if (responseData.length > 0) {
            let requests = []
            responseData.forEach((item, index) => {
              requests[index] = axios({
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
                  'user-agent':
                  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/65.0.3325.181 Chrome/65.0.3325.181 Safari/537.36'
                }
              })
            })
            axios
              .all(requests)
              .then(function (results) {
                results.forEach((result, index) => {
                  let rimg = result.data.match(/tbs=rimg:([A-Za-z0-9_-])+/gm)
                  if (rimg === null) {
                    responseData[index].rimg = false
                  } else {
                    responseData[index].rimg = rimg[0].replace(/tbs=rimg:/gm, '')
                  }
                })
              })
              .then(() => {
                responseData = cleanMetadata(responseData)
                res.write(JSON.stringify(responseData))
                res.end()
              })
          } else {
            res.end()
          }
        })
    } else {
      res.end()
    }
  })
  .listen(8080)
