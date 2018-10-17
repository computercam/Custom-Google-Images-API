module.exports.cleanSbi = function (url) {
  return url.replace(/^((.+\/[^.]+)(\.jpg|\.gif|\.jpeg|\.png|\.bmp|tiff))(.+)$/g, '$1')
}

module.exports.isNotEmpty = function (str) {
  return !(!str || str.length === 0 || typeof str === 'undefined')
}
