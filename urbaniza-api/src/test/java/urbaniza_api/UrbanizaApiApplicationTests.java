package urbaniza_api;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:inicializacao", "spring.jpa.hibernate.ddl-auto=create-drop"})
class UrbanizaApiApplicationTests {

	@Test
	void contextLoads() {
	}

}
