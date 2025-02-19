export interface ComparisonOption {
    text: string;
    imageUrl: string;
}

export interface Comparison {
    id: string;
    question: string;
    leftOption: ComparisonOption;
    rightOption: ComparisonOption;
}

export interface QuizConfig {
    comparisons: Comparison[];
} 