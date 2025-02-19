import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Intro} from './components/Intro';
import {Comparison} from './components/Comparison';
import {Outro} from './components/Outro';
import {QUIZ_DATA} from './data/quizData';

export const QuizVideo: React.FC = () => {
	const frame = useCurrentFrame();
	const introEndFrame = 150; // 5 seconds
	const outroStartFrame = 1650; // 55 seconds

	return (
		<AbsoluteFill style={{
			backgroundColor: '#1a1a1a',
		}}>
			{/* Intro Section */}
			<Intro />

			{/* Comparisons Section */}
			{QUIZ_DATA.map((item, index) => (
				<Comparison
					key={index}
					data={item}
					startFrame={150 + index * 150} // Each comparison starts 5 seconds after the previous
				/>
			))}

			{/* Outro Section */}
			<Outro />
		</AbsoluteFill>
	);
}; 