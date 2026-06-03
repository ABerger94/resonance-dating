import { useState, useEffect, useRef } from 'react';

const COLORS = [
  'rgba(14,165,233,VAR)',   // sky/primary
  'rgba(99,102,241,VAR)',   // indigo
  'rgba(16,185,129,VAR)',   // emerald
  'rgba(245,158,11,VAR)',   // amber
  'rgba(168,85,247,VAR)',   // purple
];

function pickColor(index) {
  return COLORS[index % COLORS.length];
}

export default function VoidBubble({ thread, index, onJoin, containerWidth, containerHeight }) {
  const [pos, setPos] = useState(null);
  const [vel, setVel] = useState(null);
  const [hovered, setHovered] = useState(false);
  const posRef = useRef(null);
  const velRef = useRef(null);
  const rafRef = useRef(null);
  const nodeRef = useRef(null);

  // Bubble size based on text length
  const textLen = (thread.prompt_text || '').length;
  const radius = Math.max(80, Math.min(130, 70 + textLen * 0.3));

  const colorBase = pickColor(index);
  const borderColor = colorBase.replace('VAR', hovered ? '0.9' : '0.6');
  const bgColor = colorBase.replace('VAR', hovered ? '0.22' : '0.12');
  const glowColor = colorBase.replace('VAR', hovered ? '0.4' : '0.2');

  useEffect(() => {
    if (!containerWidth || !containerHeight) return;

    const startX = radius + Math.random() * (containerWidth - radius * 2);
    const startY = radius + Math.random() * (containerHeight - radius * 2);
    const speed = 0.15 + Math.random() * 0.2;
    const angle = Math.random() * Math.PI * 2;
    const startVel = { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed };

    setPos({ x: startX, y: startY });
    setVel(startVel);
    posRef.current = { x: startX, y: startY };
    velRef.current = startVel;
  }, [containerWidth, containerHeight]);

  useEffect(() => {
    if (!posRef.current || !velRef.current) return;

    const animate = () => {
      const p = posRef.current;
      const v = velRef.current;
      if (!p || !v) return;

      let nx = p.x + v.x;
      let ny = p.y + v.y;
      let nvx = v.x;
      let nvy = v.y;

      if (nx - radius < 0) { nx = radius; nvx = Math.abs(nvx); }
      if (nx + radius > containerWidth) { nx = containerWidth - radius; nvx = -Math.abs(nvx); }
      if (ny - radius < 0) { ny = radius; nvy = Math.abs(nvy); }
      if (ny + radius > containerHeight) { ny = containerHeight - radius; nvy = -Math.abs(nvy); }

      posRef.current = { x: nx, y: ny };
      velRef.current = { x: nvx, y: nvy };
      setPos({ x: nx, y: ny });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [containerWidth, containerHeight, radius, posRef.current !== null]);

  if (!pos) return null;

  const shortText = thread.prompt_text?.length > 80
    ? thread.prompt_text.slice(0, 77) + '...'
    : thread.prompt_text;

  return (
    <div
      ref={nodeRef}
      onClick={() => onJoin(thread)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="absolute cursor-pointer select-none font-mono"
      style={{
        left: pos.x - radius,
        top: pos.y - radius,
        width: radius * 2,
        height: radius * 2,
        borderRadius: '50%',
        border: `1px solid ${borderColor}`,
        background: bgColor,
        boxShadow: `0 0 ${hovered ? 48 : 24}px ${glowColor}, inset 0 0 ${hovered ? 24 : 12}px ${colorBase.replace('VAR', '0.1')}`,
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease, background 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: hovered ? 10 : 1,
        transform: hovered ? 'scale(1.06)' : 'scale(1)',
      }}
    >
      {/* Handle */}
      <div style={{
        fontSize: '8px',
        letterSpacing: '1.5px',
        color: colorBase.replace('VAR', '0.7'),
        marginBottom: '6px',
        textAlign: 'center',
      }}>
        {thread.creator_handle || 'UNKNOWN'}
      </div>

      {/* Prompt text */}
      <div style={{
        fontSize: '10px',
        lineHeight: '1.45',
        color: hovered ? 'hsl(215 41% 10%)' : 'hsl(215 41% 25%)',
        textAlign: 'center',
        transition: 'color 0.2s',
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 4,
        WebkitBoxOrient: 'vertical',
      }}>
        {shortText}
      </div>

      {/* Hover CTA */}
      {hovered && (
        <div style={{
          marginTop: '8px',
          fontSize: '8px',
          letterSpacing: '2px',
          color: colorBase.replace('VAR', '0.9'),
        }}>
          ENTER ›
        </div>
      )}
    </div>
  );
}