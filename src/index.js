import fs from 'fs'
import http from 'http'
import https from 'https'
import chalk from 'chalk'
import { app } from './app.js'

// Connection
const protocol = process.env.POP_CHAT_ENABLE_HTTPS == '1' ? 'https' : 'http'
const port = process.env.POP_CHAT_PORT || 8000
const addr = process.env.POP_CHAT_ADDR || '127.0.0.1'
if (process.env.POP_CHAT_ENABLE_HTTPS === "1") {
  // Use HTTPS
  const privateKey = fs.readFileSync(process.env.POP_CHAT_PRIVATE_KEY_PATH, 'utf8')
  const certificate = fs.readFileSync(process.env.POP_CHAT_CERT_PATH, 'utf8')
  var server = https.createServer({ key: privateKey, cert: certificate }, app)
} else {
  // Use HTTP
  var server = http.createServer(app)
}

// Socket.IO
import { io as socketio } from './handlers/socketHandler.js'
socketio.attach(server)

// Start the server
server.listen(port, addr, () => {
  console.log(chalk.green(`[PopChat2] Server Running at ${protocol}://${addr}:${port}`))
})