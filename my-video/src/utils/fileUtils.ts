export async function checkFileAccessibility(url: string): Promise<boolean> {
    console.log(`=== Checking accessibility for URL: ${url} ===`);
    try {
        console.log('Sending HEAD request...');
        const response = await fetch(url, { method: 'HEAD' });
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        console.log('Response ok:', response.ok);
        return response.ok;
    } catch (error: any) {
        console.error(`Error checking accessibility for ${url}:`, error);
        console.error('Error details:', {
            name: error?.name || 'Unknown',
            message: error?.message || 'No message available',
            stack: error?.stack || 'No stack trace available'
        });
        return false;
    }
}

export async function findAccessibleUrl(urls: string[]): Promise<string | null> {
    console.log('=== Finding accessible URL ===');
    console.log('Checking URLs:', urls);
    
    for (const url of urls) {
        console.log(`\nTesting URL: ${url}`);
        if (await checkFileAccessibility(url)) {
            console.log('✅ URL is accessible:', url);
            return url;
        } else {
            console.log('❌ URL is not accessible:', url);
        }
    }
    
    console.error('No accessible URLs found among:', urls);
    return null;
} 