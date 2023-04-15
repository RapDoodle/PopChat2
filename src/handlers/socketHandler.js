import jwt from 'jsonwebtoken'
import { Server as SocketIOServer } from 'socket.io'
import { generateMessage, generateFile } from '../utils/message.js'
import { humanReadableFileSize } from '../utils/file.js'
import { Room } from '../models/room.js'

export const io = new SocketIOServer({
  pingInterval: 2000,
  pingTimeout: 5000,
  maxHttpBufferSize: Math.max(1000, parseInt(process.env.POP_CHAT_MAX_FILESIZE))
})

io.on('connection', (socket) => {
  socket.on('join', ({ username, roomId }, callback) => {
    try {
      const room = Room.getRoom({ roomId })
      const user = room.getUser({ username })

      socket.join(room.getRoomIdentifier())

      user.socketId = socket.id
      user.isOnline = true

      socket.roomId = roomId
      socket.username = user.username
      socket.userId = user.id

      socket.emit('welcome', { createdAt: new Date().getTime() })  // Print the welcome message
      socket.broadcast.to(room.getRoomIdentifier()).emit('newMessage', generateMessage(`${user.displayName} has joined the chat`, 'Bot'))
      io.to(room.getRoomIdentifier()).emit('roomUpdate', {
        roomId: room.roomId,
        users: room.getAllUsers(),
      })
      callback()
    } catch (e) {
      callback(e)
    }
  })

  socket.on('rejoin', ({ token }, callback) => {
    try {
      const decoded = jwt.verify(token, configManager.getConfig().environment.jwtSecretKey)
      const room = Room.getRoom({ roomId: decoded.roomId })
      const user = room.rejoin({ username: decoded.username })

      socket.join(room.roomId)
      user.socketId = socket.id
      user.isOnline = true

      socket.roomId = room.roomId
      socket.username = user.username
      socket.userId = user.id

      socket.emit('newMessage', generateMessage('You are now back online!', 'Bot'))
      socket.broadcast.to(room.getRoomIdentifier()).emit('newMessage', generateMessage(`${user.displayName} is now online`, 'Bot'))
      io.to(room.getRoomIdentifier()).emit('roomUpdate', {
        roomId: room.roomId,
        users: room.getAllUsers(),
      })
      callback()
    } catch (error) {
      callback(error)
    }
  })

  socket.on('send', ({ text }, callback) => {
    try {
      const room = Room.getRoom({ roomId: socket.roomId })
      const user = room.getUser({ username: socket.username })
      if (user) {
        io.to(room.getRoomIdentifier()).emit('newMessage', generateMessage(text, user.displayName))
        return callback()
      }
      socket.emit('newMessage', generateMessage('You are not logged in', 'Bot'))
      return callback()
    } catch (e) {
      // Usually occurs when the server restarted
      callback(e)
    }
  })

  socket.on('file', ({ filename, objectUrl }, callback) => {
    try {
      const room = Room.getRoom({ roomId: socket.roomId })
      const user = room.getUser({ username: socket.username })
      if (objectUrl.length > parseInt(process.env.POP_CHAT_MAX_FILESIZE))
        throw `The file size exceeded the limit of ${humanReadableFileSize(parseInt(process.env.POP_CHAT_MAX_FILESIZE))}`
      if (user) {
        // Send to the original sender as well
        io.to(room.getRoomIdentifier()).emit('newFile', generateFile(filename, objectUrl, user.displayName))
        return callback()
      }
      socket.emit('newMessage', generateMessage('You are not logged in', 'Bot'))
      return callback()
    } catch (e) {
      // Usually occurs when the server restarted
      callback(e)
    }
  })

  socket.on('disconnect', () => {
    try {
      const room = Room.getRoom({ roomId: socket.roomId })
      const user = room.getUser({ id: socket.userId })
      user.isOnline = false
      // const user = room.getUser({ id: socket.userId })
      if (user) {
        const users = room.getAllUsers()
        const isRoomEmpty = users.every((userEntry) => userEntry.isOnline === false)
        if (isRoomEmpty) {
          room.setRoomTimeout({ minutes: 2 })
        } else {
          io.to(room.getRoomIdentifier()).emit('newMessage', generateMessage(`${user.displayName} has disconnected`, 'Bot'))
          io.to(room.getRoomIdentifier()).emit('roomUpdate', {
            roomId: room.roomId,
            users,
          })
        }
      }
    } catch (error) {
      // It usually happens when the server restarts,
      // simply ingore the connection
      return
    }
  })
})
