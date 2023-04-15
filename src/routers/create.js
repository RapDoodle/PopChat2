import jwt from 'jsonwebtoken'
import express from 'express'
import { Room } from '../models/room.js'
import { User } from '../models/user.js'

export const createRouter = new express.Router()

createRouter.get('/create', async (req, res) => {
  res.render('create')
})

createRouter.post('/create', async (req, res) => {
  try {
    const room = new Room({ password: req.body.password })
    const user = new User({ username: req.body.username, roomId: room.roomId })
    room.join({ user, password: room.password })  // Grant the user with password of the room since the user may not know the password at this moment

    const token = jwt.sign({
      id: user.id,
      roomId: room.roomId,
      username: user.username
    }, process.env.POP_CHAT_JWT_SECRET)
    req.session.token = token

    res.render('chat', {
      username: user.username,
      roomId: room.roomId,
      roomPassword: room.password,  // Only send the password when the useer is the creator
      token,
    })
  } catch (error) {
    return res.render('create', {
      error,
      username: req.body.username,
    })
  }
})
