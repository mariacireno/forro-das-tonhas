/* ============================================================
   FORRÓ DAS TONHAS — Tweaks
   Context + panel UI. Lifts visual variables out of components
   so the user can tweak them live.
   ============================================================ */

const TweaksContext = React.createContext({});
const useTweaksCtx = () => React.useContext(TweaksContext);

// Palette presets ---------------------------------------------
const PALETTES = {
  junina_brasil: {
    name: 'Junina · Brasil',
    cream:        '#F1ECDB',
    'cream-deep': '#E6DCBF',
    'cream-warm': '#F7F2E2',
    green:        '#1EA84A',
    'green-deep': '#137A35',
    indigo:       '#2826D6',
    'indigo-deep':'#1E1C9E',
    yellow:       '#F2C82E',
    'yellow-deep':'#D9AC15',
    red:          '#E63D1F',
    ink:          '#16143A',
    'ink-soft':   '#3A3865',
  },
  verde_sertao: {
    name: 'Verde sertão',
    cream:        '#F2EAD6',
    'cream-deep': '#E0D2A8',
    'cream-warm': '#F8F1DD',
    green:        '#0E7C3A',
    'green-deep': '#0A5826',
    indigo:       '#3D2B1F',
    'indigo-deep':'#28190F',
    yellow:       '#E8A82E',
    'yellow-deep':'#C28614',
    red:          '#C8341A',
    ink:          '#1F1810',
    'ink-soft':   '#5A4530',
  },
  festa_noturna: {
    name: 'Festa noturna',
    cream:        '#1B1644',
    'cream-deep': '#0F0B30',
    'cream-warm': '#26206B',
    green:        '#46E26B',
    'green-deep': '#1FA84A',
    indigo:       '#7B7AFF',
    'indigo-deep':'#5957E0',
    yellow:       '#FFD735',
    'yellow-deep':'#E0B520',
    red:          '#FF5F3F',
    ink:          '#F7F2E2',
    'ink-soft':   '#C5B9E0',
  },
  cordel_quente: {
    name: 'Cordel quente',
    cream:        '#F5E9D2',
    'cream-deep': '#E8D4A3',
    'cream-warm': '#FAF1DE',
    green:        '#3F8A2F',
    'green-deep': '#28611F',
    indigo:       '#9C2A1C',
    'indigo-deep':'#6E1E13',
    yellow:       '#F0B321',
    'yellow-deep':'#C8930E',
    red:          '#D8431F',
    ink:          '#3A1A0C',
    'ink-soft':   '#7A4838',
  },
};

const FONTS = {
  bowlby: '"Bowlby One", "Anton", system-ui, sans-serif',
  anton:  '"Anton", "Bowlby One", system-ui, sans-serif',
  shoulders: '"Big Shoulders Display", "Anton", system-ui, sans-serif',
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "junina_brasil",
  "displayFont": "bowlby",
  "decorIntensity": "balanced",
  "heroIllustration": "sanfona",
  "showMatch": true,
  "matchLineText": "BRASIL × MARROCOS",
  "ctaCopy": "Continuar · PIX na hora",
  "strokeWeight": 1.5
}/*EDITMODE-END*/;

function TweaksProvider({ children }) {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const pal = PALETTES[t.palette] || PALETTES.junina_brasil;

  // Build CSS var overrides from current palette
  const cssVars = {};
  Object.entries(pal).forEach(([k, v]) => {
    if (k !== 'name') cssVars[`--${k}`] = v;
  });
  cssVars['--font-display'] = FONTS[t.displayFont] || FONTS.bowlby;
  cssVars['--font-display-cond'] = t.displayFont === 'anton' ? FONTS.anton : FONTS.anton;
  cssVars['--tweak-stroke'] = t.strokeWeight;

  return (
    <TweaksContext.Provider value={t}>
      <div style={{ ...cssVars, width: '100%', height: '100%' }}>
        {children}
        <TweaksPanel title="Tweaks · Forró das Tonhas">
          <TweakSection label="Paleta" />
          <TweakColor
            label="Esquema de cores"
            value={[pal.green, pal.indigo, pal.yellow, pal.cream]}
            options={Object.entries(PALETTES).map(([k, p]) => [p.green, p.indigo, p.yellow, p.cream])}
            onChange={(v) => {
              // Find which palette key this matches
              const key = Object.keys(PALETTES).find(k =>
                [PALETTES[k].green, PALETTES[k].indigo, PALETTES[k].yellow, PALETTES[k].cream].join() === v.join()
              );
              if (key) setTweak('palette', key);
            }}
          />
          <div style={{ fontSize: 10, opacity: 0.6, marginTop: -4 }}>
            {pal.name}
          </div>

          <TweakSection label="Tipografia" />
          <TweakRadio
            label="Fonte display"
            value={t.displayFont}
            options={['bowlby', 'anton', 'shoulders']}
            onChange={(v) => setTweak('displayFont', v)}
          />
          <TweakSlider
            label="Espessura do contorno"
            value={t.strokeWeight}
            min={0} max={4} step={0.5} unit="px"
            onChange={(v) => setTweak('strokeWeight', v)}
          />

          <TweakSection label="Hero" />
          <TweakRadio
            label="Ilustração"
            value={t.heroIllustration}
            options={['sanfona', 'casal', 'sol', 'só tipo']}
            onChange={(v) => setTweak('heroIllustration', v)}
          />
          <TweakRadio
            label="Decoração"
            value={t.decorIntensity}
            options={['sutil', 'balanced', 'festa']}
            onChange={(v) => setTweak('decorIntensity', v)}
          />

          <TweakSection label="Copy & edição" />
          <TweakToggle
            label="Mostrar disputa (Brasil × Marrocos)"
            value={t.showMatch}
            onChange={(v) => setTweak('showMatch', v)}
          />
          <TweakText
            label="Texto da disputa"
            value={t.matchLineText}
            onChange={(v) => setTweak('matchLineText', v)}
          />
          <TweakText
            label="CTA principal"
            value={t.ctaCopy}
            onChange={(v) => setTweak('ctaCopy', v)}
          />
        </TweaksPanel>
      </div>
    </TweaksContext.Provider>
  );
}

Object.assign(window, { TweaksContext, useTweaksCtx, TweaksProvider, PALETTES, FONTS });
