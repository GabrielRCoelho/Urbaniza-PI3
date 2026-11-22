package urbaniza_api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import urbaniza_api.dto.ResumoAvaliacao;
import urbaniza_api.model.Avaliacao;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {

    // Se a pessoa avaliar o bairro novamente, só o último envio entra na média.
    @Query("""
        select new urbaniza_api.dto.ResumoAvaliacao(a.bairroId, count(a),
            avg(a.seguranca), avg(a.mobilidade), avg(a.iluminacao))
        from Avaliacao a
        where a.id = (select max(b.id) from Avaliacao b
            where b.usuarioId = a.usuarioId and b.bairroId = a.bairroId)
        group by a.bairroId
        """)
    List<ResumoAvaliacao> resumirPorBairro();
}
