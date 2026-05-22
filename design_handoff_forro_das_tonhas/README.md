# Handoff — Forró das Tonhas · Redesign do site de venda de ingressos

## Visão geral

Este pacote contém a **nova identidade visual** do **Forró das Tonhas** e seu **fluxo de venda de ingressos** (mobile + desktop), inspirado no flyer junino existente do evento (verde kelly + azul/roxo elétrico + amarelo + creme texturizado, com vibe São João + cores da seleção brasileira).

A entrega substitui o front atual hospedado em `forro-das-tonhas-production.up.railway.app/venda`.

---

## ⚠️ Sobre os arquivos deste pacote

Os arquivos em `reference/` são **prototipações em HTML/JSX rodando via Babel no navegador** — ou seja, **referências de design**, não código de produção pra copiar literalmente.

Sua tarefa (e do Claude Code) é **recriar esses designs dentro do ambiente real do projeto** (qualquer que seja: Next.js/React, Vue, Astro, Svelte, etc.), seguindo os padrões já estabelecidos no codebase. O que **vale 1:1** é:

- **Os design tokens** (`tokens.css`) — cores, fontes, espaçamentos
- **Os componentes SVG decorativos** (`decor.jsx`) — bandeirinhas, estrelas, sanfona, sunburst (esses podem ser portados quase como estão)
- **A hierarquia visual e regras de layout** (descritas abaixo)
- **As copies e textos** (descritas abaixo)

O que **NÃO vale 1:1**: a estrutura React específica, o gerenciamento de estado, o sistema de Tweaks (ferramenta de exploração, não produção).

## Fidelidade

**Alta fidelidade (hifi)** — colors, tipografia, espaçamentos e interações estão definitivos. Reproduzir pixel-perfect, ajustando apenas conforme convenções do codebase.

---

## Stack-agnóstico

Não sei seu stack atual (Railway → pode ser Node/Express, Next.js, Python, etc). Recomendações por cenário:

- **Next.js / React** → portar `decor.jsx` direto, usar Tailwind ou CSS Modules com as variáveis em `tokens.css`
- **Express + EJS/templates** → manter SVGs como partials, CSS via `tokens.css` importado no layout
- **Astro / 11ty** → componentes Astro pros SVGs, CSS global com tokens
- **Sem framework JS** → tokens.css + HTML puro + SVGs inline; o fluxo do form em vanilla JS (já é só um form com soma de preços + chamada pra gerar PIX)

---

## Sistema de design — Tokens

### Cores (paleta principal: "Junina · Brasil")

| Token             | Hex       | Uso                                    |
|-------------------|-----------|----------------------------------------|
| `--cream`         | `#F1ECDB` | Fundo principal (com textura de papel) |
| `--cream-deep`    | `#E6DCBF` | Fundo secundário                       |
| `--cream-warm`    | `#F7F2E2` | Inputs, cards (clarinho)               |
| `--green`         | `#1EA84A` | Marca, títulos, CTAs                   |
| `--green-deep`    | `#137A35` | Preços, ênfase verde                   |
| `--indigo`        | `#2826D6` | Ilustrações line-art, secundária       |
| `--indigo-deep`   | `#1E1C9E` | Acentos                                |
| `--yellow`        | `#F2C82E` | Estrelas, datas em destaque            |
| `--yellow-deep`   | `#D9AC15` | Hover/active                           |
| `--red`           | `#E63D1F` | Urgência ("esgotando"), tagline       |
| `--ink`           | `#16143A` | Texto principal, bordas, contornos     |
| `--ink-soft`      | `#3A3865` | Texto secundário                       |

> **Outras paletas** (Verde sertão, Festa noturna, Cordel quente) estão definidas em `reference/tweaks-config.jsx` — são opções de marca pra editar caso queira sazonalizar futuras edições.

### Textura de papel

```css
.paper-bg {
  background-color: var(--cream);
  background-image:
    radial-gradient(rgba(22,20,58,0.05) 1px, transparent 1px),
    radial-gradient(rgba(22,20,58,0.03) 1px, transparent 1px);
  background-size: 3px 3px, 7px 7px;
  background-position: 0 0, 1px 1px;
}
```

Aplicar em todos os fundos para o efeito "papel craft" / risográfico.

### Tipografia (Google Fonts)

```html
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Bowlby+One&family=Familjen+Grotesk:wght@400;500;600;700&family=Permanent+Marker&display=swap" rel="stylesheet">
```

| Variável                  | Família                | Uso                                       |
|---------------------------|------------------------|-------------------------------------------|
| `--font-display`          | `Bowlby One`           | Wordmark gigante, números (preços, dia)   |
| `--font-display-cond`     | `Anton`                | Headlines secundárias, labels             |
| `--font-body`             | `Familjen Grotesk`     | Corpo, inputs, descrições                 |
| `--font-script`           | `Permanent Marker`     | "pé de serra", "reserva sua mesa" etc.    |

**Regras:**
- Todo texto display em UPPERCASE
- `letter-spacing: -0.02em` no display, `0.04em` no condensado
- `line-height: 0.88–0.95` no display (compacto)
- Texto de corpo: 13–16px / `line-height: 1.4`
- Em mobile, hero "FORRÓ DAS TONHAS" em `56–66px`. Em desktop, `156px`.

### Tratamento "outline-fill"

O recurso visual marcante é texto verde com contorno azul-marinho (`--ink`):
```css
color: var(--green);
-webkit-text-stroke: 1.5px var(--ink);
paint-order: stroke fill;
```
Espessura do stroke: `1px` (mobile pequeno), `1.5–2px` (mobile hero), `3–5px` (desktop/artes).

### Espaçamentos & raios

| Token        | Valor   |
|--------------|---------|
| `--r-xs`     | `4px`   |
| `--r-sm`     | `8px`   |
| `--r-md`     | `14px`  |
| `--r-lg`     | `22px`  |
| `--r-xl`     | `32px`  |
| `--r-pill`   | `999px` |

### Sombras

```css
--shadow-card: 0 2px 0 0 rgba(22,20,58,0.12), 0 8px 24px -8px rgba(22,20,58,0.18);
--shadow-cta:  0 4px 0 0 var(--ink), 0 8px 16px -4px rgba(22,20,58,0.3);
```

**Atenção** ao CTA: sombra "hard" deslocada de 4px (estilo risográfico/cordel) — quando o usuário aperta, `transform: translateY(2px)` + sombra encolhe pra `0 2px 0 0`.

### Bordas

Cards e botões usam `border: 2.5px solid var(--ink)` para o look "ilustrado/impresso". Inputs usam `2px`.

---

## Componentes decorativos (SVG)

Todos em `reference/decor.jsx` — portar como componentes React (ou Vue/Astro/etc) preservando os SVGs. **Os SVGs respondem a `currentColor` indiretamente via `color` prop, então o tema escuro funciona out-of-the-box ao trocar tokens.**

| Componente          | Uso                                                              |
|---------------------|------------------------------------------------------------------|
| `<Bandeirinhas>`    | Garland junina no topo de páginas (props: count, height, colors) |
| `<Star>`            | Estrela 5 pontas, decoração espalhada                            |
| `<Sparkle>`         | Diamante 4 pontas, separador entre palavras                      |
| `<Sunburst>`        | Selo estilo "explosão" — usado em badges "RESERVA SUA MESA"      |
| `<SunRays>`         | Sol estilizado (canto inferior esquerdo do hero)                 |
| `<Sanfona>`         | Sanfona line-art em indigo (hero illustration)                   |
| `<DancingCouple>`   | Casal dançando forró (alternativa ao hero)                       |

---

## Screens

### 1. Mobile · Home (`/venda`)

**Propósito:** Apresentação da edição + escolha de ingressos + CTA pra avançar pro checkout.

**Layout (top → bottom):**

1. **Bandeirinhas garland** — full-width, ~56px altura, 5 bandeirinhas
2. **Pill "VENDA OFICIAL · INGRESSOS ANTECIPADOS"** centralizada, fundo `--ink`, texto `--cream-warm`, dot verde à esquerda
3. **Wordmark do evento** — "FORRÓ / DAS TONHAS" — `font-display` 56px verde com stroke ink, centralizado. Estrelas decorativas flutuando (1 amarela à esquerda, 1 sparkle indigo à direita)
4. **Ilustração da sanfona** (170px largura, indigo line-art) + pequeno `SunRays` 90px no canto inferior esquerdo
5. **Match line opcional:** "BRASIL × MARROCOS" (font-display 22px verde stroke ink) + abaixo "QUINTETO PÉ DE SERRA · TRANSMISSÃO AO VIVO" em font-display-cond 13px indigo, letter-spacing 0.15em
6. **Strip de data** — card preto (`--ink`), border-radius 16px:
   - À esquerda: "**13**" em font-display 36px amarelo + "JUN · 2026" em font-display-cond 14px
   - À direita: "SÁBADO" em letterspacing alto / "16h às 22h" em bold / "📍 @becodoalto.olinda" em fonte body
   - Estrelinha verde de canto sobrepondo o topo direito do card
7. **Endereço** centralizado, texto small `--ink-soft`:
   - "Rua 27 de Janeiro (Rua da Pitombeira), 211"
   - "Sítio Histórico · Olinda · PE"
8. **Seção "ESCOLHA SEU INGRESSO"** — header com label + texto small "máx. 2 / pedido"
9. **3 cards de ingresso** (ver componente `<TicketRow>` abaixo):
   - Lote Promocional · R$ 30,00 · badge "ESGOTANDO" vermelho · "23 restantes"
   - 2º Lote · R$ 45,00
   - Mesa para 4 · R$ 250,00 · "8 mesas"
10. **Footer sticky (sempre visível):** card creme com borda superior `2.5px solid --ink`:
    - Linha 1: contagem de itens (esquerda) + total em font-display 28px (direita)
    - Linha 2: **CTA primário** "**Continuar · PIX na hora →**" — botão verde full-width, borda ink, sombra deslocada 4px
    - Linha 3: pequeno texto "🔒 Ambiente seguro · QR Code PIX gerado na hora"

#### Componente `<TicketRow>`

Container: `border: 2.5px solid var(--ink)`, `border-radius: 16px`, padding 14px, fundo `--cream-warm` quando selecionado, transparente quando 0. Sombra `0 3px 0 0 var(--ink)`.

Layout flex horizontal:
- **Esquerda:** ícone 44×44px com cor de fundo distinta por tipo (verde/indigo/vermelho), border-radius 12px, emoji 🎟 ou 🪑 centralizado
- **Centro:** nome em font-display-cond 16px + badge opcional "ESGOTANDO" (pill vermelha) / preço em font-display 22px verde-deep + "/ unid." em fonte small / opcional "23 restantes" em ink-soft
- **Direita:** Stepper "− 0 +" com botões redondos verdes (28px), border-radius pill no container

**Regras de quantidade:**
- Máx **2 itens no total do pedido** (soma de todas as quantidades). Tentar incrementar acima de 2 não faz nada.
- Mínimo 0 por item.

---

### 2. Mobile · Seus dados (checkout)

**Propósito:** Coletar dados do comprador antes de gerar PIX.

**Layout:**

1. **Header preto** — botão "← Voltar" (esquerda) + wordmark mini centralizado
2. **Stepper de progresso** — 3 bolinhas (01 ✓ / 02 ativo / 03 inativo) com linhas conectando:
   - Done: verde com check
   - Active: amarelo com número + label
   - Pending: cream-warm
3. **Headline** "QUEM VAI ARRASTAR O PÉ?" em font-display-cond 28px
4. **Subheadline** "O ingresso vai pro seu e-mail com QR code de entrada." em body
5. **4 inputs:** Nome completo / E-mail / CPF / Celular — todos com `<label-strong>` (font-display-cond uppercase 13px) + input com borda 2px ink
6. **Resumo do pedido** (card creme com borda):
   - Header "SEU PEDIDO" em font-display-cond
   - Linhas item · preço (body 14px)
   - Linha divisória sutil
   - TOTAL em font-display-cond 14px à esquerda + valor em font-display 28px verde-deep à direita
7. **Footer sticky:** CTA "**Gerar QR Code PIX →**" (verde, mesma sombra). Disabled quando nome < 4 chars OR email sem "@"

---

### 3. Mobile · PIX

**Propósito:** Mostrar QR Code + Pix Copia-e-Cola + status.

**Layout:**

1. **Header preto + Stepper** (igual ao Checkout, mas 01 e 02 done, 03 active)
2. **Headline** "PAGUE COM PIX" + subheadline "QR Code expira em **09:42**." (timer vermelho)
3. **Card central** com:
   - Caixa branca interna com QR Code 180×180px (pode ser SVG do QR real gerado pelo backend)
   - Pequeno logo redondo verde no centro do QR (overlay)
   - "APONTE A CÂMERA DO SEU BANCO" em font-display-cond 14px
   - **Código PIX copia-e-cola** em monospace 11px dentro de caixa tracejada `--cream-deep`
   - Botão "📋 Copiar código PIX" (btn-ghost)
4. **Footer info:** "Valor: R$ 75,00 · Pedido #4827" + "Após o pagamento, aguarde até 30s para a confirmação."

---

### 4. Desktop · Home

Grid 1.2fr / 0.8fr:

- **Coluna esquerda:** Wordmark gigantesco (FORRÓ 156px / DAS + sparkle + "pé de serra" script / TONHAS 156px) + match line "BRASIL × MARROCOS" em 34px + sun rays no canto inferior
- **Coluna direita:** Caixa de ingressos (mesmo componente do mobile, dentro de `<surface-card>` 22px padding) + strip de data no topo + CTA full-width

**Topo:** Nav bar com Wordmark à esquerda, links "O EVENTO · LINE-UP · COMO CHEGAR · FALE COM A GENTE" no centro, CTA "Comprar ingresso →" à direita.

**Faixa verde inferior:** scrolling marquee com items "✦ FORRÓ PÉ DE SERRA ✦ QUINTETO AO VIVO ✦ COMIDA DE BOTECO ✦ CACHAÇA DA TERRA ✦ OLINDA · PE ✦ 13/06/2026".

---

## Estados, validação & interações

### Estado mínimo
```ts
type CartItem = { ticketId: 'promo' | 'lote2' | 'mesa', qty: number };
type Cart = CartItem[]; // soma de qty <= 2

type BuyerData = {
  name: string;        // required, > 3 chars
  email: string;       // required, regex email
  cpf: string;         // mask 000.000.000-00, validar dígito
  phone: string;       // mask (DD) 9 9999-9999
};

type Order = {
  cart: Cart;
  buyer: BuyerData;
  total: number;       // calculado server-side também!
  orderId: string;
  pixCode: string;     // gerado server-side
  pixExpiresAt: Date;
};
```

### Regras
- Total do pedido = soma de `ticket.price * item.qty`
- Máximo 2 itens totais no pedido (incluindo mesas, embora cada mesa = 1 item que abrange 4 pessoas)
- CTA "Continuar" desabilitado quando total = 0
- CTA "Gerar PIX" desabilitado até nome (>3) e email (com @) válidos
- Botão CTA: ao pressionar, `translateY(2px)` + sombra reduzida (`:active`)
- Inputs: ao focar, borda muda pra `--green` + box-shadow `0 0 0 3px rgba(30,168,74,0.2)`

### Transições
- Tudo discreto: 120ms ease nos botões/inputs.
- Sem animações exageradas.

---

## Acessibilidade

- Contraste OK em todas paletas testadas (verde sobre creme, ink sobre creme, etc).
- Tamanhos mínimos: corpo 13px, hit targets ≥ 44×44px (steppers, CTA).
- Inputs sempre com `<label>` visível.
- SVGs decorativos com `aria-hidden="true"`.

---

## Arquivos neste pacote

```
design_handoff_forro_das_tonhas/
├── README.md                    ← este arquivo (especificação completa)
├── CLAUDE_CODE_PROMPT.md        ← prompt pronto pra colar no Claude Code
└── reference/                   ← protótipos HTML originais, abrir num browser
    ├── index.html               ← entrada (design canvas com tudo)
    ├── tokens.css               ← design tokens (cores, fonts, helpers) ⭐
    ├── decor.jsx                ← componentes SVG decorativos ⭐
    ├── logo.jsx                 ← variações de logo
    ├── site.jsx                 ← screens: MobileHome, MobileCheckout, MobilePix, DesktopHome
    ├── art.jsx                  ← post feed + story (referência de arte)
    ├── app.jsx                  ← composição do canvas
    └── tweaks-config.jsx        ← paletas alternativas + sistema de variação visual
```

**Como rodar localmente** para inspecionar:
```bash
cd reference
python -m http.server 8000
# abrir http://localhost:8000
```

(Não funciona com `file://` por causa dos imports JSX via Babel — precisa servir via http.)

---

## Conteúdo (copies oficiais)

### Hero
- Top pill: "**VENDA OFICIAL · INGRESSOS ANTECIPADOS**"
- Nome: "**FORRÓ DAS TONHAS**"
- Sublinha: "BRASIL × MARROCOS · Quinteto Pé de Serra · Transmissão ao vivo"
- Data: "13 de junho de 2026 · sábado · 16h às 22h"
- Local: "📍 @becodoalto.olinda · Rua 27 de Janeiro (Rua da Pitombeira), 211 · Sítio Histórico · Olinda · PE"

### Tickets
- "**Lote Promocional**" — R$ 30,00
- "**2º Lote**" — R$ 45,00
- "**Mesa para 4**" — R$ 250,00 (atende 4 pessoas)

### CTAs
- Home → Checkout: "**Continuar · PIX na hora →**"
- Checkout → PIX: "**Gerar QR Code PIX →**"

### Headlines secundárias
- Checkout: "**QUEM VAI ARRASTAR O PÉ?**"
- PIX: "**PAGUE COM PIX**"

### Subscript / disclaimers
- "🔒 Ambiente seguro · QR Code PIX gerado na hora"
- "máx. 2 por pedido"
- "O ingresso vai pro seu e-mail com QR code de entrada."
- "Após o pagamento, aguarde até 30s para a confirmação."

---

## Próximos passos sugeridos (não estão neste pacote)

- **Tela de sucesso pós-pagamento** (com QR code do ingresso pra entrada)
- **E-mail transacional** (template no mesmo visual)
- **Página /sobre** com line-up completo e fotos
- **Tela de admin** pra criar novas edições do Forró das Tonhas
- **Versão impressa** do flyer A4

Pergunte ao Claude que estes são naturalmente os próximos passos depois de entregar este redesign.
