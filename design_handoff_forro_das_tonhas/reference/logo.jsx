/* ============================================================
   FORRÓ DAS TONHAS — Logo lockups
   3 versões: principal, badge/selo, monograma
   ============================================================ */

// PRIMARY LOCKUP — wordmark com sanfona + estrelas
function LogoPrimary({ scale = 1, withBg = true }) {
  const W = 540 * scale;
  const H = 420 * scale;
  return (
    <div style={{
      width: W, height: H,
      background: withBg ? 'var(--cream)' : 'transparent',
      position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24 * scale,
    }} className={withBg ? 'paper-bg' : ''}>
      {/* Estrelas decorativas */}
      <div style={{ position: 'absolute', top: 24 * scale, left: 32 * scale }}>
        <Star size={28 * scale} fill="var(--yellow)" />
      </div>
      <div style={{ position: 'absolute', top: 36 * scale, right: 44 * scale }}>
        <Sparkle size={22 * scale} fill="var(--indigo)" />
      </div>
      <div style={{ position: 'absolute', bottom: 30 * scale, left: 40 * scale }}>
        <Sparkle size={18 * scale} fill="var(--green)" />
      </div>
      <div style={{ position: 'absolute', bottom: 24 * scale, right: 28 * scale }}>
        <Star size={24 * scale} fill="var(--red)" rotate={15} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 * scale }}>
        {/* Main wordmark */}
        <div style={{ textAlign: 'center', lineHeight: 0.88 }}>
          <div className="t-display" style={{
            fontSize: 86 * scale,
            color: 'var(--green)',
            letterSpacing: '-0.02em',
            WebkitTextStroke: `${2.5 * scale}px var(--ink)`,
            paintOrder: 'stroke fill',
          }}>
            FORRÓ
          </div>
          <div className="t-display" style={{
            fontSize: 26 * scale,
            color: 'var(--ink)',
            letterSpacing: '0.18em',
            margin: `${4 * scale}px 0`,
          }}>
            ❖ DAS ❖
          </div>
          <div className="t-display" style={{
            fontSize: 86 * scale,
            color: 'var(--green)',
            letterSpacing: '-0.02em',
            WebkitTextStroke: `${2.5 * scale}px var(--ink)`,
            paintOrder: 'stroke fill',
          }}>
            TONHAS
          </div>
        </div>

        {/* Sanfona small */}
        <div style={{ marginTop: 6 * scale }}>
          <Sanfona width={70 * scale} />
        </div>

        {/* Tagline */}
        <div className="t-script" style={{
          fontSize: 18 * scale,
          color: 'var(--red)',
          transform: 'rotate(-3deg)',
          marginTop: 2 * scale,
        }}>
          pé de serra · raiz · Olinda
        </div>
      </div>
    </div>
  );
}

// COMPACT WORDMARK — single line, for headers
function LogoWordmark({ size = 1, color = 'var(--green)', strokeColor = 'var(--ink)' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 * size }}>
      <Sanfona width={36 * size} color="var(--indigo)" />
      <div style={{ lineHeight: 0.9 }}>
        <div className="t-display" style={{
          fontSize: 26 * size,
          color: color,
          WebkitTextStroke: `${1.5 * size}px ${strokeColor}`,
          paintOrder: 'stroke fill',
          letterSpacing: '-0.01em',
        }}>
          FORRÓ DAS
        </div>
        <div className="t-display" style={{
          fontSize: 26 * size,
          color: color,
          WebkitTextStroke: `${1.5 * size}px ${strokeColor}`,
          paintOrder: 'stroke fill',
          letterSpacing: '-0.01em',
        }}>
          TONHAS
        </div>
      </div>
    </div>
  );
}

// BADGE / SELO — formato sunburst (estilo "Reserva sua mesa")
function LogoBadge({ size = 220 }) {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <Sunburst size={size} points={16} fill="var(--yellow)" stroke="var(--ink)" strokeWidth={2.5}>
        <div style={{ textAlign: 'center', transform: 'rotate(-6deg)' }}>
          <div className="t-display" style={{
            fontSize: size * 0.10,
            color: 'var(--ink)',
            letterSpacing: '0.04em',
            lineHeight: 0.95,
          }}>
            FORRÓ
          </div>
          <div className="t-display" style={{
            fontSize: size * 0.07,
            color: 'var(--green)',
            letterSpacing: '0.1em',
            margin: `${size * 0.01}px 0`,
            WebkitTextStroke: `1px var(--ink)`,
            paintOrder: 'stroke fill',
          }}>
            DAS
          </div>
          <div className="t-display" style={{
            fontSize: size * 0.10,
            color: 'var(--ink)',
            letterSpacing: '0.04em',
            lineHeight: 0.95,
          }}>
            TONHAS
          </div>
          <div style={{
            fontFamily: 'var(--font-script)',
            fontSize: size * 0.055,
            color: 'var(--red)',
            marginTop: size * 0.025,
          }}>
            Olinda · PE
          </div>
        </div>
      </Sunburst>
    </div>
  );
}

// MONOGRAMA — F+T entrelaçados
function LogoMonogram({ size = 120 }) {
  return (
    <div style={{
      width: size, height: size,
      background: 'var(--green)',
      border: `${size * 0.025}px solid var(--ink)`,
      borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
      boxShadow: `0 ${size * 0.04}px 0 0 var(--ink)`,
    }}>
      <div className="t-display" style={{
        fontSize: size * 0.65,
        color: 'var(--cream-warm)',
        WebkitTextStroke: `${size * 0.015}px var(--ink)`,
        paintOrder: 'stroke fill',
        lineHeight: 0.85,
        letterSpacing: '-0.05em',
      }}>
        FT
      </div>
      {/* Tiny stars on the perimeter */}
      <div style={{ position: 'absolute', top: -size * 0.06, right: size * 0.1 }}>
        <Star size={size * 0.16} fill="var(--yellow)" />
      </div>
      <div style={{ position: 'absolute', bottom: size * 0.08, left: -size * 0.04 }}>
        <Sparkle size={size * 0.12} fill="var(--indigo)" />
      </div>
    </div>
  );
}

Object.assign(window, { LogoPrimary, LogoWordmark, LogoBadge, LogoMonogram });
