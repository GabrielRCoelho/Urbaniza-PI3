async function iniciarMapa() {
    const aviso = document.querySelector("#mensagem-mapa");
    const formularioBusca = document.querySelector("#form-busca");
    const busca = document.querySelector("#input-busca-regiao");
    const lista = document.querySelector("#resultados-busca");
    const detalhe = document.querySelector("#detalhe-bairro");
    const distritoAtual = document.querySelector("#distrito-atual");
    const botoesCategoria = document.querySelectorAll("[data-categoria]");
    let bairroSelecionado = null;
    let categoria = "geral";

    try {
        const mapa = L.map("mapa-sp").setView([-23.65, -46.65], 11);
        const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(mapa);
        tiles.once("tileerror", () => {
            document.querySelector("#mensagem-tiles").textContent = "Há imagens do mapa indisponíveis. Você ainda pode buscar e selecionar regiões.";
        });

        const [bairros, geojson] = await Promise.all([
            carregarBairrosAvaliados(), carregarJson("/geografia/distritos.geojson")
        ]);

        function mostrarDetalhe() {
            if (!bairroSelecionado) return;
            const notas = bairroSelecionado.notas;
            detalhe.hidden = false;
            detalhe.querySelector("h2").textContent = bairroSelecionado.nome;
            detalhe.querySelector(".zona-regiao").textContent = "Distrito " + bairroSelecionado.distrito;
            detalhe.querySelector(".nota-destaque").textContent = notas ? formatarNota(notas[categoria]) + " / 5" : "Sem avaliações";
            detalhe.querySelector(".quantidade").textContent = notas ? notas.total + (notas.total === 1 ? " avaliação" : " avaliações") : "";
            detalhe.querySelector("a").href = "avaliacoes.html?bairro=" + encodeURIComponent(bairroSelecionado.id);
        }

        function selecionarBairro(bairro) {
            bairroSelecionado = bairro;
            mostrarDetalhe();
            mapa.setView([bairro.lat, bairro.lon], 15);
            marcador.setLatLng([bairro.lat, bairro.lon]).addTo(mapa);
        }

        function limparBairro() {
            bairroSelecionado = null;
            detalhe.hidden = true;
            marcador.remove();
        }

        function listarResultados(encontrados) {
            lista.replaceChildren();
            for (const bairro of encontrados) {
                const item = document.createElement("li");
                const botao = document.createElement("button");
                botao.type = "button";
                botao.textContent = opcaoBairro(bairro);
                botao.addEventListener("click", () => selecionarBairro(bairro));
                item.append(botao);
                lista.append(item);
            }
            aviso.textContent = encontrados.length > 0 ? encontrados.length + " bairro(s) encontrado(s)." : "Nenhum bairro encontrado.";
        }

        const marcador = L.circleMarker([0, 0], {
            radius: 8, color: "#fff", fillColor: "#068a47", fillOpacity: 1, weight: 2
        });

        // O código do distrito liga o polígono oficial aos pontos do catálogo.
        const camadaDistritos = L.geoJSON(geojson, {
            style: { color: "#143456", weight: 1.5, fillOpacity: 0.1 },
            onEachFeature: (feature, camada) => {
                const { ds_codigo: codigo, ds_nome: nome } = feature.properties;
                camada.bindTooltip(nome);
                camada.on("click", () => {
                    limparBairro();
                    busca.value = "";
                    distritoAtual.textContent = "Distrito " + nome;
                    listarResultados(bairros.filter(bairro => bairro.distritoId === codigo));
                    mapa.fitBounds(camada.getBounds(), { maxZoom: 14 });
                });
            }
        }).addTo(mapa);
        mapa.fitBounds(camadaDistritos.getBounds());

        formularioBusca.addEventListener("submit", evento => {
            evento.preventDefault();
            const termo = normalizar(busca.value);
            limparBairro();
            distritoAtual.textContent = "";
            if (!termo) {
                lista.replaceChildren();
                aviso.textContent = "Digite um bairro ou distrito para buscar.";
                mapa.fitBounds(camadaDistritos.getBounds());
                return;
            }
            const exatos = bairros.filter(bairro =>
                normalizar(bairro.nome) === termo || normalizar(bairro.distrito) === termo
            );
            const encontrados = exatos.length ? exatos : bairros.filter(bairro =>
                normalizar(bairro.nome).includes(termo) || normalizar(bairro.distrito).includes(termo)
            );
            listarResultados(encontrados);
            if (encontrados.length === 1) selecionarBairro(encontrados[0]);
            if (encontrados.length > 1) {
                mapa.fitBounds(encontrados.map(bairro => [bairro.lat, bairro.lon]), { maxZoom: 14 });
            }
        });

        botoesCategoria.forEach(botao => {
            botao.addEventListener("click", () => {
                categoria = botao.dataset.categoria;
                botoesCategoria.forEach(item => {
                    const ativo = item === botao;
                    item.classList.toggle("selecionado", ativo);
                    item.setAttribute("aria-pressed", ativo);
                });
                mostrarDetalhe();
            });
        });

        formularioBusca.querySelector("fieldset").disabled = false;
        aviso.textContent = "Busque um bairro ou clique em um distrito para ver seus bairros.";
        // Só seleciona ao abrir um link que aponta explicitamente para um bairro.
        const bairroId = new URLSearchParams(location.search).get("bairro");
        const bairroDoLink = bairros.find(bairro => bairro.id === bairroId);
        if (bairroDoLink) selecionarBairro(bairroDoLink);
    } catch (erro) {
        aviso.textContent = erro.message || "Não foi possível carregar o mapa.";
    }
}

iniciarMapa();
