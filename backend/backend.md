# Arquitetura Backend — Sistema de Venda e Validação de Ingressos

> Stack: **Spring Boot 3 · Java 21 · PostgreSQL · JWT · TOTP · PagBank**  
> 5 sprints · 2 semanas cada · 10 semanas no total

---

## Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        API REST (Spring Boot)                │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │   Auth   │  │ Checkout │  │ Webhook  │  │   Scan    │  │
│  │Controller│  │Controller│  │Controller│  │ Controller│  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬─────┘  │
│       │              │              │               │        │
│  ┌────▼─────┐  ┌────▼─────┐  ┌────▼─────┐  ┌─────▼─────┐  │
│  │  Auth    │  │ Checkout │  │ Webhook  │  │   Scan    │  │
│  │ Service  │  │ Service  │  │ Service  │  │  Service  │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬─────┘  │
│       │              │              │               │        │
│       └──────────────┴──────────────┴───────────────┘       │
│                              │                              │
│                    ┌─────────▼──────────┐                   │
│                    │  JPA Repositories   │                   │
│                    └─────────┬──────────┘                   │
└──────────────────────────────┼──────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │     PostgreSQL       │
                    │  users · tickets     │
                    └─────────────────────┘
```

---

## Estrutura de Pacotes

```
src/
├── main/java/com/ingressos/
│   ├── config/
│   │   ├── SecurityConfig.java          # Spring Security + JWT filter chain
│   │   ├── JwtConfig.java               # Propriedades JWT (secret, expiry)
│   │   └── WebClientConfig.java         # WebClient para PagBank
│   │
│   ├── auth/
│   │   ├── AuthController.java          # POST /api/auth/register, /login, GET /me
│   │   ├── AuthService.java
│   │   ├── JwtService.java              # Geração e validação de tokens
│   │   ├── dto/
│   │   │   ├── RegisterRequest.java
│   │   │   ├── LoginRequest.java
│   │   │   └── AuthResponse.java
│   │   └── model/
│   │       └── User.java                # @Entity users
│   │
│   ├── checkout/
│   │   ├── CheckoutController.java      # POST /api/checkout/pix, GET /status/{id}
│   │   ├── CheckoutService.java
│   │   ├── PagBankService.java          # Integração WebClient com PagBank
│   │   ├── dto/
│   │   │   ├── PixRequest.java
│   │   │   ├── PixResponse.java
│   │   │   └── OrderStatusResponse.java
│   │   └── model/
│   │       └── Ticket.java              # @Entity tickets
│   │
│   ├── webhook/
│   │   ├── WebhookController.java       # POST /api/webhooks/pagbank
│   │   ├── WebhookService.java
│   │   ├── HmacValidator.java           # Validação HMAC-SHA256
│   │   └── dto/
│   │       └── PagBankWebhookPayload.java
│   │
│   ├── ticket/
│   │   ├── TicketController.java        # GET /api/tickets/mine, /{uuid}/totp-seed
│   │   ├── TotpService.java             # Geração e validação TOTP (RFC 6238)
│   │   └── dto/
│   │       ├── TicketResponse.java
│   │       └── TotpSeedResponse.java
│   │
│   ├── scan/
│   │   ├── ScanController.java          # POST /api/scan/validate
│   │   ├── ScanService.java
│   │   └── dto/
│   │       ├── ScanRequest.java
│   │       └── ScanResponse.java
│   │
│   ├── repository/
│   │   ├── UserRepository.java
│   │   └── TicketRepository.java
│   │
│   └── exception/
│       ├── GlobalExceptionHandler.java  # @ControllerAdvice
│       ├── DuplicateEmailException.java
│       ├── TicketAlreadyUsedException.java
│       └── InvalidTokenException.java
│
└── test/java/com/ingressos/
    ├── auth/
    │   ├── AuthServiceTest.java
    │   └── AuthControllerIT.java
    ├── checkout/
    │   ├── PagBankServiceTest.java
    │   └── CheckoutControllerIT.java
    ├── webhook/
    │   ├── HmacValidatorTest.java
    │   └── WebhookControllerIT.java
    ├── ticket/
    │   └── TotpServiceTest.java
    └── scan/
        ├── ScanControllerTest.java
        └── ScanFlowIT.java
```

---

## Schema do Banco de Dados

```sql
-- init.sql

CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       VARCHAR(255) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,        -- bcrypt
    role        VARCHAR(20)  NOT NULL DEFAULT 'CUSTOMER', -- CUSTOMER | STAFF
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tickets (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES users(id),
    order_id     VARCHAR(100) UNIQUE NOT NULL,  -- ID do pedido PagBank
    status       VARCHAR(20)  NOT NULL DEFAULT 'PENDING', -- PENDING | PAID | CANCELLED
    totp_secret  VARCHAR(64),                   -- preenchido após confirmação
    is_used      BOOLEAN NOT NULL DEFAULT FALSE,
    used_at      TIMESTAMPTZ,
    used_by_staff UUID REFERENCES users(id),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tickets_user_id ON tickets(user_id);
CREATE INDEX idx_tickets_order_id ON tickets(order_id);
```

---

## Dependências Maven (`pom.xml`)

```xml
<!-- Core -->
<dependency>spring-boot-starter-web</dependency>
<dependency>spring-boot-starter-data-jpa</dependency>
<dependency>spring-boot-starter-security</dependency>
<dependency>spring-boot-starter-validation</dependency>
<dependency>spring-boot-starter-webflux</dependency>   <!-- WebClient PagBank -->

<!-- JWT -->
<dependency>io.jsonwebtoken:jjwt-api:0.12.5</dependency>
<dependency>io.jsonwebtoken:jjwt-impl:0.12.5</dependency>
<dependency>io.jsonwebtoken:jjwt-jackson:0.12.5</dependency>

<!-- TOTP -->
<dependency>dev.samstevens.totp:totp-spring-boot-starter:1.7.1</dependency>

<!-- Database -->
<dependency>org.postgresql:postgresql</dependency>
<dependency>org.flywaydb:flyway-core</dependency>

<!-- Testes -->
<dependency>spring-boot-starter-test</dependency>
<dependency>org.testcontainers:postgresql:1.19.7</dependency>
<dependency>org.testcontainers:junit-jupiter:1.19.7</dependency>
<dependency>io.rest-assured:rest-assured:5.4.0</dependency>
```

---

## Configuração de Segurança

```java
// SecurityConfig.java — visão esquemática

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // Rotas públicas
    // POST /api/auth/register
    // POST /api/auth/login
    // POST /api/webhooks/pagbank  (autenticado via HMAC, não JWT)

    // Rotas autenticadas (JWT obrigatório)
    // GET  /api/auth/me
    // POST /api/checkout/pix
    // GET  /api/checkout/status/{id}
    // GET  /api/tickets/mine
    // GET  /api/tickets/{uuid}/totp-seed

    // Rotas restritas a STAFF
    // POST /api/scan/validate

    // Filtros na cadeia
    // 1. JwtAuthenticationFilter  → extrai e valida Bearer token
    // 2. HmacValidationFilter     → apenas para /webhooks/** (valida assinatura PagBank)

    // Senhas: BCryptPasswordEncoder (strength = 12)
    // CSRF: desabilitado (API stateless)
    // Session: STATELESS
    // CORS: apenas domínio do frontend (configurável via .env)
}
```

---

---

# Sprint 1 — Fundação: Infra, BD e Autenticação
**Semanas 1–2 · 8 story points**

> **Objetivo:** Ambiente de desenvolvimento configurado, schema SQL aplicado e endpoint JWT funcionando end-to-end.

## Endpoints

| Método | Rota | Autenticação | Descrição |
|--------|------|:---:|-----------|
| `POST` | `/api/auth/register` | — | Cria novo usuário |
| `POST` | `/api/auth/login` | — | Retorna JWT |
| `GET` | `/api/auth/me` | JWT | Retorna dados do usuário logado |

## Implementação

```
auth/
├── AuthController.java
├── AuthService.java
│     register(RegisterRequest) → AuthResponse
│     login(LoginRequest)       → AuthResponse
├── JwtService.java
│     generateToken(UserDetails)  → String
│     validateToken(String)       → Boolean
│     extractUsername(String)     → String
├── dto/
│   ├── RegisterRequest.java  (@NotBlank email, password)
│   ├── LoginRequest.java
│   └── AuthResponse.java     (token, email, role)
└── model/
    └── User.java             (@Entity, implements UserDetails)

config/
├── SecurityConfig.java       (filtro JWT + rotas públicas)
└── JwtConfig.java            (secret base64, expiração)

repository/
└── UserRepository.java       (findByEmail)
```

## Regras de Negócio

- E-mail único: `DuplicateEmailException` → `409 Conflict`
- Senha mínima 8 caracteres com `@NotBlank`
- Senha armazenada com `BCrypt(strength=12)`
- JWT expira em 24h; assinado com `HS256` e secret via `.env`

## Testes — Sprint 1

### Unitários (`AuthServiceTest.java`)

```java
// 1. Registro com e-mail duplicado lança DuplicateEmailException
@Test
void register_duplicateEmail_throwsDuplicateEmailException()

// 2. Login com senha errada lança BadCredentialsException
@Test
void login_wrongPassword_throwsBadCredentialsException()

// 3. Login bem-sucedido retorna token não-nulo
@Test
void login_validCredentials_returnsToken()

// 4. Token gerado é válido e contém o username correto
@Test
void generateToken_validUser_tokenContainsCorrectUsername()
```

### Integração (`AuthControllerIT.java` — Testcontainers)

```java
// Testcontainers: PostgreSQL real em container
@Testcontainers
@SpringBootTest(webEnvironment = RANDOM_PORT)

// 5. POST /register com payload válido retorna 201 e token
// 6. POST /register com e-mail duplicado retorna 409
// 7. POST /login com credenciais corretas retorna 200 e JWT válido
// 8. POST /login com senha errada retorna 401
// 9. GET /me sem token retorna 401
// 10. GET /me com token válido retorna dados do usuário
```

### Cobertura mínima Sprint 1

| Classe | Cobertura-alvo |
|--------|:--------------:|
| `AuthService` | ≥ 80% |
| `JwtService` | ≥ 90% |
| `AuthController` | ≥ 75% (via IT) |

---

---

# Sprint 2 — Checkout PIX e Integração PagBank
**Semanas 3–4 · 9 story points**

> **Objetivo:** usuário autenticado inicia pagamento PIX no sandbox do PagBank; ticket criado com status `PENDING`.

## Endpoints

| Método | Rota | Autenticação | Descrição |
|--------|------|:---:|-----------|
| `POST` | `/api/checkout/pix` | JWT | Cria cobrança PIX e ticket PENDING |
| `GET` | `/api/checkout/status/{orderId}` | JWT | Consulta status do pedido |

## Implementação

```
checkout/
├── CheckoutController.java
├── CheckoutService.java
│     createPixCharge(userId)    → PixResponse
│     getOrderStatus(orderId)    → OrderStatusResponse
├── PagBankService.java          (WebClient)
│     createPixOrder(payload)    → PagBankOrderResponse
│     getOrderStatus(orderId)    → PagBankStatusResponse
├── dto/
│   ├── PixResponse.java         (orderId, qrCode, copyPaste, expiresAt)
│   └── OrderStatusResponse.java (orderId, status)
└── model/
    └── Ticket.java              (@Entity com campos Sprint 2)
```

## Regras de Negócio

- Apenas usuários autenticados criam cobranças
- Ticket criado com `status = PENDING` e `orderId` do PagBank
- QR Code e string copia-e-cola retornados na resposta
- Cobrança expira em 30 minutos (configurável via `.env`)

## Testes — Sprint 2

### Unitários (`PagBankServiceTest.java`)

```java
// 1. Payload PIX montado corretamente (amount, expiration, reference)
@Test
void createPixOrder_validInput_payloadIsCorrectlyBuilt()

// 2. Falha na API PagBank propaga exceção tratável
@Test
void createPixOrder_apiFailure_throwsPaymentGatewayException()

// 3. Status PAID é mapeado corretamente do response PagBank
@Test
void getOrderStatus_paidOrder_returnsPaidStatus()
```

### Integração (`CheckoutControllerIT.java` — Testcontainers + WireMock)

```java
// WireMock simula a API PagBank em sandbox

// 4. POST /checkout/pix cria ticket PENDING no BD
// 5. POST /checkout/pix retorna QR Code no response body
// 6. POST /checkout/pix sem JWT retorna 401
// 7. GET /checkout/status/{id} retorna status correto
// 8. GET /checkout/status/{id} com orderId inexistente retorna 404
```

### Cobertura mínima Sprint 2

| Classe | Cobertura-alvo |
|--------|:--------------:|
| `PagBankService` | ≥ 85% |
| `CheckoutService` | ≥ 80% |
| `CheckoutController` | ≥ 75% (via IT) |

---

---

# Sprint 3 — Webhook, Ingresso e QR Code TOTP
**Semanas 5–6 · 9 story points**

> **Objetivo:** webhook PagBank confirma pagamento; ticket muda para `PAID`; TOTP gerado; usuário vê QR Code dinâmico.

## Endpoints

| Método | Rota | Autenticação | Descrição |
|--------|------|:---:|-----------|
| `POST` | `/api/webhooks/pagbank` | HMAC | Recebe notificação de pagamento |
| `GET` | `/api/tickets/mine` | JWT | Lista ingressos do usuário |
| `GET` | `/api/tickets/{uuid}/totp-seed` | JWT | Retorna seed para gerar QR Code TOTP |

## Implementação

```
webhook/
├── WebhookController.java
├── WebhookService.java
│     processPayment(payload)    → void
│     isAlreadyProcessed(id)     → boolean   (idempotência)
├── HmacValidator.java
│     validate(body, signature)  → boolean

ticket/
├── TicketController.java
├── TotpService.java
│     generateSecret()           → String    (Base32, 160 bits)
│     getCurrentToken(secret)    → String    (6 dígitos, janela 30s)
│     validate(token, secret)    → boolean   (aceita janela ±1)
└── dto/
    ├── TicketResponse.java      (uuid, status, createdAt)
    └── TotpSeedResponse.java    (totpUri, qrCodeBase64)
```

## Regras de Negócio

- Webhook validado via `X-PagBank-Signature` (HMAC-SHA256 do body)
- Assinatura inválida → `401 Unauthorized` imediatamente
- Idempotência: segundo POST com mesmo `orderId` já `PAID` → `200 OK` sem alterar BD
- Ao confirmar: `status = PAID`, `totp_secret` gerado e persistido
- `GET /totp-seed` disponível apenas para o dono do ingresso (validação de `userId`)

## Testes — Sprint 3

### Unitários (`HmacValidatorTest.java`)

```java
// 1. Assinatura HMAC válida retorna true
@Test
void validate_validSignature_returnsTrue()

// 2. Assinatura HMAC inválida retorna false
@Test
void validate_tamperedBody_returnsFalse()

// 3. Assinatura nula/ausente retorna false
@Test
void validate_nullSignature_returnsFalse()
```

### Unitários (`TotpServiceTest.java`)

```java
// 4. Token gerado é válido dentro da janela de 30s
@Test
void validate_tokenGeneratedNow_isValid()

// 5. Token de 60s atrás (fora da janela ±1) é rejeitado
@Test
void validate_expiredToken_isInvalid()

// 6. Token de step anterior (dentro de ±1) é aceito
@Test
void validate_tokenFromPreviousStep_isAccepted()

// 7. generateSecret() retorna Base32 válido com 32 caracteres
@Test
void generateSecret_returnsValidBase32Secret()
```

### Unitários (`WebhookServiceTest.java`)

```java
// 8. Webhook com ticket já PAID → retorna sem alterar BD (idempotência)
@Test
void processPayment_alreadyPaid_doesNotModifyTicket()

// 9. Webhook válido → status muda de PENDING para PAID
@Test
void processPayment_pendingTicket_updatesStatusToPaid()
```

### Integração (`WebhookControllerIT.java` — Testcontainers)

```java
// 10. POST /webhooks/pagbank com HMAC inválido → 401
// 11. Fluxo completo: ticket PENDING → webhook → ticket PAID com totp_secret preenchido
// 12. Reentrega do mesmo webhook → 200 sem duplicar alteração no BD
```

### Cobertura mínima Sprint 3

| Classe | Cobertura-alvo |
|--------|:--------------:|
| `HmacValidator` | ≥ 95% |
| `TotpService` | ≥ 95% |
| `WebhookService` | ≥ 85% |
| `TicketController` | ≥ 75% (via IT) |

---

---

# Sprint 4 — Scanner da Equipe (MVP Completo)
**Semanas 7–8 · 7 story points**

> **Objetivo:** staff escaneia QR Code TOTP do cliente e valida o ingresso em tempo real. Sistema completo ponta a ponta.

## Endpoints

| Método | Rota | Autenticação | Descrição |
|--------|------|:---:|-----------|
| `POST` | `/api/scan/validate` | JWT (STAFF) | Valida token TOTP + marca ingresso como usado |

## Implementação

```
scan/
├── ScanController.java
├── ScanService.java
│     validate(ScanRequest, staffId)  → ScanResponse
│       1. Busca ticket pelo uuid
│       2. Verifica status == PAID
│       3. Verifica is_used == false
│       4. Valida token TOTP
│       5. Marca is_used = true, used_at = now(), used_by_staff = staffId
├── dto/
│   ├── ScanRequest.java     (ticketUuid, totpToken)
│   └── ScanResponse.java    (valid: boolean, message, usedAt)
```

## Regras de Negócio

- Endpoint restrito a usuários com `role = STAFF`
- Ticket `is_used = true` → `409 Conflict` com mensagem descritiva
- Token TOTP inválido/expirado → `422 Unprocessable Entity`
- Ticket com status diferente de `PAID` → `400 Bad Request`
- Auditoria: `used_at` e `used_by_staff` persistidos atomicamente

## Testes — Sprint 4

### Unitários (`ScanControllerTest.java`)

```java
// 1. Token TOTP válido + ingresso PAID → 200 com valid = true
@Test
void validate_validTokenPaidTicket_returns200()

// 2. Ingresso já usado (is_used = true) → 409
@Test
void validate_alreadyUsedTicket_returns409()

// 3. Token TOTP expirado → 422
@Test
void validate_expiredTotpToken_returns422()

// 4. Ingresso com status PENDING → 400
@Test
void validate_pendingTicket_returns400()

// 5. Usuário com role CUSTOMER tentando acessar → 403
@Test
void validate_customerRole_returns403()

// 6. Após validação bem-sucedida, is_used = true, used_at e used_by_staff persistidos
@Test
void validate_success_auditFieldsArePersisted()
```

### Integração E2E (`ScanFlowIT.java` — Testcontainers)

```java
// 7. Fluxo completo: register → login → pix → webhook → scan → ingresso marcado
@Test
void fullFlow_registerToScan_ticketMarkedAsUsed()

// 8. Tentativa de reutilizar QR Code após validação → 409
@Test
void reuseQrCode_afterSuccessfulScan_returns409()
```

### Testes de Segurança

```java
// 9. Endpoint /scan/validate não acessível sem JWT
// 10. Endpoint /scan/validate não acessível com JWT de CUSTOMER
// 11. Brute-force de token TOTP bloqueado após 10 tentativas (rate limiting)
```

### Cobertura mínima Sprint 4

| Classe | Cobertura-alvo |
|--------|:--------------:|
| `ScanService` | ≥ 90% |
| `ScanController` | ≥ 80% (via IT) |
| Fluxo E2E | 1 teste cobrindo ponta a ponta |

---

---

# Sprint 5 — Hardening, Produção e Testes de Carga
**Semanas 9–10 · 4 story points**

> **Objetivo:** sistema seguro e pronto para o evento real; HTTPS, PagBank em modo live, testes de carga aprovados.

## Implementação

```
config/
├── SecurityConfig.java     → revisão final de CORS (domínio único)
├── RateLimitConfig.java    → bucket4j ou configuração Nginx

infra/
├── nginx.conf              → reverse proxy + TLS + rate limiting
├── docker-compose.prod.yml → variáveis de produção
└── .env.prod               → credenciais reais (nunca no repositório)
```

## Checklist de Segurança

- `CORS`: apenas `https://seudominio.com` autorizado
- `HSTS`: `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `X-Frame-Options: DENY`
- `Content-Security-Policy`: configurado no Nginx
- `X-Content-Type-Options: nosniff`
- Rate limiting em `/api/auth/login`: 5 tentativas / minuto por IP
- Secrets nunca em logs (`@JsonIgnore` em campos sensíveis)
- `totp_secret` criptografado at-rest no BD (`AES-256` via `@Convert`)

## Testes — Sprint 5

### Carga (`ScanLoadTest.java` — Gatling ou k6)

```
Cenário: 200 requisições simultâneas em POST /api/scan/validate
Meta: latência p95 < 500ms
Meta: zero erros 5xx
Duração: 2 minutos com ramp-up de 30s
```

### Segurança

```
☐ Headers HTTPS verificados (HSTS, X-Frame-Options, CSP)
☐ Rate limiting em /login: 6ª tentativa recebe 429
☐ Tentativa de SQL Injection nos inputs → 400, sem stack trace
☐ JWT com assinatura adulterada → 401
☐ HMAC de webhook adulterado → 401
☐ TOTP reutilizado → 409
```

### Regressão Completa

```
☐ Toda a suíte unitária verde (mvn test)
☐ Toda a suíte de integração verde (Testcontainers)
☐ Fluxo E2E com PagBank em modo live executado 1x
☐ UAT com equipe de staff em condições reais
```

### Cobertura mínima Sprint 5

| Escopo | Cobertura-alvo |
|--------|:--------------:|
| Services (geral) | ≥ 70% |
| Controllers (geral) | ≥ 70% |
| `HmacValidator` + `TotpService` | ≥ 95% |

---

---

## Resumo de Testes por Sprint

| Sprint | Unitários | Integração | E2E / Carga | Segurança |
|--------|:---------:|:----------:|:-----------:|:---------:|
| 1 — Auth | 4 | 6 | — | — |
| 2 — PIX | 3 | 5 | — | — |
| 3 — Webhook + TOTP | 9 | 3 | — | HMAC |
| 4 — Scanner | 6 | 2 | 2 | TOTP + roles |
| 5 — Produção | — | regressão | carga (k6) | headers + rate limit |

---

## Critérios Transversais

- Cobertura mínima de **70%** em todos os services e controllers
- **Testcontainers** obrigatório para testes de integração com BD — zero mocks de repositório
- Pipeline CI (GitHub Actions) executa suíte completa a cada push na `main`
- Variáveis sensíveis exclusivamente em `.env` — nunca no código ou nos logs
- Commits semânticos: `feat:` · `fix:` · `test:` · `chore:` · `security:`
- Toda PR revisada antes de merge