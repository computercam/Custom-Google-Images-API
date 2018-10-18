const drop = require('lodash.drop')
const take = require('lodash.take')
const puppeteer = require('puppeteer')
module.exports = async (queryStr, query, debug) => {
  const { start, limit } = query
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: !debug
  })
  const page = await browser.newPage()
  await page.goto(queryStr, { waitUntil: 'load' })
  let results = await page.evaluate(() => {
    let nodeList = Array.from(document.querySelectorAll('#search [data-ri]'))
    let data = []
    nodeList.forEach((node, index) => {
      data[index] = JSON.parse(node.lastElementChild.textContent)
      data[index].ved = node.dataset.ved
    })
    return data
  })
  await browser.close()
  if (start && start > 0 && start < results.length) {
    results = drop(results, start)
  }
  if (limit && limit > 0 && limit < results.length) {
    results = take(results, limit)
  }
  return results
}
