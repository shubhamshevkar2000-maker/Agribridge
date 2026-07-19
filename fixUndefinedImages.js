const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'frontend', 'src', 'app');
const files = fs.readdirSync(dir, { recursive: true })
  .filter(f => f.endsWith('.tsx'))
  .map(f => path.join(dir, f));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  content = content.replace(/getValidImageUrl\(([a-zA-Z0-9_.]+)\.images\[0\],/g, "getValidImageUrl($1.images?.[0],");

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  }
});
