# Arquitetura Frontend — Sistema de Venda e Validação de Ingressos

> Stack: **Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion · Zustand · React Query**
> Design: **Precision Dark — Preto profundo · Slate Blue · Tipografia editorial · Animações suaves**
> 5 sprints · 2 semanas cada · 10 semanas no total

---

## Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Next.js 14 App Router                        │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  ┌──────────┐  │
│  │  (auth)/     │  │  (app)/      │  │ (staff)/  │  │   api/   │  │
│  │  login       │  │  checkout    │  │  scanner  │  │  route   │  │
│  │  register    │  │  tickets     │  │           │  │  handlers│  │
│  └──────┬───────┘  └──────┬───────┘  └─────┬─────┘  └──────────┘  │
│         │                 │                 │                       │
│         └─────────────────┴─────────────────┘                      │
│                           │                                         │
│              ┌────────────▼────────────┐                           │
│              │   Shared Components     │                           │
│              │   Hooks · Stores · Lib  │                           │
│              └────────────┬────────────┘                           │
└───────────────────────────┼─────────────────────────────────────────┘
                            │
              ┌─────────────▼─────────────┐
              │   Spring Boot REST API    │
              │   /api/**                 │
              └───────────────────────────┘
```

---

## Design System

### Paleta de Cores

```css
/* tokens.css */
:root {
  /* Base */
  --color-bg:          #0A0A0B;   /* Preto profundo */
  --color-surface:     #111113;   /* Cards e modais */
  --color-surface-2:   #1A1A1E;   /* Inputs e hover */
  --color-border:      #2A2A30;   /* Bordas sutis */

  /* Primária — Slate Blue — Azul ardósia */
  --color-primary:      #6C8EBF;   /* Azul ardósia principal */
  --color-primary-light: #9AB4D8;   /* Azul claro */
  --color-primary-dim:  #3D5A80;   /* Azul escuro */

  /* Status */
  --color-success:     #2ECC71;
  --color-error:       #E74C3C;
  --color-warning:     #F39C12;
  --color-pending:     #3498DB;

  /* Texto */
  --color-text-primary:   #E8ECF0;   /* Off-white frio */
  --color-text-secondary: #8A8490;
  --color-text-muted:     #4A4750;

  /* Tipografia */
  --font-display: "Cormorant Garamond", serif;   /* Títulos — elegância editorial */
  --font-body:    "DM Sans", sans-serif;         /* Corpo — legibilidade clean */
  --font-mono:    "JetBrains Mono", monospace;   /* Códigos e valores */
}
```

### Tipografia

| Token | Fonte | Tamanho | Peso | Uso |
|-------|-------|:-------:|:----:|-----|
| `display-xl` | Cormorant Garamond | 64px | 300 | Hero principal |
| `display-lg` | Cormorant Garamond | 48px | 400 | Títulos de página |
| `display-md` | Cormorant Garamond | 32px | 400 | Subtítulos |
| `body-lg` | DM Sans | 18px | 400 | Texto principal |
| `body-md` | DM Sans | 16px | 400 | Parágrafo |
| `body-sm` | DM Sans | 14px | 400 | Labels e captions |
| `mono` | JetBrains Mono | 14px | 400 | PIX, UUIDs, tokens |

### Animações

```typescript
// lib/animations.ts — variantes Framer Motion reutilizáveis

export const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
}

export const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } }
}

export const staggerContainer = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08 } }
}

export const scaleIn = {
  hidden:  { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } }
}

export const slideInRight = {
  hidden:  { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }
}

// Micro-interação: botão com efeito de pressão
export const buttonTap = { scale: 0.97, transition: { duration: 0.1 } }
```

### Componentes Base

```
components/
├── ui/
│   ├── Button.tsx          # Variantes: primary (slate blue), ghost, danger
│   ├── Input.tsx           # Float label + borda animada no focus
│   ├── Card.tsx            # Glassmorphism sutil com border slate blue
│   ├── Badge.tsx           # Status: PENDING | PAID | USED
│   ├── Spinner.tsx         # Anel slate blue giratório
│   ├── Toast.tsx           # Notificações com Framer Motion
│   └── Divider.tsx         # Linha ornamental slate blue
│
├── layout/
│   ├── Navbar.tsx          # Logo + nav links + avatar menu
│   ├── Footer.tsx          # Links e copyright
│   └── PageTransition.tsx  # Wrapper com animação entre rotas
│
└── feedback/
    ├── LoadingScreen.tsx   # Tela de carregamento inicial
    ├── ErrorBoundary.tsx   # Tratamento global de erros
    └── EmptyState.tsx      # Estado vazio com ilustração SVG
```

---

## Estrutura de Diretórios

```
src/
├── app/
│   ├── layout.tsx                    # Root layout (fontes, providers, toasts)
│   ├── page.tsx                      # Landing page pública
│   │
│   ├── (auth)/                       # Grupo sem navbar
│   │   ├── layout.tsx                # Layout centrado com bg animado
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   │
│   ├── (app)/                        # Grupo com navbar (autenticado)
│   │   ├── layout.tsx                # Middleware de proteção de rota
│   │   ├── checkout/page.tsx
│   │   └── tickets/
│   │       ├── page.tsx              # Lista de ingressos
│   │       └── [uuid]/page.tsx       # Ingresso individual com QR Code
│   │
│   └── (staff)/                      # Grupo restrito a STAFF
│       ├── layout.tsx
│       └── scanner/page.tsx
│
├── components/
│   ├── ui/                           # Componentes atômicos
│   ├── layout/                       # Estrutura de página
│   ├── feedback/                     # Estados de UI
│   ├── auth/                         # LoginForm, RegisterForm
│   ├── checkout/                     # CheckoutCard, QrCodeDisplay, StatusPolling
│   ├── tickets/                      # TicketCard, TicketList, TotpQrCode
│   └── scanner/                      # CameraView, ScanResult, ValidationFeedback
│
├── hooks/
│   ├── useAuth.ts                    # Login, logout, estado do usuário
│   ├── useCheckout.ts                # Criação de cobrança PIX
│   ├── useTickets.ts                 # Listagem e busca de ingressos
│   ├── useTotpQr.ts                  # Rotação TOTP a cada 30s
│   ├── useScanner.ts                 # Controle de câmera e validação
│   └── useOrderStatus.ts            # Polling de status do pedido
│
├── stores/
│   ├── authStore.ts                  # Zustand: token JWT, dados do usuário
│   └── uiStore.ts                    # Zustand: toasts, loading global
│
├── lib/
│   ├── api.ts                        # Axios instance com interceptors
│   ├── animations.ts                 # Variantes Framer Motion
│   ├── queryClient.ts               # React Query config
│   ├── validators.ts                 # Zod schemas
│   └── utils.ts                      # Funções utilitárias
│
├── types/
│   ├── auth.ts
│   ├── ticket.ts
│   └── scan.ts
│
└── middleware.ts                     # Proteção de rotas via Next.js middleware
```

---

## Segurança Frontend

### Proteção de Rotas

```typescript
// middleware.ts
// Lógica de proteção sem expor detalhes de implementação

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value
  const { pathname } = request.nextUrl

  // Rotas que exigem autenticação
  const protectedPaths = ["/checkout", "/tickets", "/scanner"]

  // Rotas exclusivas para STAFF (verificadas via JWT claims)
  const staffPaths = ["/scanner"]

  // Redireciona unauthenticated → /login
  // Redireciona não-STAFF de /scanner → /tickets
  // Redireciona autenticado de /login → /tickets
}
```

### Armazenamento de Token

```typescript
// authStore.ts — token em httpOnly cookie, NUNCA em localStorage

// ✅ Correto: token armazenado em cookie httpOnly (via API route)
// ✅ Correto: dados não-sensíveis do usuário em Zustand (email, role)
// ❌ Errado: JWT em localStorage (vulnerável a XSS)
// ❌ Errado: dados sensíveis em sessionStorage
```

### Cliente HTTP Seguro

```typescript
// lib/api.ts

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,      // envia cookies em cross-origin
  timeout: 10_000,
})

// Interceptor: injeta Authorization header
api.interceptors.request.use((config) => {
  const token = getTokenFromCookie()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Interceptor: redireciona para /login em 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthAndRedirect("/login")
    }
    return Promise.reject(error)
  }
)
```

### Validação de Inputs (Zod)

```typescript
// lib/validators.ts

export const loginSchema = z.object({
  email:    z.string().email("E-mail inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
})

export const registerSchema = loginSchema.extend({
  name:            z.string().min(2),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
})

export const scanRequestSchema = z.object({
  ticketUuid: z.string().uuid("UUID inválido"),
  totpToken:  z.string().length(6, "Token deve ter 6 dígitos").regex(/^\d+$/),
})
```

---

---

# Sprint 1 — Fundação: Auth, Layout e Design System
**Semanas 1–2 · 8 story points**

> **Objetivo:** scaffold Next.js configurado, design system base implementado, páginas de login e cadastro funcionando com animações.

## Páginas e Componentes

```
app/
├── layout.tsx            # Providers: QueryClient, Zustand, Toaster
├── (auth)/
│   ├── layout.tsx        # Background: partículas slate blue animadas em canvas
│   ├── login/page.tsx    # Formulário com validação Zod + React Hook Form
│   └── register/page.tsx

components/
├── ui/
│   ├── Button.tsx        # Variantes primary/ghost + animação de loading
│   ├── Input.tsx         # Float label + borda que acende em focus (slate blue)
│   ├── Toast.tsx         # Slide-in da direita com Framer Motion
│   └── Spinner.tsx
├── auth/
│   ├── LoginForm.tsx     # Campos + submit com feedback visual
│   └── RegisterForm.tsx

stores/
└── authStore.ts          # token, user (email, role), setAuth, clearAuth

lib/
├── api.ts                # Axios instance
└── validators.ts         # loginSchema, registerSchema
```

## Design da Tela de Auth

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   [Background escuro com partículas slate blue         │
│    se movendo lentamente]                           │
│                                                     │
│         ┌───────────────────────────────┐           │
│         │                               │           │
│         │   ◆  INGRESSO                 │           │
│         │      Sistema de Eventos       │           │
│         │                               │           │
│         │   ─────────────────────────   │           │
│         │                               │           │
│         │   [ E-mail               ]    │           │
│         │   [ Senha                ]    │           │
│         │                               │           │
│         │   [   ENTRAR   ──────►  ]     │           │
│         │                               │           │
│         │   Não tem conta? Cadastre-se  │           │
│         └───────────────────────────────┘           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Animações Sprint 1

- **Entrada da página auth**: card sobe com `fadeUp` + `opacity 0→1` em 500ms
- **Focus no Input**: borda anima de `--color-border` para `--color-primary` em 200ms
- **Botão submit**: spinner substitui texto com `AnimatePresence` enquanto carrega
- **Erro de formulário**: campo treme com `keyframes: [0, -6, 6, -4, 4, 0]px` em 300ms
- **Toast**: desliza da direita com `slideInRight`, sai para direita ao fechar

## Testes — Sprint 1

### Unitários (`LoginForm.test.tsx` — Jest + RTL)

```typescript
// 1. Submeter formulário vazio exibe erros de validação nos campos
test("empty submit shows validation errors")

// 2. E-mail com formato inválido exibe mensagem de erro
test("invalid email shows error message")

// 3. Senha com menos de 8 caracteres exibe erro
test("password < 8 chars shows error")

// 4. Formulário válido chama api.post com os dados corretos
test("valid form calls api with correct payload")

// 5. Spinner aparece durante loading e some após resposta
test("spinner shows during loading")

// 6. Erro 401 da API exibe toast de "Credenciais inválidas"
test("401 response shows error toast")
```

### Unitários (`RegisterForm.test.tsx`)

```typescript
// 7. Senhas divergentes exibem erro de confirmação
test("mismatched passwords shows confirm error")

// 8. Registro bem-sucedido redireciona para /tickets
test("successful register redirects to /tickets")
```

### Unitários (`authStore.test.ts`)

```typescript
// 9. setAuth persiste token e dados do usuário corretamente
test("setAuth stores token and user data")

// 10. clearAuth zera o estado completamente
test("clearAuth resets state to initial")
```

### E2E (`auth.spec.ts` — Playwright)

```typescript
// 11. Fluxo login → redirecionamento → página protegida
// 12. Tentativa de acessar /tickets sem login → redireciona para /login
// 13. Logout limpa estado e redireciona para /login
```

---

---

# Sprint 2 — Checkout PIX e Exibição do QR Code
**Semanas 3–4 · 9 story points**

> **Objetivo:** usuário autenticado navega até checkout, clica em "Pagar com PIX", vê QR Code animado e polling de status.

## Páginas e Componentes

```
app/(app)/
└── checkout/page.tsx        # Página principal de compra

components/checkout/
├── CheckoutCard.tsx          # Card com resumo do ingresso + botão CTA
├── QrCodeDisplay.tsx         # QR Code com borda animada + copia-e-cola
├── PixCopyButton.tsx         # Botão "Copiar código" com feedback ✓
├── StatusBadge.tsx           # Badge animado: PENDING → PAID
└── StatusPolling.tsx         # Wrapper de polling com countdown

hooks/
├── useCheckout.ts            # Mutation: POST /api/checkout/pix
└── useOrderStatus.ts         # Query com refetchInterval: 3000ms
```

## Design da Tela de Checkout

```
┌──────────────────────────────────────────────────────────────┐
│  ← Voltar                                    Conta ▾         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│         Seu Ingresso                                         │
│         ─────────────────────────────────────               │
│                                                              │
│   ┌─────────────────────┐   ┌──────────────────────────┐   │
│   │                     │   │                          │   │
│   │  Evento Principal   │   │  ░░░░░░░░░░░░░░░░░░░░░  │   │
│   │  26 de Outubro      │   │  ░░  QR CODE PIX  ░░░░  │   │
│   │  São Paulo, SP      │   │  ░░░░░░░░░░░░░░░░░░░░░  │   │
│   │                     │   │                          │   │
│   │  R$ 120,00          │   │  [ Copiar código  ✓ ]   │   │
│   │                     │   │                          │   │
│   │  [  GERAR PIX  ]    │   │  Expira em  14:32        │   │
│   │                     │   │                          │   │
│   └─────────────────────┘   └──────────────────────────┘   │
│                                                              │
│   ⟳ Aguardando confirmação do pagamento...                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Animações Sprint 2

- **Transição checkout → QR Code**: `AnimatePresence` troca o card com `scaleIn`
- **Borda do QR Code**: gradiente slate blue rotacionando 360° em loop (4s, `ease-linear`)
- **Badge PENDING → PAID**: pulsa suavemente com `scale: [1, 1.05, 1]` a cada 2s; ao confirmar, flash verde com `scaleIn`
- **Contador regressivo**: dígitos trocam com `AnimatePresence` por `fadeUp` de baixo
- **Botão copiar PIX**: ícone de cópia troca para ✓ com `rotateY: 180°` em 300ms, volta após 2s

## Testes — Sprint 2

### Unitários (`CheckoutCard.test.tsx`)

```typescript
// 1. Botão "Gerar PIX" chama hook useCheckout ao ser clicado
test("PIX button triggers useCheckout mutation")

// 2. Loading state desabilita o botão e exibe spinner
test("loading state disables button and shows spinner")

// 3. Erro da API exibe toast com mensagem de falha
test("API error shows failure toast")
```

### Unitários (`QrCodeDisplay.test.tsx`)

```typescript
// 4. QR Code é renderizado quando qrCodeBase64 está presente
test("renders QR code when base64 data is provided")

// 5. Botão copiar altera texto para "Copiado!" após click
test("copy button changes to Copiado after click")

// 6. Countdown exibe tempo restante corretamente
test("countdown displays remaining time correctly")
```

### Unitários (`useOrderStatus.test.ts`)

```typescript
// 7. Polling inicia quando orderId está definido
test("polling starts when orderId is defined")

// 8. Polling para quando status retorna PAID
test("polling stops when status is PAID")

// 9. Intervalo de polling é de 3 segundos
test("polling interval is 3 seconds", () => {
  jest.useFakeTimers()
  // verifica calls ao longo do tempo
})
```

### E2E (`checkout.spec.ts` — Playwright)

```typescript
// 10. Fluxo completo: login → checkout → QR Code visível na tela
// 11. Botão copiar funciona e mostra feedback visual
// 12. Página de checkout sem autenticação → redirect /login
```

---

---

# Sprint 3 — Painel de Ingressos e QR Code TOTP
**Semanas 5–6 · 9 story points**

> **Objetivo:** usuário vê seus ingressos no painel, acessa o ingresso individual e vê QR Code TOTP dinâmico girando a cada 30s.

## Páginas e Componentes

```
app/(app)/tickets/
├── page.tsx                  # Lista de ingressos
└── [uuid]/page.tsx           # Ingresso individual com TOTP

components/tickets/
├── TicketList.tsx             # Grid de cards com stagger animation
├── TicketCard.tsx             # Card com status badge + hover effect
├── TicketDetail.tsx           # Layout do ingresso individual
├── TotpQrCode.tsx             # QR Code dinâmico com countdown circular
└── TotpCountdown.tsx          # SVG progress ring countdown

hooks/
├── useTickets.ts              # GET /api/tickets/mine (React Query)
└── useTotpQr.ts               # Lógica de rotação a cada 30s
```

## Design da Tela de Ingressos

```
┌──────────────────────────────────────────────────────────────┐
│  ◆ INGRESSO                             João Silva  ▾        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Meus Ingressos                                              │
│  ─────────────────────────────────────────────────          │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │                  │  │                  │                 │
│  │ Evento Principal │  │ Workshop Dev     │                 │
│  │ 26 Out · SP      │  │ 27 Out · SP      │                 │
│  │                  │  │                  │                 │
│  │ ● CONFIRMADO     │  │ ○ PENDENTE       │                 │
│  │                  │  │                  │                 │
│  │  Ver ingresso ►  │  │  Ver ingresso ►  │                 │
│  └──────────────────┘  └──────────────────┘                 │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Design da Tela de Ingresso Individual

```
┌──────────────────────────────────────────────────────────────┐
│  ← Meus Ingressos                                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│              Evento Principal                                │
│              26 de Outubro de 2025, 20h                      │
│              Arena São Paulo                                  │
│              ─────────────────────────                       │
│                                                              │
│         ┌─────────────────────────────┐                     │
│         │                             │                     │
│         │   ░░░░░░░░░░░░░░░░░░░░░░░  │                     │
│         │   ░░                   ░░░  │  ← QR Code TOTP    │
│         │   ░░   QR DINÂMICO    ░░░  │                     │
│         │   ░░                   ░░░  │                     │
│         │   ░░░░░░░░░░░░░░░░░░░░░░░  │                     │
│         │                             │                     │
│         │    ◯ ─────────── 28s        │  ← Progress ring   │
│         │       Renova em 28s         │                     │
│         │                             │                     │
│         └─────────────────────────────┘                     │
│                                                              │
│  ⚠ Apresente este QR Code ao staff na entrada               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Animações Sprint 3

- **Entrada da lista**: cards aparecem em stagger (`staggerChildren: 0.08s`) com `fadeUp`
- **TicketCard hover**: `scale: 1.02` + sombra slate blue suave em 200ms
- **Troca do QR Code TOTP**: fade cross-dissolve 400ms a cada 30s (não pisca)
- **Progress ring**: SVG `stroke-dashoffset` anima de 100% a 0% em 30s linearmente
- **Badge CONFIRMADO**: pulsação verde suave em loop (`opacity: [1, 0.7, 1]`, 2s)

## Testes — Sprint 3

### Unitários (`TicketCard.test.tsx`)

```typescript
// 1. Renderiza nome do evento, data e status corretamente
test("renders event name, date and status")

// 2. Badge PAID exibe "Confirmado" com cor verde
test("PAID status shows Confirmado badge in green")

// 3. Badge PENDING exibe "Pendente" com cor azul
test("PENDING status shows Pendente badge in blue")

// 4. Clique no card navega para /tickets/[uuid]
test("card click navigates to ticket detail page")
```

### Unitários (`useTotpQr.test.ts` — Jest fake timers)

```typescript
// 5. Hook retorna qrCodeUri válido no mount
test("hook returns valid qrCodeUri on mount")

// 6. QR Code é regenerado exatamente aos 30 segundos
test("QR code regenerates exactly at 30 seconds", () => {
  jest.useFakeTimers()
  const { result } = renderHook(() => useTotpQr(uuid))
  const initialUri = result.current.qrCodeUri
  act(() => jest.advanceTimersByTime(30_000))
  expect(result.current.qrCodeUri).not.toBe(initialUri)
})

// 7. Countdown começa em 30 e decrementa a cada segundo
test("countdown starts at 30 and decrements each second")

// 8. Cleanup do hook cancela o intervalo ao desmontar
test("hook cleanup cancels interval on unmount")
```

### Unitários (`TotpQrCode.test.tsx`)

```typescript
// 9. Exibe QR Code quando dados estão disponíveis
test("displays QR code when data is available")

// 10. Exibe skeleton loader enquanto faz fetch
test("shows skeleton loader during fetch")

// 11. Progress ring começa em 100% e chega a 0% em 30s
test("progress ring animates from 100 to 0 in 30s")
```

### E2E (`tickets.spec.ts` — Playwright)

```typescript
// 12. Lista de ingressos carrega e exibe cards corretamente
// 13. Ingresso PAID exibe QR Code TOTP; ingresso PENDING não exibe
// 14. QR Code TOTP muda após 30 segundos (verificado via screenshot diff)
```

---

---

# Sprint 4 — Scanner da Equipe (Staff)
**Semanas 7–8 · 7 story points**

> **Objetivo:** staff acessa `/scanner`, abre câmera, escaneia QR Code TOTP e recebe feedback visual imediato.

## Páginas e Componentes

```
app/(staff)/
└── scanner/page.tsx          # Rota protegida (role = STAFF)

components/scanner/
├── CameraView.tsx             # Wrapper html5-qrcode com overlay slate blue
├── ScanOverlay.tsx            # Moldura animada sobre a câmera
├── ValidationFeedback.tsx     # Painel de resultado: verde/vermelho
├── ScanHistory.tsx            # Lista compacta dos últimos scans
└── StaffHeader.tsx            # Header minimalista com logout

hooks/
└── useScanner.ts              # Controle de câmera + POST /api/scan/validate
```

## Design da Tela de Scanner

```
┌──────────────────────────────────────────────────────────────┐
│  SCANNER  ·  Staff Mode                          [Sair]      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │                                                    │     │
│  │              [FEED DA CÂMERA]                      │     │
│  │                                                    │     │
│  │         ╔═══════════════════╗                      │     │
│  │         ║                   ║  ← moldura animada   │     │
│  │         ║   Posicione o     ║                      │     │
│  │         ║   QR Code aqui    ║                      │     │
│  │         ║                   ║                      │     │
│  │         ╚═══════════════════╝                      │     │
│  │                                                    │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │  ✓  INGRESSO VÁLIDO — João Silva                   │     │  ← verde
│  │     Evento Principal · 26 Out · Validado às 19:42  │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Design dos Estados de Validação

```
Estado: VÁLIDO
┌──────────────────────────────────────────────────┐
│  ✓  INGRESSO VÁLIDO                              │  bg: #0D2818, border: #2ECC71
│     João Silva · Evento Principal                │
│     Validado às 19:42:07                         │
└──────────────────────────────────────────────────┘

Estado: JÁ UTILIZADO
┌──────────────────────────────────────────────────┐
│  ✗  INGRESSO JÁ UTILIZADO                        │  bg: #1A0A0A, border: #E74C3C
│     Validado anteriormente às 18:55:21           │
└──────────────────────────────────────────────────┘

Estado: TOKEN INVÁLIDO
┌──────────────────────────────────────────────────┐
│  ⚠  TOKEN EXPIRADO OU INVÁLIDO                   │  bg: #1A1200, border: #F39C12
│     Solicite ao visitante que atualize o QR Code │
└──────────────────────────────────────────────────┘
```

## Animações Sprint 4

- **Moldura da câmera**: 4 cantos animam com `scale` e `opacity` em loop suave (2s, `ease-in-out`)
- **Laser de scan**: linha horizontal translúcida percorre a moldura de cima a baixo em 1.5s loop
- **Resultado VÁLIDO**: painel entra com `scaleIn` + flash verde no fundo (150ms) + vibração do dispositivo (`navigator.vibrate(200)`)
- **Resultado INVÁLIDO**: painel entra com tremor horizontal (`keyframes shake`) + flash vermelho
- **Transição entre scans**: resultado some com `fadeIn` reverso após 4s para reiniciar câmera

## Testes — Sprint 4

### Unitários (`ValidationFeedback.test.tsx`)

```typescript
// 1. Status "valid" renderiza painel verde com nome do titular
test("valid status renders green panel with holder name")

// 2. Status "already_used" renderiza painel vermelho com horário
test("already_used renders red panel with timestamp")

// 3. Status "invalid_token" renderiza painel amarelo com instrução
test("invalid_token renders yellow panel with instruction")

// 4. Painel some automaticamente após 4 segundos
test("panel auto-dismisses after 4 seconds", () => {
  jest.useFakeTimers()
  // renderiza → avança 4s → verifica unmount
})
```

### Unitários (`useScanner.test.ts`)

```typescript
// 5. Scan com token válido chama POST /api/scan/validate com uuid e token
test("valid scan calls validate endpoint with uuid and token")

// 6. Resposta 409 seta status "already_used"
test("409 response sets already_used status")

// 7. Resposta 422 seta status "invalid_token"
test("422 response sets invalid_token status")

// 8. Durante loading, novos scans são ignorados (debounce)
test("new scans ignored during loading")
```

### Segurança (`scanner.spec.ts`)

```typescript
// 9. Acesso a /scanner com role CUSTOMER → redirect /tickets
test("CUSTOMER role redirected from /scanner")

// 10. Acesso a /scanner sem autenticação → redirect /login
test("unauthenticated access redirected to /login")
```

### E2E (`scanner.spec.ts` — Playwright)

```typescript
// 11. Staff autenticado acessa /scanner sem redirect
// 12. Feedback visual correto para cada tipo de resposta da API (mock)
```

---

---

# Sprint 5 — Hardening, Performance e Testes Finais
**Semanas 9–10 · 4 story points**

> **Objetivo:** otimizações de performance, acessibilidade, testes de carga no frontend e aprovação em UAT.

## Implementação

```
app/
└── layout.tsx              # Meta tags de segurança (CSP via headers)

next.config.js              # Headers de segurança, otimização de imagens

components/
└── feedback/
    └── ErrorBoundary.tsx   # Boundary global com UI de fallback elegante

lib/
└── performance.ts          # Web Vitals reporting (LCP, FID, CLS)
```

### Headers de Segurança (`next.config.js`)

```javascript
const securityHeaders = [
  { key: "X-Frame-Options",           value: "DENY" },
  { key: "X-Content-Type-Options",    value: "nosniff" },
  { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",        value: "camera=(self), microphone=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval'",   // necessário para Next.js dev
      "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
      "font-src 'self' fonts.gstatic.com",
      "img-src 'self' data: blob:",
      "connect-src 'self' https://api.seudominio.com",
      "media-src 'self'",                  // câmera no scanner
    ].join("; ")
  }
]
```

### Otimizações de Performance

```
☐ next/image em todas as imagens (lazy loading automático)
☐ Dynamic imports para html5-qrcode (carrega apenas na rota /scanner)
☐ Fontes com display: swap e preconnect para fonts.googleapis.com
☐ React Query staleTime: 30s para lista de tickets (evita refetch desnecessário)
☐ Skeleton loaders em todos os estados de loading (sem layout shift)
☐ Bundle analyzer: chunks acima de 500kb identificados e divididos
```

## Testes — Sprint 5

### Acessibilidade (`a11y.test.tsx` — jest-axe)

```typescript
// 1. Página de login não tem violações WCAG 2.1 AA
test("login page has no accessibility violations", async () => {
  const { container } = render(<LoginPage />)
  expect(await axe(container)).toHaveNoViolations()
})

// 2. Página de tickets não tem violações WCAG 2.1 AA
test("tickets page has no accessibility violations")

// 3. Scanner exibe aria-live region para anunciar resultado ao leitor de tela
test("scanner announces result to screen reader via aria-live")
```

### Performance (`performance.spec.ts` — Playwright)

```typescript
// 4. LCP (Largest Contentful Paint) < 2.5s na página de tickets
test("tickets page LCP < 2.5s")

// 5. CLS (Cumulative Layout Shift) < 0.1 no fluxo de checkout
test("checkout flow CLS < 0.1")
```

### Regressão Visual (`visual.spec.ts` — Playwright + screenshots)

```typescript
// 6. Login page — screenshot diff com baseline aprovado
// 7. Tickets list — screenshot diff com baseline aprovado
// 8. Scanner valid state — screenshot diff com baseline aprovado
```

### Regressão Funcional (suíte completa)

```
☐ auth.spec.ts          — login, register, logout, proteção de rotas
☐ checkout.spec.ts      — PIX, QR Code, polling de status
☐ tickets.spec.ts       — lista, detalhe, TOTP rotation
☐ scanner.spec.ts       — validação, estados de feedback, segurança de role
```

### UAT com Equipe de Staff

```
☐ Scanner testado em iPhone 13+ (Safari)
☐ Scanner testado em Android (Chrome)
☐ QR Code TOTP lido corretamente em ambientes com luz baixa
☐ Tempo de resposta do feedback visual < 1s após scan
☐ Fontes legíveis em brilho baixo de tela
```

---

---

## Resumo de Testes por Sprint

| Sprint | Unitários | Integração/Hooks | E2E (Playwright) | Segurança | Acessib. |
|--------|:---------:|:----------------:|:----------------:|:---------:|:--------:|
| 1 — Auth | 10 | — | 3 | Middleware | — |
| 2 — PIX | 9 | — | 3 | Auth guard | — |
| 3 — TOTP | 11 | — | 3 | — | — |
| 4 — Scanner | 8 | — | 2 | Role guard | — |
| 5 — Produção | — | — | regressão | CSP headers | 3 |

---

## Dependências Principais

```json
{
  "dependencies": {
    "next": "14.x",
    "react": "18.x",
    "typescript": "5.x",
    "tailwindcss": "3.x",
    "framer-motion": "11.x",
    "zustand": "4.x",
    "@tanstack/react-query": "5.x",
    "axios": "1.x",
    "react-hook-form": "7.x",
    "zod": "3.x",
    "@hookform/resolvers": "3.x",
    "html5-qrcode": "2.x",
    "qrcode": "1.x"
  },
  "devDependencies": {
    "jest": "29.x",
    "@testing-library/react": "14.x",
    "@testing-library/user-event": "14.x",
    "jest-axe": "8.x",
    "@playwright/test": "1.x",
    "msw": "2.x"
  }
}
```

---

## Critérios Transversais

- Cobertura mínima de **70%** em hooks e componentes críticos (Jest)
- **Playwright** para todos os fluxos de autenticação e scanner
- **MSW (Mock Service Worker)** para mockar a API nos testes de componente
- Nenhum `console.error` ou warning de React nos testes
- `lighthouse CI` no pipeline: Performance ≥ 85, Accessibility ≥ 90
- Commits semânticos: `feat:` · `fix:` · `test:` · `style:` · `a11y:`
- Toda PR com screenshot dos componentes modificados