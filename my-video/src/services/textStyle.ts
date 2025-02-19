interface StyledTextConfig {
    textShadow: string;
    WebkitTextStroke: string;
}

export const getStyledText = async (
    text: string,
    fontSize: number = 24,
    textColor: string = '#FFFFFF',
    strokeColor: string = '#000000',
    strokeWidth: number = 4
): Promise<StyledTextConfig> => {
    const requestData = {
        text,
        fontSize,
        textColor,
        strokeColor,
        strokeWidth
    };
    
    console.log('🎨 Text Style Service - Sending request:', JSON.stringify(requestData, null, 2));

    try {
        const response = await fetch('http://127.0.0.1:8756/style-text', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Origin': window.location.origin
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('🚨 Text Style Service - Server Error:', {
                status: response.status,
                statusText: response.statusText,
                error: errorText
            });
            throw new Error(`Server error: ${response.status} - ${errorText || response.statusText}`);
        }

        const result = await response.json();
        console.log('✨ Text Style Service - Received response:', JSON.stringify(result, null, 2));
        return result;
    } catch (error) {
        console.error('🚨 Text Style Service - Request failed:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            requestData
        });

        // Fallback to local generation if server fails
        console.log('⚠️ Text Style Service - Using fallback style generation');
        const shadowOffsets = [
            [-1, -1], [1, -1], [-1, 1], [1, 1],  // Corner shadows
            [0, -1], [0, 1], [-1, 0], [1, 0]      // Edge shadows
        ];

        const textShadow = shadowOffsets
            .map(([x, y]) => `${x * strokeWidth}px ${y * strokeWidth}px 0 ${strokeColor}`)
            .join(', ');

        const fallbackResult = {
            textShadow,
            WebkitTextStroke: `${strokeWidth}px ${strokeColor}`
        };

        console.log('🔧 Text Style Service - Generated fallback style:', JSON.stringify(fallbackResult, null, 2));
        return fallbackResult;
    }
}; 