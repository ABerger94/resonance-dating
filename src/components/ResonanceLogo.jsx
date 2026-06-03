export default function ResonanceLogo({ size = 28, className = '' }) {
  // Concentric arc pairs — left side opens right, right side opens left
  // Each arc is a semicircle with a gap at top and bottom center
  const color = "hsl(199,89%,48%)";
  const sw = 6.5;
  const lc = "round";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* LEFT side arcs — open on the right, gap top+bottom */}
      {/* Outer */}
      <path d="M50 10 A40 40 0 0 0 50 90" stroke={color} strokeWidth={sw} strokeLinecap={lc} fill="none"/>
      {/* Mid */}
      <path d="M50 22 A28 28 0 0 0 50 78" stroke={color} strokeWidth={sw} strokeLinecap={lc} fill="none"/>
      {/* Inner */}
      <path d="M50 34 A16 16 0 0 0 50 66" stroke={color} strokeWidth={sw} strokeLinecap={lc} fill="none"/>

      {/* RIGHT side arcs — open on the left, gap top+bottom */}
      {/* Outer */}
      <path d="M50 10 A40 40 0 0 1 50 90" stroke={color} strokeWidth={sw} strokeLinecap={lc} fill="none"/>
      {/* Mid */}
      <path d="M50 22 A28 28 0 0 1 50 78" stroke={color} strokeWidth={sw} strokeLinecap={lc} fill="none"/>
      {/* Inner */}
      <path d="M50 34 A16 16 0 0 1 50 66" stroke={color} strokeWidth={sw} strokeLinecap={lc} fill="none"/>
    </svg>
  );
}