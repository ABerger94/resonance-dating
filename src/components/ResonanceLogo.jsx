export default function ResonanceLogo({ size = 30, className = '', color = 'hsl(var(--primary))' }) {
  const sw = 5.5;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M 56 16 A 44 44 0 0 0 56 104" stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" />
      <path d="M 56 31 A 29 29 0 0 0 56 89" stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" />
      <path d="M 56 45 A 15 15 0 0 0 56 75" stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" />

      <path d="M 64 16 A 44 44 0 0 1 64 104" stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" />
      <path d="M 64 31 A 29 29 0 0 1 64 89" stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" />
      <path d="M 64 45 A 15 15 0 0 1 64 75" stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" />
    </svg>
  );
}
