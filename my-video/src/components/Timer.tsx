import {useCurrentFrame, Video} from 'remotion';
import clockVideo from '../@Assets/clock.mp4';

interface TimerProps {
	startFrame: number;
}

export const Timer: React.FC<TimerProps> = ({startFrame}) => {
	const frame = useCurrentFrame();
	const relativeFrame = frame - startFrame;

	return (
		<div style={{
			position: 'absolute',
			bottom: 100,
			left: '50%',
			transform: 'translateX(-50%)',
			width: '200px', // Adjust size as needed
			height: '200px',
		}}>
			<Video
				src={clockVideo}
				startFrom={relativeFrame}
				endAt={relativeFrame + 150} // 5 seconds at 30fps
				style={{
					width: '100%',
					height: '100%',
				}}
			/>
		</div>
	);
}; 