import { useState, useEffect, Fragment } from 'react'
import { useParams } from 'react-router-dom'
import { formatBRL } from '../utils/format'
import { Bandeirinhas, Star, Sparkle, SunRays, Sanfona } from '../components/Decor'

/* ── shared helpers ── */

const D = {
  display: { fontFamily: 'var(--font-display)', fontWeight: 400, letterSpacing: '-0.01em', lineHeight: 0.92, textTransform: 'uppercase' },
  displayCond: { fontFamily: 'var(--font-display-cond)', fontWeight: 400, letterSpacing: '0.005em', lineHeight: 0.95, textTransform: 'uppercase' },
  body: { fontFamily: 'var(--font-body)', fontWeight: 400, lineHeight: 1.4 },
}

function StepProgress({ step }) {
  const steps = [
    { n: '01', label: 'Ingressos' },
    { n: '02', label: 'Seus dados' },
    { n: '03', label: 'Confirmar' },
  ]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
      {steps.map((s, i) => {
        const done = i + 1 < step
        const active = i + 1 === step
        return (
          <Fragment key={s.n}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: done ? 'var(--green)' : active ? 'var(--yellow)' : 'var(--cream-warm)',
                border: '2px solid var(--ink)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                ...D.display, fontSize: 11, color: 'var(--ink)',
              }}>
                {done ? '✓' : s.n}
              </div>
              {active && (
                <span style={{ ...D.displayCond, fontSize: 11, color: 'var(--ink)', letterSpacing: '0.1em' }}>
                  {s.label.toUpperCase()}
                </span>
              )}
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: done ? 'var(--ink)' : 'var(--cream-deep)' }} />
            )}
          </Fragment>
        )
      })}
    </div>
  )
}

function TicketRow({ id, name, price, unit, badge, qty, onChange, maxReached, esgotado, description }) {
  const active = qty > 0 && !esgotado
  const color = id === 'mesa' ? 'var(--red)' : id === 'lote2' ? 'var(--indigo)' : 'var(--green)'
  const icon = id === 'mesa' ? '🪑' : '🎟'
  const canInc = !maxReached && !esgotado

  return (
    <div style={{
      background: active ? 'var(--cream-warm)' : 'rgba(247,242,226,0.6)',
      border: '2.5px solid var(--ink)',
      borderRadius: 16, padding: '14px',
      marginBottom: 10,
      display: 'flex', alignItems: 'center', gap: 12,
      boxShadow: active ? '0 3px 0 0 var(--ink)' : '0 2px 0 0 rgba(22,20,58,0.5)',
      transition: 'box-shadow .12s ease',
    }}>
      {/* Color icon box */}
      <div style={{
        flexShrink: 0, width: 44, height: 44,
        background: color, borderRadius: 12, border: '2px solid var(--ink)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ ...D.displayCond, fontSize: 16, color: esgotado ? 'var(--ink-soft)' : 'var(--ink)' }}>{name}</span>
          {esgotado ? (
            <span style={{
              ...D.displayCond, fontSize: 10,
              background: 'var(--ink-soft)', color: 'var(--cream-warm)',
              padding: '2px 6px', borderRadius: 999, letterSpacing: '0.08em',
            }}>
              ESGOTADO
            </span>
          ) : badge && (
            <span style={{
              ...D.displayCond, fontSize: 10,
              background: 'var(--red)', color: 'var(--cream-warm)',
              padding: '2px 6px', borderRadius: 999, letterSpacing: '0.08em',
            }}>
              {badge.toUpperCase()}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ ...D.display, fontSize: 22, color: price > 0 ? 'var(--green-deep)' : 'var(--green)' }}>
            {price > 0 ? formatBRL(price) : 'GRÁTIS'}
          </span>
          <span style={{ ...D.body, fontSize: 11, color: 'var(--ink-soft)' }}>{unit}</span>
        </div>
        {description && (
          <div style={{ ...D.body, fontSize: 11, color: 'var(--ink-soft)', marginTop: 2 }}>
            {description}
          </div>
        )}
      </div>

      {/* Stepper */}
      <div style={{
        flexShrink: 0, display: 'flex', alignItems: 'center',
        background: 'var(--cream-warm)', border: '2px solid var(--ink)', borderRadius: 999, padding: 2,
      }}>
        <button type="button" onClick={() => onChange(-1)} disabled={qty === 0}
          aria-label="Diminuir"
          style={{
            width: 28, height: 28, borderRadius: '50%', border: 'none',
            background: qty === 0 ? 'transparent' : 'var(--cream-deep)',
            color: qty === 0 ? 'var(--ink-soft)' : 'var(--ink)',
            fontSize: 18, fontWeight: 700, cursor: qty === 0 ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >−</button>
        <div style={{ minWidth: 22, textAlign: 'center', ...D.display, fontSize: 18, color: 'var(--ink)' }}>{qty}</div>
        <button type="button" onClick={() => onChange(1)} disabled={!canInc}
          aria-label="Aumentar"
          style={{
            width: 28, height: 28, borderRadius: '50%', border: 'none',
            background: !canInc ? 'var(--cream-deep)' : 'var(--green)',
            color: !canInc ? 'var(--ink-soft)' : 'var(--cream-warm)',
            fontSize: 18, fontWeight: 700, cursor: !canInc ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >+</button>
      </div>
    </div>
  )
}

function BtnPrimary({ disabled, onClick, children, style = {} }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        ...D.displayCond, fontSize: 18, letterSpacing: '0.04em',
        background: disabled ? 'var(--cream-deep)' : 'var(--green)',
        color: disabled ? 'var(--ink-soft)' : 'var(--cream-warm)',
        border: '2.5px solid var(--ink)', borderRadius: 999, padding: '16px 28px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? '0 2px 0 0 var(--ink-soft)' : 'var(--shadow-cta)',
        width: '100%', transition: 'transform .12s ease, box-shadow .12s ease',
        ...style,
      }}
    >
      {children}
    </button>
  )
}

function StickyFooter({ children }) {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10,
      background: 'var(--cream-warm)', borderTop: '2.5px solid var(--ink)',
      padding: '14px 16px 18px',
      boxShadow: '0 -8px 24px -8px rgba(22,20,58,0.2)',
    }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        {children}
      </div>
    </div>
  )
}

function DarkHeader({ onBack }) {
  return (
    <div style={{
      padding: '14px 16px', background: 'var(--ink)', color: 'var(--cream-warm)',
      display: 'flex', alignItems: 'center', gap: 12,
      position: 'sticky', top: 0, zIndex: 10,
    }}>
      <button type="button" onClick={onBack} style={{
        background: 'transparent', border: 'none', color: 'var(--cream-warm)',
        fontSize: 14, ...D.body, cursor: 'pointer',
        padding: '6px 10px', borderRadius: 8,
        display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
      }}>← Voltar</button>
      <div style={{
        flex: 1, textAlign: 'center',
        ...D.displayCond, fontSize: 16, letterSpacing: '0.12em', color: 'var(--cream-warm)',
        paddingRight: 70,
      }}>
        FORRÓ DAS TONHAS
      </div>
    </div>
  )
}

/* ── Step 1: Ticket selection ── */

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const handler = (e) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isDesktop
}

function StepTickets({ config, qty, setQty, onAdvance }) {
  const isDesktop = useIsDesktop()
  const limitePorPedido = parseInt(config.limite_por_compra) || 4
  const disponiveis = parseInt(config.disponivel_cortesia) || 0
  const limite = Math.min(limitePorPedido, disponiveis)
  const totalQtd = qty.cortesia || 0
  const esgotado = disponiveis === 0

  const update = (d) => {
    setQty(q => {
      const next = Math.max(0, (q.cortesia || 0) + d)
      if (d > 0 && next > limite) return q
      return { ...q, cortesia: next }
    })
  }

  const ticketRows = (
    <TicketRow
      id="cortesia"
      name="Ingresso Cortesia"
      price={0}
      unit="/ unid."
      badge={null}
      qty={totalQtd}
      onChange={update}
      maxReached={totalQtd >= limite}
      esgotado={esgotado}
    />
  )

  /* ── DESKTOP ── */
  if (isDesktop) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--cream)' }} className="paper-bg">
        {/* Nav */}
        <nav style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 48px', borderBottom: '2px solid var(--ink)',
          background: 'var(--cream-warm)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sanfona width={30} color="var(--indigo)" />
            <div style={{ ...D.display, fontSize: 22, color: 'var(--green)', WebkitTextStroke: '1px var(--ink)', paintOrder: 'stroke fill', letterSpacing: '-0.01em' }}>
              FORRÓ DAS TONHAS
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <a href="https://www.instagram.com/becodoalto.olinda/" target="_blank" rel="noopener noreferrer"
              style={{ ...D.displayCond, fontSize: 13, color: 'var(--ink)', textDecoration: 'none', letterSpacing: '0.12em' }}>
              @BECODOALTO.OLINDA
            </a>
            <span style={{ ...D.displayCond, fontSize: 13, color: 'var(--ink-soft)', letterSpacing: '0.1em' }}>13 JUN 2026</span>
          </div>
        </nav>

        {/* Bandeirinhas */}
        <div style={{ height: 70 }}>
          <Bandeirinhas count={12} height={70} />
        </div>

        {/* 2-col grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 48, padding: '24px 48px 80px', maxWidth: 1280, margin: '0 auto' }}>

          {/* LEFT: hero */}
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--ink)', color: 'var(--cream-warm)', padding: '6px 14px', borderRadius: 999, ...D.displayCond, fontSize: 12, letterSpacing: '0.2em', marginBottom: 20 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />
              VENDA OFICIAL · INGRESSOS ANTECIPADOS
            </div>

            {/* Wordmark — sol decorativo posicionado relativo a este wrapper */}
            <div style={{ position: 'relative', paddingBottom: 16 }}>
              <div style={{ ...D.display, fontSize: 148, color: 'var(--green)', WebkitTextStroke: '3px var(--ink)', paintOrder: 'stroke fill', lineHeight: 0.85, letterSpacing: '-0.025em' }}>
                FORRÓ
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, margin: '10px 0' }}>
                <span style={{ ...D.display, fontSize: 52, color: 'var(--ink)' }}>DAS</span>
                <Sparkle size={40} fill="var(--indigo)" />
              </div>
              <div style={{ ...D.display, fontSize: 148, color: 'var(--green)', WebkitTextStroke: '3px var(--ink)', paintOrder: 'stroke fill', lineHeight: 0.85, letterSpacing: '-0.025em' }}>
                TONHAS
              </div>
              {/* Sol no canto inferior esquerdo do wordmark */}
              <div style={{ position: 'absolute', left: -30, bottom: -20, opacity: 0.8, zIndex: 0, pointerEvents: 'none' }}>
                <SunRays size={160} fill="var(--yellow)" />
              </div>
            </div>

            {/* Match line */}
            <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ ...D.displayCond, fontSize: 34, color: 'var(--indigo)' }}>BRASIL</span>
              <Sparkle size={22} fill="var(--yellow)" />
              <span style={{ ...D.displayCond, fontSize: 34, color: 'var(--indigo)' }}>MARROCOS</span>
              <span style={{ ...D.body, fontSize: 12, color: 'var(--ink-soft)', marginLeft: 6, lineHeight: 1.4 }}>
                quinteto pé de serra<br />transmissão ao vivo
              </span>
            </div>

            {/* Date strip */}
            <div style={{ marginTop: 28, background: 'var(--ink)', color: 'var(--cream-warm)', borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 18, maxWidth: 380, position: 'relative' }}>
              <div style={{ flexShrink: 0, textAlign: 'center', lineHeight: 0.9 }}>
                <div style={{ ...D.display, fontSize: 44, color: 'var(--yellow)' }}>13</div>
                <div style={{ ...D.displayCond, fontSize: 15, letterSpacing: '0.1em' }}>JUN · 2026</div>
              </div>
              <div style={{ flex: 1, ...D.body, fontSize: 14 }}>
                <div style={{ opacity: 0.7, ...D.displayCond, letterSpacing: '0.12em', fontSize: 11 }}>SÁBADO</div>
                <div style={{ fontWeight: 600, fontSize: 18 }}>16h às 22h</div>
                <div style={{ opacity: 0.8, marginTop: 4 }}>
                  <a href="https://www.instagram.com/becodoalto.olinda/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                    📍 @becodoalto.olinda
                  </a>
                </div>
              </div>
              <div style={{ position: 'absolute', top: -12, right: -10 }}>
                <Star size={32} fill="var(--green)" rotate={20} />
              </div>
            </div>
            <div style={{ marginTop: 10, ...D.body, fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
              Rua 27 de Janeiro (Rua da Pitombeira), 211 · Sítio Histórico · Olinda · PE
            </div>
          </div>

          {/* RIGHT: ticket card */}
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: -18, right: -10, zIndex: 1 }}>
              <Star size={44} fill="var(--red)" rotate={15} />
            </div>

            <div style={{ background: 'var(--cream-warm)', border: '2.5px solid var(--ink)', borderRadius: 22, padding: 24, boxShadow: 'var(--shadow-card)', position: 'sticky', top: 24 }}>
              {/* Compact date in card */}
              <div style={{ background: 'var(--ink)', color: 'var(--cream-warm)', borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{ flexShrink: 0, textAlign: 'center', lineHeight: 0.9 }}>
                  <div style={{ ...D.display, fontSize: 34, color: 'var(--yellow)' }}>13</div>
                  <div style={{ ...D.displayCond, fontSize: 12, letterSpacing: '0.1em' }}>JUN · 2026</div>
                </div>
                <div style={{ flex: 1, ...D.body, fontSize: 13 }}>
                  <div style={{ opacity: 0.7, ...D.displayCond, letterSpacing: '0.1em', fontSize: 10 }}>SÁBADO · 16h às 22h</div>
                  <div style={{ opacity: 0.85, marginTop: 4, fontSize: 12 }}>
                    <a href="https://www.instagram.com/becodoalto.olinda/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                      📍 @becodoalto.olinda
                    </a>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ ...D.displayCond, fontSize: 20, color: 'var(--ink)' }}>INGRESSO CORTESIA</div>
                <div style={{ ...D.body, fontSize: 11, color: 'var(--ink-soft)' }}>{disponiveis} disponíveis</div>
              </div>

              {ticketRows}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '10px 4px', marginTop: 4 }}>
                <span style={{ ...D.body, color: 'var(--ink-soft)', fontSize: 13 }}>
                  {totalQtd === 0 ? 'Nenhum ingresso' : `${totalQtd} ${totalQtd === 1 ? 'ingresso' : 'ingressos'}`}
                </span>
                <span style={{ ...D.display, fontSize: 36, color: 'var(--green)' }}>GRÁTIS</span>
              </div>

              <BtnPrimary disabled={totalQtd === 0} onClick={onAdvance}>
                Confirmar presença →
              </BtnPrimary>
              <div style={{ textAlign: 'center', fontSize: 11, ...D.body, color: 'var(--ink-soft)', marginTop: 10 }}>
                O ingresso com QR code chega no seu e-mail
              </div>
            </div>
          </div>
        </div>

        {/* Info strip */}
        <div style={{ background: 'var(--green)', color: 'var(--ink)', borderTop: '2.5px solid var(--ink)', padding: '14px 48px', display: 'flex', alignItems: 'center', gap: 40, ...D.displayCond, fontSize: 15, letterSpacing: '0.1em', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          <span>✦ FORRÓ PÉ DE SERRA</span>
          <span>✦ QUINTETO AO VIVO</span>
          <span>✦ COMIDA DE BOTECO</span>
          <span>✦ SÍTIO HISTÓRICO</span>
          <span>✦ OLINDA · PE</span>
          <span>✦ 13/06/2026</span>
        </div>
      </div>
    )
  }

  /* ── MOBILE ── */
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--cream)' }} className="paper-bg">
      {/* Hero */}
      <div style={{ position: 'relative' }}>
        <div style={{ height: 56, marginTop: -8 }}>
          <Bandeirinhas count={6} height={56} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--ink)', color: 'var(--cream-warm)', padding: '5px 12px', borderRadius: 999, ...D.displayCond, fontSize: 11, letterSpacing: '0.18em' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />
            VENDA OFICIAL · INGRESSOS ANTECIPADOS
          </div>
        </div>

        <div style={{ padding: '14px 20px 0', textAlign: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 14, left: 10 }}><Star size={22} fill="var(--yellow)" rotate={-15} /></div>
          <div style={{ position: 'absolute', top: 32, right: 14 }}><Sparkle size={18} fill="var(--indigo)" /></div>
          <div style={{ ...D.display, fontSize: 56, color: 'var(--green)', WebkitTextStroke: '1.5px var(--ink)', paintOrder: 'stroke fill', letterSpacing: '-0.02em' }}>
            FORRÓ<br />DAS TONHAS
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: -4, position: 'relative', minHeight: 160 }}>
          <Sanfona width={170} color="var(--indigo)" />
          <div style={{ position: 'absolute', left: 6, bottom: -10 }}><SunRays size={90} fill="var(--yellow)" /></div>
        </div>

        {/* Match line */}
        <div style={{ marginTop: 10, textAlign: 'center', padding: '0 16px' }}>
          <div style={{ ...D.display, fontSize: 22, color: 'var(--green)', WebkitTextStroke: '1px var(--ink)', paintOrder: 'stroke fill' }}>
            BRASIL × MARROCOS
          </div>
          <div style={{ ...D.displayCond, fontSize: 12, color: 'var(--indigo)', letterSpacing: '0.15em', marginTop: 2 }}>
            QUINTETO PÉ DE SERRA · TRANSMISSÃO AO VIVO
          </div>
        </div>

        <div style={{ margin: '18px 20px 0', background: 'var(--ink)', color: 'var(--cream-warm)', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
          <div style={{ flexShrink: 0, textAlign: 'center', lineHeight: 0.9 }}>
            <div style={{ ...D.display, fontSize: 36, color: 'var(--yellow)' }}>13</div>
            <div style={{ ...D.displayCond, fontSize: 14, color: 'var(--cream-warm)', letterSpacing: '0.1em' }}>JUN · 2026</div>
          </div>
          <div style={{ flex: 1, ...D.body, fontSize: 13 }}>
            <div style={{ opacity: 0.7, ...D.displayCond, letterSpacing: '0.12em', fontSize: 11 }}>SÁBADO</div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>16h às 22h</div>
            <div style={{ opacity: 0.8, marginTop: 4 }}>
              <a href="https://www.instagram.com/becodoalto.olinda/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                📍 @becodoalto.olinda
              </a>
            </div>
          </div>
          <div style={{ position: 'absolute', top: -10, right: -8 }}><Star size={28} fill="var(--green)" rotate={20} /></div>
        </div>

        <div style={{ margin: '10px 20px 0', ...D.body, fontSize: 12, color: 'var(--ink-soft)', textAlign: 'center', lineHeight: 1.5 }}>
          Rua 27 de Janeiro (Rua da Pitombeira), 211<br />Sítio Histórico · Olinda · PE
        </div>
      </div>

      <div style={{ padding: '22px 16px 140px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 6px 12px' }}>
          <div style={{ ...D.displayCond, fontSize: 22, color: 'var(--ink)' }}>INGRESSO CORTESIA</div>
          <div style={{ ...D.body, fontSize: 11, color: 'var(--ink-soft)' }}>{disponiveis} disponíveis</div>
        </div>
        {ticketRows}
      </div>

      <StickyFooter>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <div style={{ ...D.body, fontSize: 13, color: 'var(--ink-soft)' }}>
            {totalQtd === 0 ? 'Nenhum ingresso' : `${totalQtd} ${totalQtd === 1 ? 'ingresso' : 'ingressos'}`}
          </div>
          <div style={{ ...D.displayCond, fontSize: 28, color: 'var(--green)' }}>GRÁTIS</div>
        </div>
        <BtnPrimary disabled={totalQtd === 0} onClick={onAdvance}>
          Confirmar presença →
        </BtnPrimary>
        <div style={{ textAlign: 'center', fontSize: 11, ...D.body, color: 'var(--ink-soft)', marginTop: 8 }}>
          O ingresso com QR code chega no seu e-mail
        </div>
      </StickyFooter>
    </div>
  )
}

/* ── Step 2: Personal data ── */

const inputStyle = {
  width: '100%', background: 'var(--cream-warm)',
  border: '2px solid var(--ink)', borderRadius: 14,
  padding: '14px 16px', fontFamily: 'var(--font-body)', fontSize: 16,
  color: 'var(--ink)', outline: 'none', boxSizing: 'border-box',
}
const labelStyle = {
  fontFamily: 'var(--font-display-cond)', fontSize: 13,
  letterSpacing: '0.08em', textTransform: 'uppercase',
  color: 'var(--ink)', display: 'block', marginBottom: 8,
}

function StepDados({ qty, form, setForm, enviando, erro, onBack, onSubmit }) {
  const valid = form.nome.trim().length > 2 && form.email.includes('@') && form.email.includes('.')
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--cream)' }} className="paper-bg">
      <DarkHeader onBack={onBack} />

      <div style={{ padding: '20px 16px 140px', maxWidth: 520, margin: '0 auto' }}>
        <StepProgress step={2} />

        <div style={{ ...D.displayCond, fontSize: 28, color: 'var(--ink)', marginBottom: 4 }}>
          QUEM VAI ARRASTAR O PÉ?
        </div>
        <div style={{ ...D.body, fontSize: 13, color: 'var(--ink-soft)', marginBottom: 20 }}>
          O ingresso vai pro seu e-mail com QR code de entrada.
        </div>

        <label style={labelStyle} htmlFor="venda-nome">Nome completo *</label>
        <input
          id="venda-nome"
          style={inputStyle}
          value={form.nome}
          onChange={set('nome')}
          placeholder="Seu nome completo"
          autoComplete="name"
        />

        <div style={{ height: 14 }} />

        <label style={labelStyle} htmlFor="venda-email">E-mail *</label>
        <input
          id="venda-email"
          style={inputStyle}
          type="email"
          value={form.email}
          onChange={set('email')}
          placeholder="seu@email.com"
          autoComplete="email"
        />

        <div style={{ height: 14 }} />

        <label style={labelStyle} htmlFor="venda-tel">Celular</label>
        <input
          id="venda-tel"
          style={inputStyle}
          value={form.telefone}
          onChange={set('telefone')}
          placeholder="(81) 9 9999-9999"
          autoComplete="tel"
          inputMode="tel"
        />

        {/* Order summary */}
        <div style={{
          background: 'var(--cream-warm)', border: '2.5px solid var(--ink)',
          borderRadius: 22, padding: 16, marginTop: 22,
          boxShadow: 'var(--shadow-card)',
        }}>
          <div style={{ ...D.displayCond, fontSize: 16, color: 'var(--ink)', marginBottom: 10 }}>SEU PEDIDO</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, ...D.body, fontSize: 14, color: 'var(--ink)' }}>
            <span>{qty.cortesia}× Cortesia</span>
            <span style={{ fontWeight: 600, color: 'var(--green-deep)' }}>GRÁTIS</span>
          </div>
          <div style={{ height: 1, background: 'var(--ink)', opacity: 0.15, margin: '10px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ ...D.displayCond, fontSize: 14 }}>TOTAL</span>
            <span style={{ ...D.display, fontSize: 28, color: 'var(--green)' }}>GRÁTIS</span>
          </div>
        </div>

        {erro && (
          <div style={{
            marginTop: 12, padding: '10px 14px',
            background: 'rgba(230,61,31,0.08)', border: '1.5px solid var(--red)',
            borderRadius: 12, ...D.body, fontSize: 14, color: 'var(--red)',
          }}>
            {erro}
          </div>
        )}
      </div>

      <StickyFooter>
        <BtnPrimary disabled={!valid || enviando} onClick={onSubmit}>
          {enviando ? 'Confirmando...' : 'Confirmar presença →'}
        </BtnPrimary>
      </StickyFooter>
    </div>
  )
}

/* ── Step 3: Confirmação ── */

function StepConfirmado({ resultado }) {
  const v = resultado.venda
  const qty = v.quantidade_lote_promo || v.quantidade || 0
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--green)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', textAlign: 'center' }} className="paper-bg">
      <div style={{ fontSize: 72, lineHeight: 1 }}>🎉</div>
      <div style={{ ...D.display, fontSize: 56, color: 'var(--cream-warm)', WebkitTextStroke: '2px var(--ink)', paintOrder: 'stroke fill', marginTop: 12, lineHeight: 0.9 }}>
        PRESENÇA<br />CONFIRMADA!
      </div>
      <div style={{ marginTop: 20, ...D.body, fontSize: 15, color: 'var(--ink)', maxWidth: 320, lineHeight: 1.6 }}>
        Seu ingresso está a caminho!<br />
        Verifique o e-mail <strong>{v.email}</strong> para o QR code de entrada.
      </div>
      <div style={{ marginTop: 24, background: 'var(--ink)', color: 'var(--cream-warm)', borderRadius: 18, padding: '16px 24px', maxWidth: 300, width: '100%' }}>
        <div style={{ ...D.displayCond, fontSize: 12, letterSpacing: '0.18em', opacity: 0.6, marginBottom: 4 }}>NOS VEMOS LÁ!</div>
        <div style={{ ...D.displayCond, fontSize: 22 }}>13 JUN 2026</div>
        <div style={{ ...D.body, fontSize: 13, opacity: 0.75, marginTop: 4 }}>16h · Olinda, PE</div>
      </div>
      <div style={{ marginTop: 20, ...D.displayCond, fontSize: 13, color: 'var(--ink)', letterSpacing: '0.1em', opacity: 0.8 }}>
        {qty}× Cortesia · GRÁTIS
      </div>
    </div>
  )
}

/* ── Main ── */

export default function VendaPublica() {
  const { eventoId } = useParams()
  const [config, setConfig] = useState({})
  const [loadingConfig, setLoadingConfig] = useState(true)
  const [qty, setQty] = useState({ cortesia: 0 })
  const [form, setForm] = useState({ nome: '', email: '', telefone: '' })
  const [step, setStep] = useState(1)
  const [resultado, setResultado] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    fetch(`/api/config?evento_id=${eventoId || ''}`)
      .then(r => r.json())
      .then(c => { setConfig(c); setLoadingConfig(false) })
      .catch(() => setLoadingConfig(false))
  }, [eventoId])

  // Sincroniza botão Voltar do browser com os steps
  useEffect(() => {
    window.history.replaceState({ step: 1 }, '')
  }, [])

  useEffect(() => {
    const onPop = (e) => {
      const s = e.state?.step ?? 1
      if (s < step) {
        setErro('')
        setStep(s)
      }
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [step])

  const goTo = (s) => {
    window.history.pushState({ step: s }, '')
    setStep(s)
  }

  const submit = async () => {
    setErro('')
    setEnviando(true)
    try {
      const res = await fetch('/api/tickets/venda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: form.nome.trim(),
          email: form.email.trim(),
          telefone: form.telefone.trim() || undefined,
          quantidade_lote_promo: qty.cortesia,
          evento_id: eventoId,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao confirmar')
      setResultado(data)
      goTo(3)
    } catch (err) {
      setErro(err.message)
    } finally {
      setEnviando(false)
    }
  }

  if (loadingConfig) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }} className="paper-bg">
        <div style={{ ...D.body, color: 'var(--ink-soft)' }}>Carregando...</div>
      </div>
    )
  }

  if (config.vendas_ativas === '0') {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--cream)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', textAlign: 'center' }} className="paper-bg">
        <div style={{ height: 70, width: '100%', position: 'absolute', top: 0 }}>
          <Bandeirinhas count={8} height={70} />
        </div>
        <Sanfona width={100} color="var(--indigo)" />
        <div style={{ ...D.display, fontSize: 52, color: 'var(--ink)', lineHeight: 0.9, marginTop: 20 }}>
          FORRÓ<br />DAS TONHAS
        </div>
        <div style={{ marginTop: 28, background: 'var(--ink)', color: 'var(--cream-warm)', borderRadius: 18, padding: '20px 28px', maxWidth: 340, width: '100%' }}>
          <div style={{ fontSize: 36 }}>⏸</div>
          <div style={{ ...D.displayCond, fontSize: 22, marginTop: 8, letterSpacing: '0.06em' }}>
            VENDAS PAUSADAS
          </div>
          <div style={{ ...D.body, fontSize: 14, opacity: 0.75, marginTop: 10, lineHeight: 1.6 }}>
            As vendas online estão temporariamente suspensas. Em breve as vendas serão reabertas.
          </div>
        </div>
        <div style={{ marginTop: 20, ...D.displayCond, fontSize: 14, color: 'var(--indigo)', letterSpacing: '0.1em' }}>
          13 JUN 2026 · OLINDA, PE
        </div>
      </div>
    )
  }

  if (step === 1) {
    return <StepTickets config={config} qty={qty} setQty={setQty} onAdvance={() => goTo(2)} />
  }
  if (step === 2) {
    return (
      <StepDados
        qty={qty}
        form={form} setForm={setForm}
        enviando={enviando} erro={erro}
        onBack={() => { setErro(''); goTo(1) }}
        onSubmit={submit}
      />
    )
  }
  return <StepConfirmado resultado={resultado} />
}
