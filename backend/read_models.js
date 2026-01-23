const fs = require('fs');
try {
    const content = fs.readFileSync('models.txt', 'utf16le');
    const lines = content.split(/\r?\n/);
    const flash = lines.filter(l => l.toLowerCase().includes('flash'));
    console.log("Flash Models found:");
    flash.forEach(l => console.log(l.trim()));
} catch (e) {
    console.error(e);
}
