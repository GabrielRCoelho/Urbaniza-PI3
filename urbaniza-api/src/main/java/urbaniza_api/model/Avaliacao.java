package urbaniza_api.model;

import jakarta.persistence.*;
import urbaniza_api.dto.NovaAvaliacao;

@Entity
public class Avaliacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long usuarioId;

    @Column(nullable = false)
    private String bairroId;

    private int seguranca;
    private int mobilidade;
    private int iluminacao;

    protected Avaliacao() {}

    public Avaliacao(Long usuarioId, NovaAvaliacao dados) {
        this.usuarioId = usuarioId;
        this.bairroId = dados.bairroId();
        this.seguranca = dados.seguranca();
        this.mobilidade = dados.mobilidade();
        this.iluminacao = dados.iluminacao();
    }
}
