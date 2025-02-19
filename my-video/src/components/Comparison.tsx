import {
	AbsoluteFill,
	useCurrentFrame,
	interpolate,
	spring,
	useVideoConfig,
} from 'remotion';
import {Timer} from './Timer';
import {QuizItem} from '../data/quizData';

interface ComparisonProps {
	data: QuizItem;
	startFrame: number;
}

export const Comparison: React.FC<ComparisonProps> = ({data, startFrame}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const relativeFrame = frame - startFrame;
	
	const opacity = spring({
		frame: relativeFrame,
		fps,
		config: {
			damping: 200,
		},
	});

	if (relativeFrame < 0 || relativeFrame > 150) return null;

	return (
		<AbsoluteFill>
			<div style={{
				opacity,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				padding: 40,
			}}>
				<h1 style={{
					fontSize: 60,
					color: 'white',
					textAlign: 'center',
					marginBottom: 40,
				}}>
					{data.question}
				</h1>
				
				<div style={{
					display: 'flex',
					width: '100%',
					justifyContent: 'space-between',
				}}>
					{/* Left Option */}
					<div style={{flex: 1, padding: 20}}>
						<img
							src={data.leftOption.image}
							style={{
								width: '100%',
								height: 'auto',
								borderRadius: 20,
							}}
						/>
						<h2 style={{
							color: 'white',
							textAlign: 'center',
							fontSize: 40,
						}}>
							{data.leftOption.text}
						</h2>
					</div>

					{/* Right Option */}
					<div style={{flex: 1, padding: 20}}>
						<img
							src={data.rightOption.image}
							style={{
								width: '100%',
								height: 'auto',
								borderRadius: 20,
							}}
						/>
						<h2 style={{
							color: 'white',
							textAlign: 'center',
							fontSize: 40,
						}}>
							{data.rightOption.text}
						</h2>
					</div>
				</div>

				<Timer startFrame={startFrame} />
			</div>
		</AbsoluteFill>
	);
}; 