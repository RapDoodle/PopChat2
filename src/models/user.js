export class User {

  constructor({ username, roomId }) {
    // Validate the data
    if (!username && !roomId) {
      throw 'User name and room are required!'
    }

    // Clean the data
    try {
      var displayName = username.trim()
      username = displayName.toLowerCase()
    } catch (e) {
      throw 'Invalid username'
    }

    this.id = undefined  // The id will be given when joining a room
    this.socketId = undefined
    this.username = username
    this.displayName = displayName
    this.roomId = roomId
    this.isOnline = undefined
  }

}
