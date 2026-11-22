package urbaniza_api.dto;

public record ResumoAvaliacao(String bairroId, Long total, Double seguranca,
                              Double mobilidade, Double iluminacao) {

    // A média geral dá o mesmo peso aos três critérios.
    public double getGeral() {
        return (seguranca + mobilidade + iluminacao) / 3;
    }
}
