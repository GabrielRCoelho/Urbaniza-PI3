package urbaniza_api.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import urbaniza_api.dto.*;
import urbaniza_api.model.Usuario;
import urbaniza_api.service.UsuarioService;

@RestController
// O front envia este cabeçalho. Sem CORS liberado, outros sites não podem usá-lo.
@RequestMapping(value = "/api/usuarios", headers = "X-Urbaniza=true")
public class UsuarioController {

    private final UsuarioService servico;

    public UsuarioController(UsuarioService servico) {
        this.servico = servico;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RespostaUsuario cadastrar(@Valid @RequestBody CadastroUsuario cadastro) {
        return RespostaUsuario.de(servico.cadastrar(cadastro));
    }

    @PostMapping("/login")
    public RespostaUsuario entrar(@Valid @RequestBody LoginUsuario dados, HttpServletRequest requisicao) {
        Usuario usuario = servico.autenticar(dados);
        HttpSession anterior = requisicao.getSession(false);
        if (anterior != null) {
            anterior.invalidate();
        }
        // Uma sessão nova evita reutilizar o identificador anterior ao login.
        requisicao.getSession(true).setAttribute("usuarioId", usuario.getId());
        return RespostaUsuario.de(usuario);
    }

    @GetMapping("/me")
    public RespostaUsuario consultar(HttpServletRequest requisicao) {
        return RespostaUsuario.de(servico.buscar(obterUsuarioId(requisicao)));
    }

    @PutMapping("/me")
    public RespostaUsuario atualizar(@Valid @RequestBody AtualizacaoUsuario dados,
                                    HttpServletRequest requisicao) {
        return RespostaUsuario.de(servico.atualizarEmail(obterUsuarioId(requisicao), dados.email()));
    }

    @DeleteMapping("/me")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(HttpServletRequest requisicao) {
        servico.excluir(obterUsuarioId(requisicao));
        requisicao.getSession(false).invalidate();
    }

    @PostMapping("/sair")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void sair(HttpServletRequest requisicao) {
        HttpSession sessao = requisicao.getSession(false);
        if (sessao != null) {
            sessao.invalidate();
        }
    }

    private Long obterUsuarioId(HttpServletRequest requisicao) {
        HttpSession sessao = requisicao.getSession(false);
        if (sessao == null || !(sessao.getAttribute("usuarioId") instanceof Long id)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Entre na sua conta para continuar");
        }
        return id;
    }
}
