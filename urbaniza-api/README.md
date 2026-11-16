# Urbaniza: contas de usuários

Projeto local de estudo com Spring Boot, JPA e H2. Os nomes que criamos estão em português; métodos e anotações do Spring seguem as convenções da biblioteca.

## Como executar

No terminal, entre na pasta `urbaniza-api`, que contém `pom.xml` e `mvnw.cmd`:

```powershell
.\mvnw.cmd spring-boot:run
```

Abra http://localhost:8080/Index.html. Use as telas por esse endereço, pois o login usa o cookie de sessão do servidor. Não abra o HTML diretamente nem pelo Live Server para testar esta integração.

Para testar, crie uma conta com e-mail e senha de pelo menos 8 caracteres, faça login e abra Perfil. Ali você pode mudar o e-mail, sair ou excluir a própria conta. O limite da senha é 72 bytes por causa do BCrypt.

Os dados ficam em `urbaniza-api/dados/` e permanecem após reiniciar. O login expira após 30 minutos sem uso e precisa ser feito novamente se o servidor reiniciar. A pasta do banco está no `.gitignore`.

## Organização

```text
src/main/java/urbaniza_api/
  UrbanizaApiApplication.java       inicia o Spring
  config/ConfiguracaoWeb.java       permite acessar o front pelo Spring
  controller/TesteController.java   rota de teste já existente
  controller/UsuarioController.java recebe as requisições de conta
  controller/TratamentoErros.java   devolve mensagens de erro
  dto/CadastroUsuario.java          dados de entrada do cadastro
  dto/LoginUsuario.java             dados de entrada do login
  dto/AtualizacaoUsuario.java       novo e-mail do perfil
  dto/RespostaUsuario.java          id e e-mail; nunca inclui a senha
  model/Usuario.java               representa a tabela de usuários
  repository/UsuarioRepository.java consulta e salva no banco
  service/UsuarioService.java       regras do cadastro, login e edição
```

Fluxo: HTML → Script_conta.js → controller → service → repository → banco.

O service usa `BCryptPasswordEncoder.encode` para gerar o hash e `matches` para verificar a senha. Não se descriptografa a senha. Só adicionamos o módulo `spring-security-crypto`; a autenticação desta versão é uma sessão simples controlada no controller, sem JWT ou configuração de filtros do Spring Security.

## Rotas

Todas as rotas de conta exigem o cabeçalho `X-Urbaniza: true`, enviado pelo JavaScript. Ele impede alterações por formulários de outros sites; não habilitamos CORS. O usuário autenticado é identificado pela sessão, nunca por um id enviado pelo front.

| Método | Rota | Função |
|---|---|---|
| POST | /api/usuarios | Cadastrar |
| POST | /api/usuarios/login | Entrar |
| GET | /api/usuarios/me | Consultar a própria conta |
| PUT | /api/usuarios/me | Alterar o próprio e-mail |
| DELETE | /api/usuarios/me | Excluir a própria conta |
| POST | /api/usuarios/sair | Encerrar a sessão |

O cadastro recebe `nome`, `email`, `senha` e `confirmarSenha`. O nome é obrigatório, aceita até 80 caracteres e aparece no perfil. Contas anteriores à inclusão desse campo continuam válidas e exibem “Sua conta” enquanto estiverem sem nome. O login recebe `email` e `senha`. A edição recebe apenas `email`.

## Arquivos do front alterados

- `Index.html` e `Cadastro.html`: formulário conectado e espaço para mensagens.
- `perfil.html`: e-mail da conta, formulário para editar, botões de sair e excluir conectados.
- `inicio.html`: confere se existe uma sessão ativa.
- `Style_perfil.css`: estilos do formulário de edição.
- `Script_conta.js` (novo): envia as requisições e exibe as respostas.

Recuperação de senha e verificação de código continuam somente como telas. Não há envio de e-mail, CRUD de avaliações nem edição de senha nesta etapa. As páginas estáticas não são conteúdo privado; as operações e os dados da conta exigem sessão. Para publicar o projeto, ainda será preciso configurar HTTPS, banco e proteção contra tentativas repetidas de login.

## Testes

```powershell
.\mvnw.cmd test
```

Os testes usam H2 em memória para não alterar suas contas locais. Conferem cadastro, validação, e-mail duplicado, hash de senha, login, isolamento de sessões, edição, saída, exclusão e acesso aos arquivos do front.
