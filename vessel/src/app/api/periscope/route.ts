
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    const rootDir = process.cwd(); // This should be the 'vessel' directory now
    const fileList: any[] = [];

    const scanDir = (dir: string) => {
        if (!fs.existsSync(dir)) return;
        const files = fs.readdirSync(dir);

        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                if (file !== 'node_modules' && file !== '.git' && file !== '.next') {
                    scanDir(filePath);
                }
            } else {
                try {
                    const ext = path.extname(file).toLowerCase();
                    if (['.ts', '.tsx', '.js', '.jsx', '.css', '.md', '.json', '.html'].includes(ext)) {
                        // Limit file size to avoid choking
                        if (stat.size < 100000) {
                            const content = fs.readFileSync(filePath, 'utf8');
                            const relativePath = path.relative(rootDir, filePath);
                            fileList.push({
                                path: relativePath,
                                content: content,
                                timestamp: stat.mtimeMs
                            });
                        }
                    }
                } catch (e) {
                    console.error(`Skipping file ${file}`);
                }
            }
        });
    };

    try {
        scanDir(rootDir);
        return NextResponse.json({ files: fileList });
    } catch (e) {
        return NextResponse.json({ error: 'Periscope Malfunction' }, { status: 500 });
    }
}
