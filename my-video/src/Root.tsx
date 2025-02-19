import React, { useState, useRef, useEffect } from 'react';
import { Composition } from 'remotion';
import { Player, PlayerRef } from '@remotion/player';
import { ScriptVideo, ScriptVideoProps } from './components/Video/ScriptVideo';
import { Script, ComponentType, ScriptComponent } from './types/script';
import { AppLayout } from './components/Layout/AppLayout';
import { ComponentPalette } from './components/ScriptEditor/ComponentPalette';
import { Timeline } from './components/ScriptEditor/Timeline';
import { CaptionTimeline } from './components/ScriptEditor/CaptionTimeline';
import { ComponentEditor } from './components/ScriptEditor/ComponentEditor';
import { Modal } from './components/common/Modal';
import { TemplateManager } from './components/TemplateManager/TemplateManager';
import { theme } from './styles/theme';
import { commonStyles } from './styles/commonStyles';
import { IconButton } from './components/common/IconButton';
import { findAccessibleUrl } from './utils/fileUtils';

// Create an isolated video preview component
const IsolatedVideoPreview: React.FC<{ script: Script }> = ({ script }) => {
	const playerRef = useRef<PlayerRef>(null);

	return (
		<div style={{
			position: 'relative',
			width: '100%',
			height: '100%',
		}}>
			<Player
				ref={playerRef}
				component={ScriptVideo}
				durationInFrames={Math.max(
					...script.components.map(comp => {
						const start = comp.startFrame || 0;
						const duration = comp.durationInFrames || 150;
						return start + duration;
					}),
					300 // Minimum 10 seconds
				)}
				fps={30}
				compositionWidth={1080}
				compositionHeight={1920}
				style={{
					width: '100%',
					height: '100%',
				}}
				controls
				autoPlay
				loop
				inputProps={{ script }}
			/>
		</div>
	);
};

// Add error boundary
class ErrorBoundary extends React.Component<{
	children: React.ReactNode;
	onError?: (error: Error) => void;
}, { hasError: boolean }> {
	constructor(props: { children: React.ReactNode; onError?: (error: Error) => void; }) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	componentDidCatch(error: Error) {
		if (this.props.onError) {
			this.props.onError(error);
		}
	}

	render() {
		if (this.state.hasError) {
			return null;
		}
		return this.props.children;
	}
}

// Wrap the video components with error boundary
const SafeVideoPreview = ({ script }: { script: Script }) => {
	const [error, setError] = useState<Error | null>(null);
	const [previewUrl, setPreviewUrl] = useState('');
	const previewContainerRef = useRef<HTMLDivElement>(null);

	// Update preview URL when script changes
	useEffect(() => {
		console.log('Updating preview URL with script:', script);
		console.log('Background settings:', script.settings.background);

		// Pass the script directly to the preview
		const scriptData = encodeURIComponent(JSON.stringify(script));
		const newPreviewUrl = `http://localhost:3001/ScriptVideo?props=${scriptData}`;
		console.log('Setting preview URL:', newPreviewUrl);
		console.log('Decoded preview data:', JSON.parse(decodeURIComponent(scriptData)));
		setPreviewUrl(newPreviewUrl);
	}, [script]);

	if (error) {
		return (
			<div style={{
				width: '100%',
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				backgroundColor: theme.colors.background.primary,
				color: theme.colors.text.primary,
				padding: theme.spacing.lg,
				textAlign: 'center',
				gap: theme.spacing.md,
			}}>
				<div style={{
					fontSize: theme.fontSizes.lg,
					fontWeight: 'bold',
					marginBottom: theme.spacing.sm,
				}}>
					Preview Unavailable
				</div>
				<div style={{
					fontSize: theme.fontSizes.sm,
					color: theme.colors.text.secondary,
					maxWidth: '80%',
				}}>
					{error.message || 'There was an error loading the preview.'}
				</div>
			</div>
		);
	}

	return (
		<div 
			ref={previewContainerRef}
			style={{
				position: 'relative',
				width: '100%',
				height: '100%',
				backgroundColor: '#000',
			}}
		>
			{previewUrl && (
				<iframe
					src={previewUrl}
					style={{
						width: '100%',
						height: '100%',
						border: 'none',
					}}
					title="Video Preview"
					key={previewUrl}
				/>
			)}
		</div>
	);
};

export const RemotionRoot: React.FC = () => {
	const [script, setScript] = useState<Script>({
		id: Date.now().toString(),
		title: 'New Quiz',
		components: [],
		captionTracks: [],
		settings: {
			defaultTextStyle: {
				fontSize: 40,
				color: 'white',
				fontFamily: 'Arial',
				textAlign: 'center',
			},
			defaultCaptionStyle: {
				fontSize: 24,
				color: 'white',
				fontFamily: 'Arial',
				textAlign: 'center',
			},
			background: {
				type: 'none',
			},
		},
	});

	const [currentFrame, setCurrentFrame] = useState(0);
	const [selectedComponentId, setSelectedComponentId] = useState<string | undefined>(undefined);
	const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
	const [timelineZoom, setTimelineZoom] = useState(1);
	const [editingTextPosition, setEditingTextPosition] = useState<string | null>(null);
	const [previewKey, setPreviewKey] = useState(0);
	const [previewUrl, setPreviewUrl] = useState('');
	const [error, setError] = useState<Error | null>(null);

	const playerRef = useRef<PlayerRef>(null);
	const previewContainerRef = useRef<HTMLDivElement>(null);

	// Calculate total duration, minimum 30 frames (1 second)
	const totalDuration = Math.max(
		...script.components.map(comp => {
			const start = comp.startFrame || 0;
			const duration = comp.durationInFrames || 150; // Default 5 seconds if not specified
			return start + duration;
		}),
		300 // Minimum 10 seconds
	);

	// Get selected component
	const selectedComponent = script.components.find(c => c.id === selectedComponentId);

	// Handle messages from preview iframe
	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			if (event.origin === 'http://localhost:3001') {
				try {
					const data = JSON.parse(event.data);
					if (data.type === 'updateTextPosition' && data.componentId && data.position) {
						setScript(prev => ({
							...prev,
							components: prev.components.map(comp => {
								if (comp.id === data.componentId && comp.type === 'text') {
									return {
										...comp,
										style: {
											...comp.style,
											position: data.position
										}
									};
								}
								return comp;
							})
						}));
					}
				} catch (err) {
					console.error('Error processing message:', err);
				}
			}
		};

		window.addEventListener('message', handleMessage);
		return () => window.removeEventListener('message', handleMessage);
	}, []);

	const handleDragStart = (type: ComponentType) => {
		console.log('Dragging component:', type);
	};

	const handleComponentChange = (updated: Script['components'][0]) => {
		const newScript = {
			...script,
			components: script.components.map(c => 
				c.id === updated.id ? updated : c
			),
		};
		setScript(newScript);
		setPreviewKey(prev => prev + 1);
	};

	const handleComponentDelete = (id: string | undefined) => {
		const newScript = {
			...script,
			components: script.components.filter(c => c.id !== id),
		};
		setScript(newScript);
		setSelectedComponentId(undefined);
		setPreviewKey(prev => prev + 1);
	};

	const handleReorder = (components: ScriptComponent[]) => {
		setScript(prev => ({
			...prev,
			components,
		}));
	};

	const updatePreviewUrl = (script: Script) => {
		console.log('Updating preview URL with script:', script);
		console.log('Background settings:', script.settings?.background);

		// Get custom fonts from localStorage
		let customFonts = [];
		try {
			const savedFonts = localStorage.getItem('customFonts');
			if (savedFonts) {
				customFonts = JSON.parse(savedFonts);
			}
		} catch (error) {
			console.error('Error loading custom fonts:', error);
		}

		// Create preview data object with both script and fonts
		const previewData = {
			script,
			customFonts
		};

		// Update preview URL with combined data
		const previewUrl = `http://localhost:3001/ScriptVideo?props=${encodeURIComponent(JSON.stringify(previewData))}`;
		console.log('Setting preview URL:', previewUrl);
		console.log('Decoded preview data:', previewData);
		setPreviewUrl(previewUrl);
	};

	return (
		<>
			<ErrorBoundary>
				<Composition
					id="ScriptVideo"
					component={ScriptVideo}
					durationInFrames={totalDuration}
					fps={30}
					width={1080}
					height={1920}
					defaultProps={{
						script
					}}
				/>
			</ErrorBoundary>
			<AppLayout script={script} onScriptChange={(newScript) => {
				setScript(newScript);
				setPreviewKey(prev => prev + 1);
			}}>
				{/* Left Sidebar - Components Panel */}
				<div style={{
					display: 'flex',
					flexDirection: 'column',
					gap: theme.spacing.lg,
					backgroundColor: theme.colors.background.secondary,
					borderRadius: theme.borderRadius.lg,
					padding: theme.spacing.lg,
					boxShadow: theme.shadows.md,
					height: 'fit-content',
					position: 'sticky',
					top: theme.spacing.lg,
					width: '250px', // Fixed width for consistency
					minWidth: '250px', // Prevent shrinking
				}}>
					<div style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						padding: `${theme.spacing.sm} ${theme.spacing.md}`,
						backgroundColor: theme.colors.background.tertiary,
						borderRadius: theme.borderRadius.md,
					}}>
						<h2 style={{
							margin: 0,
							fontSize: theme.fontSizes.xl,
							fontFamily: theme.fonts.heading,
							color: theme.colors.text.primary,
						}}>Components</h2>
						<IconButton
							icon="📋"
							onClick={() => setIsTemplateManagerOpen(true)}
							tooltip="Templates"
							variant="ghost"
						/>
					</div>
					<ComponentPalette onDragStart={handleDragStart} />
				</div>

				{/* Center Content */}
				<div style={{
					display: 'flex',
					flexDirection: 'column',
					gap: theme.spacing.xl,
					width: '100%',
				}}>
					{/* Preview Section */}
					<div style={{
						backgroundColor: theme.colors.background.tertiary,
						borderRadius: theme.borderRadius.lg,
						overflow: 'hidden',
						padding: theme.spacing.lg,
						boxShadow: theme.shadows.lg,
						height: '65vh',
						minHeight: '500px',
					}}>
						<div style={{
							position: 'relative',
							width: '100%',
							height: '100%',
							backgroundColor: theme.colors.background.primary,
							borderRadius: theme.borderRadius.md,
							overflow: 'hidden',
							boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)',
						}}>
							<SafeVideoPreview key={previewKey} script={script} />
						</div>
					</div>

					{/* Timeline Section */}
					<div style={{
						backgroundColor: theme.colors.background.secondary,
						borderRadius: theme.borderRadius.lg,
						padding: theme.spacing.lg,
						boxShadow: theme.shadows.md,
					}}>
						{/* Timeline Controls */}
						<div style={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							padding: `${theme.spacing.sm} ${theme.spacing.md}`,
							backgroundColor: theme.colors.background.tertiary,
							borderRadius: theme.borderRadius.md,
							marginBottom: theme.spacing.md,
						}}>
							<div style={{ display: 'flex', gap: theme.spacing.sm }}>
								<h3 style={{
									margin: 0,
									fontSize: theme.fontSizes.lg,
									fontFamily: theme.fonts.heading,
									color: theme.colors.text.primary,
									marginRight: theme.spacing.md,
								}}>Timeline</h3>
								<IconButton
									icon="⏮"
									onClick={() => playerRef.current?.seekTo(0)}
									tooltip="Go to Start"
									variant="ghost"
								/>
								<IconButton
									icon="⏪"
									onClick={() => {
										const frame = Math.max(0, currentFrame - 30);
										playerRef.current?.seekTo(frame);
										setCurrentFrame(frame);
									}}
									tooltip="Back 1 Second"
									variant="ghost"
								/>
								<IconButton
									icon="⏩"
									onClick={() => {
										const frame = Math.min(300, currentFrame + 30);
										playerRef.current?.seekTo(frame);
										setCurrentFrame(frame);
									}}
									tooltip="Forward 1 Second"
									variant="ghost"
								/>
							</div>
							<div style={{ display: 'flex', gap: theme.spacing.sm }}>
								<IconButton
									icon="🔍-"
									onClick={() => setTimelineZoom(prev => Math.max(0.5, prev - 0.1))}
									tooltip="Zoom Out"
									variant="ghost"
								/>
								<IconButton
									icon="🔍+"
									onClick={() => setTimelineZoom(prev => Math.min(2, prev + 0.1))}
									tooltip="Zoom In"
									variant="ghost"
								/>
							</div>
						</div>

						{/* Main Timeline */}
						<Timeline
							script={script}
							onReorder={handleReorder}
							onSelect={setSelectedComponentId}
							selectedId={selectedComponentId}
							onDelete={handleComponentDelete}
						/>

						{/* Captions Timeline */}
						<CaptionTimeline
							script={script}
							onScriptChange={setScript}
						/>
					</div>
				</div>

				{/* Right Sidebar - Properties Panel */}
				<div style={{
					backgroundColor: theme.colors.background.secondary,
					borderRadius: theme.borderRadius.lg,
					padding: theme.spacing.lg,
					boxShadow: theme.shadows.md,
					height: 'fit-content',
					maxHeight: 'calc(100vh - 40px)',
					position: 'sticky',
					top: theme.spacing.lg,
					overflow: 'auto',
					width: '300px', // Fixed width for consistency
					minWidth: '300px', // Prevent shrinking
				}}>
					<div style={{
						padding: `${theme.spacing.sm} ${theme.spacing.md}`,
						backgroundColor: theme.colors.background.tertiary,
						borderRadius: theme.borderRadius.md,
						marginBottom: theme.spacing.lg,
					}}>
						<h2 style={{
							margin: 0,
							fontSize: theme.fontSizes.xl,
							fontFamily: theme.fonts.heading,
							color: theme.colors.text.primary,
						}}>Properties</h2>
					</div>
					{selectedComponent && (
						<ComponentEditor
							component={selectedComponent}
							onChange={handleComponentChange}
							onDelete={() => handleComponentDelete(selectedComponent.id)}
							onEditPosition={setEditingTextPosition}
						/>
					)}
				</div>
			</AppLayout>

			{/* Template Manager Modal */}
			<Modal
				isOpen={isTemplateManagerOpen}
				onClose={() => setIsTemplateManagerOpen(false)}
				title={
					<h2 style={{
						...commonStyles.heading,
						margin: 0,
						display: 'flex',
						alignItems: 'center',
						gap: theme.spacing.sm,
						color: theme.colors.text.primary,
						fontSize: theme.fontSizes.xl,
						fontFamily: theme.fonts.heading,
					}}>
						 Templates
					</h2>
				}
			>
				<TemplateManager
					currentScript={script}
					onTemplateSelect={(newScript) => {
						setScript(newScript);
						setIsTemplateManagerOpen(false);
					}}
				/>
			</Modal>

			{/* Component Editor Modal (for mobile/tablet) */}
			<Modal
				isOpen={!!selectedComponentId && window.innerWidth < 1024}
				onClose={() => setSelectedComponentId(undefined)}
				title={
					selectedComponent && (
						<h2 style={{
							...commonStyles.heading,
							margin: 0,
							display: 'flex',
							alignItems: 'center',
							gap: theme.spacing.sm,
							color: theme.colors.text.primary,
							fontSize: theme.fontSizes.xl,
							fontFamily: theme.fonts.heading,
						}}>
							<span style={{ fontSize: '1.2em' }}>
								{selectedComponent.type === 'title' && '📑'}
								{selectedComponent.type === 'text' && '📝'}
								{selectedComponent.type === 'comparison' && '⚖️'}
								{selectedComponent.type === 'countdown' && '⏲️'}
								{selectedComponent.type === 'transition' && '🔄'}
								{selectedComponent.type === 'voice' && '🎙️'}
							</span>
							Edit {selectedComponent.type.charAt(0).toUpperCase() + selectedComponent.type.slice(1)}
						</h2>
					)
				}
			>
				{selectedComponent && (
					<ComponentEditor
						component={selectedComponent}
						onChange={handleComponentChange}
						onDelete={() => handleComponentDelete(selectedComponent.id)}
					/>
				)}
			</Modal>
		</>
	);
};
