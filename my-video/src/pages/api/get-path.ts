import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Read from the exact location specified
        const filePath = 'D:\\Projects\\Remotion Couples Quiz\\path.txt';
        const backgroundPath = fs.readFileSync(filePath, 'utf8');
        
        console.log('Read background path:', backgroundPath);
        
        // Return the path as plain text
        res.setHeader('Content-Type', 'text/plain');
        return res.status(200).send(backgroundPath);
    } catch (error) {
        console.error('Error reading path:', error);
        return res.status(500).json({ error: 'Failed to read path' });
    }
} 