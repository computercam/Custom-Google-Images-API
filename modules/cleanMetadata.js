module.exports = function (data, query) {
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
    if (typeof query.retain !== 'undefined') {
      let retain = query.retain
      retain = JSON.parse(retain)
      newData[index].okeys = retain.okeys
      newData[index].ocats = retain.ocats
    }
  })
  return newData
}
