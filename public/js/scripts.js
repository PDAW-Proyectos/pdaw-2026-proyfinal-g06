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

    const demorar = (funcion, espera = 250) => {
        let temporizador;
        return (...argumentos) => {
            clearTimeout(temporizador);
            temporizador = setTimeout(() => funcion(...argumentos), espera);
        };
    };

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
        cargarPublicaciones();
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
            cargarPublicaciones();
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
    let idUsuarioActual = null;
    let publicacionEnEdicion = null;
    let juegoSeleccionadoModal = null;

    const actualizarPerfilUsuarioOriginal = actualizarPerfilUsuario;
    actualizarPerfilUsuario = (usuario) => {
        actualizarPerfilUsuarioOriginal(usuario);
        estaUsuarioAutenticado = Boolean(usuario);
        idUsuarioActual = usuario ? usuario.id : null;
    };

    botonCrearPublicacion.addEventListener('click', () => {
        juegoSeleccionadoModal = null;
        prepararNuevaPublicacion();
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

    function prepararNuevaPublicacion() {
        publicacionEnEdicion = null;
        formularioCrearPublicacion.reset();
        document.getElementById('titulo-modal-crear-publicacion').textContent = 'Crear nueva publicación';
        document.getElementById('boton-enviar-publicacion').textContent = 'Publicar';
    }

    function editarPublicacion(publicacion, desdeModalJuego = false) {
        publicacionEnEdicion = publicacion;
        formularioCrearPublicacion.elements.game.value = publicacion.game || publicacion.juego || '';
        formularioCrearPublicacion.elements.category.value = publicacion.category || publicacion.categoria || '';
        formularioCrearPublicacion.elements.title.value = publicacion.title || publicacion.titulo || '';
        formularioCrearPublicacion.elements.content.value = publicacion.content || publicacion.contenido || '';
        document.getElementById('titulo-modal-crear-publicacion').textContent = 'Editar publicación';
        document.getElementById('boton-enviar-publicacion').textContent = 'Guardar cambios';

        if (desdeModalJuego) {
            elementoModalJuego.addEventListener('hidden.bs.modal', () => modalCrearPublicacion.show(), { once: true });
            modalJuego.hide();
        } else {
            modalCrearPublicacion.show();
        }
    }

    function crearAccionesPublicacion(publicacion, desdeModalJuego = false) {
        const autor = publicacion.author || publicacion.autor;
        if (!idUsuarioActual || !autor || String(autor.id) !== String(idUsuarioActual)) return null;

        const acciones = document.createElement('div');
        acciones.className = 'mt-2';
        const botonEditar = document.createElement('button');
        botonEditar.type = 'button';
        botonEditar.className = 'btn btn-outline-primary btn-sm';
        botonEditar.textContent = 'Editar';
        botonEditar.addEventListener('click', () => editarPublicacion(publicacion, desdeModalJuego));
        acciones.appendChild(botonEditar);
        return acciones;
    }

    function actualizarEstadoVisualVoto(contenedorVotos, puntajeVotos, miVoto) {
        if (!contenedorVotos) return;
        const elementoPuntaje = contenedorVotos.querySelector('.puntaje-votos');
        const botonArriba = contenedorVotos.querySelector('[data-accion-voto="1"]');
        const botonAbajo = contenedorVotos.querySelector('[data-accion-voto="-1"]');

        if (elementoPuntaje) {
            elementoPuntaje.textContent = String(puntajeVotos ?? 0);
        }
        if (botonArriba) {
            botonArriba.classList.toggle('text-primary', miVoto === 1);
            botonArriba.classList.toggle('fw-bold', miVoto === 1);
            botonArriba.classList.toggle('text-muted', miVoto !== 1);
            botonArriba.setAttribute('aria-pressed', String(miVoto === 1));
        }
        if (botonAbajo) {
            botonAbajo.classList.toggle('text-danger', miVoto === -1);
            botonAbajo.classList.toggle('fw-bold', miVoto === -1);
            botonAbajo.classList.toggle('text-muted', miVoto !== -1);
            botonAbajo.setAttribute('aria-pressed', String(miVoto === -1));
        }
    }

    async function enviarVotoPublicacion(idPublicacion, valor, contenedorVotos) {
        if (!estaUsuarioAutenticado) {
            mostrarFormularioLogin();
            modalAutenticacion.show();
            return;
        }

        const botones = contenedorVotos ? contenedorVotos.querySelectorAll('button[data-accion-voto]') : [];
        botones.forEach((boton) => { boton.disabled = true; });

        try {
            const respuesta = await fetch(`/api/posts/${encodeURIComponent(idPublicacion)}/voto`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ valor: Number(valor) })
            });

            if (respuesta.status === 401) {
                mostrarFormularioLogin();
                modalAutenticacion.show();
                return;
            }

            if (!respuesta.ok) return;
            const resultado = await respuesta.json();
            actualizarEstadoVisualVoto(contenedorVotos, resultado.puntajeVotos, resultado.miVoto);
        } catch (error) {
            return;
        } finally {
            botones.forEach((boton) => { boton.disabled = false; });
        }
    }

    contenedorPublicaciones.addEventListener('click', (evento) => {
        const botonVoto = evento.target.closest('button[data-accion-voto]');
        if (!botonVoto) return;
        const contenedorVotos = botonVoto.closest('[data-contenedor-votos]');
        const idPublicacion = contenedorVotos ? contenedorVotos.dataset.idPublicacion : null;
        if (!idPublicacion) return;
        enviarVotoPublicacion(idPublicacion, Number(botonVoto.dataset.accionVoto), contenedorVotos);
    });

    async function cargarPublicaciones(pagina = 1) {
        try {
            const respuesta = await fetch(`/api/posts?page=${pagina}`);
            if (!respuesta.ok) throw new Error('Error al cargar publicaciones');
            const resultado = await respuesta.json();

            const listaPublicaciones = resultado.data || [];
            if (listaPublicaciones.length === 0) {
                const avisoVacio = document.createElement('div');
                avisoVacio.className = 'text-center text-muted py-4';
                avisoVacio.textContent = 'Aún no hay publicaciones. ¡Sé el primero en iniciar una conversación!';
                contenedorPublicaciones.replaceChildren(avisoVacio);
                return;
            }

            const nodosPublicaciones = listaPublicaciones.map((publicacion) => {
                const clon = plantillaPublicacion.content.cloneNode(true);

                const elementoJuego = clon.querySelector('.publicacion-juego, .post-game');
                const elementoCategoria = clon.querySelector('.publicacion-categoria, .post-category');
                const elementoTitulo = clon.querySelector('.publicacion-titulo, .post-title');
                const elementoMetadatos = clon.querySelector('.publicacion-metadatos, .post-meta');
                const enlacePublicacion = clon.querySelector('.publicacion-enlace');
                const imagenPortada = clon.querySelector('.publicacion-portada');
                const contenedorVotos = clon.querySelector('[data-contenedor-votos]');
                const juego = publicacion.game || publicacion.juego || '';
                const portada = publicacion.imagenJuego || (publicacion.datosJuego && publicacion.datosJuego.imagen);

                if (elementoJuego) elementoJuego.textContent = juego;
                if (elementoCategoria) elementoCategoria.textContent = publicacion.category || publicacion.categoria || '';
                if (elementoTitulo) elementoTitulo.textContent = publicacion.title || publicacion.titulo || '';
                if (enlacePublicacion) enlacePublicacion.href = `/post.html?id=${encodeURIComponent(publicacion.id)}`;
                if (imagenPortada && portada) {
                    imagenPortada.src = portada;
                    imagenPortada.alt = `Portada de ${juego}`;
                    imagenPortada.classList.remove('d-none');
                    imagenPortada.addEventListener('error', () => imagenPortada.classList.add('d-none'), { once: true });
                }

                if (contenedorVotos) {
                    contenedorVotos.dataset.idPublicacion = publicacion.id;
                    const puntajeInicial = publicacion.puntajeVotos ?? publicacion.votes ?? 0;
                    const miVotoInicial = publicacion.miVoto ?? publicacion.userVote ?? 0;
                    actualizarEstadoVisualVoto(contenedorVotos, puntajeInicial, miVotoInicial);
                }

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
                const acciones = crearAccionesPublicacion(publicacion);
                if (acciones && elementoMetadatos) elementoMetadatos.parentElement.appendChild(acciones);

                return clon;
            });

            contenedorPublicaciones.replaceChildren(...nodosPublicaciones);
        } catch (error) {
            const alertaError = document.createElement('div');
            alertaError.className = 'alert alert-danger';
            alertaError.textContent = 'Error al cargar las publicaciones.';
            contenedorPublicaciones.replaceChildren(alertaError);
        }
    }

    formularioCrearPublicacion.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        const botonEnvio = formularioCrearPublicacion.querySelector('button[type="submit"]');
        botonEnvio.disabled = true;
        alertaErrorPublicacion.classList.add('d-none');

        try {
            const editando = Boolean(publicacionEnEdicion);
            const endpoint = editando
                ? `/api/posts/${encodeURIComponent(publicacionEnEdicion.id)}`
                : '/api/posts';
            const respuesta = await fetch(endpoint, {
                method: editando ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.fromEntries(new FormData(formularioCrearPublicacion)))
            });

            const resultado = await respuesta.json();

            if (!respuesta.ok) {
                alertaErrorPublicacion.textContent = resultado.error
                    || (editando ? 'Error al actualizar la publicación.' : 'Error al publicar.');
                alertaErrorPublicacion.classList.remove('d-none');
                return;
            }

            prepararNuevaPublicacion();
            modalCrearPublicacion.hide();
            await cargarPublicaciones();
            if (juegoSeleccionadoModal) await cargarPublicacionesJuego(juegoSeleccionadoModal);
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
    const elementoModalJuego = document.getElementById('modal-juego');
    const modalJuego = bootstrap.Modal.getOrCreateInstance(elementoModalJuego);
    const tituloModalJuego = document.getElementById('titulo-modal-juego');
    const imagenModalJuego = document.getElementById('imagen-modal-juego');
    const descripcionModalJuego = document.getElementById('descripcion-modal-juego');
    const generosModalJuego = document.getElementById('generos-modal-juego');
    const plataformasModalJuego = document.getElementById('plataformas-modal-juego');
    const puntajeModalJuego = document.getElementById('puntaje-modal-juego');
    const puntajeComunidadModalJuego = document.getElementById('puntaje-comunidad-modal-juego');
    const formularioPuntuarJuego = document.getElementById('formulario-puntuar-juego');
    const campoNotaJuego = document.getElementById('campo-nota-juego');
    const botonEnviarPuntuacion = document.getElementById('boton-enviar-puntuacion');
    const mensajePuntuacionJuego = document.getElementById('mensaje-puntuacion-juego');
    const estadoPublicacionesJuego = document.getElementById('estado-publicaciones-juego');
    const publicacionesDelJuego = document.getElementById('publicaciones-del-juego');
    const sinPublicacionesJuego = document.getElementById('sin-publicaciones-juego');
    const botonPrimeraPublicacion = document.getElementById('boton-primera-publicacion');

    function actualizarSugerenciasJuegos(juegos) {
        if (!listaSugerenciasJuegos) return;
        const opciones = juegos.map((juego) => {
            const opcion = document.createElement('option');
            opcion.value = juego.titulo;
            return opcion;
        });
        listaSugerenciasJuegos.replaceChildren(...opciones);
    }

    function renderizarJuegos(juegos) {
        if (!contenedorJuegos) return;
        contenedorJuegos.classList.remove('d-none');

        const juegosAMostrar = campoBuscarJuego && campoBuscarJuego.value.trim()
            ? juegos
            : juegos.slice(0, 3);

        const tarjetas = juegosAMostrar.map((juego) => {
            const tarjeta = document.createElement('button');
            tarjeta.type = 'button';
            tarjeta.className = 'game-card';

            if (juego.imagen) {
                const imagen = document.createElement('img');
                imagen.src = juego.imagen;
                imagen.alt = juego.titulo;
                imagen.className = 'game-img rounded-3 mb-2';
                tarjeta.appendChild(imagen);
            }

            const titulo = document.createElement('h4');
            titulo.className = 'game-title fw-bold mb-0';
            titulo.textContent = juego.titulo;

            tarjeta.appendChild(titulo);
            tarjeta.addEventListener('click', () => abrirModalJuego(juego));
            return tarjeta;
        });

        contenedorJuegos.replaceChildren(...tarjetas);
    }

    async function cargarPublicacionesJuego(juego) {
        publicacionesDelJuego.replaceChildren();
        estadoPublicacionesJuego.textContent = 'Cargando publicaciones...';
        sinPublicacionesJuego.classList.add('d-none');
        botonPrimeraPublicacion.classList.add('d-none');

        try {
            const respuesta = await fetch(`/api/posts?game=${encodeURIComponent(juego.titulo)}`);
            const resultado = await respuesta.json();
            if (!juegoSeleccionadoModal || juegoSeleccionadoModal.titulo !== juego.titulo) return;
            if (!respuesta.ok) throw new Error(resultado.error || 'No se pudieron cargar las publicaciones.');

            const publicaciones = resultado.data || [];
            estadoPublicacionesJuego.textContent = publicaciones.length
                ? `${resultado.total} ${resultado.total === 1 ? 'publicación' : 'publicaciones'}`
                : '';

            const tarjetas = publicaciones.map((publicacion) => {
                const tarjeta = document.createElement('article');
                tarjeta.className = 'card';
                const cuerpo = document.createElement('div');
                cuerpo.className = 'card-body';
                const titulo = document.createElement('h6');
                titulo.className = 'card-title fw-bold';
                const enlacePublicacion = document.createElement('a');
                enlacePublicacion.href = `/post.html?id=${encodeURIComponent(publicacion.id)}`;
                enlacePublicacion.target = '_blank';
                enlacePublicacion.rel = 'noopener noreferrer';
                enlacePublicacion.className = 'text-decoration-none text-body-emphasis';
                enlacePublicacion.textContent = publicacion.title || publicacion.titulo || 'Sin título';
                titulo.appendChild(enlacePublicacion);
                const autor = document.createElement('p');
                autor.className = 'text-muted fs-xs mb-2';
                autor.textContent = `Por ${(publicacion.author && publicacion.author.name) || 'Usuario'} · ${publicacion.category || publicacion.categoria || ''}`;
                const contenido = document.createElement('p');
                contenido.className = 'card-text mb-0';
                contenido.textContent = publicacion.content || publicacion.contenido || '';
                cuerpo.append(titulo, autor, contenido);
                const acciones = crearAccionesPublicacion(publicacion, true);
                if (acciones) cuerpo.appendChild(acciones);
                tarjeta.appendChild(cuerpo);
                return tarjeta;
            });

            publicacionesDelJuego.replaceChildren(...tarjetas);

            if (!publicaciones.length) {
                sinPublicacionesJuego.classList.remove('d-none');
                botonPrimeraPublicacion.classList.remove('d-none');
            }
        } catch (error) {
            if (!juegoSeleccionadoModal || juegoSeleccionadoModal.titulo !== juego.titulo) return;
            estadoPublicacionesJuego.textContent = error.message || 'No se pudieron cargar las publicaciones.';
        }
    }

    function actualizarVistaPuntuacionComunidad(resumen) {
        if (!puntajeComunidadModalJuego) return;
        const promedio = Number(resumen && resumen.promedio) || 0;
        const cantidadVotos = Number(resumen && resumen.cantidadVotos) || 0;
        const miPuntuacion = resumen ? resumen.miPuntuacion : null;

        if (cantidadVotos > 0) {
            puntajeComunidadModalJuego.textContent = `${promedio} / 10 (${cantidadVotos} ${cantidadVotos === 1 ? 'voto' : 'votos'})`;
        } else {
            puntajeComunidadModalJuego.textContent = 'Sin votos de la comunidad aún';
        }

        if (campoNotaJuego && miPuntuacion) {
            campoNotaJuego.value = String(miPuntuacion);
        }
        if (botonEnviarPuntuacion) {
            botonEnviarPuntuacion.textContent = miPuntuacion ? 'Actualizar nota' : 'Enviar';
        }
    }

    async function cargarPuntuacionJuegoModal(juego) {
        if (!puntajeComunidadModalJuego) return;
        if (mensajePuntuacionJuego) {
            mensajePuntuacionJuego.textContent = '';
        }
        actualizarVistaPuntuacionComunidad({
            promedio: juego.puntajeComunidad || 0,
            cantidadVotos: juego.cantidadVotos || 0,
            miPuntuacion: juego.miPuntuacion || null
        });

        try {
            const respuesta = await fetch(`/api/juegos/puntuaciones?juego=${encodeURIComponent(juego.titulo)}`);
            if (!respuesta.ok) return;
            const resultado = await respuesta.json();
            if (!juegoSeleccionadoModal || juegoSeleccionadoModal.titulo !== juego.titulo) return;
            if (resultado.datos) {
                juego.puntajeComunidad = resultado.datos.promedio;
                juego.cantidadVotos = resultado.datos.cantidadVotos;
                juego.miPuntuacion = resultado.datos.miPuntuacion;
                actualizarVistaPuntuacionComunidad(resultado.datos);
            }
        } catch (error) {
            return;
        }
    }

    if (formularioPuntuarJuego) {
        formularioPuntuarJuego.addEventListener('submit', async (evento) => {
            evento.preventDefault();
            if (!juegoSeleccionadoModal) return;

            if (!estaUsuarioAutenticado) {
                elementoModalJuego.addEventListener('hidden.bs.modal', () => {
                    mostrarFormularioLogin();
                    modalAutenticacion.show();
                }, { once: true });
                modalJuego.hide();
                return;
            }

            if (botonEnviarPuntuacion) botonEnviarPuntuacion.disabled = true;
            if (mensajePuntuacionJuego) mensajePuntuacionJuego.textContent = '';

            try {
                const respuesta = await fetch('/api/juegos/puntuaciones', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        juego: juegoSeleccionadoModal.titulo,
                        nota: Number(campoNotaJuego.value)
                    })
                });
                const resultado = await respuesta.json();

                if (!respuesta.ok) {
                    if (mensajePuntuacionJuego) {
                        mensajePuntuacionJuego.textContent = resultado.error || 'No se pudo registrar tu voto.';
                    }
                    return;
                }

                if (resultado.datos) {
                    juegoSeleccionadoModal.puntajeComunidad = resultado.datos.promedio;
                    juegoSeleccionadoModal.cantidadVotos = resultado.datos.cantidadVotos;
                    juegoSeleccionadoModal.miPuntuacion = resultado.datos.miPuntuacion;
                    actualizarVistaPuntuacionComunidad(resultado.datos);
                    if (mensajePuntuacionJuego) {
                        mensajePuntuacionJuego.textContent = 'Tu puntuación fue guardada.';
                    }
                }
            } catch (error) {
                if (mensajePuntuacionJuego) {
                    mensajePuntuacionJuego.textContent = 'Error de conexión al guardar la puntuación.';
                }
            } finally {
                if (botonEnviarPuntuacion) botonEnviarPuntuacion.disabled = false;
            }
        });
    }

    function abrirModalJuego(juego) {
        juegoSeleccionadoModal = juego;
        tituloModalJuego.textContent = juego.titulo;
        descripcionModalJuego.textContent = juego.descripcion || '';
        generosModalJuego.textContent = Array.isArray(juego.generos) ? juego.generos.join(', ') : '';
        plataformasModalJuego.textContent = Array.isArray(juego.plataformas) ? juego.plataformas.join(', ') : '';
        puntajeModalJuego.textContent = juego.puntaje > 0
            ? `${juego.puntaje} / 10`
            : 'Sin puntaje disponible';
        if (juego.imagen) {
            imagenModalJuego.src = juego.imagen;
            imagenModalJuego.alt = juego.titulo;
            imagenModalJuego.classList.remove('d-none');
        } else {
            imagenModalJuego.removeAttribute('src');
            imagenModalJuego.classList.add('d-none');
        }
        modalJuego.show();
        cargarPuntuacionJuegoModal(juego);
        cargarPublicacionesJuego(juego);
    }

    botonPrimeraPublicacion.addEventListener('click', () => {
        if (!juegoSeleccionadoModal) return;
        prepararNuevaPublicacion();
        campoJuegoPublicacion.value = juegoSeleccionadoModal.titulo;
        elementoModalJuego.addEventListener('hidden.bs.modal', () => {
            if (estaUsuarioAutenticado) {
                modalCrearPublicacion.show();
            } else {
                mostrarFormularioLogin();
                modalAutenticacion.show();
            }
        }, { once: true });
        modalJuego.hide();
    });

    let controladorBusquedaJuegos = null;

    async function cargarJuegos(termino = '') {
        if (!contenedorJuegos) return;
        if (mensajeJuegos) {
            mensajeJuegos.classList.add('d-none');
            mensajeJuegos.textContent = '';
        }

        if (controladorBusquedaJuegos) {
            controladorBusquedaJuegos.abort();
        }
        controladorBusquedaJuegos = new AbortController();

        try {
            const respuesta = await fetch(`/api/juegos?busqueda=${encodeURIComponent(termino)}`, {
                signal: controladorBusquedaJuegos.signal
            });
            const resultado = await respuesta.json();

            if (!respuesta.ok) {
                contenedorJuegos.replaceChildren();
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
            if (error.name === 'AbortError') return;
            if (mensajeJuegos) {
                mensajeJuegos.textContent = 'Error al consultar videojuegos.';
                mensajeJuegos.classList.remove('d-none');
            }
        }
    }

    if (formularioBuscarJuego) {
        formularioBuscarJuego.addEventListener('submit', async (evento) => {
            evento.preventDefault();
            const termino = campoBuscarJuego ? campoBuscarJuego.value.trim() : '';
            if (!termino) {
                cargarJuegos();
                return;
            }

            await cargarJuegos(termino);
            if (contenedorJuegos && !contenedorJuegos.children.length && mensajeJuegos && mensajeJuegos.classList.contains('d-none')) {
                mensajeJuegos.textContent = 'No se encontraron juegos. Probá con otro nombre.';
                mensajeJuegos.classList.remove('d-none');
            }
        });
    }

    if (campoBuscarJuego) {
        const buscarEnTiempoReal = demorar((texto) => {
            cargarJuegos(texto);
        }, 250);

        campoBuscarJuego.addEventListener('input', () => {
            buscarEnTiempoReal(campoBuscarJuego.value.trim());
        });
    }

    let controladorSugerencias = null;

    if (campoJuegoPublicacion) {
        const buscarSugerenciasConDemora = demorar(async (texto) => {
            if (controladorSugerencias) {
                controladorSugerencias.abort();
            }
            if (!texto) {
                if (listaSugerenciasJuegos) listaSugerenciasJuegos.replaceChildren();
                return;
            }

            controladorSugerencias = new AbortController();
            try {
                const respuesta = await fetch(`/api/juegos?busqueda=${encodeURIComponent(texto)}`, {
                    signal: controladorSugerencias.signal
                });
                if (!respuesta.ok) return;
                const resultado = await respuesta.json();
                actualizarSugerenciasJuegos(resultado.datos || []);
            } catch (error) {
                if (error.name === 'AbortError') return;
            }
        }, 250);

        campoJuegoPublicacion.addEventListener('input', () => {
            buscarSugerenciasConDemora(campoJuegoPublicacion.value.trim());
        });
    }

    cargarJuegos();

    fetch('/api/auth/me')
        .then(async (respuesta) => {
            if (!respuesta.ok) throw new Error('No se pudo consultar la sesión actual.');
            const resultado = await respuesta.json();
            actualizarPerfilUsuario(resultado.user);
            cargarPublicaciones();
        })
        .catch((error) => {
            console.error(error);
        });
});
