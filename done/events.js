const EventEmitter = require('events')

class Bank extends EventEmitter {
  constructor() {
    super()
    this.clients = new Map()
    this.onAdd()
    this.onGet()
    this.onWithdraw()
    this.onSend()
    this.onError()
  }

  register({ name, balance }) {
    if (balance <= 0) {
      this.emit('error', 'The balanse should be at least more than 0')
    } else {
      let theSameName = false
      this.clients.forEach((item) => {
        if (item.name === name) {
          theSameName = true
        }
      })

      if (theSameName) {
        this.emit('error', "Cann't add the person with the same name")
      } else {
        if (typeof name === 'string' && typeof balance === 'number') {
          this.clients.set(this.clients.size + 1, {
            name: name,
            balance: balance,
          })
          return this.clients.size
        } else {
          this.emit('error', "Make sure you're puttung the right data")
        }
      }
    }
  }

  onAdd() {
    this.on('add', (id, sum) => {
      if (sum <= 0) {
        this.emit('error', 'The sum should be at least more than 0')
      } else {
        if (
          this.clients.get(id) &&
          typeof sum === 'number' &&
          typeof id === 'number'
        ) {
          this.clients.set(id, {
            ...this.clients.get(id),
            balance: this.clients.get(id).balance + sum,
          })
        } else {
          this.emit('error', "Make sure you're asking for a right data")
        }
      }
    })
  }

  onGet() {
    this.on('get', (id, func) => {
      if (
        this.clients.get(id) &&
        typeof id === 'number' &&
        typeof func === 'function'
      ) {
        func(this.clients.get(id).balance)
      } else {
        this.emit('error', "Make sure you're asking for a right data")
      }
    })
  }

  onWithdraw() {
    this.on('withdraw', (id, sum) => {
      if (
        this.clients.get(id) &&
        typeof id === 'number' &&
        typeof sum === 'number'
      ) {
        if (sum <= 0 || sum > this.clients.get(id).balance) {
          this.emit('error', 'The wrong sum')
        } else {
          this.clients.set(id, {
            ...this.clients.get(id),
            balance: this.clients.get(id).balance - sum,
          })
        }
      } else {
        this.emit('error', "Make sure you're asking for a right data")
      }
    })
  }

  onSend() {
    this.on('send', (firstId, secondId, sum) => {
      if (
        this.clients.get(firstId) &&
        this.clients.get(secondId) &&
        typeof firstId === 'number' &&
        typeof secondId === 'number' &&
        typeof sum === 'number'
      ) {
        if (sum <= 0 || sum > this.clients.get(firstId).balance) {
          this.emit('error', 'The wrong sum')
        } else {
          this.clients.set(firstId, {
            ...this.clients.get(firstId),
            balance: this.clients.get(firstId).balance - sum,
          })
          this.clients.set(secondId, {
            ...this.clients.get(secondId),
            balance: this.clients.get(secondId).balance + sum,
          })
        }
      }
    })
  }

  onError() {
    this.on('error', (message) => {
      throw Error(message)
    })
  }
}

const bank = new Bank()

const personId = bank.register({ name: 'Pitter Black', balance: 100 })
const personId2 = bank.register({ name: 'Pitter Blackk', balance: 100 })

bank.emit('add', personId, 20)
bank.emit('add', personId2, 50)
bank.emit('add', personId2, 50)
bank.emit('get', personId, (balance) => {
  console.log(`I have ${balance}₴`) // I have 100₴
})
bank.emit('send', personId, personId2, 20)
bank.emit('withdraw', personId, 50)
bank.emit('get', personId, (balance) => {
  console.log(`I have ${balance}₴`) // I have 50₴
})
bank.emit('get', personId2, (balance) => {
  console.log(`I have ${balance}₴`) // I have 220₴
})
