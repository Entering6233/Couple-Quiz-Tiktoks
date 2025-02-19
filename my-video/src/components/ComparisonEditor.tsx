import React from 'react';
import {Comparison} from '../types/quiz';
import { ImageSelector } from './ImageSelector';

interface ComparisonEditorProps {
	comparison: Comparison;
	onChange: (updatedComparison: Comparison) => void;
	onDelete: () => void;
}

export const ComparisonEditor: React.FC<ComparisonEditorProps> = ({
	comparison,
	onChange,
	onDelete,
}) => {
	return (
		<div style={{
			padding: '20px',
			border: '1px solid #ccc',
			borderRadius: '8px',
			backgroundColor: '#f8f9fa',
		}}>
			{/* Question Section */}
			<div style={{marginBottom: '20px'}}>
				<label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
					Question:
				</label>
				<input
					type="text"
					value={comparison.question}
					onChange={(e) => {
						onChange({
							...comparison,
							question: e.target.value,
						});
					}}
					style={{
						width: '100%',
						padding: '8px',
						fontSize: '16px',
						borderRadius: '4px',
						border: '1px solid #ddd',
					}}
					placeholder="Enter your question..."
				/>
			</div>

			{/* Options Section */}
			<div style={{
				display: 'grid',
				gridTemplateColumns: '1fr 1fr',
				gap: '20px',
			}}>
				{/* Left Option */}
				<div>
					<label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
						Left Option:
					</label>
					<input
						type="text"
						value={comparison.leftOption.text}
						onChange={(e) => {
							onChange({
								...comparison,
								leftOption: {
									...comparison.leftOption,
									text: e.target.value,
								},
							});
						}}
						style={{
							width: '100%',
							padding: '8px',
							fontSize: '16px',
							borderRadius: '4px',
							border: '1px solid #ddd',
							marginBottom: '10px',
						}}
						placeholder="Enter left option..."
					/>
					{/* Left Option Image Selection */}
					<ImageSelector
						searchTerm={comparison.leftOption.text}
						onSelect={(imageUrl) => {
							onChange({
								...comparison,
								leftOption: {
									...comparison.leftOption,
									imageUrl,
								},
							});
						}}
						currentImageUrl={comparison.leftOption.imageUrl}
					/>
				</div>

				{/* Right Option */}
				<div>
					<label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
						Right Option:
					</label>
					<input
						type="text"
						value={comparison.rightOption.text}
						onChange={(e) => {
							onChange({
								...comparison,
								rightOption: {
									...comparison.rightOption,
									text: e.target.value,
								},
							});
						}}
						style={{
							width: '100%',
							padding: '8px',
							fontSize: '16px',
							borderRadius: '4px',
							border: '1px solid #ddd',
							marginBottom: '10px',
						}}
						placeholder="Enter right option..."
					/>
					{/* Right Option Image Selection */}
					<ImageSelector
						searchTerm={comparison.rightOption.text}
						onSelect={(imageUrl) => {
							onChange({
								...comparison,
								rightOption: {
									...comparison.rightOption,
									imageUrl,
								},
							});
						}}
						currentImageUrl={comparison.rightOption.imageUrl}
					/>
				</div>
			</div>

			{/* Delete Button */}
			<button
				onClick={onDelete}
				style={{
					marginTop: '20px',
					padding: '8px 16px',
					backgroundColor: '#dc3545',
					color: 'white',
					border: 'none',
					borderRadius: '4px',
					cursor: 'pointer',
				}}
			>
				Delete Comparison
			</button>
		</div>
	);
}; 