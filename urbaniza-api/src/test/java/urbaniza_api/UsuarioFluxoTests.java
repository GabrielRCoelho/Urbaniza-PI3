package urbaniza_api;

import java.net.CookieManager;
import java.net.CookiePolicy;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import urbaniza_api.repository.UsuarioRepository;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
    "spring.datasource.url=jdbc:h2:mem:fluxo;DB_CLOSE_DELAY=-1",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
class UsuarioFluxoTests {

    @LocalServerPort
    int porta;

    @Autowired
    UsuarioRepository repositorio;

    private HttpClient navegador() {
        CookieManager cookies = new CookieManager(null, CookiePolicy.ACCEPT_ALL);
        return HttpClient.newBuilder().cookieHandler(cookies).build();
    }

    private HttpResponse<String> chamar(HttpClient cliente, String metodo, String rota, String dados) throws Exception {
        HttpRequest requisicao = HttpRequest.newBuilder(URI.create("http://localhost:" + porta + rota))
            .header("Content-Type", "application/json")
            .header("X-Urbaniza", "true")
            .method(metodo, dados == null ? HttpRequest.BodyPublishers.noBody() : HttpRequest.BodyPublishers.ofString(dados))
            .build();
        return cliente.send(requisicao, HttpResponse.BodyHandlers.ofString());
    }

    @Test
    void cadastroLoginPerfilESaida() throws Exception {
        HttpClient cliente = navegador();
        HttpClient outro = navegador();
        String cadastro = "{\"nome\":\"  João Teste  \",\"email\":\"Pessoa@exemplo.com\",\"senha\":\"senha1234\",\"confirmarSenha\":\"senha1234\"}";
        String login = "{\"email\":\"pessoa@exemplo.com\",\"senha\":\"senha1234\"}";

        assertEquals(401, chamar(cliente, "GET", "/api/usuarios/me", null).statusCode());
        assertEquals(401, chamar(cliente, "PUT", "/api/usuarios/me", "{\"email\":\"novo@exemplo.com\"}").statusCode());
        assertEquals(401, chamar(cliente, "DELETE", "/api/usuarios/me", null).statusCode());
        assertEquals(400, chamar(cliente, "POST", "/api/usuarios", cadastro.replace("Pessoa@exemplo.com", "invalido")).statusCode());
        assertEquals(400, chamar(cliente, "POST", "/api/usuarios", cadastro.replace("\"confirmarSenha\":\"senha1234\"", "\"confirmarSenha\":\"diferente\"")).statusCode());
        assertEquals(400, chamar(cliente, "POST", "/api/usuarios", cadastro.replace("senha1234", "curta")).statusCode());
        assertEquals(400, chamar(cliente, "POST", "/api/usuarios", cadastro.replace("senha1234", "á".repeat(37))).statusCode());

        assertEquals(400, chamar(cliente, "POST", "/api/usuarios", cadastro.replace("  João Teste  ", "   ")).statusCode());
        assertEquals(400, chamar(cliente, "POST", "/api/usuarios", cadastro.replace("  João Teste  ", "a".repeat(81))).statusCode());
        assertEquals(400, chamar(cliente, "POST", "/api/usuarios", cadastro.replace("\"nome\":\"  João Teste  \",", "")).statusCode());
        HttpResponse<String> criado = chamar(cliente, "POST", "/api/usuarios", cadastro);
        assertEquals(201, criado.statusCode());
        assertFalse(criado.body().contains("senha"));
        assertTrue(criado.body().contains("João Teste"));
        assertEquals("João Teste", repositorio.findByEmail("pessoa@exemplo.com").orElseThrow().getNome());
        String hash = repositorio.findByEmail("pessoa@exemplo.com").orElseThrow().getSenhaHash();
        assertNotEquals("senha1234", hash);
        assertTrue(new BCryptPasswordEncoder().matches("senha1234", hash));
        assertEquals(409, chamar(cliente, "POST", "/api/usuarios", cadastro).statusCode());
        assertEquals(401, chamar(cliente, "POST", "/api/usuarios/login", login.replace("senha1234", "errada")).statusCode());

        HttpResponse<String> entrada = chamar(cliente, "POST", "/api/usuarios/login", login);
        assertEquals(200, entrada.statusCode());
        String cookie = entrada.headers().firstValue("set-cookie").orElseThrow().toLowerCase();
        assertTrue(cookie.contains("httponly"));
        assertTrue(cookie.contains("samesite=strict"));
        assertEquals(200, chamar(cliente, "GET", "/api/usuarios/me", null).statusCode());
        assertEquals(401, chamar(outro, "GET", "/api/usuarios/me", null).statusCode());

        assertEquals(201, chamar(outro, "POST", "/api/usuarios", cadastro.replace("Pessoa@exemplo.com", "outro@exemplo.com")).statusCode());
        assertEquals(200, chamar(outro, "POST", "/api/usuarios/login", login.replace("pessoa@exemplo.com", "outro@exemplo.com")).statusCode());
        assertEquals(409, chamar(cliente, "PUT", "/api/usuarios/me", "{\"email\":\"outro@exemplo.com\"}").statusCode());
        assertEquals(400, chamar(cliente, "PUT", "/api/usuarios/me", "{\"email\":\"invalido\"}").statusCode());
        HttpResponse<String> atualizado = chamar(cliente, "PUT", "/api/usuarios/me", "{\"email\":\"NOVO@exemplo.com\"}");
        assertEquals(200, atualizado.statusCode());
        assertTrue(atualizado.body().contains("novo@exemplo.com"));
        assertTrue(atualizado.body().contains("João Teste"));
        assertTrue(chamar(cliente, "GET", "/api/usuarios/me", null).body().contains("João Teste"));
        assertTrue(chamar(outro, "GET", "/api/usuarios/me", null).body().contains("outro@exemplo.com"));

        assertEquals(204, chamar(cliente, "POST", "/api/usuarios/sair", null).statusCode());
        assertEquals(401, chamar(cliente, "GET", "/api/usuarios/me", null).statusCode());
        assertEquals(401, chamar(cliente, "POST", "/api/usuarios/login", login).statusCode());
        assertEquals(200, chamar(cliente, "POST", "/api/usuarios/login", login.replace("pessoa@exemplo.com", "novo@exemplo.com")).statusCode());
        assertEquals(204, chamar(cliente, "DELETE", "/api/usuarios/me", null).statusCode());
        assertEquals(401, chamar(cliente, "GET", "/api/usuarios/me", null).statusCode());
        assertFalse(repositorio.existsByEmail("novo@exemplo.com"));
        assertTrue(repositorio.existsByEmail("outro@exemplo.com"));
        assertEquals(401, chamar(cliente, "POST", "/api/usuarios/login", login.replace("pessoa@exemplo.com", "novo@exemplo.com")).statusCode());
    }

    @Test
    void arquivosDoFrontERequisicoesSemCabecalho() throws Exception {
        HttpClient cliente = navegador();
        for (String caminho : new String[] {"/Index.html", "/Cadastro.html", "/perfil.html", "/inicio.html", "/Script_conta.js", "/Style_perfil.css", "/assets/Logo.svg"}) {
            assertEquals(200, chamar(cliente, "GET", caminho, null).statusCode(), caminho);
        }
        assertEquals(404, chamar(cliente, "GET", "/pom.xml", null).statusCode());
        HttpRequest semCabecalho = HttpRequest.newBuilder(URI.create("http://localhost:" + porta + "/api/usuarios/sair"))
            .POST(HttpRequest.BodyPublishers.noBody()).build();
        assertNotEquals(204, cliente.send(semCabecalho, HttpResponse.BodyHandlers.ofString()).statusCode());
    }
}
