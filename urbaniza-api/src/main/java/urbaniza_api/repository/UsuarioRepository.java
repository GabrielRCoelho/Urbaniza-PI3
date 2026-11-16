package urbaniza_api.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import urbaniza_api.model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    boolean existsByEmail(String email);

    Optional<Usuario> findByEmail(String email);
}