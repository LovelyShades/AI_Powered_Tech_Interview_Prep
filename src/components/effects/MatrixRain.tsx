import { useEffect, useRef } from 'react';

interface MatrixRainProps {
  intensity?: number;
  speed?: number;
  className?: string;
  corner?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'fullscreen';
}

export const MatrixRain = ({ 
  intensity = 50, 
  speed = 30, 
  className = '',
  corner = 'fullscreen'
}: MatrixRainProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size based on corner type
    let canvasWidth, canvasHeight;
    if (corner === 'fullscreen') {
      canvasWidth = window.innerWidth;
      canvasHeight = window.innerHeight;
    } else {
      canvasWidth = Math.min(window.innerWidth, window.innerHeight) * 0.5;
      canvasHeight = Math.min(window.innerWidth, window.innerHeight) * 0.5;
    }
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Matrix characters with more variety
    const matrixChars = '01ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz<>/\\';
    const chars = matrixChars.split('');

    // Column setup
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = new Array(columns).fill(0);

    // Initialize drops at random positions
    for (let i = 0; i < drops.length; i++) {
      drops[i] = Math.random() * (canvas.height / fontSize);
    }

    let animationId: number;

    const draw = () => {
      // Create trailing effect
      ctx.fillStyle = 'rgba(0, 10, 30, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set font and initial color
      ctx.font = `${fontSize}px 'Courier New', monospace`;
      ctx.textAlign = 'center';

      for (let i = 0; i < drops.length; i++) {
        // Skip some columns randomly for variation
        if (Math.random() > 0.95) continue;

        // Random character
        const char = chars[Math.floor(Math.random() * chars.length)];
        
        // Gradient effect - brighter at the bottom
        const y = drops[i] * fontSize;
        const alpha = Math.min(1, (canvas.height - y) / canvas.height + 0.3);
        
        // Blue-purple gradient color
        const hue = 220 + Math.sin(Date.now() * 0.001 + i * 0.1) * 40;
        ctx.fillStyle = `hsla(${hue}, 80%, ${60 + alpha * 40}%, ${alpha * 0.9})`;
        
        // Add slight glow effect
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 8;
        
        ctx.fillText(char, i * fontSize + fontSize/2, y);

        // Reset shadow for next character
        ctx.shadowBlur = 0;

        // Move drop down
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = -1;
        }
        drops[i] += 0.3 + Math.random() * 0.3;
      }

      animationId = requestAnimationFrame(draw);
    };

    // Start animation
    draw();

    // Handle resize
    const handleResize = () => {
      if (corner === 'fullscreen') {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [intensity, speed, corner]);

  const getPositionClass = () => {
    switch (corner) {
      case 'top-left':
        return 'top-0 left-0';
      case 'top-right':
        return 'top-0 right-0';
      case 'bottom-left':
        return 'bottom-0 left-0';
      case 'bottom-right':
        return 'bottom-0 right-0';
      case 'fullscreen':
        return 'top-0 left-0';
      default:
        return 'top-0 left-0';
    }
  };

  const getMaskGradient = () => {
    if (corner === 'fullscreen') {
      return 'radial-gradient(ellipse at center, transparent 20%, black 40%, transparent 80%)';
    }
    
    const position = corner.includes('left') ? '0%' : '100%';
    const vertical = corner.includes('top') ? '0%' : '100%';
    return `radial-gradient(circle at ${position} ${vertical}, black 0%, transparent 60%)`;
  };

  return (
    <canvas
      ref={canvasRef}
      className={`fixed ${getPositionClass()} pointer-events-none z-0 ${className}`}
      style={{ 
        mixBlendMode: 'screen',
        maskImage: getMaskGradient(),
        opacity: corner === 'fullscreen' ? 0.3 : 0.6
      }}
    />
  );
};