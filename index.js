const modules = require('./modules')
const port = 3000
const debug = false

require('greenlock-express').create({
  version: 'draft-11',
  server: 'https://acme-v02.api.letsencrypt.org/directory',
  // Note: If at first you don't succeed, stop and switch to staging
  // https://acme-staging-v02.api.letsencrypt.org/directory
  email: 'csanders@protonmail.com',
  agreeTos: true,
  approveDomains: [
    'gimgmetadata.limitunknown.com',
    'www.gimgmetadata.limitunknown.com'
  ],
  configDir: '~/.config/acme/',
  app: require('express')().use('/', (req, res) => {
    console.log(`Express started listening on port ${port}`)
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
      res.json({ error: 'You did no specify any keywords to use.' })
      res.end()
    }
  })
}).listen(80, 443)
