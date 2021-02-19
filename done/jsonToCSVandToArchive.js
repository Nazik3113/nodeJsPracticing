const { json2csvAsync } = require('json-2-csv')
const { readFile, writeFile } = require('fs').promises
const zlib = require('zlib')
const fs = require('fs')

// read JSON from a file
const json = readFile('./data/comments.json')
json.then((data) => {
  createCsv(JSON.parse(data), ['postId', 'name', 'body'])
})

async function createCsv(json, neededArray) {
  try {
    let jsonArr = []
    let object = {}
    json.forEach((obj) => {
      object = {}
      for (const prop in obj) {
        if (neededArray.filter((a) => a === prop).length > 0) {
          object[prop] = obj[prop]
        }
      }
      jsonArr.push(object)
    })
    const csv = await json2csvAsync(jsonArr)
    // write CSV to a file
    await writeFile('./data/todos.csv', csv)
    const r = fs.createReadStream('./data/todos.csv')
    const w = fs.createWriteStream('./data/todos.csv.gz')
    r.pipe(zlib.createGzip()).pipe(w)
  } catch (err) {
    console.log(err)
  }
}
