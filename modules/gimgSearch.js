const puppeteer = require('puppeteer')
module.exports = async (query, debug) => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'], headless: !debug })
  const page = await browser.newPage()
  await page.goto(query, { waitUntil: 'load' })
  const pageEval = await page.evaluate(() => {
    let nodeList = Array.from(document.querySelectorAll('#search [data-ri]'))
    let data = []
    nodeList.forEach((node, index) => {
      data[index] = JSON.parse(node.lastElementChild.textContent)
      data[index].ved = node.dataset.ved
    })
    return data
  })
  await browser.close()
  return pageEval
}
