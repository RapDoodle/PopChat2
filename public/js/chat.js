const socket = io()

var sendForm = document.getElementById('sendForm')
var msgBox = document.getElementById('textMsg')
var sendFormBtn = document.getElementById('send')
var sendFileBtn = document.getElementById('send-file')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplateLeft = document.querySelector('#message-left-template').innerHTML
const messageTemplateRight = document.querySelector('#message-right-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
// const { username, room } = Qs.parse(location.search)
const username = document.getElementById('connectionInfo__username').value
const roomId = document.getElementById('connectionInfo__roomId').value
const roomPassword = document.getElementById('connectionInfo__roomPassword').value
const token = document.getElementById('connectionInfo__token').value
const maxFileSize = parseInt(document.getElementById('connectionInfo__maxFileSize').value || 1000)

// Clear history
window.history.pushState("", "", '/chat');
window.onbeforeunload = () => {
  // Not working anymore
  return 'Are you sure to leave the room? Leaving will result in the lost of all current chat history?'
}

const autoscroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  // Visible height
  const visibleHeight = $messages.offsetHeight

  // Height of messages container
  const contentHeight = $messages.scrollHeight

  const scrolledOffset = $messages.scrollTop + visibleHeight

  if (contentHeight - newMessageHeight <= scrolledOffset) {
    $messages.scrollTop = $messages.scrollHeight
  }
}

let files = []

// Send file
sendFileBtn.addEventListener('click', () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.addEventListener('change', () => {
    const file = input.files[0]
		// Check file size
		if (file.size > maxFileSize) {
			messageRender({
				sender: 'Bot (local)',
				message: `The file is too big. Exceeded the maximum filesize allowed (${humanReadableFileSize(maxFileSize)}).`,
			})
			return
		}
    const reader = new FileReader()
    reader.addEventListener('load', () => {
			const objectUrl = reader.result
			socket.emit('file', {
				filename: file.name,
				objectUrl: reader.result
			}, (error) => {
				if (error) {
					alert(error)
				}
			})
    });

    // Read the selected file as a data URL
    reader.readAsDataURL(file)
  });

  // Trigger a click event on the file input
  input.click()
})

var count = 0
var intervalEvent

var tryReconnect = function () {
  socket.io.reconnect()
  count++
  if (count >= 20) {
    const html = Mustache.render(messageTemplateLeft, {
      sender: 'Bot (local)',
      message: 'Failed to reconnect. Please refresh the page.',
      createdAt: moment(new Date().getTime()).format('h:mm A'),
    })
    $messages.insertAdjacentHTML('beforeend', html)
    clearInterval(intervalEvent)
  }
}

const messageRender = ({
  sender,
  message,
  createdAt = new Date().getTime(),
  messageTemplate,
	msgHtml
}) => {
  if (!messageTemplate) {
    messageTemplate = sender.toLowerCase() == username ? messageTemplateRight : messageTemplateLeft
  }
  const html = Mustache.render(messageTemplate, { sender, message, createdAt: moment(createdAt).format('h:mm A'), msgHtml })
  $messages.insertAdjacentHTML('beforeend', html)
  autoscroll()
}

socket.on('welcome', ({ createdAt }) => {
  const message = roomPassword.length !== 0 ? `Welcome to your new chat room (id:${roomId})! The password for joining the room is: ${roomPassword}` : `Welcome to room ${roomId}`
  messageRender({
    sender: 'Bot',
    message,
    createdAt,
  })
})

socket.on('newMessage', (msg) => {
  messageRender({ sender: msg.user, message: msg.text, createdAt: msg.createdAt })
})

socket.on('newFile', (msg) => {
	files.push(msg)
	const msgHtml = `File <a href="#" onclick="saveFile(${files.length-1})">${msg.filename}</a>`
  messageRender({ sender: msg.user, message: msg.text, createdAt: msg.createdAt, msgHtml })
})

const saveFile = (index) => {
	const blob = dataUrlToBlob(files[index].objectUrl);
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', files[index].filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const dataUrlToBlob = (dataUrl) => {
  const parts = dataUrl.split(';base64,')
  const contentType = parts[0].split(':')[1]
  const raw = window.atob(parts[1])
  const rawLength = raw.length
  const array = new Uint8Array(new ArrayBuffer(rawLength))
  for (let i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i)
  }
  return new Blob([array], { type: contentType })
}

socket.on('roomUpdate', ({ roomId, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    roomId,
    users
  })
  document.querySelector('#sidebar').innerHTML = html
})

socket.on('disconnect', () => {
  messageRender({
    sender: 'Bot (local)',
    message: 'You\'ve lost connection to the server. Trying to reconnect',
  })
  intervalEvent = setInterval(tryReconnect, 2000)
})

sendForm.addEventListener('submit', (e) => {
  e.preventDefault()
  sendFormBtn.setAttribute('disabled', 'disabled')
  text = e.target.elements.textMsg.value
  socket.emit('send', { text }, (error) => {
    msgBox.value = ''
    msgBox.focus()
    sendFormBtn.removeAttribute('disabled')
    if (error) {
      messageRender({ sender: 'Bot', message: error })
    }
  })
})

socket.emit('join', { username, roomId }, (error) => {
  if (error) {
    alert(error)
    location.href = '/'
  }
})

socket.on('connect', () => {
  if (intervalEvent) {
    clearInterval(intervalEvent)
    socket.emit('rejoin', { token }, (error) => {
      if (error) {
        const html = Mustache.render(messageTemplateLeft, {
          sender: 'Bot (local)',
          message: 'Failed to reconnect. Please refresh the page.',
          createdAt: moment(new Date().getTime()).format('h:mm A'),
        })
        $messages.insertAdjacentHTML('beforeend', html)
      }
    })
  }
})

