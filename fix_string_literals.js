const fs = require('fs');
const path = require('path');

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(file));
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walkDir('src/sim');
for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace escaped backticks with regular backticks
    content = content.replace(/\\`/g, '`');
    
    // Replace double-escaped single quotes with a single escaped quote
    content = content.replace(/\\\\'/g, "\\'");

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log(`Fixed ${file}`);
    }
}
