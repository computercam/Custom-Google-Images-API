// This module parses the incoming api query, and creates a google images query string
const isNotEmpty = require('./stringHelpers').isNotEmpty
// const cleanSbi = require('stringHelpers').cleanSbi

module.exports = function (q) {
  let str = 'https://google.com/search?q='
  str += q.keywords.replace(/\s+/gm, '+') + '&tbm=isch'
  if (isNotEmpty(q.rimg)) str += '&tbs=rimg:' + q.rimg
  if (isNotEmpty(q.safe)) str += '&safe=active'
  return {
    str,
    q
  }
}
