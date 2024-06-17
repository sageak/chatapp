const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Login route
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/login', (req, res) => {
  const username = req.body.username;
  res.redirect(`/chat?username=${username}`);
});

// Chat route
app.get('/chat', (req, res) => {
  const username = req.query.username;
  fs.readFile('chat.txt', 'utf8', (err, data) => {
    if (err) {
      return res.send('Error reading chat file.');
    }
    const messages = data.split('\n').filter(Boolean).map(line => JSON.parse(line));
    res.send(generateChatPage(username, messages));
  });
});

// Submit message route
app.post('/submit', (req, res) => {
  const username = req.body.username;
  const message = req.body.message;
  const chatMessage = { username, message, timestamp: new Date().toISOString() };

  fs.appendFile('chat.txt', JSON.stringify(chatMessage) + '\n', err => {
    if (err) {
      return res.send('Error writing to chat file.');
    }
    res.redirect(`/chat?username=${username}`);
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

function generateChatPage(username, messages) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Chat</title>
      </head>
      <body>
        <h1>Chat</h1>
        <div id="chat">
          ${messages.map(msg => `<p><strong>${msg.username}:</strong> ${msg.message}</p>`).join('')}
        </div>
        <form action="/submit" method="POST">
          <input type="hidden" name="username" value="${username}">
          <input type="text" name="message" placeholder="Enter your message">
          <button type="submit">Send</button>
        </form>
      </body>
    </html>
  `;
}
