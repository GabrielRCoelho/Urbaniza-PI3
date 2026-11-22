const formulario = document.querySelector("form[data-conta]");
const mensagem = document.querySelector("#mensagem-conta");

async function chamarApi(caminho, metodo = "GET", dados) {
    let resposta;
    try {
        resposta = await fetch("/api/usuarios" + caminho, {
            method: metodo,
            credentials: "same-origin",
            headers: { "Content-Type": "application/json", "X-Urbaniza": "true" },
            body: dados === undefined ? undefined : JSON.stringify(dados)
        });
    } catch {
        throw new Error("Não foi possível conectar ao servidor.");
    }
    if (resposta.status === 204) return;
    const conteudo = await resposta.json().catch(() => ({}));
    if (!resposta.ok) {
        if (resposta.status === 401 && document.body.dataset.protegida === "true") {
            window.location.replace("Index.html");
        }
        throw new Error(conteudo.mensagem || "Não foi possível concluir a operação.");
    }
    return conteudo;
}

function mostrarMensagem(texto) {
    if (mensagem) mensagem.textContent = texto;
}

if (formulario) {
    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        const botao = formulario.querySelector('button[type="submit"]');
        botao.disabled = true;
        mostrarMensagem("");
        try {
            const dados = Object.fromEntries(new FormData(formulario));
            if (formulario.dataset.conta === "cadastro") {
                await chamarApi("", "POST", dados);
                window.location.href = "Index.html?cadastro=ok";
            } else {
                await chamarApi("/login", "POST", dados);
                window.location.href = "inicio.html";
            }
        } catch (erro) {
            mostrarMensagem(erro.message);
        } finally {
            botao.disabled = false;
        }
    });
}

document.querySelectorAll(".mostrar-senha").forEach((botao) => {
    botao.addEventListener("click", () => {
        const campo = botao.closest(".campo").querySelector("input");
        campo.type = campo.type === "password" ? "text" : "password";
        botao.setAttribute("aria-label", campo.type === "password" ? "Mostrar senha" : "Ocultar senha");
    });
});

if (new URLSearchParams(window.location.search).get("cadastro") === "ok") {
    mostrarMensagem("Conta criada! Entre com seu e-mail e senha.");
}

async function carregarConta() {
    try {
        const usuario = await chamarApi("/me");
        const email = document.querySelector(".dados .email");
        if (email) {
            email.textContent = usuario.email;
            document.querySelector(".dados .nome").textContent = usuario.nome || "Sua conta";
            document.querySelector("#email-perfil").value = usuario.email;
            document.querySelector("#formulario-perfil").hidden = false;
        }
    } catch (erro) {
        mostrarMensagem(erro.message);
    }
}

if (document.body.dataset.protegida === "true") {
    carregarConta();
    // Revalida a sessão ao voltar para uma página no histórico do navegador.
    window.addEventListener("pageshow", (evento) => {
        if (evento.persisted) carregarConta();
    });
}

const perfil = document.querySelector("#formulario-perfil");
if (perfil) {
    perfil.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        const botao = perfil.querySelector('button[type="submit"]');
        botao.disabled = true;
        try {
            const usuario = await chamarApi("/me", "PUT", { email: perfil.elements.email.value });
            document.querySelector(".dados .email").textContent = usuario.email;
            perfil.elements.email.value = usuario.email;
            mostrarMensagem("E-mail atualizado!");
        } catch (erro) {
            mostrarMensagem(erro.message);
        } finally {
            botao.disabled = false;
        }
    });
}

async function encerrarConta(botao, caminho, metodo) {
    botao.disabled = true;
    try {
        await chamarApi(caminho, metodo);
        window.location.replace("Index.html");
    } catch (erro) {
        mostrarMensagem(erro.message);
        botao.disabled = false;
    }
}

document.querySelector("#sair-conta")?.addEventListener("click", (evento) => {
    encerrarConta(evento.currentTarget, "/sair", "POST");
});
document.querySelector("#confirmar-exclusao")?.addEventListener("click", (evento) => {
    document.querySelector("#modal-excluir").hidePopover();
    encerrarConta(evento.currentTarget, "/me", "DELETE");
});
