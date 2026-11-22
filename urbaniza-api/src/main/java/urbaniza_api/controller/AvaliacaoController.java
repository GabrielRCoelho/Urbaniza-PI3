package urbaniza_api.controller;

import java.util.List;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import urbaniza_api.dto.NovaAvaliacao;
import urbaniza_api.dto.ResumoAvaliacao;
import urbaniza_api.service.AvaliacaoService;

@RestController
@RequestMapping("/api/avaliacoes")
public class AvaliacaoController {

    private final AvaliacaoService servico;

    public AvaliacaoController(AvaliacaoService servico) {
        this.servico = servico;
    }

    @GetMapping
    public List<ResumoAvaliacao> resumir() {
        return servico.resumir();
    }

    @PostMapping(headers = "X-Urbaniza=true")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void avaliar(@SessionAttribute(value = "usuarioId", required = false) Long usuarioId,
                        @Valid @RequestBody NovaAvaliacao dados) {
        // O autor vem da sessão criada no login.
        if (usuarioId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Entre para avaliar.");
        }
        servico.salvar(usuarioId, dados);
    }
}
