async function iniciarAvaliacoes() {
    const form = document.querySelector("#form-avaliacao");
    const mensagem = document.querySelector("#mensagem-avaliacao");
    const listaDistritos = form.elements.distrito;
    const listaBairros = form.elements.bairroId;
    const botao = form.querySelector("button");

    try {
        const bairros = await carregarCatalogo();
        const distritos = [...new Set(bairros.map(bairro => bairro.distrito))]
            .sort((a, b) => a.localeCompare(b, "pt-BR"));
        for (const distrito of distritos) listaDistritos.add(new Option(distrito, distrito));

        function mostrarBairros() {
            listaBairros.replaceChildren(new Option("Selecione o bairro", ""));
            for (const bairro of bairros.filter(item => item.distrito === listaDistritos.value)) {
                listaBairros.add(new Option(bairro.nome, bairro.id));
            }
            listaBairros.disabled = !listaDistritos.value;
        }

        listaDistritos.addEventListener("change", mostrarBairros);
        const bairroId = new URLSearchParams(location.search).get("bairro");
        const bairroDoLink = bairros.find(bairro => bairro.id === bairroId);
        if (bairroDoLink) listaDistritos.value = bairroDoLink.distrito;
        mostrarBairros();
        if (bairroDoLink) listaBairros.value = bairroDoLink.id;

        form.querySelector("fieldset").disabled = false;
        mensagem.textContent = "";
        form.addEventListener("submit", async evento => {
            evento.preventDefault();
            const dados = Object.fromEntries(new FormData(form));
            botao.disabled = true;
            mensagem.textContent = "Salvando avaliação…";
            try {
                const resposta = await fetch("/api/avaliacoes", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "X-Urbaniza": "true" },
                    body: JSON.stringify({
                        bairroId: dados.bairroId,
                        seguranca: Number(dados.seguranca),
                        mobilidade: Number(dados.mobilidade),
                        iluminacao: Number(dados.iluminacao)
                    })
                });
                if (resposta.status === 401) {
                    location.replace("Index.html");
                    return;
                }
                if (!resposta.ok) {
                    const erro = await resposta.json().catch(() => ({}));
                    throw new Error(erro.mensagem || "Não foi possível salvar a avaliação.");
                }
                mensagem.textContent = "Avaliação salva.";
            } catch (erro) {
                mensagem.textContent = erro.message;
            } finally {
                botao.disabled = false;
            }
        });
    } catch (erro) {
        mensagem.textContent = erro.message;
    }
}

iniciarAvaliacoes();
