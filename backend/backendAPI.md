# Documentação da API Backend — LivePass

Esta API provê funcionalidades para o sistema de venda e validação de ingressos, integrando pagamentos via PIX (PagBank) e validação dinâmica via TOTP.

## 🚀 Tecnologias
- **Spring Boot 3.4.1**
- **Java 21**
- **PostgreSQL**
- **JWT (JSON Web Token)**
- **TOTP (RFC 6238)**
- **PagBank SDK/API**

---

## 🔐 Autenticação
A maioria dos endpoints requer um token JWT.
1. Use o endpoint `/api/auth/login` para obter o token.
2. Envie o token em todas as requisições protegidas via Header:
   `Authorization: Bearer <seu_token_aqui>`

---

## 🛠 Endpoints

### 1. Autenticação (`Auth`)

#### **POST** `/api/auth/register`
Cria um novo usuário no sistema.
- **Request Body:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "senhaSegura123",
  "role": "CUSTOMER" 
}
```
*(Role pode ser `CUSTOMER` ou `STAFF`)*

#### **POST** `/api/auth/login`
Autentica o usuário e retorna o token JWT.
- **Rate Limit:** 5 tentativas por minuto.
- **Request Body:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "senhaSegura123"
}
```
- **Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "usuario@exemplo.com",
  "role": "CUSTOMER"
}
```

#### **GET** `/api/auth/me` (Protegido)
Retorna os dados do usuário logado baseado no token.
- **Response (200 OK):**
```json
{
  "email": "usuario@exemplo.com",
  "role": "CUSTOMER"
}
```

---

### 2. Checkout (`Checkout`)

#### **POST** `/api/checkout/pix` (Protegido)
Inicia uma cobrança PIX para o usuário logado.
- **Response (200 OK):**
```json
{
  "orderId": "ORD-548972...",
  "qrCode": "https://sandbox.api.pagseguro.com/qrcode/...",
  "copyPaste": "00020101021226850014br.gov.bcb.pix...",
  "expiresAt": "2026-04-25T16:00:00-03:00"
}
```

#### **GET** `/api/checkout/status/{orderId}` (Protegido)
Consulta o status atual de um pedido.
- **Response (200 OK):**
```json
{
  "orderId": "ORD-548972...",
  "status": "PAID"
}
```
*(Status: `PENDING`, `PAID`, `CANCELLED`)*

---

### 3. Ingressos (`Tickets`)

#### **GET** `/api/tickets/mine` (Protegido)
Lista todos os ingressos pertencentes ao usuário logado.
- **Response (200 OK):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "orderId": "ORD-548972...",
    "status": "PAID",
    "isUsed": false,
    "createdAt": "2026-04-25T14:30:00-03:00"
  }
]
```

#### **GET** `/api/tickets/{id}/totp-seed` (Protegido)
Retorna os dados para geração do QR Code dinâmico de validação.
- **Nota:** Só funciona se o ingresso estiver `PAID`.
- **Response (200 OK):**
```json
{
  "totpUri": "otpauth://totp/LivePass:usuario@exemplo.com?secret=...",
  "qrCodeBase64": "data:image/png;base64,iVBORw0KGgoAAA..."
}
```

---

### 4. Webhooks (Integração PagBank)

#### **POST** `/api/webhooks/pagbank` (Público/HMAC)
Endpoint que recebe notificações do PagBank.
- **Segurança:** Requer header `X-PagBank-Signature` para validação HMAC-SHA256.
- **Request Body (Simplificado):**
```json
{
  "id": "ORD-548972...",
  "status": "PAID"
}
```

---

### 5. Scanner Staff (`Scan`)

#### **POST** `/api/scan/validate` (Protegido - Role STAFF)
Valida um ingresso através do UUID e do código TOTP de 6 dígitos mostrado no celular do cliente.
- **Request Body:**
```json
{
  "ticketId": "550e8400-e29b-41d4-a716-446655440000",
  "totpToken": "123456"
}
```
- **Response (200 OK - Válido):**
```json
{
  "valid": true,
  "message": "Ticket successfully validated",
  "usedAt": "2026-04-25T20:15:00-03:00"
}
```
- **Response (200 OK - Erro):**
```json
{
  "valid": false,
  "message": "Invalid or expired TOTP token",
  "usedAt": null
}
```

---

## 🛡 Segurança em Produção
- **CORS:** Atualmente configurado para `livepass.com` e `localhost:3000`.
- **Headers:** HSTS, CSP e X-Frame-Options ativados.
- **Proteção de Dados:** Senhas e segredos TOTP são omitidos de qualquer resposta JSON (`@JsonIgnore`).
- **Rate Limit:** Ativado no endpoint de login para mitigar ataques de força bruta.
