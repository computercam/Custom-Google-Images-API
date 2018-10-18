const app = require('express')()
const fs = require('fs')
const modules = require('./modules')
const { email, domain, port, origin, debug, local } = JSON.parse(fs.readFileSync('./config.json'))
const allowHost = debug ? origin : '*'

const api = (req, res) => {
  // Allow debugging from any host
  res.append('Access-Control-Allow-Origin', allowHost)
  // Only process the request if the keywords query was included
  if (req.query.keywords) {
    (async () => {
      const { parseQuery, gimgSearch, getRimg, cleanResults } = modules
      const gimgQueryStr = parseQuery(req.query)
      let results = await gimgSearch(gimgQueryStr, req.query, debug)
      if (results.length > 0) {
        results = await getRimg(results, req.query.keywords)
        results = cleanResults(results, req.query)
        res.json(results)
        res.end()
      } else {
        res.json({ error: 'Your query yeiled no results.' })
        res.end()
      }
    })(req, res, modules, debug)
  } else {
    res.json({ error: 'You did not specify any keywords to use.' })
    res.end()
  }
}
if (local) {
  app.get('/', (req, res) => {
    api(req, res)
  })
  app.listen(port.local, () => {
    console.log(`Express is running locally on port ${port.local}`)
  })
} else {
  require('./server/greenlock')(app, { email, domain, port }, api)
}
