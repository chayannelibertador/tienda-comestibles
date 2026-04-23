const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\seba\\.gemini\\antigravity\\brain';
const targetDir = 'C:\\Users\\seba\\Desktop\\Workspaces\\tienda-comestibles';

// Recursively find all *resolved files (walkthroughs and implementations)
function findResolvedFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findResolvedFiles(fullPath, fileList);
    } else if (file.endsWith('.resolved')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const resolvedFiles = findResolvedFiles(brainDir);

// Get their updatedAt dates from the metadata.json if exists
const filesWithDates = resolvedFiles.map(file => {
  let date = new Date(0);
  const metadataPath = file.replace('.resolved', '.metadata.json');
  if (fs.existsSync(metadataPath)) {
    try {
      const meta = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      if (meta.updatedAt) date = new Date(meta.updatedAt);
    } catch (e) {}
  }
  return { file, date };
});

filesWithDates.sort((a, b) => a.date - b.date);

let extractedFiles = {};

for (const { file } of filesWithDates) {
  const content = fs.readFileSync(file, 'utf8');
  // Match code blocks like ```diff:path/to/file.jsx
  const regex = /```diff:([^\n]+)\n([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const filename = match[1].trim();
    const diffContent = match[2];
    
    if (diffContent.includes('===\n')) {
      const parts = diffContent.split('===\n');
      const newContent = parts[parts.length - 1];
      extractedFiles[filename] = newContent;
    } else if (diffContent.includes('===')) {
        const parts = diffContent.split('===');
        let newContent = parts[parts.length - 1];
        if (newContent.startsWith('\n')) newContent = newContent.substring(1);
        extractedFiles[filename] = newContent;
    }
  }
}

// Now write all extracted files to targetDir
for (const [filename, content] of Object.entries(extractedFiles)) {
  let targetPath = path.join(targetDir, filename);
  
  if (!filename.includes('/') && !filename.includes('\\')) {
    const name = path.basename(filename);
    if (['App.jsx', 'main.jsx', 'index.css', 'variables.css'].includes(name)) targetPath = path.join(targetDir, 'src', name);
    else if (['Home.jsx', 'Login.jsx', 'Cart.jsx', 'OrderConfirmation.jsx', 'Catalog.jsx', 'Admin.jsx', 'AdminProducts.jsx', 'ProductDetail.jsx'].includes(name)) targetPath = path.join(targetDir, 'src', 'pages', name);
    else if (name.endsWith('.css') && ['Home.css', 'Login.css', 'Cart.css', 'Admin.css', 'AdminProducts.css', 'Catalog.css'].includes(name)) targetPath = path.join(targetDir, 'src', 'pages', name);
    else if (['Navbar.jsx', 'Footer.jsx', 'StickyMenu.jsx', 'Marquee.jsx'].includes(name)) targetPath = path.join(targetDir, 'src', 'components', 'layout', name);
    else if (name.endsWith('.css') && ['Navbar.css', 'Footer.css', 'StickyMenu.css', 'Marquee.css'].includes(name)) targetPath = path.join(targetDir, 'src', 'components', 'layout', name);
    else if (['Button.jsx', 'Input.jsx', 'BrandIcon.jsx', 'Testimonials.jsx', 'TrustSection.jsx'].includes(name)) targetPath = path.join(targetDir, 'src', 'components', 'common', name);
    else if (['AddressForm.jsx'].includes(name)) targetPath = path.join(targetDir, 'src', 'components', 'checkout', name);
    else if (['UserContext.jsx', 'CartContext.jsx', 'ToastContext.jsx', 'SettingsContext.jsx', 'ProductsContext.jsx'].includes(name)) targetPath = path.join(targetDir, 'src', 'context', name);
    else if (['ProductForm.jsx', 'ProductList.jsx'].includes(name)) targetPath = path.join(targetDir, 'src', 'components', 'admin', name);
    else if (name.endsWith('.css') && ['ProductForm.css', 'ProductList.css'].includes(name)) targetPath = path.join(targetDir, 'src', 'components', 'admin', name);
    else targetPath = path.join(targetDir, 'src', name); // Fallback
  }
  
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, content);
  console.log('Written:', targetPath);
}

console.log('Total extracted:', Object.keys(extractedFiles).length);
