/* ============================================================
   FORRÓ DAS TONHAS — Site screens (mobile-first)
   Home, Checkout (form), Sucesso (QR PIX), e versão desktop
   ============================================================ */

const { useState } = React;

// Real event data — vinda do site atual
const EVENT = {
  date: '13 de junho · 2026',
  dateLong: '13 de junho de 2026',
  time: '16h às 22h',
  venue: '@becodoalto.olinda',
  address: 'Rua 27 de Janeiro (Rua da Pitombeira), 211',
  city: 'Sítio Histórico · Olinda · PE',
  tickets: [
    { id: 'promo', name: 'Lote Promocional', price: 30, badge: 'esgotando', remaining: '23 restantes' },
    { id: 'lote2', name: '2º Lote', price: 45, badge: null, remaining: null },
    { id: 'mesa', name: 'Mesa para 4', price: 250, badge: 'casadinha', remaining: '8 mesas' },
  ],
};

const BRL = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// ====== MOBILE — HOME / VENDA ======
function MobileHome({ onAdvance }) {
  const tw = (typeof useTweaksCtx === 'function') ? useTweaksCtx() : {};
  const decor = tw.decorIntensity || 'balanced';
  const illust = tw.heroIllustration || 'sanfona';
  const showMatch = tw.showMatch !== false;
  const matchText = tw.matchLineText || 'BRASIL × MARROCOS';
  const ctaCopy = tw.ctaCopy || 'Continuar · PIX na hora';

  const [qty, setQty] = useState({ promo: 1, lote2: 0, mesa: 0 });
  const total = EVENT.tickets.reduce((s, t) => s + t.price * (qty[t.id] || 0), 0);
  const totalUnits = Object.values(qty).reduce((a, b) => a + b, 0);
  const update = (id, d) => {
    setQty(q => {
      const next = Math.max(0, Math.min(2, (q[id] || 0) + d));
      // Max 2 por pedido (regra do site original)
      const others = Object.entries(q).reduce((s, [k, v]) => k !== id ? s + v : s, 0);
      if (next + others > 2 && d > 0) return q;
      return { ...q, [id]: next };
    });
  };

  return (
    <div style={{ height: '100%', overflow: 'auto', background: 'var(--cream)' }} className="paper-bg">
      {/* HERO */}
      <div style={{ position: 'relative', paddingBottom: 0 }}>
        {/* Top bandeirinhas */}
        {decor !== 'sutil' && (
          <div style={{ position: 'relative', height: 56, marginTop: -8 }}>
            <Bandeirinhas count={decor === 'festa' ? 7 : 5} height={56} />
          </div>
        )}

        {/* Tag pill */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: decor === 'sutil' ? 18 : 10 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'var(--ink)', color: 'var(--cream-warm)',
            padding: '5px 12px', borderRadius: 999,
            fontFamily: 'var(--font-display-cond)', fontSize: 11,
            letterSpacing: '0.18em',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }}></span>
            VENDA OFICIAL · INGRESSOS ANTECIPADOS
          </div>
        </div>

        {/* Main wordmark */}
        <div style={{ padding: '14px 20px 0', textAlign: 'center', position: 'relative' }}>
          {/* Floating stars */}
          {decor !== 'sutil' && (
            <>
              <div style={{ position: 'absolute', top: 14, left: 10 }}>
                <Star size={22} fill="var(--yellow)" rotate={-15} />
              </div>
              <div style={{ position: 'absolute', top: 32, right: 14 }}>
                <Sparkle size={18} fill="var(--indigo)" />
              </div>
              {decor === 'festa' && (
                <>
                  <div style={{ position: 'absolute', top: 80, left: 24 }}>
                    <Sparkle size={14} fill="var(--green)" />
                  </div>
                  <div style={{ position: 'absolute', top: 110, right: 30 }}>
                    <Star size={16} fill="var(--red)" rotate={10} />
                  </div>
                </>
              )}
            </>
          )}

          <div className="t-display" style={{
            fontSize: 56, color: 'var(--green)',
            WebkitTextStroke: `${1.5 * (tw.strokeWeight ?? 1)}px var(--ink)`,
            paintOrder: 'stroke fill',
            lineHeight: 0.88,
            letterSpacing: '-0.02em',
          }}>
            FORRÓ<br />DAS TONHAS
          </div>
        </div>

        {/* Hero illustration — switches via tweak */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: -4, position: 'relative', minHeight: illust === 'só tipo' ? 8 : 160 }}>
          {illust === 'sanfona' && <Sanfona width={170} color="var(--indigo)" />}
          {illust === 'casal'   && <DancingCouple width={170} color="var(--indigo)" />}
          {illust === 'sol'     && <SunRays size={180} fill="var(--yellow)" />}
          {illust !== 'só tipo' && decor !== 'sutil' && illust !== 'sol' && (
            <div style={{ position: 'absolute', left: 6, bottom: -10 }}>
              <SunRays size={90} fill="var(--yellow)" />
            </div>
          )}
        </div>

        {/* Match line (toggleable) */}
        {showMatch && (
          <>
            <div style={{
              marginTop: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: '0 16px',
            }}>
              <span className="t-display" style={{ fontSize: 22, color: 'var(--green)', WebkitTextStroke: `${1 * (tw.strokeWeight ?? 1)}px var(--ink)`, paintOrder: 'stroke fill', textAlign: 'center' }}>
                {matchText}
              </span>
            </div>
            <div style={{
              textAlign: 'center',
              fontFamily: 'var(--font-display-cond)',
              fontSize: 13, color: 'var(--indigo)',
              letterSpacing: '0.15em', marginTop: 2,
            }}>
              QUINTETO PÉ DE SERRA · TRANSMISSÃO AO VIVO
            </div>
          </>
        )}

        {/* Date strip */}
        <div style={{
          margin: '18px 20px 0',
          background: 'var(--ink)', color: 'var(--cream-warm)',
          borderRadius: 16,
          padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: 14,
          position: 'relative',
        }}>
          <div style={{ flex: 'none', textAlign: 'center', lineHeight: 0.9 }}>
            <div className="t-display" style={{ fontSize: 36, color: 'var(--yellow)' }}>13</div>
            <div className="t-display-cond" style={{ fontSize: 14, color: 'var(--cream-warm)', letterSpacing: '0.1em' }}>JUN · 2026</div>
          </div>
          <div style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 13 }}>
            <div style={{ opacity: 0.7, fontFamily: 'var(--font-display-cond)', letterSpacing: '0.12em', fontSize: 11 }}>SÁBADO</div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>{EVENT.time}</div>
            <div style={{ opacity: 0.8, marginTop: 4 }}>📍 {EVENT.venue}</div>
          </div>
          {/* corner star */}
          <div style={{ position: 'absolute', top: -10, right: -8 }}>
            <Star size={28} fill="var(--green)" rotate={20} />
          </div>
        </div>

        {/* Location card */}
        <div style={{ margin: '10px 20px 0', fontSize: 12, fontFamily: 'var(--font-body)', color: 'var(--ink-soft)', textAlign: 'center', lineHeight: 1.5 }}>
          {EVENT.address}<br />
          {EVENT.city}
        </div>
      </div>

      {/* TICKETS section */}
      <div style={{ padding: '22px 16px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 6px 12px' }}>
          <div className="t-display-cond" style={{ fontSize: 22, color: 'var(--ink)' }}>ESCOLHA SEU INGRESSO</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--ink-soft)' }}>máx. 2 / pedido</div>
        </div>

        {EVENT.tickets.map(t => (
          <TicketRow key={t.id} t={t} qty={qty[t.id] || 0} onChange={(d) => update(t.id, d)} />
        ))}
      </div>

      {/* Totals + CTA */}
      <div style={{
        position: 'sticky', bottom: 0, left: 0, right: 0,
        background: 'var(--cream-warm)',
        borderTop: '2.5px solid var(--ink)',
        padding: '14px 16px 18px',
        boxShadow: '0 -8px 24px -8px rgba(22,20,58,0.2)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-soft)' }}>
            {totalUnits === 0 ? 'Nenhum ingresso' : `${totalUnits} ${totalUnits === 1 ? 'item' : 'itens'}`}
          </div>
          <div className="t-display-cond" style={{ fontSize: 28, color: 'var(--ink)' }}>{BRL(total)}</div>
        </div>
        <button className="btn-primary" disabled={total === 0} onClick={onAdvance}>
          {ctaCopy} →
        </button>
        <div style={{ textAlign: 'center', fontSize: 11, fontFamily: 'var(--font-body)', color: 'var(--ink-soft)', marginTop: 8 }}>
          🔒 Ambiente seguro · QR Code PIX gerado na hora
        </div>
      </div>
    </div>
  );
}

function TicketRow({ t, qty, onChange }) {
  const active = qty > 0;
  return (
    <div style={{
      background: active ? 'var(--cream-warm)' : 'rgba(247,242,226,0.6)',
      border: `2.5px solid var(--ink)`,
      borderRadius: 16,
      padding: '14px 14px',
      marginBottom: 10,
      display: 'flex', alignItems: 'center', gap: 12,
      boxShadow: active ? '0 3px 0 0 var(--ink)' : '0 2px 0 0 rgba(22,20,58,0.5)',
      position: 'relative',
    }}>
      {/* Side indicator */}
      <div style={{
        flex: 'none', width: 44, height: 44,
        background: t.id === 'mesa' ? 'var(--red)' : t.id === 'lote2' ? 'var(--indigo)' : 'var(--green)',
        borderRadius: 12,
        border: '2px solid var(--ink)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 22 }}>{t.id === 'mesa' ? '🪑' : '🎟'}</span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span className="t-display-cond" style={{ fontSize: 16, color: 'var(--ink)' }}>{t.name.toUpperCase()}</span>
          {t.badge === 'esgotando' && (
            <span style={{
              fontFamily: 'var(--font-display-cond)', fontSize: 10,
              background: 'var(--red)', color: 'var(--cream-warm)',
              padding: '2px 6px', borderRadius: 999, letterSpacing: '0.08em',
            }}>ESGOTANDO</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--green-deep)' }}>{BRL(t.price)}</span>
          <span style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{t.id === 'mesa' ? '/ mesa' : '/ unid.'}</span>
        </div>
        {t.remaining && (
          <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 2 }}>{t.remaining}</div>
        )}
      </div>

      {/* Stepper */}
      <div style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
        <Stepper qty={qty} onChange={onChange} />
      </div>
    </div>
  );
}

function Stepper({ qty, onChange }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      background: 'var(--cream-warm)',
      border: '2px solid var(--ink)', borderRadius: 999, padding: 2,
    }}>
      <button onClick={() => onChange(-1)} disabled={qty === 0} style={btnStepStyle(qty === 0)}>−</button>
      <div style={{
        minWidth: 22, textAlign: 'center',
        fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink)',
      }}>{qty}</div>
      <button onClick={() => onChange(1)} style={btnStepStyle(false)}>+</button>
    </div>
  );
}
const btnStepStyle = (disabled) => ({
  width: 28, height: 28, borderRadius: '50%',
  border: 'none',
  background: disabled ? 'transparent' : 'var(--green)',
  color: disabled ? 'var(--ink-soft)' : 'var(--cream-warm)',
  fontSize: 16, fontWeight: 700,
  cursor: disabled ? 'not-allowed' : 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
});

// ====== MOBILE — CHECKOUT (dados) ======
function MobileCheckout({ onAdvance, onBack }) {
  const [name, setName] = useState('Maria Antônia');
  const [email, setEmail] = useState('maria@email.com');
  const valid = name.length > 3 && email.includes('@');
  return (
    <div style={{ height: '100%', overflow: 'auto', background: 'var(--cream)' }} className="paper-bg">
      {/* Header */}
      <div style={{
        padding: '14px 16px 14px',
        background: 'var(--ink)', color: 'var(--cream-warm)',
        position: 'relative',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button onClick={onBack} style={{
          background: 'transparent', border: 'none', color: 'var(--cream-warm)',
          fontSize: 14, fontFamily: 'var(--font-body)', cursor: 'pointer',
          padding: '6px 10px', borderRadius: 8,
          display: 'flex', alignItems: 'center', gap: 4, flex: 'none',
        }}>← Voltar</button>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', paddingRight: 70 }}>
          <LogoWordmark size={0.55} color="var(--cream-warm)" strokeColor="var(--green)" />
        </div>
      </div>

      <div style={{ padding: '20px 16px 100px' }}>
        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
          <Step n="01" label="Ingressos" done />
          <div style={{ flex: 1, height: 2, background: 'var(--ink)' }}></div>
          <Step n="02" label="Seus dados" active />
          <div style={{ flex: 1, height: 2, background: 'var(--cream-deep)' }}></div>
          <Step n="03" label="Pagar" />
        </div>

        <div className="t-display-cond" style={{ fontSize: 28, color: 'var(--ink)', marginBottom: 4 }}>QUEM VAI ARRASTAR O PÉ?</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 20 }}>
          O ingresso vai pro seu e-mail com QR code de entrada.
        </div>

        <label className="label-strong">Nome completo</label>
        <input className="input-field" value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome" />

        <div style={{ height: 14 }} />

        <label className="label-strong">E-mail</label>
        <input className="input-field" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" />

        <div style={{ height: 14 }} />

        <label className="label-strong">CPF</label>
        <input className="input-field" placeholder="000.000.000-00" />

        <div style={{ height: 14 }} />

        <label className="label-strong">Celular</label>
        <input className="input-field" placeholder="(81) 9 9999-9999" />

        {/* Order summary */}
        <div className="surface-card" style={{ marginTop: 22, padding: 16 }}>
          <div className="t-display-cond" style={{ fontSize: 16, color: 'var(--ink)', marginBottom: 10 }}>SEU PEDIDO</div>
          <SummaryRow name="1× Lote Promocional" price={30} />
          <SummaryRow name="1× 2º Lote" price={45} />
          <div style={{ height: 1, background: 'var(--ink)', opacity: 0.15, margin: '10px 0' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span className="t-display-cond" style={{ fontSize: 14 }}>TOTAL</span>
            <span className="t-display" style={{ fontSize: 28, color: 'var(--green-deep)' }}>R$ 75,00</span>
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div style={{
        position: 'sticky', bottom: 0,
        background: 'var(--cream-warm)', borderTop: '2.5px solid var(--ink)',
        padding: '14px 16px',
      }}>
        <button className="btn-primary" disabled={!valid} onClick={onAdvance}>
          Gerar QR Code PIX →
        </button>
      </div>
    </div>
  );
}

function Step({ n, label, active, done }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 'none' }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        background: done ? 'var(--green)' : active ? 'var(--yellow)' : 'var(--cream-warm)',
        border: '2px solid var(--ink)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-display)', fontSize: 11, color: 'var(--ink)',
      }}>{done ? '✓' : n}</div>
      {active && <span style={{ fontFamily: 'var(--font-display-cond)', fontSize: 11, color: 'var(--ink)', letterSpacing: '0.1em' }}>{label.toUpperCase()}</span>}
    </div>
  );
}

function SummaryRow({ name, price }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink)' }}>
      <span>{name}</span>
      <span style={{ fontWeight: 600 }}>{BRL(price)}</span>
    </div>
  );
}

// ====== MOBILE — PIX QR CODE ======
function MobilePix({ onBack }) {
  return (
    <div style={{ height: '100%', overflow: 'auto', background: 'var(--cream)' }} className="paper-bg">
      <div style={{
        padding: '14px 16px 14px',
        background: 'var(--ink)', color: 'var(--cream-warm)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button onClick={onBack} style={{
          background: 'transparent', border: 'none', color: 'var(--cream-warm)',
          fontSize: 14, fontFamily: 'var(--font-body)', cursor: 'pointer',
          padding: '6px 10px', borderRadius: 8,
          display: 'flex', alignItems: 'center', gap: 4, flex: 'none',
        }}>← Voltar</button>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', paddingRight: 70 }}>
          <LogoWordmark size={0.55} color="var(--cream-warm)" strokeColor="var(--green)" />
        </div>
      </div>

      <div style={{ padding: '20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
          <Step n="01" label="Ingressos" done />
          <div style={{ flex: 1, height: 2, background: 'var(--ink)' }}></div>
          <Step n="02" label="Dados" done />
          <div style={{ flex: 1, height: 2, background: 'var(--ink)' }}></div>
          <Step n="03" label="Pagar" active />
        </div>

        <div className="t-display-cond" style={{ fontSize: 28, color: 'var(--ink)' }}>PAGUE COM PIX</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 16 }}>
          QR Code expira em <strong style={{ color: 'var(--red)' }}>09:42</strong>. Após pagar, o ingresso cai no seu e-mail.
        </div>

        {/* QR */}
        <div className="surface-card" style={{ padding: 20, textAlign: 'center' }}>
          <div style={{
            display: 'inline-block', padding: 12, background: '#fff',
            border: '2px solid var(--ink)', borderRadius: 12,
          }}>
            {/* Fake QR pattern */}
            <svg viewBox="0 0 100 100" width="180" height="180" aria-hidden="true">
              {Array.from({ length: 25 }).map((_, i) => Array.from({ length: 25 }).map((_, j) => {
                const seed = (i * 7 + j * 13 + i * j) % 17;
                return seed < 8 ? <rect key={`${i}-${j}`} x={i * 4} y={j * 4} width={4} height={4} fill="var(--ink)" /> : null;
              }))}
              {/* Corner markers */}
              {[[0,0],[80,0],[0,80]].map(([x,y]) => (
                <g key={`${x}-${y}`}>
                  <rect x={x} y={y} width={20} height={20} fill="var(--ink)" />
                  <rect x={x+4} y={y+4} width={12} height={12} fill="#fff" />
                  <rect x={x+8} y={y+8} width={4} height={4} fill="var(--ink)" />
                </g>
              ))}
              {/* Center logo overlay */}
              <rect x="38" y="38" width="24" height="24" fill="#fff" />
              <circle cx="50" cy="50" r="9" fill="var(--green)" stroke="var(--ink)" strokeWidth="1.5" />
            </svg>
          </div>
          <div style={{ marginTop: 14, fontFamily: 'var(--font-display-cond)', color: 'var(--ink)', fontSize: 14, letterSpacing: '0.08em' }}>
            APONTE A CÂMERA DO SEU BANCO
          </div>
          <div style={{
            marginTop: 14, padding: 10,
            background: 'var(--cream-deep)', border: '2px dashed var(--ink)', borderRadius: 10,
            fontFamily: 'monospace', fontSize: 11, color: 'var(--ink)', wordBreak: 'break-all',
            lineHeight: 1.4,
          }}>
            00020126360014BR.GOV.BCB.PIX0114+5581988887777520400005303986540575.005802BR5921FORRO DAS TONHAS6009OLINDA62070503***6304A1B2
          </div>
          <button className="btn-ghost" style={{ marginTop: 12 }}>📋 Copiar código PIX</button>
        </div>

        <div style={{ marginTop: 14, fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-soft)', textAlign: 'center', lineHeight: 1.6 }}>
          Valor: <strong style={{ color: 'var(--ink)' }}>R$ 75,00</strong> · Pedido #<strong>4827</strong><br />
          Após o pagamento, aguarde até 30s para a confirmação.
        </div>
      </div>
    </div>
  );
}

// ====== DESKTOP — HOME ======
function DesktopHome() {
  const [qty, setQty] = useState({ promo: 1, lote2: 0, mesa: 0 });
  const total = EVENT.tickets.reduce((s, t) => s + t.price * (qty[t.id] || 0), 0);
  const update = (id, d) => {
    setQty(q => {
      const others = Object.entries(q).reduce((s, [k, v]) => k !== id ? s + v : s, 0);
      const next = Math.max(0, Math.min(2 - others, (q[id] || 0) + d));
      return { ...q, [id]: next };
    });
  };

  return (
    <div style={{ height: '100%', overflow: 'auto', background: 'var(--cream)' }} className="paper-bg">
      {/* Top nav */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 48px',
        borderBottom: '2px solid var(--ink)',
        background: 'var(--cream-warm)',
      }}>
        <LogoWordmark size={0.7} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <a className="t-display-cond" style={navLink}>O EVENTO</a>
          <a className="t-display-cond" style={navLink}>LINE-UP</a>
          <a className="t-display-cond" style={navLink}>COMO CHEGAR</a>
          <a className="t-display-cond" style={navLink}>FALE COM A GENTE</a>
          <button className="btn-primary" style={{ width: 'auto', padding: '12px 22px', fontSize: 14 }}>
            Comprar ingresso →
          </button>
        </div>
      </div>

      {/* Bandeirinhas */}
      <div style={{ position: 'relative', height: 70 }}>
        <Bandeirinhas count={12} height={70} />
      </div>

      {/* HERO */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 40,
        padding: '20px 48px 60px',
        position: 'relative',
      }}>
        {/* LEFT: text + lockup */}
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--ink)', color: 'var(--cream-warm)', padding: '6px 14px', borderRadius: 999, fontFamily: 'var(--font-display-cond)', fontSize: 12, letterSpacing: '0.2em', marginBottom: 18 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }}></span>
            VENDA OFICIAL · ÚLTIMOS LOTES
          </div>

          <div className="t-display" style={{
            fontSize: 156, color: 'var(--green)',
            WebkitTextStroke: '3px var(--ink)', paintOrder: 'stroke fill',
            lineHeight: 0.85,
            letterSpacing: '-0.025em',
          }}>
            FORRÓ
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 18, margin: '8px 0',
          }}>
            <span className="t-display" style={{ fontSize: 56, color: 'var(--ink)' }}>DAS</span>
            <Sparkle size={42} fill="var(--indigo)" />
            <span className="t-script" style={{ fontSize: 32, color: 'var(--red)', transform: 'rotate(-4deg)', display: 'inline-block' }}>pé de serra</span>
          </div>
          <div className="t-display" style={{
            fontSize: 156, color: 'var(--green)',
            WebkitTextStroke: '3px var(--ink)', paintOrder: 'stroke fill',
            lineHeight: 0.85,
            letterSpacing: '-0.025em',
          }}>
            TONHAS
          </div>

          {/* Match line */}
          <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 16 }}>
            <span className="t-display-cond" style={{ fontSize: 34, color: 'var(--indigo)' }}>BRASIL</span>
            <Sparkle size={24} fill="var(--yellow)" />
            <span className="t-display-cond" style={{ fontSize: 34, color: 'var(--indigo)' }}>MARROCOS</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-soft)', marginLeft: 8 }}>
              quinteto pé de serra<br /> transmissão ao vivo
            </span>
          </div>

          {/* Decorative sun */}
          <div style={{ position: 'absolute', left: -40, bottom: -30 }}>
            <SunRays size={170} fill="var(--yellow)" />
          </div>
        </div>

        {/* RIGHT: ticket box */}
        <div style={{ position: 'relative' }}>
          {/* Floating decorations */}
          <div style={{ position: 'absolute', top: -22, right: -12 }}>
            <Star size={48} fill="var(--red)" rotate={15} />
          </div>

          <div className="surface-card" style={{ padding: 22, position: 'relative' }}>
            {/* Date strip */}
            <div style={{
              background: 'var(--ink)', color: 'var(--cream-warm)',
              borderRadius: 14, padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16,
            }}>
              <div style={{ textAlign: 'center', lineHeight: 0.9 }}>
                <div className="t-display" style={{ fontSize: 38, color: 'var(--yellow)' }}>13</div>
                <div className="t-display-cond" style={{ fontSize: 13, letterSpacing: '0.1em' }}>JUN · 2026</div>
              </div>
              <div style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 13 }}>
                <div style={{ opacity: 0.7, fontFamily: 'var(--font-display-cond)', letterSpacing: '0.12em', fontSize: 10 }}>SÁBADO</div>
                <div style={{ fontWeight: 600 }}>16h às 22h</div>
                <div style={{ opacity: 0.8, marginTop: 2, fontSize: 12 }}>📍 @becodoalto.olinda</div>
              </div>
            </div>

            <div className="t-display-cond" style={{ fontSize: 20, marginBottom: 10 }}>ESCOLHA SEU INGRESSO</div>

            {EVENT.tickets.map(t => (
              <TicketRow key={t.id} t={t} qty={qty[t.id] || 0} onChange={(d) => update(t.id, d)} />
            ))}

            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              padding: '10px 4px', marginTop: 6,
            }}>
              <span style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-soft)', fontSize: 13 }}>Total</span>
              <span className="t-display" style={{ fontSize: 36, color: 'var(--green-deep)' }}>{BRL(total)}</span>
            </div>
            <button className="btn-primary" disabled={total === 0}>
              Continuar · PIX na hora →
            </button>
            <div style={{ textAlign: 'center', fontSize: 11, fontFamily: 'var(--font-body)', color: 'var(--ink-soft)', marginTop: 10 }}>
              🔒 Ambiente seguro · QR Code PIX gerado na hora · máx. 2 por pedido
            </div>
          </div>
        </div>
      </div>

      {/* Info strip */}
      <div style={{
        background: 'var(--green)', color: 'var(--ink)',
        borderTop: '2.5px solid var(--ink)', borderBottom: '2.5px solid var(--ink)',
        padding: '14px 48px',
        display: 'flex', alignItems: 'center', gap: 40, fontFamily: 'var(--font-display-cond)', fontSize: 16, letterSpacing: '0.1em',
        overflow: 'hidden', whiteSpace: 'nowrap',
      }}>
        <span>✦ FORRÓ PÉ DE SERRA</span>
        <span>✦ QUINTETO AO VIVO</span>
        <span>✦ COMIDA DE BOTECO</span>
        <span>✦ CACHAÇA DA TERRA</span>
        <span>✦ OLINDA · PE</span>
        <span>✦ 13/06/2026</span>
      </div>
    </div>
  );
}

const navLink = {
  fontSize: 13, color: 'var(--ink)', letterSpacing: '0.12em',
  cursor: 'pointer', textDecoration: 'none',
};

Object.assign(window, { MobileHome, MobileCheckout, MobilePix, DesktopHome, BRL });
