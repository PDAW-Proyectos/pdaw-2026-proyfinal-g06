document.addEventListener('DOMContentLoaded', () => {
    const elementoHtml = document.documentElement;
    const botonTema = document.getElementById('theme-toggle');
    const icono = botonTema.querySelector('i');
    const formularioLogin = document.getElementById('login-form');
    const formularioRegistro = document.getElementById('register-form');
    const tituloModalAutenticacion = document.getElementById('auth-modal-title');
    const textoAlternarAutenticacion = document.getElementById('auth-switch-prompt');
    const botonAlternarAutenticacion = document.getElementById('auth-switch');
    const mensajeAutenticacion = document.getElementById('auth-message');
    const elementoModalAutenticacion = document.getElementById('auth-modal');
    const modalAutenticacion = bootstrap.Modal.getOrCreateInstance(elementoModalAutenticacion);
    const botonAbrirAutenticacion = document.getElementById('auth-trigger');
    const perfilUsuario = document.getElementById('user-profile');
    const nombreUsuario = document.getElementById('user-name');
    const avatarUsuario = document.getElementById('user-avatar');
    const botonCerrarSesion = document.getElementById('logout-button');

    const temaGuardado = localStorage.getItem('theme');
    if (temaGuardado) {
        elementoHtml.setAttribute('data-bs-theme', temaGuardado);
        actualizarIcono(temaGuardado);
    }

    botonTema.addEventListener('click', () => {
        const temaActual = elementoHtml.getAttribute('data-bs-theme');
        const nuevoTema = temaActual === 'light' ? 'dark' : 'light';
        
        elementoHtml.setAttribute('data-bs-theme', nuevoTema);
        
        localStorage.setItem('theme', nuevoTema);
        
        actualizarIcono(nuevoTema);
    });

    function actualizarIcono(tema) {
        if (tema === 'dark') {
            icono.classList.remove('bi-moon');
            icono.classList.add('bi-sun');
        } else {
            icono.classList.remove('bi-sun');
            icono.classList.add('bi-moon');
        }
    }

    function mostrarMensajeAutenticacion(mensaje, tipo = 'danger') {
        mensajeAutenticacion.textContent = mensaje;
        mensajeAutenticacion.className = `alert alert-${tipo}`;
    }

    function limpiarMensajeAutenticacion() {
        mensajeAutenticacion.textContent = '';
        mensajeAutenticacion.className = 'alert d-none';
    }

    function mostrarFormularioLogin() {
        formularioLogin.classList.remove('d-none');
        formularioRegistro.classList.add('d-none');
        tituloModalAutenticacion.textContent = 'Iniciar sesión';
        textoAlternarAutenticacion.textContent = '¿No tienes cuenta?';
        botonAlternarAutenticacion.textContent = 'Regístrate';
        limpiarMensajeAutenticacion();
    }

    function mostrarFormularioRegistro() {
        formularioLogin.classList.add('d-none');
        formularioRegistro.classList.remove('d-none');
        tituloModalAutenticacion.textContent = 'Crear cuenta';
        textoAlternarAutenticacion.textContent = '¿Ya tienes cuenta?';
        botonAlternarAutenticacion.textContent = 'Inicia sesión';
        limpiarMensajeAutenticacion();
    }

    function actualizarPerfilUsuario(usuario) {
        if (!usuario) {
            botonAbrirAutenticacion.classList.remove('d-none');
            perfilUsuario.classList.add('d-none');
            perfilUsuario.classList.remove('d-flex');
            return;
        }

        nombreUsuario.textContent = usuario.name;
        avatarUsuario.textContent = usuario.name.trim().charAt(0).toUpperCase();
        botonAbrirAutenticacion.classList.add('d-none');
        perfilUsuario.classList.remove('d-none');
        perfilUsuario.classList.add('d-flex');
    }

    async function enviarPeticionAutenticacion(endpoint, formulario) {
        const botonEnvio = formulario.querySelector('button[type="submit"]');
        botonEnvio.disabled = true;
        limpiarMensajeAutenticacion();

        try {
            const respuesta = await fetch(`/api/auth/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.fromEntries(new FormData(formulario)))
            });
            const resultado = await respuesta.json();

            if (!respuesta.ok) {
                mostrarMensajeAutenticacion(resultado.error || 'No se pudo completar la solicitud.');
                return null;
            }

            return resultado;
        } catch (error) {
            mostrarMensajeAutenticacion('No se pudo conectar con el servidor. Inténtalo de nuevo.');
            return null;
        } finally {
            botonEnvio.disabled = false;
        }
    }

    botonAlternarAutenticacion.addEventListener('click', () => {
        if (formularioLogin.classList.contains('d-none')) {
            mostrarFormularioLogin();
        } else {
            mostrarFormularioRegistro();
        }
    });

    formularioLogin.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        if (!formularioLogin.reportValidity()) return;

        const resultado = await enviarPeticionAutenticacion('login', formularioLogin);
        if (!resultado) return;

        actualizarPerfilUsuario(resultado.user);
        formularioLogin.reset();
        modalAutenticacion.hide();
    });

    formularioRegistro.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        if (!formularioRegistro.reportValidity()) return;

        const resultado = await enviarPeticionAutenticacion('register', formularioRegistro);
        if (!resultado) return;

        const emailRegistrado = formularioRegistro.elements.email.value;
        formularioRegistro.reset();
        mostrarFormularioLogin();
        document.getElementById('login-email').value = emailRegistrado;
        mostrarMensajeAutenticacion('Cuenta creada. Ahora inicia sesión con tu correo y contraseña.', 'success');
        document.getElementById('login-password').focus();
    });

    botonCerrarSesion.addEventListener('click', async () => {
        botonCerrarSesion.disabled = true;
        try {
            const respuesta = await fetch('/api/auth/logout', { method: 'POST' });
            if (!respuesta.ok) {
                mostrarMensajeAutenticacion('No se pudo cerrar la sesión. Inténtalo de nuevo.');
                return;
            }
            actualizarPerfilUsuario(null);
        } catch (error) {
            mostrarMensajeAutenticacion('No se pudo conectar con el servidor. Inténtalo de nuevo.');
        } finally {
            botonCerrarSesion.disabled = false;
        }
    });

    elementoModalAutenticacion.addEventListener('show.bs.modal', mostrarFormularioLogin);

    const contenedorPublicaciones = document.getElementById('contenedor-publicaciones') || document.getElementById('posts-container');
    const plantillaPublicacion = document.getElementById('plantilla-publicacion') || document.getElementById('post-template');
    const botonCrearPublicacion = document.getElementById('boton-crear-publicacion') || document.getElementById('create-post-btn');
    const formularioCrearPublicacion = document.getElementById('formulario-crear-publicacion') || document.getElementById('create-post-form');
    const elementoModalCrearPublicacion = document.getElementById('modal-crear-publicacion') || document.getElementById('create-post-modal');
    const modalCrearPublicacion = bootstrap.Modal.getOrCreateInstance(elementoModalCrearPublicacion);
    const alertaErrorPublicacion = document.getElementById('alerta-error-publicacion') || document.getElementById('post-error');

    let estaUsuarioAutenticado = false;

    const actualizarPerfilUsuarioOriginal = actualizarPerfilUsuario;
    actualizarPerfilUsuario = (usuario) => {
        actualizarPerfilUsuarioOriginal(usuario);
        estaUsuarioAutenticado = Boolean(usuario);
    };

    botonCrearPublicacion.addEventListener('click', () => {
        if (estaUsuarioAutenticado) {
            modalCrearPublicacion.show();
        } else {
            mostrarFormularioLogin();
            modalAutenticacion.show();
        }
    });

    elementoModalCrearPublicacion.addEventListener('show.bs.modal', () => {
        alertaErrorPublicacion.classList.add('d-none');
        alertaErrorPublicacion.textContent = '';
    });

    async function cargarPublicaciones(pagina = 1) {
        try {
            const respuesta = await fetch(`/api/posts?page=${pagina}`);
            if (!respuesta.ok) throw new Error('Error al cargar publicaciones');
            const resultado = await respuesta.json();

            contenedorPublicaciones.innerHTML = '';

            const listaPublicaciones = resultado.data || [];
            if (listaPublicaciones.length === 0) {
                contenedorPublicaciones.innerHTML = '<div class="text-center text-muted py-4">Aún no hay publicaciones. ¡Sé el primero en iniciar una conversación!</div>';
                return;
            }

            listaPublicaciones.forEach((publicacion) => {
                const clon = plantillaPublicacion.content.cloneNode(true);
                
                const elementoJuego = clon.querySelector('.publicacion-juego, .post-game');
                const elementoCategoria = clon.querySelector('.publicacion-categoria, .post-category');
                const elementoTitulo = clon.querySelector('.publicacion-titulo, .post-title');
                const elementoMetadatos = clon.querySelector('.publicacion-metadatos, .post-meta');

                if (elementoJuego) elementoJuego.textContent = publicacion.game || publicacion.juego || '';
                if (elementoCategoria) elementoCategoria.textContent = publicacion.category || publicacion.categoria || '';
                if (elementoTitulo) elementoTitulo.textContent = publicacion.title || publicacion.titulo || '';
                
                const fechaFormateada = new Date(publicacion.createdAt).toLocaleDateString('es-ES', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                const autor = publicacion.author || publicacion.autor;
                const nombreAutor = (autor && (autor.name || autor.nombre)) || 'Usuario';
                if (elementoMetadatos) {
                    elementoMetadatos.textContent = `${nombreAutor} · ${fechaFormateada}`;
                }
                
                contenedorPublicaciones.appendChild(clon);
            });
        } catch (error) {
            contenedorPublicaciones.innerHTML = '<div class="alert alert-danger">Error al cargar las publicaciones.</div>';
        }
    }

    formularioCrearPublicacion.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        const botonEnvio = formularioCrearPublicacion.querySelector('button[type="submit"]');
        botonEnvio.disabled = true;
        alertaErrorPublicacion.classList.add('d-none');

        try {
            const respuesta = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.fromEntries(new FormData(formularioCrearPublicacion)))
            });
            
            const resultado = await respuesta.json();

            if (!respuesta.ok) {
                alertaErrorPublicacion.textContent = resultado.error || 'Error al publicar';
                alertaErrorPublicacion.classList.remove('d-none');
                return;
            }

            formularioCrearPublicacion.reset();
            modalCrearPublicacion.hide();
            cargarPublicaciones(); 
        } catch (error) {
            alertaErrorPublicacion.textContent = 'Error de conexión. Inténtalo de nuevo.';
            alertaErrorPublicacion.classList.remove('d-none');
        } finally {
            botonEnvio.disabled = false;
        }
    });

    cargarPublicaciones();

    const formularioBuscarJuego = document.getElementById('formulario-buscar-juego');
    const campoBuscarJuego = document.getElementById('campo-buscar-juego');
    const contenedorJuegos = document.getElementById('contenedor-juegos');
    const mensajeJuegos = document.getElementById('mensaje-juegos');
    const campoJuegoPublicacion = document.getElementById('campo-juego-publicacion');
    const listaSugerenciasJuegos = document.getElementById('lista-sugerencias-juegos');

    function actualizarSugerenciasJuegos(juegos) {
        if (!listaSugerenciasJuegos) return;
        listaSugerenciasJuegos.innerHTML = '';
        juegos.forEach((juego) => {
            const opcion = document.createElement('option');
            opcion.value = juego.titulo;
            listaSugerenciasJuegos.appendChild(opcion);
        });
    }

    function renderizarJuegos(juegos) {
        if (!contenedorJuegos) return;
        contenedorJuegos.innerHTML = '';

        juegos.slice(0, 3).forEach((juego) => {
            const columna = document.createElement('div');
            columna.className = 'col-md-4';

            const plataformasTexto = Array.isArray(juego.plataformas) && juego.plataformas.length > 0
                ? juego.plataformas.join(', ')
                : 'Sin plataformas';
            const generosTexto = Array.isArray(juego.generos) && juego.generos.length > 0
                ? juego.generos.join(' · ')
                : 'General';

            columna.innerHTML = `
                <div class="game-card">
                    <img src="${juego.imagen}" alt="${juego.titulo}" class="img-fluid rounded-3 mb-3 game-img">
                    <span class="text-primary fw-bold fs-xs">Puntaje: ${juego.puntaje} / 10</span>
                    <div class="d-flex justify-content-between align-items-center mt-2">
                        <h4 class="fw-bold mb-0">${juego.titulo}</h4>
                        <i class="bi bi-arrow-up-right fs-5"></i>
                    </div>
                    <p class="text-muted fs-sm mt-1 mb-1">${generosTexto} · ${plataformasTexto}</p>
                    <p class="text-muted fs-xs mb-0">${juego.descripcion}</p>
                </div>
            `;

            columna.addEventListener('click', () => {
                if (campoJuegoPublicacion) {
                    campoJuegoPublicacion.value = juego.titulo;
                }
                if (estaUsuarioAutenticado) {
                    modalCrearPublicacion.show();
                } else {
                    mostrarFormularioLogin();
                    modalAutenticacion.show();
                }
            });

            contenedorJuegos.appendChild(columna);
        });
    }

    async function cargarJuegos(termino = '') {
        if (!contenedorJuegos) return;
        if (mensajeJuegos) {
            mensajeJuegos.classList.add('d-none');
            mensajeJuegos.textContent = '';
        }

        try {
            const respuesta = await fetch(`/api/juegos?busqueda=${encodeURIComponent(termino)}`);
            const resultado = await respuesta.json();

            if (!respuesta.ok) {
                contenedorJuegos.innerHTML = '';
                if (mensajeJuegos) {
                    mensajeJuegos.textContent = resultado.error || 'Juego no encontrado';
                    mensajeJuegos.classList.remove('d-none');
                }
                return;
            }

            const juegos = resultado.datos || [];
            renderizarJuegos(juegos);
            actualizarSugerenciasJuegos(juegos);
        } catch (error) {
            if (mensajeJuegos) {
                mensajeJuegos.textContent = 'Error al consultar videojuegos.';
                mensajeJuegos.classList.remove('d-none');
            }
        }
    }

    if (formularioBuscarJuego) {
        formularioBuscarJuego.addEventListener('submit', (evento) => {
            evento.preventDefault();
            cargarJuegos(campoBuscarJuego ? campoBuscarJuego.value : '');
        });
    }

    if (campoJuegoPublicacion) {
        campoJuegoPublicacion.addEventListener('input', async () => {
            const texto = campoJuegoPublicacion.value.trim();
            if (!texto) return;
            try {
                const respuesta = await fetch(`/api/juegos?busqueda=${encodeURIComponent(texto)}`);
                if (!respuesta.ok) return;
                const resultado = await respuesta.json();
                actualizarSugerenciasJuegos(resultado.datos || []);
            } catch (error) {
                return;
            }
        });
    }

    cargarJuegos();

    fetch('/api/auth/me')
        .then(async (respuesta) => {
            if (!respuesta.ok) throw new Error('No se pudo consultar la sesión actual.');
            const resultado = await respuesta.json();
            actualizarPerfilUsuario(resultado.user);
        })
        .catch((error) => {
            console.error(error);
        });
});
