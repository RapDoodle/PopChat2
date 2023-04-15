import jwt from 'jsonwebtoken'
import express from 'express'
import { Room } from '../models/room.js'

export const indexRouter = new express.Router()

indexRouter.all('*', async (req, res) => {
  // If the session exists
  if (req.session.token) {
    try {
      const decoded = jwt.verify(req.session.token, process.env.POP_CHAT_JWT_SECRET)
      const room = Room.getRoom({ roomId: decoded.roomId })
      const user = room.rejoin({ username: decoded.username })
      return res.render('chat', {
        username: user.username,
        roomId: room.roomId,
        token: req.session.token
      })
    } catch (error) {
      return res.render('join', {
        error,
        username: req.body.username
      })
    }
  } else {
    return res.render('join', {
      username: req.body.username
    })
  }
})
