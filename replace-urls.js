const fs = require('fs');
const path = require('path');

const dir = './frontend/src';
// Instead of import.meta.env for quick fix, we use the explicit domain so the user doesn't need to rebuild with .env
const API_URL = 'https://campus-connect-ljjb.onrender.com';

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Replace single quoted string exactly
      content = content.replace(/'http:\/\/localhost:5000'/g, `'${API_URL}'`);
      // Replace double quoted string exactly
      content = content.replace(/"http:\/\/localhost:5000"/g, `"${API_URL}"`);
      // Replace prefix of strings like 'http://localhost:5000/api/users'
      content = content.replace(/'http:\/\/localhost:5000\//g, `'${API_URL}/`);
      
      // Replace template literals `http://localhost:5000${product}`
      content = content.replace(/`http:\/\/localhost:5000/g, `\`${API_URL}`);

      fs.writeFileSync(fullPath, content);
    }
  }
}

processDirectory(dir);
console.log('Frontend URLs Replaced successfully');
