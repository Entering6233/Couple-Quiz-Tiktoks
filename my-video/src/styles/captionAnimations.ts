import { keyframes } from '@remotion/paths';

export const captionAnimations = {
  fadeIn: keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
  `,
  
  typeWriter: keyframes`
    from { width: 0; }
    to { width: 100%; }
  `,
  
  popIn: keyframes`
    0% { transform: scale(0); opacity: 0; }
    70% { transform: scale(1.1); opacity: 0.7; }
    100% { transform: scale(1); opacity: 1; }
  `,
  
  slideInBottom: keyframes`
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  `,
  
  slideInTop: keyframes`
    from { transform: translateY(-20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  `,
  
  bounceIn: keyframes`
    0% { transform: scale(0.3); opacity: 0; }
    50% { transform: scale(1.05); opacity: 0.8; }
    70% { transform: scale(0.9); opacity: 0.9; }
    100% { transform: scale(1); opacity: 1; }
  `,
  
  glow: keyframes`
    0% { text-shadow: 0 0 0 rgba(255, 255, 255, 0); }
    50% { text-shadow: 0 0 10px rgba(255, 255, 255, 0.5); }
    100% { text-shadow: 0 0 0 rgba(255, 255, 255, 0); }
  `,
  
  wave: keyframes`
    0%, 100% { transform: translateY(0); }
    25% { transform: translateY(-4px); }
    75% { transform: translateY(4px); }
  `
};

export const getAnimationStyle = (style: string, duration: number) => {
  switch (style) {
    case 'fadeIn':
      return `${captionAnimations.fadeIn} ${duration}ms ease-out forwards`;
    case 'typeWriter':
      return `${captionAnimations.typeWriter} ${duration}ms steps(40, end) forwards`;
    case 'popIn':
      return `${captionAnimations.popIn} ${duration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards`;
    case 'slideInBottom':
      return `${captionAnimations.slideInBottom} ${duration}ms ease-out forwards`;
    case 'slideInTop':
      return `${captionAnimations.slideInTop} ${duration}ms ease-out forwards`;
    case 'bounceIn':
      return `${captionAnimations.bounceIn} ${duration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards`;
    case 'glow':
      return `${captionAnimations.glow} ${duration}ms ease-in-out infinite`;
    case 'wave':
      return `${captionAnimations.wave} ${duration}ms ease-in-out infinite`;
    default:
      return '';
  }
}; 