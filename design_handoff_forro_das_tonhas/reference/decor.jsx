/* ============================================================
   FORRÓ DAS TONHAS — Decorative SVG components
   Bandeirinhas, estrelas, sunbursts, diamantes, sanfona
   ============================================================ */

// Junina garland — alternating flag colors
function Bandeirinhas({ count = 8, colors, height = 64, sway = false, style = {} }) {
  const palette = colors || ['var(--indigo)', 'var(--yellow)', 'var(--green)', 'var(--red)'];
  const segW = 100;
  const totalW = count * segW;
  return (
    <svg
      viewBox={`0 0 ${totalW} ${height}`}
      preserveAspectRatio="none"
      style={{ width: '100%', height, display: 'block', ...style }}
      aria-hidden="true"
    >
      {/* String */}
      <path
        d={`M 0 6 Q ${totalW / 2} ${height * 0.55} ${totalW} 6`}
        fill="none"
        stroke="var(--ink)"
        strokeWidth="2"
      />
      {Array.from({ length: count }).map((_, i) => {
        const t = (i + 0.5) / count;
        // Approximate y on the curve
        const y = 6 + Math.sin(t * Math.PI) * (height * 0.5 - 6);
        const x = i * segW + segW * 0.15;
        const color = palette[i % palette.length];
        const w = segW * 0.7;
        const flagH = height * 0.55;
        return (
          <g key={i} transform={`translate(${x}, ${y}) rotate(${(t - 0.5) * 18})`}>
            <path
              d={`M 0 0 L ${w} 0 L ${w / 2} ${flagH} Z`}
              fill={color}
              stroke="var(--ink)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </g>
        );
      })}
    </svg>
  );
}

// 5-point star with optional stroke
function Star({ size = 32, fill = 'var(--yellow)', stroke = 'var(--ink)', strokeWidth = 2, rotate = 0, style = {} }) {
  const r = 50;
  const points = [];
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.42;
    points.push(`${50 + rad * Math.cos(angle)},${50 + rad * Math.sin(angle)}`);
  }
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ transform: `rotate(${rotate}deg)`, ...style }} aria-hidden="true">
      <polygon points={points.join(' ')} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" />
    </svg>
  );
}

// 4-point sparkle (the diamond/cross star used in poster between BRASIL · MARROCOS)
function Sparkle({ size = 24, fill = 'var(--indigo)', style = {} }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={style} aria-hidden="true">
      <path
        d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z"
        fill={fill}
      />
    </svg>
  );
}

// Sunburst (the RESERVA SUA MESA badge shape)
function Sunburst({ size = 160, points = 14, fill = 'var(--yellow)', stroke = 'var(--ink)', strokeWidth = 2, style = {}, children }) {
  const path = [];
  const cx = 50, cy = 50;
  const rOuter = 50;
  const rInner = 36;
  for (let i = 0; i < points * 2; i++) {
    const angle = (Math.PI / points) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? rOuter : rInner;
    const x = cx + rad * Math.cos(angle);
    const y = cy + rad * Math.sin(angle);
    path.push(`${i === 0 ? 'M' : 'L'}${x},${y}`);
  }
  path.push('Z');
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-block', ...style }}>
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ position: 'absolute', inset: 0 }} aria-hidden="true">
        <path d={path.join(' ')} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" />
      </svg>
      <div style={{
        position: 'absolute',
        inset: '20%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}>
        {children}
      </div>
    </div>
  );
}

// Sun/star ray cluster (the bottom-left sun on poster)
function SunRays({ size = 200, fill = 'var(--yellow)', stroke = 'var(--ink)', rays = 8, style = {} }) {
  const segments = [];
  for (let i = 0; i < rays; i++) {
    const a = (Math.PI * 2 / rays) * i;
    const x1 = 50 + 20 * Math.cos(a);
    const y1 = 50 + 20 * Math.sin(a);
    const x2 = 50 + 50 * Math.cos(a);
    const y2 = 50 + 50 * Math.sin(a);
    const ax = 50 + 45 * Math.cos(a + 0.18);
    const ay = 50 + 45 * Math.sin(a + 0.18);
    const bx = 50 + 45 * Math.cos(a - 0.18);
    const by = 50 + 45 * Math.sin(a - 0.18);
    segments.push(
      <path key={i}
        d={`M ${x1} ${y1} L ${ax} ${ay} L ${x2} ${y2} L ${bx} ${by} Z`}
        fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinejoin="round"
      />
    );
  }
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={style} aria-hidden="true">
      {segments}
      <circle cx="50" cy="50" r="16" fill={fill} stroke={stroke} strokeWidth="2" />
    </svg>
  );
}

// Sanfona (accordion) — simplified line-art SVG in indigo
function Sanfona({ width = 220, color = 'var(--indigo)', style = {} }) {
  return (
    <svg viewBox="0 0 220 240" width={width} style={{ display: 'block', ...style }} aria-hidden="true">
      <g fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Left keyboard box */}
        <rect x="14" y="46" width="52" height="148" rx="6" />
        {/* Buttons grid (left side) */}
        {[0,1,2,3,4,5,6].map(r => (
          [0,1,2,3].map(c => (
            <circle key={`${r}-${c}`} cx={24 + c * 11} cy={62 + r * 18} r="3" fill={color} />
          ))
        )).flat()}

        {/* Bellows (middle pleats) — zigzag */}
        <path d="M 66 46 L 80 60 L 66 74 L 80 88 L 66 102 L 80 116 L 66 130 L 80 144 L 66 158 L 80 172 L 66 186 L 80 194" />
        <path d="M 154 46 L 140 60 L 154 74 L 140 88 L 154 102 L 140 116 L 154 130 L 140 144 L 154 158 L 140 172 L 154 186 L 140 194" />
        {/* Top + bottom bellow caps */}
        <line x1="66" y1="46" x2="154" y2="46" />
        <line x1="80" y1="194" x2="140" y2="194" />

        {/* Right side: piano keyboard */}
        <rect x="154" y="46" width="52" height="148" rx="6" />
        {/* White keys (horizontal lines) */}
        {[0,1,2,3,4,5,6,7,8,9].map(i => (
          <line key={i} x1="156" y1={56 + i * 14} x2="204" y2={56 + i * 14} />
        ))}
        {/* Black keys */}
        {[0,1,2,3,4,5,6,7].map(i => (
          <rect key={i} x="172" y={50 + i * 18} width="18" height="9" fill={color} />
        ))}

        {/* Strap */}
        <path d="M 40 46 Q 40 20 110 14 Q 180 20 180 46" strokeWidth="3" />

        {/* Top accent dots */}
        <circle cx="40" cy="40" r="3" fill={color} />
        <circle cx="180" cy="40" r="3" fill={color} />

        {/* A few sound waves emanating right */}
        <path d="M 214 80 Q 224 90 214 100" />
        <path d="M 220 70 Q 234 90 220 110" opacity="0.6" />
      </g>
    </svg>
  );
}

// Decorative "Tonhas" — silhouette of two dancing couples (simplified)
// Used as a placeholder hero illustration when sanfona alone is too plain.
function DancingCouple({ width = 220, color = 'var(--indigo)', style = {} }) {
  return (
    <svg viewBox="0 0 220 240" width={width} style={{ display: 'block', ...style }} aria-hidden="true">
      <g fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Man (left) */}
        <circle cx="70" cy="48" r="16" />
        {/* Chapéu de couro */}
        <path d="M 50 38 Q 70 18 90 38 L 90 42 L 50 42 Z" fill={color} />
        {/* Body */}
        <path d="M 70 64 L 70 130" />
        {/* Arm out (to partner) */}
        <path d="M 70 80 L 110 88" />
        {/* Other arm */}
        <path d="M 70 78 L 50 100" />
        {/* Legs */}
        <path d="M 70 130 L 56 180 L 50 220" />
        <path d="M 70 130 L 86 180 L 96 220" />

        {/* Woman (right) */}
        <circle cx="150" cy="50" r="14" />
        {/* Hair bun */}
        <circle cx="150" cy="36" r="6" fill={color} />
        <path d="M 150 64 L 150 100" />
        {/* Arm to partner */}
        <path d="M 150 82 L 110 88" />
        {/* Other arm raised */}
        <path d="M 150 80 L 172 60" />
        {/* Dress (triangle) */}
        <path d="M 132 100 L 110 200 L 190 200 L 168 100 Z" fill={color} fillOpacity="0.08" />
        {/* Legs */}
        <path d="M 140 200 L 134 224" />
        <path d="M 160 200 L 166 224" />
      </g>
    </svg>
  );
}

// Soft cloud shape (for backgrounds)
function Cloud({ width = 80, fill = 'var(--cream-deep)', style = {} }) {
  return (
    <svg viewBox="0 0 100 50" width={width} style={style} aria-hidden="true">
      <path
        d="M 20 40 Q 5 40 5 28 Q 5 18 18 18 Q 20 8 32 8 Q 44 8 48 18 Q 60 12 68 22 Q 82 20 85 32 Q 95 32 95 40 Z"
        fill={fill}
      />
    </svg>
  );
}

Object.assign(window, { Bandeirinhas, Star, Sparkle, Sunburst, SunRays, Sanfona, DancingCouple, Cloud });
