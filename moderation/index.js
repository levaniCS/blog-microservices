const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json({ limit: '10kb' }));

app.post('/events', async (req, res) => {
  const { type, data } = req.body;

  if(type === 'CommentCreated') {
    console.log('comment moderateedd', type)
    const status = data.content.includes('orange') ? 'rejected' : 'approved';

    // Fire this event in Event bus
    await axios.post('http://event-bus-srv:4005/events', {
      type: 'CommentModerated',
      data: {
        id: data.id,
        postId: data.postId,
        content: data.content,
        status
      }
    }).catch(() => {})
  }

  res.send({})
})

app.listen(4003, () => {
  console.log('Listening on 4003')
})