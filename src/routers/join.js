import jwt from 'jsonwebtoken'
import express from 'express'
import { Room } from '../models/room.js'
import { User } from '../models/user.js'

export const joinRouter = new express.Router()

joinRouter.get('/join', async (req, res) => {
  res.render('join')
})

joinRouter.post('/join', async (req, res) => {
  try {
    const room = Room.getRoom({ roomId: req.body.roomId })
    const user = new User({ username: req.body.username, roomId: room.roomId })
    room.join({ user, password: req.body.roomPassword })

    const token = jwt.sign({
      id: user.id,
      roomId: room.roomId,
      username: user.username
    }, process.env.POP_CHAT_JWT_SECRET)
    req.session.token = token

    res.render('chat', {
      username: user.username,
      roomId: room.roomId,
      token,
      maxFileSize: process.env.POP_CHAT_MAX_FILESIZE
    })
  } catch (error) {
    return res.render('join', {
      error,
      username: req.body.username,
      roomId: req.body.roomId
    })
  }
})
