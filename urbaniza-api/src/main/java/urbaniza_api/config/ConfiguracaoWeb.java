package urbaniza_api.config;

import java.nio.file.Path;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class ConfiguracaoWeb implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registro) {
        // Execute o Maven dentro de urbaniza-api. O front está na pasta acima.
        String pastaFront = Path.of("..").toAbsolutePath().normalize().toUri().toString();
        registro.addResourceHandler("/*.html", "/*.css", "/*.js")
            .addResourceLocations(pastaFront);
        registro.addResourceHandler("/assets/**").addResourceLocations(pastaFront + "assets/");
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registro) {
        registro.addRedirectViewController("/", "/Index.html");
    }
}
