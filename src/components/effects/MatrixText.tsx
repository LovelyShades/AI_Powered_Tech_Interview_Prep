import { useState, useEffect } from 'react';

interface MatrixTextProps {
  text: string;
  className?: string;
  typeWriter?: boolean;
}

export const MatrixText = ({ 
  text, 
  className = '', 
  typeWriter = false 
}: MatrixTextProps) => {
  const [displayText, setDisplayText] = useState(typeWriter ? '' : text);
  const [isComplete, setIsComplete] = useState(!typeWriter);

  useEffect(() => {
    if (!typeWriter) {
      setDisplayText(text);
      setIsComplete(true);
      return;
    }

    let currentIndex = 0;
    let timeoutId: NodeJS.Timeout;

    const typeText = () => {
      if (currentIndex <= text.length) {
        if (currentIndex === text.length) {
          setDisplayText(text);
          setIsComplete(true);
        } else {
          setDisplayText(text.substring(0, currentIndex + 1));
          currentIndex++;
          timeoutId = setTimeout(typeText, Math.random() * 80 + 40);
        }
      }
    };

    typeText();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [text, typeWriter]);

  return (
    <span className={className}>
      {displayText}
      {typeWriter && !isComplete && <span className="animate-pulse">|</span>}
    </span>
  );
};