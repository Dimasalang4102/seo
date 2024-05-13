import url from 'node:url';

function normalizeURL(address_str) { 
  const url_input = new URL(address_str);

  let normalURL = url_input.host.concat(url_input.pathname);
  if (normalURL[normalURL.length-1] == '\/') {
    normalURL = normalURL.slice(0,normalURL.length-1);
  }

  return normalURL;
}

export { normalizeURL };
