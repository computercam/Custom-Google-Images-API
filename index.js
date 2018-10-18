const express = require('express')
const modules = require('./modules')
const app = express()
const port = 3000
const debug = false
app.get('/', (req, res) => {
  // Only process the request if the keywords query was included
  if (req.query.keywords) {
    (async () => {
      const { parseQuery, gimgSearch, getRimg, cleanMetadata } = modules
      const gimgQuery = parseQuery(req.query)
      let results = await gimgSearch(gimgQuery.str, debug)
      if (results.length > 0) {
        results = await getRimg(results, gimgQuery.q)
        results = cleanMetadata(results, gimgQuery.q)
        res.json(results)
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
