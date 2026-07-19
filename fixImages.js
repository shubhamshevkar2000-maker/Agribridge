const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'frontend', 'src', 'app');
const files = fs.readdirSync(dir, { recursive: true })
  .filter(f => f.endsWith('.tsx'))
  .map(f => path.join(dir, f));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  if (content.includes('getCropImageUrl')) {
    if (!content.includes('getValidImageUrl')) {
      content = content.replace(/import \{ getCropImageUrl \} from '@\/utils\/cropImages';/, "import { getCropImageUrl, getValidImageUrl } from '@/utils/cropImages';");
    }

    // Replace: src={crop.images?.[0] || getCropImageUrl(crop.name)}
    content = content.replace(/src=\{([a-zA-Z0-9_?.]+images\?\.\[0\])\s*\|\|\s*getCropImageUrl\(([^)]+)\)\}/g, "src={getValidImageUrl($1, $2)}");
    
    // Replace: src={(crop.images && crop.images.length > 0 && !crop.images[0].includes('placehold.co')) ? crop.images[0] : getCropImageUrl(crop.name)}
    content = content.replace(/src=\{\([^?]+\)\s*\?\s*([a-zA-Z0-9_?.]+images\[0\])\s*:\s*getCropImageUrl\(([^)]+)\)\}/g, "src={getValidImageUrl($1, $2)}");
    content = content.replace(/src=\{([a-zA-Z0-9_?.]+images\[0\])\}/g, "src={getValidImageUrl($1, 'crop')}");

    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      console.log('Fixed', file);
    }
  }
});
