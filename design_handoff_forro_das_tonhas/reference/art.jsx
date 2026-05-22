/* ============================================================
   FORRÓ DAS TONHAS — Artes de divulgação
   Post Feed (1:1, 1080x1080) + Story (9:16, 1080x1920) + Flyer (A4)
   ============================================================ */

// =================== POST FEED (1080x1080) ===================
function ArtFeed({ scale = 1 }) {
  const S = scale;
  return (
    <div style={{
      width: 1080 * S, height: 1080 * S,
      background: 'var(--cream)',
      position: 'relative', overflow: 'hidden',
    }} className="paper-bg">
      {/* Top bandeirinhas */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 140 * S }}>
        <Bandeirinhas count={7} height={140 * S} />
      </div>

      {/* Floating stars */}
      <div style={{ position: 'absolute', top: 200 * S, left: 70 * S }}>
        <Star size={56 * S} fill="var(--yellow)" rotate={-15} />
      </div>
      <div style={{ position: 'absolute', top: 240 * S, right: 100 * S }}>
        <Sparkle size={42 * S} fill="var(--indigo)" />
      </div>
      <div style={{ position: 'absolute', top: 470 * S, left: 60 * S }}>
        <Sparkle size={30 * S} fill="var(--green)" />
      </div>

      {/* Sun bottom-left */}
      <div style={{ position: 'absolute', bottom: -80 * S, left: -80 * S }}>
        <SunRays size={340 * S} fill="var(--yellow)" />
      </div>
      {/* Star bottom-right */}
      <div style={{ position: 'absolute', bottom: 140 * S, right: 60 * S }}>
        <Star size={90 * S} fill="var(--red)" rotate={20} />
      </div>

      {/* Top tagline */}
      <div style={{
        position: 'absolute', top: 165 * S, left: 0, right: 0,
        textAlign: 'center',
        fontFamily: 'var(--font-display-cond)',
        fontSize: 24 * S, color: 'var(--indigo)',
        letterSpacing: '0.4em',
      }}>
        ✦ VENDA OFICIAL · INGRESSOS ANTECIPADOS ✦
      </div>

      {/* Main title */}
      <div style={{
        position: 'absolute', top: 215 * S, left: 0, right: 0,
        textAlign: 'center',
      }}>
        <div className="t-display" style={{
          fontSize: 200 * S,
          color: 'var(--green)',
          WebkitTextStroke: `${4 * S}px var(--ink)`,
          paintOrder: 'stroke fill',
          lineHeight: 0.85,
        }}>
          FORRÓ
        </div>
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24 * S,
          margin: `${10 * S}px 0`,
        }}>
          <span className="t-display" style={{ fontSize: 60 * S, color: 'var(--ink)' }}>DAS</span>
        </div>
        <div className="t-display" style={{
          fontSize: 200 * S,
          color: 'var(--green)',
          WebkitTextStroke: `${4 * S}px var(--ink)`,
          paintOrder: 'stroke fill',
          lineHeight: 0.85,
        }}>
          TONHAS
        </div>
      </div>

      {/* Sanfona overlay (right side) */}
      <div style={{ position: 'absolute', top: 360 * S, right: 90 * S, opacity: 0.92, zIndex: 1 }}>
        <Sanfona width={340 * S} color="var(--indigo)" />
      </div>

      {/* Bottom info block */}
      <div style={{
        position: 'absolute', bottom: 80 * S, left: 0, right: 0,
        textAlign: 'center', zIndex: 2,
      }}>
        <div className="t-display-cond" style={{ fontSize: 56 * S, color: 'var(--indigo)', letterSpacing: '0.04em' }}>
          BRASIL <span style={{ color: 'var(--yellow)', WebkitTextStroke: `${2 * S}px var(--ink)`, paintOrder: 'stroke fill' }}>✦</span> MARROCOS
        </div>
        <div className="t-display-cond" style={{ fontSize: 22 * S, color: 'var(--ink)', letterSpacing: '0.2em', marginTop: 6 * S }}>
          QUINTETO PÉ DE SERRA · TRANSMISSÃO AO VIVO
        </div>

        <div style={{
          marginTop: 30 * S,
          display: 'inline-flex', alignItems: 'center', gap: 28 * S,
          background: 'var(--ink)', color: 'var(--cream-warm)',
          padding: `${20 * S}px ${36 * S}px`,
          borderRadius: 999, border: `${3 * S}px solid var(--ink)`,
        }}>
          <span className="t-display" style={{ fontSize: 52 * S, color: 'var(--yellow)' }}>13/06</span>
          <span style={{ width: 2, height: 50 * S, background: 'var(--cream-warm)', opacity: 0.4 }}></span>
          <span className="t-display-cond" style={{ fontSize: 24 * S, letterSpacing: '0.06em' }}>16H ÀS 22H</span>
          <span style={{ width: 2, height: 50 * S, background: 'var(--cream-warm)', opacity: 0.4 }}></span>
          <span className="t-display-cond" style={{ fontSize: 24 * S, letterSpacing: '0.06em' }}>OLINDA · PE</span>
        </div>
      </div>

      {/* RESERVA SUA MESA badge - top right corner */}
      <div style={{ position: 'absolute', top: 110 * S, right: 30 * S, transform: 'rotate(12deg)' }}>
        <Sunburst size={170 * S} points={14} fill="var(--yellow)">
          <div style={{ textAlign: 'center' }}>
            <div className="t-script" style={{ fontSize: 22 * S, color: 'var(--red)', lineHeight: 1.1 }}>
              reserva<br />sua<br />mesa!
            </div>
          </div>
        </Sunburst>
      </div>
    </div>
  );
}

// =================== STORY (1080x1920) ===================
function ArtStory({ scale = 1 }) {
  const S = scale;
  return (
    <div style={{
      width: 1080 * S, height: 1920 * S,
      background: 'var(--cream)',
      position: 'relative', overflow: 'hidden',
    }} className="paper-bg">
      {/* Top bandeirinhas */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 160 * S }}>
        <Bandeirinhas count={5} height={160 * S} />
      </div>

      {/* Decorative stars */}
      <div style={{ position: 'absolute', top: 220 * S, left: 80 * S }}>
        <Star size={62 * S} fill="var(--yellow)" rotate={-12} />
      </div>
      <div style={{ position: 'absolute', top: 280 * S, right: 90 * S }}>
        <Sparkle size={50 * S} fill="var(--indigo)" />
      </div>

      {/* Top label */}
      <div style={{
        position: 'absolute', top: 195 * S, left: 0, right: 0,
        textAlign: 'center',
        fontFamily: 'var(--font-display-cond)',
        fontSize: 26 * S, color: 'var(--indigo)',
        letterSpacing: '0.4em',
      }}>
        ✦ INGRESSOS ABERTOS ✦
      </div>

      {/* Main title */}
      <div style={{
        position: 'absolute', top: 260 * S, left: 0, right: 0,
        textAlign: 'center',
      }}>
        <div className="t-display" style={{
          fontSize: 230 * S,
          color: 'var(--green)',
          WebkitTextStroke: `${5 * S}px var(--ink)`,
          paintOrder: 'stroke fill',
          lineHeight: 0.85,
        }}>
          FORRÓ
        </div>
        <div className="t-display" style={{ fontSize: 72 * S, color: 'var(--ink)', margin: `${8 * S}px 0` }}>
          DAS
        </div>
        <div className="t-display" style={{
          fontSize: 230 * S,
          color: 'var(--green)',
          WebkitTextStroke: `${5 * S}px var(--ink)`,
          paintOrder: 'stroke fill',
          lineHeight: 0.85,
        }}>
          TONHAS
        </div>
      </div>

      {/* Sanfona center */}
      <div style={{ position: 'absolute', top: 920 * S, left: '50%', transform: 'translateX(-50%)' }}>
        <Sanfona width={460 * S} color="var(--indigo)" />
      </div>

      {/* Match line */}
      <div style={{
        position: 'absolute', top: 1380 * S, left: 0, right: 0,
        textAlign: 'center',
      }}>
        <div className="t-display-cond" style={{ fontSize: 72 * S, color: 'var(--indigo)', letterSpacing: '0.04em' }}>
          BRASIL <span style={{ color: 'var(--yellow)', WebkitTextStroke: `${3 * S}px var(--ink)`, paintOrder: 'stroke fill' }}>✦</span> MARROCOS
        </div>
        <div className="t-display-cond" style={{ fontSize: 30 * S, color: 'var(--ink)', letterSpacing: '0.2em', marginTop: 8 * S }}>
          QUINTETO PÉ DE SERRA
        </div>
      </div>

      {/* Date + venue block */}
      <div style={{
        position: 'absolute', bottom: 350 * S, left: 60 * S, right: 60 * S,
        background: 'var(--ink)', color: 'var(--cream-warm)',
        borderRadius: 32 * S, padding: `${36 * S}px ${30 * S}px`,
        textAlign: 'center',
      }}>
        <div className="t-display" style={{ fontSize: 130 * S, color: 'var(--yellow)', lineHeight: 0.9 }}>13 JUN</div>
        <div className="t-display-cond" style={{ fontSize: 32 * S, letterSpacing: '0.1em', marginTop: 8 * S, color: 'var(--cream-warm)' }}>
          SÁB · 16H ÀS 22H
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 24 * S, marginTop: 14 * S, opacity: 0.85 }}>
          Beco do Alto · Olinda · PE
        </div>
      </div>

      {/* Swipe up CTA */}
      <div style={{
        position: 'absolute', bottom: 160 * S, left: 0, right: 0,
        textAlign: 'center',
      }}>
        <div className="t-display-cond" style={{
          fontSize: 44 * S, color: 'var(--green)',
          WebkitTextStroke: `${2 * S}px var(--ink)`, paintOrder: 'stroke fill',
          letterSpacing: '0.04em',
        }}>
          DESLIZA PRA COMPRAR
        </div>
        <div style={{ marginTop: 14 * S, fontFamily: 'var(--font-display-cond)', fontSize: 22 * S, color: 'var(--indigo)', letterSpacing: '0.3em' }}>
          ↑ ↑ ↑
        </div>
      </div>

      {/* Sun bottom-left + Sparkle */}
      <div style={{ position: 'absolute', bottom: -120 * S, left: -100 * S }}>
        <SunRays size={400 * S} fill="var(--yellow)" />
      </div>

      {/* Sticker top right */}
      <div style={{ position: 'absolute', top: 140 * S, right: 30 * S, transform: 'rotate(12deg)' }}>
        <Sunburst size={220 * S} points={14} fill="var(--red)">
          <div style={{ textAlign: 'center' }}>
            <div className="t-script" style={{ fontSize: 32 * S, color: 'var(--cream-warm)', lineHeight: 1.05 }}>
              últimos<br />ingressos!
            </div>
          </div>
        </Sunburst>
      </div>
    </div>
  );
}

// =================== STORY VARIANT — Lotes ===================
function ArtStoryLotes({ scale = 1 }) {
  const S = scale;
  return (
    <div style={{
      width: 1080 * S, height: 1920 * S,
      background: 'var(--green)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Paper overlay */}
      <div style={{
        position: 'absolute', inset: 30 * S,
        background: 'var(--cream)',
        border: `${5 * S}px solid var(--ink)`,
        borderRadius: 24 * S,
      }} className="paper-bg" />

      {/* Top */}
      <div style={{ position: 'absolute', top: 70 * S, left: 0, right: 0, textAlign: 'center' }}>
        <div className="t-display-cond" style={{ fontSize: 28 * S, color: 'var(--indigo)', letterSpacing: '0.4em' }}>
          ✦ FORRÓ DAS TONHAS ✦
        </div>
        <div className="t-display" style={{
          fontSize: 130 * S, color: 'var(--green)',
          WebkitTextStroke: `${4 * S}px var(--ink)`, paintOrder: 'stroke fill',
          marginTop: 20 * S, lineHeight: 0.9,
        }}>
          LOTES<br />ABERTOS
        </div>
      </div>

      {/* Tickets list as big stickers */}
      <div style={{
        position: 'absolute', top: 600 * S, left: 100 * S, right: 100 * S,
        display: 'flex', flexDirection: 'column', gap: 28 * S,
      }}>
        {[
          { tag: 'PROMOCIONAL', price: 30, color: 'var(--green)', tilt: -2 },
          { tag: '2º LOTE', price: 45, color: 'var(--indigo)', tilt: 1.5 },
          { tag: 'MESA × 4', price: 250, color: 'var(--red)', tilt: -1 },
        ].map((tk, i) => (
          <div key={i} style={{
            background: tk.color, color: 'var(--cream-warm)',
            border: `${4 * S}px solid var(--ink)`,
            borderRadius: 24 * S,
            padding: `${24 * S}px ${36 * S}px`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            transform: `rotate(${tk.tilt}deg)`,
            boxShadow: `0 ${8 * S}px 0 0 var(--ink)`,
          }}>
            <div className="t-display-cond" style={{ fontSize: 56 * S, letterSpacing: '0.04em' }}>{tk.tag}</div>
            <div className="t-display" style={{
              fontSize: 72 * S, color: 'var(--yellow)',
              WebkitTextStroke: `${2 * S}px var(--ink)`, paintOrder: 'stroke fill',
              lineHeight: 1,
            }}>
              R${tk.price}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div style={{
        position: 'absolute', bottom: 220 * S, left: 0, right: 0, textAlign: 'center',
      }}>
        <div className="t-display-cond" style={{
          fontSize: 50 * S, color: 'var(--red)',
          letterSpacing: '0.04em',
        }}>
          DESLIZA PRA GARANTIR ↑
        </div>
        <div className="t-script" style={{
          fontSize: 36 * S, color: 'var(--indigo)',
          marginTop: 16 * S, transform: 'rotate(-2deg)', display: 'inline-block',
        }}>
          13 de junho · Beco do Alto · Olinda
        </div>
      </div>

      {/* Decorative */}
      <div style={{ position: 'absolute', top: 530 * S, left: 80 * S }}>
        <Star size={70 * S} fill="var(--yellow)" rotate={-15} />
      </div>
      <div style={{ position: 'absolute', top: 530 * S, right: 80 * S }}>
        <Sparkle size={56 * S} fill="var(--indigo)" />
      </div>
      <div style={{ position: 'absolute', bottom: 60 * S, left: 80 * S }}>
        <Sanfona width={120 * S} color="var(--indigo)" />
      </div>
    </div>
  );
}

Object.assign(window, { ArtFeed, ArtStory, ArtStoryLotes });
