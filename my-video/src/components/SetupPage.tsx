import React, {useState} from 'react';
import {Player} from '@remotion/player';
import {QuizConfig, Comparison} from '../types/quiz';
import {ComparisonEditor} from './ComparisonEditor';
import {QuizVideo} from './Video/QuizVideo';

export const SetupPage: React.FC = () => {
	const [quizConfig, setQuizConfig] = useState<QuizConfig>({
		comparisons: [],
	});

	// Calculate duration, minimum 1 second (30 frames)
	const videoDuration = Math.max(30, quizConfig.comparisons.length * 150);

	return (
		<div style={{
			display: 'grid',
			gridTemplateColumns: '1fr 1fr',
			gap: '20px',
			padding: '20px',
			height: '100vh',
			overflow: 'hidden',
		}}>
			{/* Left side - Editor Section */}
			<div style={{
				overflowY: 'auto',
				padding: '20px',
			}}>
				<h1>Quiz Video Setup</h1>
				<button
					onClick={() => {
						const newComparison: Comparison = {
							id: Date.now().toString(),
							question: '',
							leftOption: {
								text: '',
								imageUrl: '',
							},
							rightOption: {
								text: '',
								imageUrl: '',
							},
						};
						setQuizConfig(prev => ({
							...prev,
							comparisons: [...prev.comparisons, newComparison],
						}));
					}}
					style={{
						padding: '12px 24px',
						fontSize: '16px',
						cursor: 'pointer',
						backgroundColor: '#007bff',
						color: 'white',
						border: 'none',
						borderRadius: '4px',
						marginBottom: '20px',
					}}
				>
					Add New Comparison
				</button>

				<div style={{
					display: 'flex',
					flexDirection: 'column',
					gap: '20px',
				}}>
					{quizConfig.comparisons.map((comparison) => (
						<ComparisonEditor
							key={comparison.id}
							comparison={comparison}
							onChange={(updatedComparison) => {
								setQuizConfig(prev => ({
									...prev,
									comparisons: prev.comparisons.map(c => 
										c.id === updatedComparison.id ? updatedComparison : c
									),
								}));
							}}
							onDelete={() => {
								setQuizConfig(prev => ({
									...prev,
									comparisons: prev.comparisons.filter(c => c.id !== comparison.id),
								}));
							}}
						/>
					))}
				</div>
			</div>

			{/* Right side - Preview Section */}
			<div style={{
				backgroundColor: '#f8f9fa',
				padding: '20px',
				borderRadius: '8px',
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
				overflowY: 'auto',
			}}>
				<h2 style={{marginBottom: '20px'}}>Preview</h2>
				
				{/* Debug Info */}
				<div style={{ 
					marginBottom: '20px', 
					padding: '10px', 
					backgroundColor: '#eee', 
					borderRadius: '4px' 
				}}>
					<h3>Debug Info:</h3>
					<pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
						{JSON.stringify({
							comparisonsCount: quizConfig.comparisons.length,
							videoDuration,
							firstComparison: quizConfig.comparisons[0],
						}, null, 2)}
					</pre>
				</div>

				{/* Player Container */}
				<div style={{
					position: 'relative',
					width: '100%',
					paddingTop: '177.78%', // 16:9 aspect ratio
					backgroundColor: '#000',
					borderRadius: '8px',
					overflow: 'hidden',
				}}>
					<div style={{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
					}}>
						<Player
							component={QuizVideo}
							inputProps={{
								quizConfig: quizConfig,
							}}
							durationInFrames={videoDuration}
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
						/>
					</div>
				</div>
			</div>
		</div>
	);
}; 