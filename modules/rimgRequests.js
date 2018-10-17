module.exports = function (results, keywords, axios) {
  let requests = []
  results.forEach((item, index) => {
    requests[index] = axios({
      timeout: 10000,
      baseURL: 'https://www.google.com/async/',
      url: '/imgrc',
      method: 'get',
      responseType: 'text',
      params: {
        q: keywords,
        ved: item.ved,
        vet: '1' + item + '..i',
        imgurl: item.ou,
        imgrefurl: item.ru,
        tbnid: item.id,
        docid: item.rid,
        imgdii: item.id,
        async: 'cidx:1,saved:0,lp:0,_id:irc_imgrc1,_pms:s,_fmt:pc'
      },
      headers: {
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/65.0.3325.181 Chrome/65.0.3325.181 Safari/537.36'
      }
    })
    const relatedImages = await axios.all(requests)
    relatedImages.forEach((result, index) => {
      let rimg = result.data.match(/tbs=rimg:([A-Za-z0-9_-])+/gm)
      if (rimg === null) {
        results[index].rimg = false
      } else {
        results[index].rimg = rimg[0].replace(/tbs=rimg:/gm, '')
      }
    })
  })
  return requests
}
