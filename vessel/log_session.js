const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

// Configuration
const LOGS_DIR = path.join(__dirname, 'logs/sessions');
const TODAY = new Date().toISOString().split('T')[0];

// Ensure logs directory exists
if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

(async () => {
    console.log(`\n=== 📝 SHIPYARD SESSION LOGGER [${TODAY}] ===\n`);

    // 1. Get Title
    let titleRaw = '';
    while (!titleRaw) {
        let input = await askQuestion('👉 Session Title / Focus (e.g. "Fixing Navigation"): ');
        // Filter out dev server noise if it leaks into stdin/stdout capture
        if (!input.match(/^(GET|POST|PUT|DELETE|HEAD) \//)) {
            titleRaw = input;
        }
    }
    if (!titleRaw.trim()) {
        console.log("Aborted: Title required.");
        process.exit(0);
    }
    const titleSlug = titleRaw.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

    // 2. Get Content
    console.log('\n👉 Paste your chat summary/notes below.');
    console.log("(Type 'END' on a new line when finished)\n");

    const lines = [];
    for await (const line of rl) {
        if (line.trim() === 'END') break;
        lines.push(line);
    }

    if (lines.length === 0) {
        console.log("No content provided. Aborting.");
        process.exit(0);
    }

    // 3. Save File
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[1].slice(0, 5); // HH-MM
    const filename = `session_${TODAY}_${timestamp}_${titleSlug}.md`;
    const filePath = path.join(LOGS_DIR, filename);

    const fileContent = `# ${titleRaw}\n**Date**: ${new Date().toLocaleString()}\n\n${lines.join('\n')}`;

    fs.writeFileSync(filePath, fileContent);
    console.log(`\n✅ Session log saved: ${filename}`);

    // 4. Git Integration
    const doCommit = await askQuestion(`\n⚓️ git: Stage usage log and commit all changes as "${titleRaw}"? (y/N): `);

    if (doCommit.toLowerCase().startsWith('y')) {
        try {
            console.log('Staging changes...');
            execSync('git add .', { stdio: 'inherit' });

            console.log('Committing...');
            execSync(`git commit -m "Log: ${titleRaw}"`, { stdio: 'inherit' });

            console.log('\n✅ Changes committed to the Shipyard.');
        } catch (error) {
            console.error('\n❌ Git commit failed:', error.message);
        }
    } else {
        console.log('\ncreate-only mode. File saved but not committed.');
    }

    console.log('\n👋 Session closed.');
    process.exit(0);
})();
