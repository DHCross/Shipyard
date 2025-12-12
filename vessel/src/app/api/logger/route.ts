import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, content } = body;

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        // Generate Filename
        const today = new Date().toISOString().split('T')[0];
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[1].slice(0, 5); // HH-MM

        let titleSlug = 'session';
        if (title) {
            titleSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
        }

        const filename = `session_${today}_${timestamp}_${titleSlug}.md`;
        const logsDir = path.join(process.cwd(), 'logs/sessions');

        // Ensure directory exists
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }

        const filePath = path.join(logsDir, filename);

        // Construct File Content
        const fileContent = `# ${title || 'Session Log'}\n**Date**: ${new Date().toLocaleString()}\n\n${content}`;

        fs.writeFileSync(filePath, fileContent);

        // Git Integration
        let commitHash = null;
        if (body.commit) {
            try {
                // Stage only this file (or all, consistent with the script behavior? Script did 'git add .')
                // Let's stick to this file to be safe, or '.' if we want to capture other changes.
                // The user's script did 'git add .', which is powerful for "Stage usage log and commit ALL changes".
                // Let's support that power.
                await execAsync(`git add .`, { cwd: process.cwd() });
                const commitMsg = `Log: ${title || 'Session Entry'}`;
                const { stdout } = await execAsync(`git commit -m "${commitMsg}"`, { cwd: process.cwd() });
                commitHash = stdout.trim();
            } catch (gitErr: any) {
                console.warn('Git commit failed:', gitErr.message);
                // Don't fail the request, just note it
            }
        }

        return NextResponse.json({
            success: true,
            filename,
            path: `/logs/sessions/${filename}`,
            commit: commitHash
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to save log', details: error.message },
            { status: 500 }
        );
    }
}
