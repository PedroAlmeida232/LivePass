# 🛠️ Alterações Pendentes — Frontend (Next.js)

Este documento detalha as mudanças necessárias no frontend para cumprir os requisitos da `@arquitetura.md`.

---

## 1. Geração de QR Code TOTP (Client-side)
Atualmente, o frontend baixa uma imagem pronta do backend. Para maior performance e segurança, o frontend deve gerar o token e o QR Code localmente.

- [ ] **Arquivo:** `src/hooks/useTotpQr.ts`
    - Alterar para buscar o `totp_seed` (uma única vez) em vez da imagem `qrCodeBase64`.
    - Integrar a biblioteca `otplib` para gerar o token de 6 dígitos a cada 30 segundos.
    - Sincronizar o contador visual com o tempo real da máquina.
- [ ] **Arquivo:** `src/components/tickets/TotpQrCode.tsx` (ou similar)
    - Remover a tag `<img>` que exibe o Base64.
    - Instalar e utilizar `qrcode.react` para renderizar o QR Code no navegador.
    - **Formato do QR:** O valor do QR deve ser a string: `ticketUuid:token`.

---

## 2. Refatoração do Scanner (Staff)
O leitor de QR Code precisa entender o novo formato simplificado definido na arquitetura.

- [ ] **Arquivo:** `src/app/(staff)/scanner/page.tsx`
    - Alterar a função `handleScan` para aceitar o formato `uuid:token`.
    - Remover a dependência de `JSON.parse` (que falhará com o novo formato).
    - Exemplo de parsing: `const [uuid, token] = decodedText.split(':');`
- [ ] **Componente:** `ValidationFeedback.tsx`
    - Garantir que mensagens de erro como "Token Expirado" ou "Já Utilizado" sejam exibidas de forma clara com as cores e ícones do sistema.

---

## 3. Fluxo de Checkout e Pagamento
Melhorar a experiência de espera enquanto o pagamento é processado pelo Webhook do backend.

- [ ] **Arquivo:** `src/components/checkout/StatusPolling.tsx`
    - Garantir que o polling de status pare assim que o status mudar para `PAID` ou `CANCELLED`.
    - Adicionar um redirecionamento automático para a página "Meus Ingressos" após a confirmação do pagamento.

---

## 4. Proteção de Rotas e Roles
Garantir que apenas pessoal autorizado acesse a área de Staff.

- [ ] **Arquivo:** `src/middleware.ts` (ou lógica de rotas)
    - Validar se o usuário possui a role `STAFF` no token JWT antes de permitir acesso à rota `/scanner`.
    - Redirecionar usuários comuns para o dashboard se tentarem acessar a câmera de validação.

---

## 5. Dependências Necessárias
Certifique-se de que os pacotes abaixo estão instalados no `frontend/package.json`:

- [ ] `otplib`: Para geração do TOTP.
- [ ] `qrcode.react`: Para renderização do QR Code.
- [ ] `html5-qrcode`: Já presente, mas validar se a versão é estável para mobile.

---

## Checklist de Conclusão
- [ ] QR Code gerado localmente (sem delay de rede).
- [ ] Scanner decodificando formato `uuid:token`.
- [ ] Feedback visual de "Sucesso" após scan de ingresso válido.
- [ ] Redirecionamento pós-PIX funcionando.
- [ ] Acesso ao `/scanner` bloqueado para clientes comuns.
