package urbaniza_api.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TesteController {

    @GetMapping("/api/teste")
    public String testar() {
        return "Backend do Urbaniza funcionando!";
    }
}