# Urbaniza

Projeto local de estudo com Spring Boot, JPA e H2. Os nomes que criamos estão em português; métodos e anotações do Spring seguem as convenções da biblioteca.

## Como executar

Use um JDK 21, a mesma versão do projeto Dados Pessoais. No terminal, entre na pasta `urbaniza-api`, que contém `pom.xml` e `mvnw.cmd`:

```powershell
.\mvnw.cmd spring-boot:run
```

No Linux ou macOS, execute `sh mvnw spring-boot:run`. Abra http://localhost:8080/Index.html. Use as telas por esse endereço, pois o login usa o cookie de sessão do servidor. Não abra o HTML diretamente nem pelo Live Server para testar esta integração.

Para testar, crie uma conta com e-mail e senha de pelo menos 8 caracteres, faça login e abra Perfil. Ali você pode mudar o e-mail, sair ou excluir a própria conta. O limite da senha é 72 bytes por causa do BCrypt.

As páginas e os arquivos de estilo e script ficam em `src/main/resources/static`. O Spring Boot carrega esses arquivos pelo classpath, inclusive ao executar pelo IntelliJ.

Os dados ficam em `urbaniza-api/dados/` e permanecem após reiniciar. O login expira após 30 minutos sem uso e precisa ser feito novamente se o servidor reiniciar. A pasta do banco está no `.gitignore`.

## Organização

```text
src/main/java/urbaniza_api/
  UrbanizaApiApplication.java       inicia o Spring
  config/ConfiguracaoWeb.java       redireciona para a tela de login
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

Recuperação de senha e verificação de código continuam somente como telas. Envio de e-mail e edição de senha continuam fora desta etapa. As páginas estáticas não são conteúdo privado; as operações e os dados da conta exigem sessão. Para publicar o projeto, ainda será preciso configurar HTTPS, banco e proteção contra tentativas repetidas de login.

## Testes

```powershell
.\mvnw.cmd test
```

Os testes usam H2 em memória para não alterar suas contas locais. Conferem cadastro, validação, e-mail duplicado, hash de senha, login, isolamento de sessões, edição, saída, exclusão e acesso aos arquivos do front.


## Mapa, avaliações e destaques

1. Entre com a conta e abra **Mapa**. A tela começa com a cidade inteira e sem bairro selecionado. Digite um nome com ou sem acento e clique em **Buscar**, ou clique em um distrito para ver os bairros do catálogo.
2. Escolha um bairro e alterne entre as notas geral, de segurança, de mobilidade e de iluminação. O mapa sinaliza quando ainda não há avaliações. O botão **Avaliar este bairro** abre o formulário com distrito e bairro preenchidos.
3. Na tela **Avaliações**, escolha distrito e bairro e dê uma nota de 1 a 5 em cada critério. Cada conta contribui uma vez para a média de cada bairro. Um novo envio substitui a contribuição anterior.
4. Volte ao **Início** para ver a maior e a menor nota geral. Os destaques consideram somente os bairros avaliados. A nota geral é a média das três notas por critério.

Para apresentar o código, siga o envio do formulário em `Script_avaliacoes.js`, o `POST /api/avaliacoes` no `AvaliacaoController`, a validação do bairro e da conta no `AvaliacaoService` e a persistência com JPA no `AvaliacaoRepository`. O mesmo repository calcula as médias que o `GET /api/avaliacoes` devolve para Mapa e Início.

O GeoJSON local contém os 96 distritos do município. O catálogo contém 661 localidades com nome mapeadas no OpenStreetMap como `suburb`, `quarter` ou `neighbourhood`. O distrito de cada localidade é atribuído pela posição do ponto ou por um ponto interno à área mapeada. A cobertura acompanha o levantamento colaborativo e um bairro que cruza uma divisa aparece no distrito do ponto cadastrado. As avaliações começam vazias. As imagens de fundo do mapa são carregadas pela internet.

- Limites municipais por distrito, publicados pelo GeoSampa e convertidos para GeoJSON pelo Código Urbano. [GeoSampa](https://geosampa.prefeitura.sp.gov.br/) · [Distritos em GeoJSON](https://github.com/codigourbano/distritos-sp)
- Localidades no extrato de São Paulo, de 21/11/2026. Dados © colaboradores do OpenStreetMap, sob ODbL. [Extrato OpenStreetMap France](https://download.openstreetmap.fr/extracts/south-america/brazil/southeast/) · [Créditos e licença](https://www.openstreetmap.org/copyright)
