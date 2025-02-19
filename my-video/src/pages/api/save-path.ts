import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { selectedPath } = req.body;
        if (!selectedPath) {
            return res.status(400).json({ error: 'No path provided' });
        }

        // Write to the exact location specified
        const filePath = 'D:\\Projects\\Remotion Couples Quiz\\path.txt';
        
        // Write the path to the file
        fs.writeFileSync(filePath, selectedPath, 'utf8');
        
        console.log('Saved path to:', filePath);
        console.log('Path content:', selectedPath);

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error saving path:', error);
        return res.status(500).json({ error: 'Failed to save path' });
    }
} 