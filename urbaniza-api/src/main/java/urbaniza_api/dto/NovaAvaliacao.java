package urbaniza_api.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record NovaAvaliacao(
    @NotBlank(message = "Escolha um bairro.") String bairroId,
    @NotNull @Min(1) @Max(5) Integer seguranca,
    @NotNull @Min(1) @Max(5) Integer mobilidade,
    @NotNull @Min(1) @Max(5) Integer iluminacao
) {}
