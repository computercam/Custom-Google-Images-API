const glExpress = require('greenlock-express')
module.exports = (app, options, cb) => {
  const acmeServer = options.debug ? 'https://acme-staging-v02.api.letsencrypt.org/directory' : 'https://acme-v02.api.letsencrypt.org/directory'
  glExpress.create({
    version: 'draft-11',
    server: acmeServer,
    email: options.email,
    agreeTos: true,
    approveDomains: [
      options.domain,
      `www.${options.domain}`
    ],
    configDir: '~/.config/acme/',
    debug: options.debug,
    app: app.use('/', (req, res) => {
      cb(req, res)
    })
  }).listen(options.port.http, options.port.https)
}
