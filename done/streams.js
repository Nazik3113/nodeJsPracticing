const { Readable } = require('stream')
const { Writable } = require('stream')
const { Transform } = require('stream')

class Ui extends Readable {
  constructor(data, options = { objectMode: true }) {
    super(options)

    this.data = data
    this.onError()
  }

  onError() {
    this.on('error', (error) => {
      throw new Error(error)
    })
  }

  _read() {
    let data = this.data.shift()
    if (!data) {
      this.push(null)
    } else {
      if (
        !data.name ||
        !data.email ||
        !data.password ||
        typeof data.name !== 'string' ||
        typeof data.email !== 'string' ||
        typeof data.password !== 'string'
      ) {
        this.emit(
          'error',
          'Make sure you fill all fields and all of them are strings'
        )
      } else {
        this.push(data)
      }
    }
  }
}

class Guardian extends Transform {
  constructor(options = { objectMode: true }) {
    super(options)
  }

  _transform(chunk, encoding, done) {
    const hexObj = {
      meta: { source: 'ui' },
      payload: {
        ...chunk,
        email: Buffer.from(chunk.email).toString('hex'),
        password: Buffer.from(chunk.password).toString('hex'),
      },
    }
    this.push(hexObj)
    done()
  }
}

class AccountManager extends Writable {
  constructor(options = { objectMode: true }) {
    super(options)
    this.customers = new Map()
  }

  _write(chunk, encoding, done) {
    this.customers.set(chunk.payload.email, chunk)
    console.log(chunk.payload)
    done()
  }
}

const customers = [
  {
    name: 'Pitter Black',
    email: 'pblack@email.com',
    password: 'bplack_123',
  },
  {
    name: 'Oliver White',
    email: 'owhite@email.com',
    password: 'owhite_456',
  },
]

const ui = new Ui(customers)
const guardian = new Guardian()
const manager = new AccountManager()
ui.pipe(guardian).pipe(manager)
