package urbaniza_api.dto;

import urbaniza_api.model.Usuario;

// A resposta nunca deve incluir a senha nem o hash.
public record RespostaUsuario(Long id, String nome, String email) {
    public static RespostaUsuario de(Usuario usuario) {
        return new RespostaUsuario(usuario.getId(), usuario.getNome(), usuario.getEmail());
    }
}
