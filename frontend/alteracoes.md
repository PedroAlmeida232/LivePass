ALTERACOES ESTRUTURAIS PARA GERACAO DE PIX DINAMICA E SEGURA

    Novo Campo no Registro (Register)
    O endpoint de cadastro agora exige o campo cpf.
    Payload: {"email": "...", "password": "...", "cpf": "12345678901"}
    Regra: Envie apenas os 11 digitos numericos. O backend possui um validador rigoroso de algoritmo; se o CPF for invalido matematicamente, a API retornara 400 Bad Request.

    Checkout Dinamico
    A geracao de PIX (POST /api/checkout/pix) nao usa mais dados fixos.
    Dinamicidade: O backend recupera o e-mail e o CPF diretamente do usuario autenticado no banco de dados para enviar ao PagBank.
    Importante: Certifique-se de que o usuario de teste no frontend tenha um CPF cadastrado. Usuarios antigos com campo CPF nulo causarao erro.

    Tratamento de Erros (Self-Purchase)
    O PagBank proibe que o e-mail do comprador seja igual ao e-mail do dono da conta (vendedor).
    Ajuste: Para testes, evite criar contas de usuario usando o mesmo e-mail de acesso ao Dashboard do PagBank. Use e-mails distintos.

    Sincronizacao do Banco de Dados
    A coluna cpf foi adicionada a tabela users via migracao.
    Dica: Se encontrar erros de Duplicate key ou Flyway failed, certifique-se de que os usuarios de teste tenham CPFs unicos ou limpe a tabela local.

O que o Frontend deve fazer:

    Atualizar o formulario de Registro para incluir o input de CPF.

    Garantir que o campo cpf seja enviado no JSON de cadastro.

    Adicionar uma mascara de CPF no input para melhorar a UX, mas limpar a mascara enviando apenas numeros para a API.