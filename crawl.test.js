import { test, expect } from "@jest/globals";

import { normalizeURL } from "./crawl.js";

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
