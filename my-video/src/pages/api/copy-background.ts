import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { name, data } = req.body;
        
        // Extract base64 data
        const base64Data = data.split(';base64,').pop();
        const buffer = Buffer.from(base64Data, 'base64');

        // Define all possible paths where we might need the file
        const paths = [
            path.join(process.cwd(), 'public', 'backgrounds'), // Next.js public
            path.join(process.cwd(), '..', 'public', 'backgrounds'), // One level up
            path.join(process.cwd(), 'backgrounds'), // Root level
            path.join(process.cwd(), '..', 'backgrounds'), // One level up root
        ];

        // Create directories and save file in all locations
        const savedPaths = [];
        for (const dir of paths) {
            try {
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                const filePath = path.join(dir, name);
                fs.writeFileSync(filePath, buffer);
                savedPaths.push(filePath);
            } catch (err) {
                console.error(`Failed to save to ${dir}:`, err);
            }
        }

        // Verify files were saved
        const verification = savedPaths.map(p => ({
            path: p,
            exists: fs.existsSync(p),
            size: fs.existsSync(p) ? fs.statSync(p).size : 0
        }));

        console.log('File save verification:', verification);

        if (verification.some(v => v.exists)) {
            res.status(200).json({ 
                message: 'File copied successfully',
                verification 
            });
        } else {
            throw new Error('Failed to save file in any location');
        }
    } catch (error) {
        console.error('Error copying file:', error);
        res.status(500).json({ message: 'Failed to copy file' });
    }
} 