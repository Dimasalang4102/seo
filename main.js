import { argv } from 'node:process'
import { crawl } from './crawl.js'



async function main() {
  // argv.forEach((val, index) => {
  //   console.log(`${index}: ${val}`)
  // })
  if (argv.length < 3) {
    throw "Too few arguments." 
  } else if (argv.length > 3) {
    throw "Too many arguments."
  }

  const baseURL = argv[2]
  console.log(`Starting at ${baseURL}...`)
  const urls = await crawl(baseURL)
  console.log(urls)
}

main()
