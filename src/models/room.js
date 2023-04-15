import chalk from 'chalk'

const rooms = []

// Env check
if (Math.pow(10, parseInt(process.env.POP_CHAT_ROOM_ID_LENGTH)) <= parseInt(process.env.POP_CHAT_MAX_ROOMS)) {
  console.log(chalk.red('[Inking Repo] Envronment error. Error: not enough numbers of room to allocate'))
  process.exit(-1)
}

export class Room {

  constructor({ password }) {
    this.users = []
    // Generate a room id
    var roomId
    while (true) {
      roomId = Math.floor(Math.random() * Math.pow(10, parseInt(process.env.POP_CHAT_ROOM_ID_LENGTH)))
      const isNotUsed = rooms.every((room) => room.roomId !== roomId)
      if (isNotUsed) {
        break;
      }
    }

    // Generate a 9-digit password when the password field is empty
    if (password === '') {
      // Generate a random password when the password is not provided
      password = Math.floor(Math.random() * 1000000000) + ''
    }
    this.count = 0
    this.roomId = roomId
    this.password = password
    this.timeoutEvent = undefined
    rooms.push(this)
  }

  getRoomIdentifier() {
    return `room:${this.roomId}`
  }

  join({ user, password }) {
    if (password != this.password) {
      throw `Incorrect password for room ${this.roomId}`
    }

    if (this.users.length >= parseInt(process.env.POP_CHAT_MAX_ROOM_CAPACITY)) {
      throw 'The room is full, please try again later.'
    }

    const userExists = this.users.find((entryUser) => entryUser.username === user.username)
    if (userExists) {
      throw `Name ${user.username} is currently in use in room ${this.roomId}.`
    }

    user.id = this.count
    this.count++

    this.users.push(user)
    this.clearRoomTimeout()
    return user
  }

  rejoin({ username, requireOffline = true }) {
    if (requireOffline === true) {
      var user = this.users.find((entryUser) => entryUser.username === username && entryUser.isOnline === false)
    } else {
      var user = this.users.find((entryUser) => entryUser.username === username)
    }

    if (!user) {
      throw 'Invalid session info.'
    }

    // Update the user state to online
    user.isOnline = true

    this.clearRoomTimeout()
    return user
  }

  remove({ id, socketId }) {
    const index = this.users.findIndex((user) => {
      return user.id === id || user.socketId === socketId
    })
    if (index === -1) {
      throw 'Unable to remove the user'
    }
    return this.users.splice(index, 1)[0]  // Remove the user
  }

  getUser({ id, username, socketId }) {
    const user = this.users.find((user) => user.id === id || user.username === username || user.socketId === socketId)
    if (!user) {
      throw 'User not found'
    }
    return user
  }

  getAllUsers() {
    return this.users
  }

  // Check for existing user
  checkNameExistence({ username }) {
    username = username.trim().toLowerCase()
    // Will return true if the user exists in the room
    const user = this.users.find((user) => user.username == username)
    if (user) {
      // When a user is found
      return true
    }
    return false
  }

  setRoomTimeout({ minutes = 2 }) {
    this.timeoutEvent = setTimeout(() => {
      Room.freeRoom({ roomId: this.roomId })
    }, minutes * 60 * 1000)
  }

  clearRoomTimeout() {
    clearTimeout(this.timeoutEvent)
  }

  static getRoom({ roomId }) {
    const room = rooms.find((room) => room.roomId == roomId)
    if (!room) {
      throw `Room ${roomId} does not exist. You may consider creating one.`
    }
    return room
  }

  static freeRoom({ roomId }) {
    const index = rooms.findIndex((room) => room.roomId == roomId)
    if (index !== -1) {
      return rooms.splice(index, 1)[0]  // Remove the room
    }
  }

}