/* ============================================================
   FORRÓ DAS TONHAS — App entry
   Composes everything into a DesignCanvas
   ============================================================ */

const { useState: useStateApp } = React;

// Mobile flow with internal state (single artboard, 3 screens)
function MobileFlow() {
  const [step, setStep] = useStateApp(0);
  const screens = [
    <MobileHome onAdvance={() => setStep(1)} />,
    <MobileCheckout onAdvance={() => setStep(2)} onBack={() => setStep(0)} />,
    <MobilePix onBack={() => setStep(1)} />,
  ];
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Mini tab indicator (so user knows it's an interactive flow) */}
      <div style={{
        flex: 'none',
        display: 'flex', gap: 4, padding: 6,
        background: 'var(--ink)', justifyContent: 'center',
      }}>
        {['Home','Dados','PIX'].map((label, i) => (
          <button key={i} onClick={() => setStep(i)} style={{
            background: i === step ? 'var(--green)' : 'transparent',
            color: i === step ? 'var(--ink)' : 'var(--cream-warm)',
            border: 'none', padding: '4px 10px', borderRadius: 999,
            fontFamily: 'var(--font-display-cond)', fontSize: 11,
            letterSpacing: '0.1em', cursor: 'pointer',
          }}>{label.toUpperCase()}</button>
        ))}
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        {screens[step]}
      </div>
    </div>
  );
}

function App() {
  return (
    <TweaksProvider>
      <DesignCanvas>
        <DCSection id="site-mobile" title="Site · Mobile" subtitle="90% das vendas — fluxo completo. Use os Tweaks para ajustar paleta, fonte e copy ao vivo.">
          <DCArtboard id="m-flow" label="🪗 Fluxo completo (interativo)" width={390} height={780}>
            <MobileFlow />
          </DCArtboard>
          <DCArtboard id="m-home" label="01 · Home (venda)" width={390} height={780}>
            <MobileHome onAdvance={() => {}} />
          </DCArtboard>
          <DCArtboard id="m-checkout" label="02 · Seus dados" width={390} height={780}>
            <MobileCheckout onAdvance={() => {}} onBack={() => {}} />
          </DCArtboard>
          <DCArtboard id="m-pix" label="03 · PIX" width={390} height={780}>
            <MobilePix onBack={() => {}} />
          </DCArtboard>
        </DCSection>

        <DCSection id="brand" title="Identidade · Logo" subtitle="Marca principal + variações de uso">
          <DCArtboard id="logo-primary" label="Logo principal" width={540} height={420}>
            <LogoPrimary />
          </DCArtboard>
          <DCArtboard id="logo-badge" label="Selo · uso comemorativo" width={300} height={300}>
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }} className="paper-bg">
              <LogoBadge size={240} />
            </div>
          </DCArtboard>
          <DCArtboard id="logo-wordmark" label="Wordmark · headers" width={400} height={160}>
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }} className="paper-bg">
              <LogoWordmark size={1.2} />
            </div>
          </DCArtboard>
          <DCArtboard id="logo-monogram" label="Monograma · avatar/favicon" width={200} height={200}>
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }} className="paper-bg">
              <LogoMonogram size={140} />
            </div>
          </DCArtboard>
        </DCSection>

        <DCSection id="site-desktop" title="Site · Desktop" subtitle="Versão para tela larga">
          <DCArtboard id="d-home" label="Home desktop" width={1280} height={900}>
            <DesktopHome />
          </DCArtboard>
        </DCSection>

        <DCSection id="art" title="Artes de divulgação" subtitle="Feed Instagram, Story e variantes">
          <DCArtboard id="a-feed" label="Post feed · 1080×1080" width={540} height={540}>
            <ArtFeed scale={0.5} />
          </DCArtboard>
          <DCArtboard id="a-story" label="Story · 1080×1920" width={405} height={720}>
            <ArtStory scale={0.375} />
          </DCArtboard>
          <DCArtboard id="a-story-lotes" label="Story · Lotes" width={405} height={720}>
            <ArtStoryLotes scale={0.375} />
          </DCArtboard>
        </DCSection>
      </DesignCanvas>
    </TweaksProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
