// This module parses the incoming api queryuery, and creates a google images queryuery string
const isNotEmpty = require('./stringHelpers').isNotEmpty
// const cleanSbi = requeryuire('stringHelpers').cleanSbi
module.exports = function (query) {
  let str = 'https://google.com/search?query='
  str += query.keywords.replace(/\s+/gm, '+') + '&tbm=isch'
  if (isNotEmpty(query.rimg)) str += '&tbs=rimg:' + query.rimg
  if (isNotEmpty(query.safe)) str += '&safe=active'
  return str
}
