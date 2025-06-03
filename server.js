const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('public')); // لتقديم الملفات الثابتة (مثل index.html)

const textsDir = path.join(__dirname, 'texts');

// تأكد أن مجلد texts موجود
if (!fs.existsSync(textsDir)){
    fs.mkdirSync(textsDir);
}

app.post('/save', (req, res) => {
  const text = req.body.content;
  if(!text) return res.status(400).json({error: 'Empty content'});

  const id = Date.now().toString();
  const filename = path.join(textsDir, `${id}.txt`);

  fs.writeFile(filename, text, (err) => {
    if(err) return res.status(500).json({error: 'File write error'});
    const link = `${req.protocol}://${req.get('host')}/raw/${id}`;
    res.json({link});
  });
});

app.get('/raw/:id', (req, res) => {
  const id = req.params.id;
  const filename = path.join(textsDir, `${id}.txt`);

  fs.readFile(filename, 'utf8', (err, data) => {
    if(err) return res.status(404).send('Not found');
    res.type('text/plain').send(data);
  });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
