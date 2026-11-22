package urbaniza_api.service;

import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import urbaniza_api.dto.NovaAvaliacao;
import urbaniza_api.dto.ResumoAvaliacao;
import urbaniza_api.model.Avaliacao;
import urbaniza_api.repository.AvaliacaoRepository;

@Service
public class AvaliacaoService {

    private final AvaliacaoRepository repositorio;
    private final UsuarioService usuarios;
    private final Set<String> bairros = new HashSet<>();

    public AvaliacaoService(AvaliacaoRepository repositorio, UsuarioService usuarios,
                             JsonMapper mapper) throws IOException {
        this.repositorio = repositorio;
        this.usuarios = usuarios;
        // A validação consulta o mesmo catálogo que abastece o mapa e o formulário.
        try (var arquivo = new ClassPathResource("static/geografia/bairros.json").getInputStream()) {
            for (JsonNode bairro : mapper.readTree(arquivo)) {
                bairros.add(bairro.get("id").stringValue());
            }
        }
    }

    public void salvar(Long usuarioId, NovaAvaliacao dados) {
        usuarios.buscar(usuarioId);
        if (!bairros.contains(dados.bairroId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Escolha um bairro do catálogo.");
        }
        repositorio.save(new Avaliacao(usuarioId, dados));
    }

    public List<ResumoAvaliacao> resumir() {
        return repositorio.resumirPorBairro();
    }
}
