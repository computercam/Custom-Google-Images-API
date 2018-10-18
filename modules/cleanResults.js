module.exports = function (results, query) {
  results.forEach((item, index) => {
    results[index] = {
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
    if (query.retain) {
      let retain = JSON.parse(query.retain)
      results[index].okeys = retain.okeys
      results[index].ocats = retain.ocats
    }
  })
  return results
}
