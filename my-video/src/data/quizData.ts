import { Photo } from 'pexels';

export interface QuizItem {
	question: string;
	leftOption: {
		image: string;
		text: string;
		pexelsPhoto?: Photo;
	};
	rightOption: {
		image: string;
		text: string;
		pexelsPhoto?: Photo;
	};
	voiceover: string;
}

export const QUIZ_DATA: QuizItem[] = [
	{
		question: 'Coffee or Tea?',
		leftOption: {
			image: '',
			text: 'Coffee',
		},
		rightOption: {
			image: '',
			text: 'Tea',
		},
		voiceover: 'Coffee or Tea?',
	},
	// Add more comparison items here
]; 