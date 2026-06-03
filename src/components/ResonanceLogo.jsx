export default function ResonanceLogo({ size = 28, className = '' }) {
  const color = "hsl(199,89%,48%)";
  const sw = 6;

  // Each arc: left side curves LEFT (open right), right side curves RIGHT (open left)
  // Gap in the center top and bottom via the arc endpoints stopping short of 50,0 / 50,100

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/*
        Left arcs: center-point is (50,50), arcs go from top-left to bottom-left
        Each arc starts at a point to the LEFT of center-top and ends LEFT of center-bottom
        leaving a vertical gap at x=50
      */}

      {/* Outer left arc — radius ~42, gap ~8px either side of center */}
      <path
        d="M 42 8 A 42 42 0 0 0 42 92"
        stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none"
      />
      {/* Mid left arc — radius ~28 */}
      <path
        d="M 38 22 A 28 28 0 0 0 38 78"
        stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none"
      />
      {/* Inner left arc — radius ~14 */}
      <path
        d="M 36 36 A 14 14 0 0 0 36 64"
        stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none"
      />

      {/* Outer right arc */}
      <path
        d="M 58 8 A 42 42 0 0 1 58 92"
        stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none"
      />
      {/* Mid right arc */}
      <path
        d="M 62 22 A 28 28 0 0 1 62 78"
        stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none"
      />
      {/* Inner right arc */}
      <path
        d="M 64 36 A 14 14 0 0 1 64 64"
        stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none"
      />
    </svg>
  );
}