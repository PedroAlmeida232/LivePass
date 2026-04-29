# 🗺️ Roadmap de Finalização — LivePass

Este roteiro organiza as tarefas pendentes em **Sprints**, priorizando a segurança e a estabilidade do sistema de vendas e validação.

---

## 🏃 Sprint 1: Estabilização do Core & Pagamentos
**Objetivo:** Garantir que o fluxo de compra seja dinâmico e seguro.

*   **Backend:**
    *   [x] **Ativar HMAC:** Desbloquear a validação de assinatura no `WebhookController` (Segurança Crítica).
    *   [x] **PagBank Dinâmico:** Alterar `PagBankService` para usar o CPF e Nome real do usuário autenticado.
    *   [x] **Padronização DB:** Renomear colunas e campos para alinhar o código com a `@arquitetura.md` (`paymentStatus`, `ticketUuid`).
*   **Frontend:**
    *   [x] **Checkout Polling:** Refatorar o `StatusPolling.tsx` para redirecionar o usuário para "/meus-ingressos" imediatamente após a confirmação.
    *   [x] **Tratamento de Erros:** Exibir feedback visual amigável se a geração do PIX falhar.

---

## 🏃 Sprint 2: Nova Arquitetura TOTP (Client-Side)
**Objetivo:** Migrar a inteligência de geração do QR Code para o celular do cliente.

*   **Backend:**
    *   [x] **Endpoint de Seed:** Criar `GET /api/tickets/{uuid}/totp-seed` que retorna apenas a chave secreta (protegido por JWT).
    *   [x] **Limpeza:** Remover a geração de imagens Base64 do servidor para economizar memória e CPU.
*   **Frontend:**
    *   [x] **Geração Local:** Integrar `otplib` no hook `useTotpQr.ts` para gerar tokens de 6 dígitos offline.
    *   [x] **Renderização de QR:** Usar `qrcode.react` para desenhar o QR Code no formato `ticketUuid:token`.
    *   [x] **Sincronia:** Implementar contador visual (30s) sincronizado com a expiração real do token.

---

## 🏃 Sprint 3: Experiência Staff & Auditoria
**Objetivo:** Finalizar a ferramenta de validação para a equipe do evento.

*   **Backend:**
    *   [x] **Logs de Scan:** Implementar gravação de logs (ou tabela `scan_history`) para cada tentativa de entrada.
    *   [x] **Gestão de Roles:** Criar script SQL ou rota administrativa para atribuir `ROLE_STAFF` a usuários específicos.
*   **Frontend:**
    *   [x] **Refatoração do Scanner:** Ajustar o `ScannerPage.tsx` para processar a string `uuid:token`.
    *   [x] **Proteção de Rota:** Configurar o `middleware.ts` para que apenas usuários com `ROLE_STAFF` acessem a câmera de scan.
    *   [x] **Feedback Sonoro/Visual:** Adicionar cores vibrantes (Verde/Vermelho) e sons de feedback no scanner.

---

## 🏃 Sprint 4: Infraestrutura & Produção
**Objetivo:** Preparar o ambiente para escala real e deploy.

*   **Segurança:**
    *   [x] **Rate Limiting:** Configurar limites de requisições no Spring Security para evitar ataques no Login e no Scan.
    *   [x] **Criptografia:** Implementar criptografia AES-256 para o campo `totp_secret` na entidade `Ticket` via JPA Converter.
*   **Infraestrutura:**
    *   [ ] **Configuração Railway:** Configurar serviços separados para Backend e Frontend na Railway.
    *   [ ] **Nixpacks Configuration:** Ajustar comandos de build e start para otimização nativa.
    *   [ ] **Variáveis de Ambiente:** Configurar secrets e variáveis de produção no painel da Railway.
    *   [ ] **Banco de Dados:** Migrar banco de dados para o serviço gerenciado da Railway.
*   **Documentação:**
    *   [x] **API Docs:** Finalizar documentação dos endpoints via SpringDoc OpenAPI (Swagger).
    *   [x] **Manual de Operação:** Criar guia rápido para o Staff sobre como agir em casos de ingresso inválido.

---

## 📊 Definição de Pronto (Definition of Done)
1.  Código revisado e seguindo os padrões do projeto.
2.  Testes manuais realizados (Fluxo: Compra -> Pagamento -> Geração QR -> Scan).
3.  Logs de erro monitorados.
4.  Variáveis sensíveis fora do código fonte.
