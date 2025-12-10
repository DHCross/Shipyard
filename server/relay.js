
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SIGNAL_FILE = path.join(__dirname, '../user_signal.json');
const PORT = 3001;

const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // ---------------------------------------------------------
    // PERISCOPE (FILE SYNC)
    // ---------------------------------------------------------
    if (req.method === 'GET' && req.url === '/files') {
        const vesselPath = path.join(__dirname, '../vessel');

        const scanDir = (dir, fileList = []) => {
            if (!fs.existsSync(dir)) return fileList;
            const files = fs.readdirSync(dir);

            files.forEach(file => {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);

                if (stat.isDirectory()) {
                    if (file !== 'node_modules' && file !== '.git') {
                        scanDir(filePath, fileList);
                    }
                } else {
                    try {
                        // Only read text files to avoid binary garbage
                        const ext = path.extname(file).toLowerCase();
                        if (['.ts', '.tsx', '.js', '.jsx', '.css', '.md', '.json', '.html'].includes(ext)) {
                            const content = fs.readFileSync(filePath, 'utf8');
                            const relativePath = 'vessel/' + path.relative(vesselPath, filePath);
                            fileList.push({
                                path: relativePath,
                                content: content,
                                timestamp: stat.mtimeMs
                            });
                        }
                    } catch (e) {
                        console.error(`Skipping file ${file}:`, e.message);
                    }

                }
            });
            return fileList;
        };

        try {
            const files = scanDir(vesselPath);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ files }));
        } catch (e) {
            console.error('Scan Error:', e);
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Periscope Malfunction' }));
        }
        return;
    }

    // ---------------------------------------------------------
    // SIGNAL BRIDGE
    // ---------------------------------------------------------
    if (req.method === 'POST' && req.url === '/signal') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const signal = JSON.parse(body);
                // Add timestamp if missing
                signal.timestamp = signal.timestamp || Date.now();

                // Write to file
                fs.writeFileSync(SIGNAL_FILE, JSON.stringify(signal, null, 2));
                console.log(`[SIGNAL BRIDGE] Received signal: ${signal.content.substring(0, 50)}...`);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'received' }));
            } catch (e) {
                console.error('Signal Error:', e);
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
    } else {
        res.writeHead(404);
        res.end();
    }
});

server.listen(PORT, () => {
    console.log(`[SIGNAL BRIDGE] Relay active on port ${PORT}`);
    console.log(`[SIGNAL BRIDGE] Watching for UI signals...`);
});
