const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find the title from <AppLayout title="...">
    const match = content.match(/<AppLayout\s+title="([^"]+)">/);
    if (!match) return; // skip if no match
    
    const title = match[1];
    
    // Replace <AppLayout title="..."> with <>
    content = content.replace(/<AppLayout\s+title="[^"]+">/g, '<>');
    
    // Replace </AppLayout> with </>
    content = content.replace(/<\/AppLayout>/g, '</>');
    
    // Extract component name from export default function XXX
    const compMatch = content.match(/export\s+default\s+function\s+([A-Za-z0-9_]+)/);
    if (compMatch) {
        const compName = compMatch[1];
        content += `\n${compName}.layout = (page: any) => <AppLayout title="${title}">{page}</AppLayout>;\n`;
        fs.writeFileSync(filePath, content);
        console.log(`Processed ${filePath}`);
    } else {
        console.log(`Could not find export default function in ${filePath}`);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            processFile(fullPath);
        }
    }
}

walkDir('e:\\\\KMIPN\\\\AI\\\\petrochain\\\\web_portal\\\\resources\\\\js\\\\Pages');
