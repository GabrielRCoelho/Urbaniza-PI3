async function mostrarDestaques() {
    const grade = document.querySelector("#destaques");
    const mensagem = document.querySelector("#mensagem-destaques");
    try {
        // Bairros sem avaliações ficam fora dos destaques.
        const bairros = (await carregarBairrosAvaliados()).filter(bairro => bairro.notas);
        bairros.sort((a, b) => b.notas.geral - a.notas.geral || a.nome.localeCompare(b.nome, "pt-BR"));

        grade.replaceChildren();
        if (bairros.length === 0) {
            mensagem.textContent = "Os destaques aparecem após a primeira avaliação.";
            return;
        }
        mensagem.textContent = "";
        const destaques = [
            ["Maior nota geral", bairros[0]],
            ["Menor nota geral", bairros[bairros.length - 1]]
        ];
        for (const [titulo, bairro] of destaques) {
            const card = document.querySelector("#modelo-destaque").content.cloneNode(true);
            card.querySelector("h3").textContent = bairro.nome;
            card.querySelector(".subtitulo-regiao").textContent = "Distrito " + bairro.distrito;
            card.querySelector("strong").textContent = formatarNota(bairro.notas.geral);
            const link = card.querySelector("a");
            link.textContent = titulo;
            link.href = "mapa.html?bairro=" + encodeURIComponent(bairro.id);
            grade.append(card);
        }
    } catch (erro) {
        mensagem.textContent = erro.message;
    }
}

mostrarDestaques();
window.addEventListener("pageshow", evento => {
    if (evento.persisted) mostrarDestaques();
});
