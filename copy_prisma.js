const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, 'prisma');
const dest = path.join(__dirname, '.next', 'standalone', 'prisma');

function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// Only copy if source exists and standalone dir exists (meaning build ran)
if (fs.existsSync(source) && fs.existsSync(path.join(__dirname, '.next', 'standalone'))) {
    console.log(`Copying Prisma folder from ${source} to ${dest}...`);
    copyDir(source, dest);
    console.log('Prisma folder copied successfully.');
} else {
    // If standalone doesn't exist, maybe it's not a standalone build or build failed before this script
    console.warn('Standalone directory or Prisma folder not found. Skipping copy.');
}
