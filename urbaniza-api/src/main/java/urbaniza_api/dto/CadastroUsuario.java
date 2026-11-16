package urbaniza_api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CadastroUsuario(

    @NotBlank(message = "Informe o nome de usuário")
    @Size(max = 80, message = "O nome deve ter até 80 caracteres")
    String nome,

    @NotBlank(message = "Informe o e-mail")
    @Email(message = "Informe um e-mail válido")
    @Size(max = 254, message = "O e-mail deve ter até 254 caracteres")
    String email,

    @NotBlank(message = "Informe a senha")
    @Size(min = 8, message = "A senha deve ter pelo menos 8 caracteres")
    String senha,

    @NotBlank(message = "Confirme a senha")
    String confirmarSenha

) {
}
