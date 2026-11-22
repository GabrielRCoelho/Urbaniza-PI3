// As três telas usam o mesmo catálogo e as mesmas médias do servidor.
async function carregarJson(url) {
    const resposta = await fetch(url, { cache: "no-store" });
    if (!resposta.ok) throw new Error("Não foi possível carregar os dados. Tente novamente.");
    return resposta.json();
}

async function carregarCatalogo() {
    return carregarJson("/geografia/bairros.json");
}

async function carregarBairrosAvaliados() {
    const [bairros, avaliacoes] = await Promise.all([
        carregarCatalogo(), carregarJson("/api/avaliacoes")
    ]);
    const notasPorBairro = new Map(avaliacoes.map(notas => [notas.bairroId, notas]));
    return bairros.map(bairro => ({ ...bairro, notas: notasPorBairro.get(bairro.id) }));
}

function normalizar(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function formatarNota(nota) {
    return nota.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 });
}

function opcaoBairro(bairro) {
    return bairro.nome + " — " + bairro.distrito;
}
