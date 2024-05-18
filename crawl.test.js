import { test, expect } from "@jest/globals";

import { normalizeURL, getURLsFromHTML } from "./crawl.js";

test('single relative', () => {
  const html = `<html>
  <body>
    <a href=\"/xyz.html\"><span> Go to Boot.dev</span></a>
  </body>
</html>`
  expect(getURLsFromHTML(html, "https://blog.boot.dev")).toStrictEqual(['https://blog.boot.dev/xyz.html'])
})

test('two relative', () => {
  const html = `<html>
  <body>
    <a href=\"/xyz.html\"><span> Go to Boot.dev</span></a>
    <a href=\"/xyz2.html\"><span> Go to Boot.dev</span></a>
  </body>
</html>`
  expect(getURLsFromHTML(html, "https://blog.boot.dev"))
    .toStrictEqual([
      "https://blog.boot.dev/xyz.html",
      "https://blog.boot.dev/xyz2.html"
    ])
})

test('single absolute', () => {
  const html = `<html>
  <body>
    <a href=\"https://blog.boot.dev\"><span> Go to Boot.dev</span></a>
  </body>
</html>`
  expect(getURLsFromHTML(html, "https://blog.boot.dev")).toStrictEqual(['https://blog.boot.dev'])
})

test('two absolute', () => {
  const html = `<html>
  <body>
    <a href=\"https://blog.boot.dev\"><span> Go to Boot.dev</span></a>
    <a href=\"https://blog.boot.dev/ewan\"><span> Go to Boot.dev</span></a>
  </body>
</html>`
  expect(getURLsFromHTML(html, "https://blog.boot.dev"))
    .toStrictEqual([
      "https://blog.boot.dev",
      "https://blog.boot.dev/ewan"
    ])
})

test('complete_address', () => {
  expect(normalizeURL('https://blog.boot.dev/path/')).toBe("blog.boot.dev/path");
});

test('no final \/', () => {
  expect(normalizeURL('https://blog.boot.dev/path' )).toBe("blog.boot.dev/path");
});

test('http only', () => {
  expect(normalizeURL('http://blog.boot.dev/path/' )).toBe("blog.boot.dev/path");
})

test('http only and no \/', () => {
  expect(normalizeURL('http://blog.boot.dev/path'  )).toBe("blog.boot.dev/path");
})
