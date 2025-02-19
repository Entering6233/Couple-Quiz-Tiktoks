import {Composition} from 'remotion';
import {QuizVideo} from './QuizVideo';

export const RemotionVideo: React.FC = () => {
	return (
		<Composition
			id="QuizVideo"
			component={QuizVideo}
			durationInFrames={1800} // 60 seconds at 30fps
			fps={30}
			width={1080}
			height={1920} // 9:16 aspect ratio for vertical video
			defaultProps={{
				quizConfig: {
					comparisons: []
				}
			}}
		/>
	);
}; 