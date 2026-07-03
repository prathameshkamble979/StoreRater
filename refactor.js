const fs = require('fs');
const path = require('path');

const dirs = [
  'backend/src/controllers',
  'backend/src/middlewares',
  'backend/src/index.ts',
  'frontend/src/pages'
];

function processPath(p) {
  if (fs.statSync(p).isDirectory()) {
    fs.readdirSync(p).forEach(file => processPath(path.join(p, file)));
  } else if (p.endsWith('.ts') || p.endsWith('.tsx')) {
    let content = fs.readFileSync(p, 'utf8');
    let changed = false;

    // Backend replacements
    if (p.includes('backend')) {
      const regex = /res\.status\((\d+)\)\.json\(\{[\s\n]*error:\s*(.*?)[\s\n]*\}\)/g;
      if (regex.test(content)) {
        content = content.replace(regex, (match, status, msg) => {
          return `res.status(${status}).json({ success: false, message: ${msg}, error: {} })`;
        });
        changed = true;
      }
    }
    
    // Frontend replacements
    if (p.includes('frontend')) {
      const regex = /err\.response\?\.data\?\.error/g;
      if (regex.test(content)) {
        content = content.replace(regex, 'err.response?.data?.message');
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(p, content);
      console.log('Updated', p);
    }
  }
}

dirs.forEach(processPath);
