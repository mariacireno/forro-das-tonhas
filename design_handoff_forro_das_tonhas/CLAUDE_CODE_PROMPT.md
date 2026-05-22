# Prompt pra colar no Claude Code

Cole o texto abaixo no Claude Code, depois de abrir seu projeto do Forró das Tonhas. O Claude vai ler o handoff e implementar.

---

```
Vou te entregar um redesign completo da identidade visual do nosso site
de venda de ingressos do Forró das Tonhas. O pacote está em:

  ./design_handoff_forro_das_tonhas/

Leia primeiro o README.md inteiro — ele contém:
  - Os design tokens (cores, fontes, espaçamentos)
  - Specs de cada tela (mobile e desktop)
  - Componentes SVG decorativos (bandeirinhas, sanfona, etc)
  - Copies oficiais
  - Estado e regras de negócio (máx 2 por pedido, validações, etc)

Os arquivos em reference/ são protótipos em HTML/JSX que rodam no browser
via Babel — eles são REFERÊNCIA DE DESIGN, não código de produção pra
copiar literalmente. Sua tarefa é recriar esses designs dentro do nosso
codebase, seguindo os padrões e bibliotecas que já usamos.

O que vale 1:1 e pode/deve ser portado quase como está:
  - tokens.css (cores, fontes, helpers como .paper-bg, .btn-primary, .input-field)
  - decor.jsx (componentes SVG: Bandeirinhas, Star, Sparkle, Sunburst, SunRays,
    Sanfona, DancingCouple) — vire componentes do nosso framework

O que vale como referência mas precisa reconstrução:
  - site.jsx (telas mobile/desktop)
  - logo.jsx (variações do logo — adapte pro lockup oficial)

Plano sugerido (mas você pode propor melhor):
  1. Faça um sweep no codebase atual pra entender stack (package.json,
     framework, organização de pastas)
  2. Crie um arquivo de tokens (CSS variables ou theme do framework)
     baseado em reference/tokens.css
  3. Porte os SVGs decorativos como componentes
  4. Reconstrua a página /venda com a nova hierarquia (hero → tickets → CTA)
  5. Reconstrua /venda/dados e /venda/pix (telas 2 e 3 do fluxo)
  6. Adapte versão desktop
  7. Garanta que a integração com PIX (geração de QR) continua funcionando
     — só o front muda, backend mantém

Antes de começar, me mostre seu plano de implementação e quaisquer
perguntas que tenha sobre o codebase atual. Comece pelo mobile —
90% das vendas vem de celular.
```

---

## Dicas adicionais

- Se você já personalizou algum tom específico durante a conversa anterior, mencione isso no comando — o Claude Code não tem acesso ao histórico desta conversa
- Mantenha o **backend de geração de PIX intacto** — só o front muda
- A logo definitiva ainda não foi escolhida (4 variações em `reference/logo.jsx`); escolha uma antes de começar ou peça ajuda ao Claude pra decidir

## Verificações finais que vale pedir ao Claude Code

```
Depois de implementar, verifique:
  - Lighthouse score mobile > 90
  - Fontes Google Fonts carregando sem layout shift (use font-display: swap)
  - SVGs com aria-hidden="true"
  - CTA principal acessível por teclado (Tab + Enter)
  - Inputs com labels associados
  - Mensagens de erro de validação claras
  - Funciona em iOS Safari e Android Chrome (testar -webkit-text-stroke)
```
