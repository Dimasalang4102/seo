import url from 'node:url';
import { JSDOM } from 'jsdom';
import { writeFile } from 'fs'

function printFile(url_list) {
  const date = new Date(Date.now()).toString()
  let text = "crawl master500\n"
  text += `generated: ${date}\n\n`
  for (let i=0; i < url_list.length; i++) {
    text += `${url_list[i][0].toString()}\n`
    if (url_list[i][1]) {
      for (let k=0; k < url_list[i][1].length; k++) {
        text += `  ${url_list[i][1][k].toString()}\n`
      }
    }
    text += '\n'
  }

  writeFile('report.js', text, (err) => {
    if (err) throw err;
  })
}


async function crawlPage(baseURL, currentURL = baseURL) {
  console.log(`crawling ${currentURL}`)

  let res;
  try {
    res = await fetch(currentURL)
  } catch (err) {
    throw new Error(`Got Network error: ${err.message}`)
  }

  if (res.status > 399) {
    console.log(`Got HTTP error: ${res.status} ${res.statusText}`)
  }

  const contentType = res.headers.get('content-type')
  if (!contentType || !contentType.includes('text/html')) {
    console.log(`Got non-HTML response: ${contentType}`)
    return
  }

  const all_urls = getURLsFromHTML(await res.text(), baseURL)
  if (all_urls.length < 1) { return }

  const uniq = [...new Set(all_urls)]
  let normalized = []
  for (let i=0; i < uniq.length; i++) {
    try {
      normalized.push(normalizeURL2(uniq[i]))
    } catch (_) {}
  }

  return normalized
}

async function crawl(baseURL) {
  let url_set = new Set();
  let url_list = []
  const initial_urls = await crawlPage(baseURL)
  for (let i=0; i < initial_urls.length; i++) {
    url_set.add(initial_urls[i])
  }

  let new_urls = [...url_set];
  new_urls = new_urls.filter(url => {
    if (url.includes(baseURL)) {
      return true
    }
    return false
  })

  let url_list_index = -1;
  while (new_urls.length > 0) {
    let curr = new_urls.pop()
    let url_result = await crawlPage(baseURL, curr)
    url_list.push([curr])
    url_list_index++
    if (!url_result || url_result.length < 1) {
      continue;
    }
    url_list[url_list_index].push(url_result)

    for (let i=0; i < url_result.length; i++) {
      if (!url_set.has(url_result[i])) {
        url_set.add(url_result[i])
        if (url_result[i].includes(baseURL)) {
          new_urls.push(url_result[i])
        }
      }
    }
  }

  return url_list
}

function getURLsFromHTML(htmlBody, baseURL) {
  let urls = []
  const dom = new JSDOM(htmlBody)
  const anchors = dom.window.document.querySelectorAll('a')

  for (let i=0; i < anchors.length; i++) {
    urls.push(anchors.item(i).getAttribute('href').toString())
  }

  for (let i=0; i < urls.length; i++) {
    if (urls[i][0] == '/') {
      urls[i] = baseURL.concat(urls[i])
    }
  }

  return urls
}

function normalizeURL(address_str) { 
  const url_input = new URL(address_str);

  let normalURL = url_input.host.concat(url_input.pathname);
  if (normalURL[normalURL.length-1] == '\/') {
    normalURL = normalURL.slice(0,normalURL.length-1);
  }

  return normalURL;
}

function normalizeURL2(address_str) { 
  const url_input = new URL(address_str);

  let normalURL = url_input.toString()
  if (normalURL[normalURL.length-1] == '\/') {
    normalURL = normalURL.slice(0,normalURL.length-1);
  }

  return normalURL;
}

export { normalizeURL, getURLsFromHTML, crawlPage, crawl, printFile };
