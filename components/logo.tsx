export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 160 140"
      className={className}
      aria-hidden="true"
    >
      <g transform="translate(20, 20) skewX(-15)">
        <rect x="0" y="0" width="34" height="98" fill="#1A3677" />
        <rect x="42" y="0" width="22" height="98" fill="#43589D" />
        <rect x="72" y="0" width="12" height="98" fill="#98A7D4" />
      </g>
    </svg>
  )
}

export function LogoFull({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="25 25 575 115"
      className={className}
      role="img"
      aria-label="INDOLOG Logistics"
    >
      {/* Main title */}
      <text
        x="35"
        y="91"
        fontSize="62"
        letterSpacing="1"
        fontFamily="'Arial Black', Arial, sans-serif"
        fontWeight={900}
        fontStyle="italic"
        fill="#1A3677"
      >
        INDOLOG
      </text>

      {/* Lines beneath the title ending at x="200" */}
      <g fill="none" stroke="#233B7C" strokeWidth="0.8" opacity="0.85">
        {[104, 108.5, 113, 117.5, 122, 126.5].map((y) => (
          <line key={y} x1="38" y1={y} x2="190" y2={y} />
        ))}
      </g>

      {/* Subtitle starting exactly where the lines end (x="200") */}
      <text
        x="195"
        y="125"
        fontSize="24"
        letterSpacing="4"
        fontFamily="'Times New Roman', Times, serif"
        fill="#333333"
        fontWeight={300}
      >
        LOGISTICS
      </text>

      {/* Slanted bars */}
      <g transform="translate(410, 35) skewX(-15)">
        <rect x="0" y="0" width="34" height="98" fill="#1A3677" />
        <rect x="42" y="0" width="22" height="98" fill="#43589D" />
        <rect x="72" y="0" width="12" height="98" fill="#98A7D4" />
      </g>
    </svg>
  )
}