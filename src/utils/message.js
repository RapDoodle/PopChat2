export const generateMessage = (text, user) => {
  return {
    text,
    user,
    createdAt: new Date().getTime()
  }
}

export const generateFile = (filename, objectUrl, user) => {
  return {
    user,
    filename,
    objectUrl,
    createdAt: new Date().getTime()
  }
}
