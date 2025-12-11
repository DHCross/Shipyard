
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
    try {
        const signal = await req.json();
        signal.timestamp = signal.timestamp || Date.now();

        const signalFile = path.join(process.cwd(), 'user_signal.json');

        fs.writeFileSync(signalFile, JSON.stringify(signal, null, 2));

        return NextResponse.json({ status: 'received' });
    } catch (e) {
        return NextResponse.json({ error: 'Invalid Signal' }, { status: 400 });
    }
}
