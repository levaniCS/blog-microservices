const express = require('express')
const cors = require('cors')
const axios = require('axios')

const app = express()
app.use(express.json({ limit: '10kb' }))
app.use(cors())

const posts = {}
// posts === {
//   'jse342k' : {
//     id: 'sg3452fa',
//     title: 'post title',
//     comments: [
//       { id: 'jdrr34', content: 'This is post conteent' }
//     ]
//   }
// }

const handleEvent = (type, data) => {
  if(type === 'PostCreated') {
    const { id, title } = data
    posts[id] = { id, title, comments: [] }
  }

  if(type === 'CommentCreated') {
    const { id, content, postId, status } = data
    const post = posts[postId]
    post.comments.push({ id, content, status })
  }

  if(type === 'CommentModerated') {
    const { id, content, postId, status } = data
    const post = posts[postId]
    const comment = post.comments.find(c => c.id === id)

    comment.status = status
    comment.content = content
  }
}

app.get('/posts', (req, res) => {
  res.send(posts)
})

app.post('/events', (req, res) => {
  const { type, data } = req.body;
  handleEvent(type,data)
  res.send({})
})

app.listen(4002, async () => {
  console.log('Listening on 4002')

  // That give us all the events thats gonna make over time
  const res = await axios.get('http://event-bus-srv:4005/events')
  for(let event of res.data) {
    console.log('PROCESSING EVENT', event.type)
    handleEvent(event.type, event.data)
  }
})