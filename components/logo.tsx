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
        y="95"
        fontSize="62"
        letterSpacing="1"
        fontFamily="'Arial Black', Arial, sans-serif"
        fontWeight={900}
        fontStyle="italic"
        fill="#1A3677"
      >
        INDOLOG
      </text>

      {/* Lines beneath the title */}
      <g fill="none" stroke="#233B7C" strokeWidth="0.8" opacity="0.85">
        {[108, 112.5, 117, 121.5, 126, 130.5].map((y) => (
          <line key={y} x1="38" y1={y} x2="228" y2={y} />
        ))}
      </g>

      {/* Subtitle */}
      <text
        x="240"
        y="132"
        fontSize="22.5"
        letterSpacing="4.5"
        fontFamily="'Times New Roman', Times, serif"
        fill="#333333"
      >
        LOGISTICS
      </text>

      {/* Slanted bars */}
      <g transform="translate(503, 30) skewX(-15)">
        <rect x="0" y="0" width="34" height="98" fill="#1A3677" />
        <rect x="42" y="0" width="22" height="98" fill="#43589D" />
        <rect x="72" y="0" width="12" height="98" fill="#98A7D4" />
      </g>
    </svg>
  )
}