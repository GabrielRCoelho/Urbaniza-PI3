document.addEventListener("DOMContentLoaded", () => {
    const bairrosSP = [
        {
            id: "vila-mariana",
            nome: "Vila Mariana",
            zona: "Zona Sul • São Paulo",
            coords: [-23.5891, -46.6346],
            notas: {geral: 4.4, seguranca: 4.5, mobilidade: 4.6, iluminacao: 4.1}
        },
        {
            id: "pinheiros",
            nome: "Pinheiros",
            zona: "Zona Oeste • São Paulo",
            coords: [-23.5614, -46.6958],
            notas: {geral: 3.8, seguranca: 3.5, mobilidade: 4.4, iluminacao: 3.6}
        },
        {
            id: "bela-vista",
            nome: "Bela Vista",
            zona: "Centro • São Paulo",
            coords: [-23.5615, -46.6490],
            notas: {geral: 2.6, seguranca: 2.2, mobilidade: 4.2, iluminacao: 2.8}
        },
        {
            id: "se",
            nome: "Sé",
            zona: "Centro • São Paulo",
            coords: [-23.5505, -46.6333],
            notas: {geral: 2.3, seguranca: 1.9, mobilidade: 4.5, iluminacao: 2.4}
        },
        {
            id: "moema",
            nome: "Moema",
            zona: "Zona Sul • São Paulo",
            coords: [-23.5975, -46.6658],
            notas: {geral: 4.6, seguranca: 4.6, mobilidade: 4.5, iluminacao: 4.7}
        },
        {
            id: "ipiranga",
            nome: "Ipiranga",
            zona: "Zona Sul • São Paulo",
            coords: [-23.5855, -46.6095],
            notas: {geral: 3.6, seguranca: 3.4, mobilidade: 3.9, iluminacao: 3.5}
        },
        {
            id: "campo-belo",
            nome: "Campo Belo",
            zona: "Zona Sul • São Paulo",
            coords: [-23.6210, -46.6710],
            notas: {geral: 4.3, seguranca: 4.2, mobilidade: 4.1, iluminacao: 4.5}
        },
        {
            id: "saude",
            nome: "Saúde",
            zona: "Zona Sul • São Paulo",
            coords: [-23.6155, -46.6375],
            notas: {geral: 3.7, seguranca: 3.6, mobilidade: 4.0, iluminacao: 3.5}
        }
    ];

    let categoriaAtiva = "geral";
    let bairroSelecionado = bairrosSP[0];

    const mapa = L.map("mapa-sp", {zoomControl: false, attributionControl: false}).setView([-23.592, -46.650], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {maxZoom: 19}).addTo(mapa);

    setTimeout(() => {
        mapa.invalidateSize();
    }, 150);

    const camadaGeoJSON = L.layerGroup().addTo(mapa);
    const camadaMarcadores = L.layerGroup().addTo(mapa);

    function obterClassificacao(nota) {
        if (nota >= 4.0) return {texto: "Boa", classe: "status-boa", corHex: "#068a47"};
        if (nota >= 3.0) return {texto: "Média", classe: "status-media", corHex: "#f59e0b"};
        return {texto: "Ruim", classe: "status-ruim", corHex: "#e11d48"};
    }

    function atualizarCardRegiao(bairro) {
        bairroSelecionado = bairro;
        const notaAtual = bairro.notas[categoriaAtiva] ?? bairro.notas.geral;
        const infoStatus = obterClassificacao(notaAtual);

        document.getElementById("nome-regiao").textContent = bairro.nome;
        document.getElementById("zona-regiao").textContent = bairro.zona;
        document.getElementById("nota-regiao").textContent = notaAtual.toFixed(1).replace(".", ",");

        const badge = document.getElementById("status-regiao");
        badge.textContent = infoStatus.texto;
        badge.className = `tag-status ${infoStatus.classe}`;

        const containerEstrelas = document.getElementById("estrelas-regiao");
        const estrelasCheias = Math.round(notaAtual);
        containerEstrelas.innerHTML = "";
        for (let i = 1; i <= 5; i++) {
            const span = document.createElement("span");
            span.className = i <= estrelasCheias ? "estrela ativa" : "estrela inativa";
            span.innerHTML = "&#9733;";
            containerEstrelas.appendChild(span);
        }
    }

    function renderizarMarcadores(filtroTexto = "") {
        camadaMarcadores.clearLayers();
        bairrosSP
            .filter(b => b.nome.toLowerCase().includes(filtroTexto.toLowerCase()))
            .forEach(bairro => {
                const nota = bairro.notas[categoriaAtiva] ?? bairro.notas.geral;
                const {corHex} = obterClassificacao(nota);
                const isSelecionado = bairro.id === bairroSelecionado.id;

                const iconeBairro = L.divIcon({
                    className: "marcador-bairro-wrapper",
                    html: `
                                <div class="pino-bairro ${isSelecionado ? 'selecionado' : ''}" style="background-color: ${corHex};"></div>
                                <span class="nome-bairro-mapa">${bairro.nome}</span>
                            `,
                    iconSize: [100, 46],
                    iconAnchor: [50, 14]
                });

                const marcador = L.marker(bairro.coords, {icon: iconeBairro}).addTo(camadaMarcadores);
                marcador.on("click", () => {
                    atualizarCardRegiao(bairro);
                    mapa.panTo(bairro.coords);
                    renderizarMarcadores(filtroTexto);
                });
            });
    }

    async function carregarDivisaoBairrosSP() {
        try {
            const url = "https://raw.githubusercontent.com/codigourbano/distritos-sp/master/distritos-sp.geojson";
            const resposta = await fetch(url);
            if (!resposta.ok) return;
            const geojson = await resposta.json();

            camadaGeoJSON.clearLayers();
            L.geoJSON(geojson, {
                style: () => ({color: "#143456", weight: 1.2, opacity: 0.4, fillColor: "#143456", fillOpacity: 0.05}),
                onEachFeature: (feature, layer) => {
                    layer.on({
                        mouseover: (e) => e.target.setStyle({weight: 2.2, fillOpacity: 0.18, color: "#068a47"}),
                        mouseout: (e) => e.target.setStyle({weight: 1.2, fillOpacity: 0.05, color: "#143456"}),
                        click: (e) => {
                            const props = feature.properties || {};
                            const nomeDistrito = props.ds_nome || props.NOME_DIST || props.name || "Região de SP";
                            const bairroExistente = bairrosSP.find(b => b.nome.toLowerCase() === nomeDistrito.toLowerCase());

                            if (bairroExistente) {
                                atualizarCardRegiao(bairroExistente);
                            } else {
                                atualizarCardRegiao({
                                    id: nomeDistrito.toLowerCase(),
                                    nome: nomeDistrito,
                                    zona: "São Paulo • SP",
                                    coords: [e.latlng.lat, e.latlng.lng],
                                    notas: {geral: 4.0, seguranca: 3.9, mobilidade: 4.1, iluminacao: 4.0}
                                });
                            }
                            renderizarMarcadores(document.getElementById("input-busca-regiao").value);
                        }
                    });
                }
            }).addTo(camadaGeoJSON);
        } catch (e) {
            console.info("Marcadores principais carregados.");
        }
    }

    document.querySelectorAll(".pilula-filtro").forEach(botao => {
        botao.addEventListener("click", () => {
            const catClicada = botao.dataset.categoria;
            if (categoriaAtiva === catClicada) {
                categoriaAtiva = "geral";
                botao.classList.remove("selecionado");
            } else {
                document.querySelectorAll(".pilula-filtro").forEach(b => b.classList.remove("selecionado"));
                categoriaAtiva = catClicada;
                botao.classList.add("selecionado");
            }
            atualizarCardRegiao(bairroSelecionado);
            renderizarMarcadores(document.getElementById("input-busca-regiao").value);
        });
    });

    document.getElementById("input-busca-regiao").addEventListener("input", (e) => {
        const termo = e.target.value.trim();
        renderizarMarcadores(termo);
        const encontrado = bairrosSP.find(b => b.nome.toLowerCase().includes(termo.toLowerCase()));
        if (encontrado && termo.length >= 3) {
            atualizarCardRegiao(encontrado);
            mapa.panTo(encontrado.coords);
        }
    });

    document.getElementById("btn-zoom-in").addEventListener("click", () => mapa.zoomIn());
    document.getElementById("btn-zoom-out").addEventListener("click", () => mapa.zoomOut());
    document.getElementById("btn-localizacao").addEventListener("click", () => mapa.locate({
        setView: true,
        maxZoom: 14
    }));

    atualizarCardRegiao(bairroSelecionado);
    renderizarMarcadores();
    carregarDivisaoBairrosSP();
});