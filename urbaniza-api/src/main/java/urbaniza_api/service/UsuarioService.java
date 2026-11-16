package urbaniza_api.service;

import java.nio.charset.StandardCharsets;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import urbaniza_api.dto.CadastroUsuario;
import urbaniza_api.dto.LoginUsuario;
import urbaniza_api.model.Usuario;
import urbaniza_api.repository.UsuarioRepository;

@Service
public class UsuarioService {

    private final UsuarioRepository repositorio;
    private final BCryptPasswordEncoder codificador = new BCryptPasswordEncoder();

    public UsuarioService(UsuarioRepository repositorio) {
        this.repositorio = repositorio;
    }

    @Transactional
    public Usuario cadastrar(CadastroUsuario cadastro) {
        if (!cadastro.senha().equals(cadastro.confirmarSenha())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "As senhas não conferem");
        }
        // O BCrypt aceita no máximo 72 bytes, inclusive para caracteres acentuados.
        if (cadastro.senha().getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A senha é muito longa (máximo de 72 bytes)");
        }
        String email = normalizarEmail(cadastro.email());
        if (repositorio.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Este e-mail já está cadastrado");
        }
        Usuario usuario = new Usuario(cadastro.nome().strip(), email, codificador.encode(cadastro.senha()));
        return repositorio.saveAndFlush(usuario);
    }

    public Usuario autenticar(LoginUsuario dados) {
        Usuario usuario = repositorio.findByEmail(normalizarEmail(dados.email())).orElseThrow(
            () -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-mail ou senha incorretos"));
        if (dados.senha().getBytes(StandardCharsets.UTF_8).length > 72
                || !codificador.matches(dados.senha(), usuario.getSenhaHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-mail ou senha incorretos");
        }
        return usuario;
    }

    public Usuario buscar(Long id) {
        return repositorio.findById(id).orElseThrow(
            () -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Entre novamente na sua conta"));
    }

    @Transactional
    public Usuario atualizarEmail(Long id, String novoEmail) {
        Usuario usuario = buscar(id);
        String email = normalizarEmail(novoEmail);
        if (!usuario.getEmail().equals(email) && repositorio.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Este e-mail já está cadastrado");
        }
        usuario.setEmail(email);
        return repositorio.saveAndFlush(usuario);
    }

    @Transactional
    public void excluir(Long id) {
        repositorio.delete(buscar(id));
    }

    private String normalizarEmail(String email) {
        return email.strip().toLowerCase(Locale.ROOT);
    }
}
