const express = require('express')
const { randomBytes } = require('crypto')
const cors = require('cors')
const axios = require('axios')

const app = express()

app.use(express.json({ limit: '10kb' }))
app.use(cors())

const commentsByPostId = {}

app.get('/posts/:id/comments', (req, res) => {
  res.send(commentsByPostId[req.params.id] || [])
})

app.post('/posts/:id/comments', async (req, res) => {
  const commentId = randomBytes(4).toString('hex')
  const postId = req.params.id
  const { content } = req.body

  const comments = commentsByPostId[postId] || []
  comments.push({ id: commentId, content, status: 'pending' })

  //! Emit new [CommentCreated] event in EVENT BUS
  await axios.post('http://event-bus-srv:4005/events', {
    type: 'CommentCreated',
    data: {
      id: commentId,
      postId,
      content,
      status: 'pending'
    }
  })

  commentsByPostId[postId] = comments

  res.status(201).send(comments)
})

app.post('/events', async (req, res) => {
  const { type, data } = req.body
  
  if(type === 'CommentModerated') {
    const { postId, id, status, content } = data;
    const comments = commentsByPostId[postId]
    
    const comment = comments.find(cm => cm.id === id)
    comment.status = status

    // Tell other services about update
    // Fire event in EVENT BUS
    await axios.post('http://event-bus-srv:4005', {
      type: 'CommentUpdated',
      data: { id, postId, content, status }
    }).catch(() => {})
  }

  
  res.send({})
})

app.listen(4001, () => {
  console.log('Listening on 4001')
})