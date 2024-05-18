import url from 'node:url';
import { JSDOM } from 'jsdom';

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

  while (new_urls.length > 0) {
    let url_result = await crawlPage(baseURL, new_urls.pop())
    if (!url_result || url_result.length < 1) {
      continue;
    }
    console.log(url_result)
    for (let i=0; i < url_result.length; i++) {
      if (!url_set.has(url_result[i])) {
        url_set.add(url_result[i])
        if (url_result[i].includes(baseURL)) {
          new_urls.push(url_result[i])
        }
      }
    }
  }

  return [...url_set]
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

export { normalizeURL, getURLsFromHTML, crawlPage, crawl };
