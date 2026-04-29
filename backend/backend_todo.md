# 🛠️ Alterações Pendentes — Backend (Spring Boot)

Este documento detalha as mudanças necessárias para finalizar a implementação do backend de acordo com a `@arquitetura.md`.

---

## 1. Segurança e Webhooks
### Ativação da Validação HMAC
Atualmente, a validação de assinatura no `WebhookController.java` está comentada. Em produção, isso permite que qualquer um forje confirmações de pagamento.

- [ ] **Arquivo:** `WebhookController.java`
- [ ] **Ação:** Descomentar o bloqueio `if (!hmacValidator.validate(...))` e retornar `401 Unauthorized` se falhar.
- [ ] **Configuração:** Garantir que `pagbank.webhook.secret` esteja preenchido no `application.properties` ou variáveis de ambiente.

---

## 2. Integração PagBank (Dinâmica)
### Remoção de Valores Hardcoded
O `PagBankService.java` utiliza dados estáticos para testes. É necessário tornar a criação da cobrança dinâmica.

- [ ] **Arquivo:** `PagBankService.java`
- [ ] **Mudanças:**
    - Passar o `fullName` do usuário no campo `customer.name`.
    - Utilizar o CPF real do usuário (armazenado pela migração `V2__add_cpf_to_users.sql`).
    - Parametrizar o `unit_amount` (atualmente fixo em 100 centavos).
    - Ajustar o `expiration_date` para ser configurável (ex: 30 minutos).

---

## 3. Refatoração da Lógica TOTP
### Migração para Geração Local (Client-side)
A arquitetura prevê que o QR Code seja gerado no Frontend para reduzir latência e carga no servidor. O backend deve parar de enviar imagens Base64.

- [ ] **Arquivo:** `TotpService.java`
    - [ ] Remover ou depreciar o método `getQrCodeBase64`.
    - [ ] Criar método para retornar apenas o `totp_secret` (seed) de um ticket específico.
- [ ] **Arquivo:** `TicketController.java` (ou novo endpoint)
    - [ ] Criar endpoint `GET /api/tickets/{ticketUuid}/totp-seed`.
    - [ ] **Importante:** Garantir que apenas o dono do ingresso ou um STAFF possa acessar essa semente.

---

## 4. Auditoria e Logs de Acesso
### Rastreabilidade de Validação
Conforme o checklist de segurança, cada scan deve ser registrado para evitar fraudes ou uso indevido por parte da equipe.

- [ ] **Arquivo:** `ScanService.java`
- [ ] **Ação:** Implementar log (via SLF4J ou tabela de auditoria) contendo:
    - ID do Staff que realizou o scan.
    - UUID do ticket.
    - Timestamp da tentativa.
    - Resultado (Sucesso, Token Expirado, Ingresso já utilizado).

---

## 5. Gestão de Papéis (Roles)
### Atribuição de STAFF
O `SecurityConfig` já protege as rotas de scan, mas não há interface para criar um Staff.

- [ ] **Ação:** Criar um script SQL inicial ou endpoint administrativo para promover um usuário comum a `ROLE_STAFF`.
- [ ] **Verificação:** Validar se o `JwtAuthenticationFilter` está extraindo corretamente a Role do banco de dados para o contexto do Spring Security.

---

## 6. Padronização de Banco de Dados
### Alinhamento de Nomenclatura
Para evitar confusão entre a documentação e o código:

- [ ] **Modelo `Ticket.java`:** Avaliar renomear o campo `status` para `paymentStatus` para diferenciar de um possível "status de uso".
- [ ] **Endpoint:** Sincronizar se usaremos `ticketId` (PK) ou `ticketUuid` (ID de negócio) nas URLs públicas. A arquitetura sugere `ticketUuid` por segurança.

---

## Checklist de Conclusão
- [ ] Webhook validando HMAC.
- [ ] CPF sendo enviado para o PagBank.
- [ ] Backend entregando apenas a Seed TOTP, não a imagem.
- [ ] Log de auditoria funcionando no scan.
- [ ] Teste de integração: Simular pagamento -> Obter Seed -> Validar com Token via Postman.
