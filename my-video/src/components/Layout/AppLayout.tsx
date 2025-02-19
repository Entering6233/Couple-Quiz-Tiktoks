import React, { useState } from 'react';
import { theme } from '../../styles/theme';
import { ConfigMenu } from '../ConfigMenu/ConfigMenu';
import { Script } from '../../types/script';
import { exportVideo } from '../../services/videoService';
import { ComponentLogger } from '../ComponentLogger/ComponentLogger';

interface AppLayoutProps {
    children: [React.ReactNode, React.ReactNode, React.ReactNode]; // Left, Center, Right content
    script: Script;
    onScriptChange: (script: Script) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ 
    children: [leftContent, centerContent, rightContent],
    script,
    onScriptChange,
}) => {
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const handleExportVideo = async () => {
        try {
            console.log('Starting video export...');
            console.log('Script data:', script);
            setIsExporting(true);
            const outputLocation = await exportVideo(script);
            console.log('Video exported successfully to:', outputLocation);
            alert(`Video exported successfully to: ${outputLocation}`);
        } catch (error) {
            console.error('Error exporting video:', error);
            alert('Failed to export video. Check console for details.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: theme.colors.background.primary,
            color: theme.colors.text.primary,
            display: 'grid',
            gridTemplateRows: 'auto 1fr',
            overflowX: 'hidden',
        }}>
            {/* Header */}
            <header style={{
                backgroundColor: theme.colors.background.secondary,
                borderBottom: `1px solid ${theme.colors.border}`,
                padding: `${theme.spacing.md} ${theme.spacing.xl}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: theme.shadows.md,
                position: 'sticky',
                top: 0,
                zIndex: 100,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
                    <h1 style={{ 
                        margin: 0, 
                        fontSize: '24px',
                        background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: 'bold',
                    }}>
                        Couples Quiz Creator
                    </h1>
                </div>
                <nav style={{
                    display: 'flex',
                    gap: theme.spacing.lg,
                }}>
                    <button style={{
                        ...commonButtonStyle,
                        backgroundColor: 'transparent',
                        color: theme.colors.text.primary,
                    }}
                    onClick={() => setIsConfigOpen(true)}
                    >
                        ⚙️ Settings
                    </button>
                    <button style={{
                        ...commonButtonStyle,
                        backgroundColor: theme.colors.primary,
                        color: theme.colors.text.primary,
                        opacity: isExporting ? 0.7 : 1,
                        cursor: isExporting ? 'not-allowed' : 'pointer',
                    }}
                    onClick={handleExportVideo}
                    disabled={isExporting}
                    >
                        {isExporting ? 'Exporting...' : 'Export Video'}
                    </button>
                </nav>
            </header>

            {/* Main Content */}
            <main style={{
                padding: `${theme.spacing.lg} ${theme.spacing.lg}`,
                display: 'grid',
                gridTemplateColumns: '280px 1fr minmax(500px, 800px)',
                gap: theme.spacing.lg,
                height: 'calc(100vh - 80px)', // Subtract header height
                position: 'relative',
                overflow: 'hidden', // Prevent content from expanding outside
            }}>
                {/* Left Sidebar - Component Palette */}
                <aside style={{
                    backgroundColor: theme.colors.background.secondary,
                    borderRadius: theme.borderRadius.lg,
                    padding: theme.spacing.md,
                    boxShadow: theme.shadows.md,
                    border: `1px solid ${theme.colors.border}`,
                    position: 'sticky',
                    top: '80px',
                    height: 'fit-content',
                    maxHeight: 'calc(100vh - 100px)',
                    overflowY: 'auto',
                }}>
                    {leftContent}
                </aside>

                {/* Center Content - Preview */}
                <div style={{
                    backgroundColor: theme.colors.background.secondary,
                    borderRadius: theme.borderRadius.lg,
                    padding: theme.spacing.md,
                    boxShadow: theme.shadows.md,
                    border: `1px solid ${theme.colors.border}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: theme.spacing.md,
                    overflowY: 'auto',
                }}>
                    {centerContent}
                </div>

                {/* Right Sidebar - Properties */}
                <aside style={{
                    backgroundColor: theme.colors.background.secondary,
                    borderRadius: theme.borderRadius.lg,
                    padding: theme.spacing.md,
                    boxShadow: theme.shadows.md,
                    border: `1px solid ${theme.colors.border}`,
                    position: 'sticky',
                    top: '80px',
                    height: 'calc(100vh - 100px)',
                    overflowY: 'auto',
                }}>
                    {rightContent}
                </aside>
            </main>

            {/* Config Menu */}
            <ConfigMenu
                isOpen={isConfigOpen}
                onClose={() => setIsConfigOpen(false)}
                script={script}
                onScriptChange={onScriptChange}
            />

            {/* Component Logger */}
            <ComponentLogger components={script.components} />
        </div>
    );
};

// Common styles
const commonButtonStyle = {
    padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
    borderRadius: theme.borderRadius.md,
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.2s ease',
    '&:hover': {
        opacity: 0.9,
    },
}; 