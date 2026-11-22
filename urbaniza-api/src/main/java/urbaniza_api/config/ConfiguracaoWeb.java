package urbaniza_api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class ConfiguracaoWeb implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registro) {
        // O Spring serve os arquivos de src/main/resources/static pelo classpath.
        registro.addRedirectViewController("/", "/Index.html");
        registro.addRedirectViewController("/index.html", "/Index.html");
    }
}
