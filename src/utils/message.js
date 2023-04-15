export const generateMessage = (text, user) => {
  return {
    text,
    user,
    createdAt: new Date().getTime()
  }
}
