/**
 * Stethoscope resting on dark textured granite — drawn in SVG so the
 * hero needs no photo download. Purely decorative.
 */
export function HeroBackdrop({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* granite: fine grain + broad mottling */}
        <filter id="hb-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="7" result="n" />
          <feColorMatrix
            in="n"
            type="matrix"
            values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 -0.12"
          />
        </filter>
        <filter id="hb-mottle" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.006 0.009" numOctaves="4" seed="3" result="m" />
          <feColorMatrix
            in="m"
            type="matrix"
            values="0 0 0 0 0.78  0 0 0 0 0.8  0 0 0 0 0.86  0 0 0 0.9 -0.32"
          />
        </filter>
        <filter id="hb-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="18" />
        </filter>

        <radialGradient id="hb-vignette" cx="50%" cy="45%" r="75%">
          <stop offset="55%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
        </radialGradient>

        {/* polished steel */}
        <linearGradient id="hb-steel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f4f6f8" />
          <stop offset="28%" stopColor="#a9b1ba" />
          <stop offset="52%" stopColor="#eef1f4" />
          <stop offset="78%" stopColor="#7d8791" />
          <stop offset="100%" stopColor="#d6dbe0" />
        </linearGradient>
        <linearGradient id="hb-rim" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a3037" />
          <stop offset="50%" stopColor="#4b545e" />
          <stop offset="100%" stopColor="#1d2228" />
        </linearGradient>
        <radialGradient id="hb-diaphragm" cx="42%" cy="38%" r="70%">
          <stop offset="0%" stopColor="#e4e8ec" />
          <stop offset="45%" stopColor="#c3c9cf" />
          <stop offset="100%" stopColor="#8e969f" />
        </radialGradient>
        <linearGradient id="hb-tube" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#14181d" />
          <stop offset="100%" stopColor="#262c33" />
        </linearGradient>
      </defs>

      {/* stone */}
      <rect width="1600" height="900" fill="#2c343d" />
      <rect width="1600" height="900" filter="url(#hb-mottle)" opacity="0.55" />
      <rect width="1600" height="900" filter="url(#hb-grain)" opacity="0.35" />
      <path
        d="M980 0c-18 90 40 160 20 250s-90 140-60 240 120 150 110 260-60 110-50 150"
        fill="none"
        stroke="#1b2026"
        strokeOpacity="0.55"
        strokeWidth="2"
      />

      {/* shadows */}
      <g filter="url(#hb-shadow)" opacity="0.65">
        <circle cx="470" cy="360" r="250" fill="#0b0e11" />
        <path
          d="M640 500C760 700 980 790 1180 720s300-260 260-470"
          fill="none"
          stroke="#0b0e11"
          strokeWidth="70"
          strokeLinecap="round"
        />
      </g>

      {/* tubing: from chest piece, sweeping round to the headset */}
      <path
        d="M610 470C700 650 880 790 1110 760S1470 560 1450 330 1300 60 1180 40"
        fill="none"
        stroke="url(#hb-tube)"
        strokeWidth="54"
        strokeLinecap="round"
      />
      <path
        d="M610 470C700 650 880 790 1110 760S1470 560 1450 330 1300 60 1180 40"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.1"
        strokeWidth="8"
        strokeLinecap="round"
        transform="translate(-10 -12)"
      />

      {/* headset (binaurals) and ear tips */}
      <g strokeLinecap="round" fill="none">
        <path d="M1180 40c-60-10-120 10-150 60" stroke="url(#hb-steel)" strokeWidth="16" />
        <path d="M1180 40c40-40 110-60 170-40" stroke="url(#hb-steel)" strokeWidth="16" />
      </g>
      <ellipse cx="1028" cy="112" rx="34" ry="26" fill="#111418" transform="rotate(-30 1028 112)" />
      <ellipse cx="1360" cy="6" rx="34" ry="26" fill="#111418" transform="rotate(15 1360 6)" />

      {/* stem joining tube and chest piece */}
      <path d="M560 420l70 72" stroke="url(#hb-steel)" strokeWidth="34" strokeLinecap="round" />

      {/* chest piece */}
      <circle cx="470" cy="330" r="214" fill="url(#hb-rim)" />
      <circle cx="470" cy="330" r="200" fill="url(#hb-steel)" />
      <circle cx="470" cy="330" r="168" fill="#2a3036" />
      <circle cx="470" cy="330" r="156" fill="url(#hb-diaphragm)" />
      <circle cx="470" cy="330" r="156" fill="none" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="2" />
      <circle cx="470" cy="330" r="118" fill="none" stroke="#7a838c" strokeOpacity="0.35" strokeWidth="1.5" />
      <circle cx="470" cy="330" r="22" fill="#9aa2aa" />
      <circle cx="470" cy="330" r="10" fill="#c9cfd5" />
      {/* specular highlight */}
      <path d="M350 230a170 170 0 0 1 150-70" fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="10" strokeLinecap="round" />

      <rect width="1600" height="900" fill="url(#hb-vignette)" />
    </svg>
  );
}
