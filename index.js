const express = require('express')
const axios = require('axios')
const modules = require('./modules')
const app = express()
const port = 3000
const debug = false

app.get('/', (req, res) => {
  // Only process the request if the keywords query was included
  if (req.query.keywords.trim()) {
    (async () => {
      const { parseQuery, gimgSearch, rimgRequests, cleanMetadata } = modules
      const gimgQuery = parseQuery(req.query)
      let results = await gimgSearch(gimgQuery.str, debug)
      if (results.length > 0) {
        const requests = rimgRequests(results, gimgQuery.q, axios)
        axios.all(requests).then((res) => {
          console.log(res)
        }).catch((err) => {
          console.log(err)
        })
        // relatedImages.forEach((result, index) => {
        //   let rimg = result.data.match(/tbs=rimg:([A-Za-z0-9_-])+/gm)
        //   if (rimg === null) {
        //     results[index].rimg = false
        //   } else {
        //     results[index].rimg = rimg[0].replace(/tbs=rimg:/gm, '')
        //   }
        // })
        // results = cleanMetadata(results, gimgQuery.q)
        // res.json(results)
        res.end()
      } else {
        res.json({ error: 'Your query yeiled no results.' })
        res.end()
      }
    })(req, res, modules, debug)
  } else {
    res.json({ error: 'You did no specify any keywords to use.' })
    res.end()
  }
})

app.listen(port, () => {
  console.log(`Express started listening on port ${port}`)
})
