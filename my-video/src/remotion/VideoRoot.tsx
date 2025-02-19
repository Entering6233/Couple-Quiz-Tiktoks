import React from 'react';
import { Composition } from 'remotion';
import { ScriptVideo } from '../components/Video/ScriptVideo';

export const VideoRoot: React.FC = () => {
    return (
        <Composition
            id="ScriptVideo"
            component={ScriptVideo}
            durationInFrames={1800}
            fps={30}
            width={1080}
            height={1920}
            defaultProps={{
                script: {
                    id: '',
                    title: '',
                    components: [],
                    captionTracks: [],
                    settings: {
                        defaultTextStyle: {
                            fontSize: 40,
                            color: 'white',
                            fontFamily: 'Arial',
                            textAlign: 'center'
                        },
                        defaultCaptionStyle: {
                            fontSize: 24,
                            color: 'white',
                            fontFamily: 'Arial',
                            textAlign: 'center'
                        },
                        background: {
                            type: 'none'
                        }
                    }
                }
            }}
        />
    );
}; 