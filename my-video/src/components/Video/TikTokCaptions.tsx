import React from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    spring,
    interpolate,
} from 'remotion';
import { TikTokPage } from '../../types/script';

interface TikTokCaptionsProps {
    pages: TikTokPage[];
    style?: {
        backgroundColor?: string;
        textColor?: string;
        position?: 'top' | 'bottom' | 'middle';
    };
}

export const TikTokCaptions: React.FC<TikTokCaptionsProps> = ({
    pages,
    style = {},
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const currentTimeMs = (frame / fps) * 1000;

    const currentPage = pages.find((page, index) => {
        const nextPage = pages[index + 1];
        return (
            currentTimeMs >= page.startMs &&
            (!nextPage || currentTimeMs < nextPage.startMs)
        );
    });

    if (!currentPage) return null;

    const pageProgress = spring({
        frame,
        fps,
        config: {
            damping: 200,
        },
    });

    const getTokenOpacity = (token: TikTokPage['tokens'][0]) => {
        return interpolate(
            currentTimeMs,
            [token.fromMs, token.fromMs + 100, token.toMs - 100, token.toMs],
            [0, 1, 1, 0],
            {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
            }
        );
    };

    return (
        <AbsoluteFill
            style={{
                justifyContent: style.position === 'top' ? 'flex-start' : 
                    style.position === 'bottom' ? 'flex-end' : 'center',
                padding: '40px',
            }}
        >
            <div
                style={{
                    backgroundColor: style.backgroundColor || 'rgba(0, 0, 0, 0.8)',
                    color: style.textColor || 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    fontSize: '32px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    opacity: pageProgress,
                    whiteSpace: 'pre',
                    display: 'inline-block',
                    margin: '0 auto',
                }}
            >
                {currentPage.tokens.map((token, i) => (
                    <span
                        key={i}
                        style={{
                            opacity: getTokenOpacity(token),
                            display: 'inline-block',
                        }}
                    >
                        {token.text}
                    </span>
                ))}
            </div>
        </AbsoluteFill>
    );
}; 