export default function ResonanceLogo({ size = 30, className = '' }) {
  const color = "hsl(199,89%,48%)";
  const sw = 5.5;
  // Center is 60,60 in a 120x120 viewBox — gives enough room on all sides
  // Left arcs: semicircles opening RIGHT, centered at (60,60)
  // Right arcs: semicircles opening LEFT, centered at (60,60)
  // Small gap at center: arcs stop ~4px short of the vertical axis

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* LEFT arcs — curve opens to the right, endpoints near vertical center */}
      {/* Outer: r=44, endpoints at x=56 (4px left of center) */}
      <path d="M 56 16 A 44 44 0 0 0 56 104" stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none"/>
      {/* Mid: r=29 */}
      <path d="M 56 31 A 29 29 0 0 0 56 89"  stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none"/>
      {/* Inner: r=15 */}
      <path d="M 56 45 A 15 15 0 0 0 56 75"  stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none"/>

      {/* RIGHT arcs — mirror */}
      <path d="M 64 16 A 44 44 0 0 1 64 104" stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none"/>
      <path d="M 64 31 A 29 29 0 0 1 64 89"  stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none"/>
      <path d="M 64 45 A 15 15 0 0 1 64 75"  stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none"/>
    </svg>
  );
}