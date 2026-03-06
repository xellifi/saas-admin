const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

function walk(dir, callback) {
    fs.readdir(dir, (err, list) => {
        if (err) return callback(err);
        let pending = list.length;
        if (!pending) return callback(null);
        list.forEach((file) => {
            file = path.join(dir, file);
            fs.stat(file, (err, stat) => {
                if (stat && stat.isDirectory()) {
                    walk(file, (err) => {
                        if (!--pending) callback(null);
                    });
                } else {
                    if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css') || file.endsWith('.html')) {
                        const content = fs.readFileSync(file, 'utf8');
                        const newContent = content.replace(/\b(text|bg|border|ring|shadow|from|to|via|fill|stroke|decoration|outline|divide)-blue-(\d{2,3}(?:\/\d+)?)\b/g, '$1-primary-$2');
                        if (content !== newContent) {
                            fs.writeFileSync(file, newContent);
                            console.log(`Updated ${file}`);
                        }
                    }
                    if (!--pending) callback(null);
                }
            });
        });
    });
}

walk(directoryPath, (err) => {
    if (err) throw err;
    console.log('Finished updating files.');
});
