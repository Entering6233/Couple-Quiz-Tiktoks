import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
import os from 'os';

async function renderVideo(inputProps) {
    try {
        console.log('Starting video render...');
        
        // Log the full input props for debugging
        console.log('Full input props:', JSON.stringify(inputProps, null, 2));
        
        // Extract script data from input props
        const script = inputProps.script;
        if (!script) {
            throw new Error('No script data provided in input props');
        }
        
        if (!Array.isArray(script.components)) {
            throw new Error('Script components must be an array');
        }
        
        console.log(`Script has ${script.components.length} components`);
        script.components.forEach((comp, idx) => {
            console.log(`Component ${idx + 1}: ${comp.type} (${comp.durationInFrames} frames)`);
        });

        // Create a webpack bundle of the video
        const bundleLocation = await bundle({
            entryPoint: path.resolve('./src/remotion/index.ts'),
            webpackOverride: (config) => ({
                ...config,
                output: {
                    ...config.output,
                    filename: 'bundle.js',
                },
                resolve: {
                    ...config.resolve,
                    alias: {
                        ...config.resolve?.alias,
                        'react': path.resolve('./node_modules/react'),
                        'react-dom': path.resolve('./node_modules/react-dom'),
                    },
                },
            }),
        });

        console.log('Bundle created at:', bundleLocation);

        // Select the composition with the script data
        const composition = await selectComposition({
            serveUrl: bundleLocation,
            id: 'ScriptVideo',
            inputProps: {
                script: script
            },
        });

        console.log('Composition selected:', {
            id: composition.id,
            durationInFrames: composition.durationInFrames,
            width: composition.width,
            height: composition.height,
        });

        // Generate output path
        const outputLocation = path.resolve(
            `./public/videos/video-${Date.now()}.mp4`
        );

        // Ensure output directory exists
        const outputDir = path.dirname(outputLocation);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Calculate trim configuration
        const fps = inputProps.fps || 30;  // Use FPS from input props
        const paddingFrames = Math.floor(5 * fps);  // 5 seconds worth of frames at the given FPS
        const trimConfig = {
            startFrame: paddingFrames,
            endFrame: composition.durationInFrames
        };

        console.log('Starting render with config:', {
            outputLocation,
            fps,
            trimConfig,
            chromiumOptions: {
                headless: true,
                enableAcceleratedRendering: true,
                disableWebSecurity: true,
            }
        });

        // Render the video
        await renderMedia({
            composition,
            serveUrl: bundleLocation,
            codec: 'h264',
            outputLocation,
            inputProps: {
                script: script,
                trimConfig: trimConfig
            },
            fps: fps,
            chromiumOptions: {
                headless: true,
                enableAcceleratedRendering: true,
                disableWebSecurity: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu',
                ]
            },
            onProgress: ({ progress }) => {
                const percent = Math.floor(progress * 100);
                console.log(`Rendering progress: ${percent}%`);
                // Flush stdout to ensure logs are sent immediately
                if (process.stdout.write) {
                    process.stdout.write('\n');
                }
            },
        });

        const publicUrl = `/videos/${path.basename(outputLocation)}`;
        console.log('Render complete!');
        console.log(JSON.stringify({
            success: true,
            outputLocation: publicUrl
        }));

    } catch (err) {
        console.error('Render failed:', err);
        console.log(JSON.stringify({
            success: false,
            error: err.message
        }));
        process.exit(1);
    }
}

// Get input props from command line argument
try {
    const inputProps = JSON.parse(process.argv[2]);
    renderVideo(inputProps);
} catch (err) {
    console.error('Failed to parse input props:', err);
    console.log(JSON.stringify({
        success: false,
        error: 'Failed to parse input props: ' + err.message
    }));
    process.exit(1);
} 