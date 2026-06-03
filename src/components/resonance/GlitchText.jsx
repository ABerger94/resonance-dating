import { useState, useEffect, useRef } from 'react';

const GLITCH_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

export default function GlitchText({
  text,
  trigger = false,
  duration = 800,
  className = '',
  onComplete
}) {
  const [displayText, setDisplayText] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (trigger && text) {
      startGlitch();
    } else if (text && !trigger) {
      setDisplayText(text);
    }
  }, [trigger, text]);

  const startGlitch = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = elapsed / duration;

      if (progress >= 1) {
        clearInterval(intervalRef.current);
        setDisplayText(text);
        setIsAnimating(false);
        onComplete?.();
        return;
      }

      const revealedCount = Math.floor(progress * text.length);
      let scrambled = text.slice(0, revealedCount);

      for (let index = revealedCount; index < text.length; index += 1) {
        if (text[index] === ' ') {
          scrambled += ' ';
        } else {
          scrambled += GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        }
      }

      setDisplayText(scrambled);
    }, 40);
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <span
      className={`font-mono ${isAnimating ? 'text-primary' : ''} transition-colors ${className}`}
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      {displayText || (text ? ''.padStart(text.length, '*') : '')}
    </span>
  );
}
