document.addEventListener('DOMContentLoaded', async () => {
    const elementoHtml = document.documentElement;
    const botonTema = document.getElementById('theme-toggle');
    const iconoTema = botonTema.querySelector('i');
    const temaGuardado = localStorage.getItem('theme');
    if (temaGuardado) {
        elementoHtml.setAttribute('data-bs-theme', temaGuardado);
        actualizarIconoTema(temaGuardado);
    }

    botonTema.addEventListener('click', () => {
        const temaNuevo = elementoHtml.getAttribute('data-bs-theme') === 'light' ? 'dark' : 'light';
        elementoHtml.setAttribute('data-bs-theme', temaNuevo);
        localStorage.setItem('theme', temaNuevo);
        actualizarIconoTema(temaNuevo);
    });

    function actualizarIconoTema(tema) {
        iconoTema.classList.toggle('bi-sun', tema === 'dark');
        iconoTema.classList.toggle('bi-moon', tema !== 'dark');
    }

    const formularioLogin = document.getElementById('login-form');
    const formularioRegistro = document.getElementById('register-form');
    const tituloModalAutenticacion = document.getElementById('auth-modal-title');
    const textoAlternarAutenticacion = document.getElementById('auth-switch-prompt');
    const botonAlternarAutenticacion = document.getElementById('auth-switch');
    const mensajeAutenticacion = document.getElementById('auth-message');
    const modalAutenticacionElemento = document.getElementById('auth-modal');
    const modalAutenticacion = bootstrap.Modal.getOrCreateInstance(modalAutenticacionElemento);
    const botonAbrirAutenticacion = document.getElementById('auth-trigger');
    const perfilUsuario = document.getElementById('user-profile');
    const nombreUsuario = document.getElementById('user-name');
    const avatarUsuario = document.getElementById('user-avatar');
    const botonCerrarSesion = document.getElementById('logout-button');
    const indicadorCarga = document.getElementById('indicador-carga-publicacion');
    const detallePublicacion = document.getElementById('detalle-publicacion');
    const botonEditar = document.getElementById('boton-editar-publicacion');
    const formularioEditar = document.getElementById('formulario-crear-publicacion');
    const botonGuardarEdicion = document.getElementById('boton-enviar-publicacion');
    const alertaEdicion = document.getElementById('alerta-error-publicacion');
    const modalEditar = bootstrap.Modal.getOrCreateInstance(document.getElementById('modal-crear-publicacion'));
    const idPublicacion = new URLSearchParams(window.location.search).get('id');
    let usuarioActual = null;
    let publicacionActual = null;

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

    function actualizarBotonEdicion() {
        const autor = publicacionActual && (publicacionActual.author || publicacionActual.autor);
        const esAutor = usuarioActual && autor && String(usuarioActual.id) === String(autor.id);
        botonEditar.classList.toggle('d-none', !esAutor);
    }

    function actualizarPerfilUsuario(usuario) {
        usuarioActual = usuario;
        if (!usuario) {
            botonAbrirAutenticacion.classList.remove('d-none');
            perfilUsuario.classList.add('d-none');
            perfilUsuario.classList.remove('d-flex');
            actualizarBotonEdicion();
            return;
        }

        nombreUsuario.textContent = usuario.name;
        avatarUsuario.textContent = usuario.name.trim().charAt(0).toUpperCase();
        botonAbrirAutenticacion.classList.add('d-none');
        perfilUsuario.classList.remove('d-none');
        perfilUsuario.classList.add('d-flex');
        actualizarBotonEdicion();
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
    modalAutenticacionElemento.addEventListener('show.bs.modal', mostrarFormularioLogin);

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

    function mostrarAlertaEdicion(mensaje) {
        alertaEdicion.textContent = mensaje;
        alertaEdicion.classList.remove('d-none');
    }

    function mostrarPublicacion(publicacion) {
        const autor = publicacion.author || publicacion.autor || {};
        const nombreAutor = autor.name || autor.nombre || 'Usuario';
        const juego = publicacion.game || publicacion.juego || '';
        const datosJuego = publicacion.datosJuego || {};
        const imagenJuego = publicacion.imagenJuego || datosJuego.imagen || '';
        const titulo = publicacion.title || publicacion.titulo || '';
        const fecha = new Date(publicacion.createdAt).toLocaleDateString('es-ES', {
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        document.getElementById('publicacion-juego').textContent = juego;
        document.getElementById('publicacion-categoria').textContent = publicacion.category || publicacion.categoria || '';
        document.getElementById('publicacion-titulo').textContent = titulo;
        document.getElementById('publicacion-contenido').textContent = publicacion.content || publicacion.contenido || '';
        document.getElementById('publicacion-autor').textContent = nombreAutor;
        document.getElementById('publicacion-avatar').textContent = nombreAutor.trim().charAt(0).toUpperCase();
        document.getElementById('publicacion-fecha').textContent = `· ${fecha}`;
        const imagenPortada = document.getElementById('publicacion-portada');
        if (imagenJuego) {
            imagenPortada.src = imagenJuego;
            imagenPortada.alt = `Portada de ${juego}`;
            imagenPortada.classList.remove('d-none');
            imagenPortada.onerror = () => imagenPortada.classList.add('d-none');
        } else {
            imagenPortada.removeAttribute('src');
            imagenPortada.classList.add('d-none');
        }

        const informacionJuego = document.getElementById('informacion-juego');
        const generos = Array.isArray(datosJuego.generos) ? datosJuego.generos.join(', ') : '';
        const plataformas = Array.isArray(datosJuego.plataformas) ? datosJuego.plataformas.join(', ') : '';
        const puntaje = typeof datosJuego.puntaje === 'number' && datosJuego.puntaje > 0
            ? `${datosJuego.puntaje} / 10`
            : '';
        const hayInformacionJuego = Boolean(datosJuego.descripcion || generos || plataformas || puntaje);
        informacionJuego.classList.toggle('d-none', !hayInformacionJuego);
        document.getElementById('juego-descripcion').textContent = datosJuego.descripcion || 'Sin descripción disponible.';
        document.getElementById('juego-generos').textContent = generos || 'Sin datos disponibles.';
        document.getElementById('juego-plataformas').textContent = plataformas || 'Sin datos disponibles.';
        document.getElementById('juego-puntaje').textContent = puntaje || 'Sin puntaje disponible.';
        document.title = `${titulo || 'Publicación'} - respawn.`;
        actualizarBotonEdicion();
    }

    botonEditar.addEventListener('click', () => {
        formularioEditar.elements.game.value = publicacionActual.game || publicacionActual.juego || '';
        formularioEditar.elements.category.value = publicacionActual.category || publicacionActual.categoria || '';
        formularioEditar.elements.title.value = publicacionActual.title || publicacionActual.titulo || '';
        formularioEditar.elements.content.value = publicacionActual.content || publicacionActual.contenido || '';
        document.getElementById('titulo-modal-crear-publicacion').textContent = 'Editar publicación';
        botonGuardarEdicion.textContent = 'Guardar cambios';
        alertaEdicion.classList.add('d-none');
        modalEditar.show();
    });

    formularioEditar.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        if (!formularioEditar.reportValidity()) return;

        botonGuardarEdicion.disabled = true;
        alertaEdicion.classList.add('d-none');
        try {
            const respuesta = await fetch(`/api/posts/${encodeURIComponent(idPublicacion)}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.fromEntries(new FormData(formularioEditar)))
            });
            const resultado = await respuesta.json();
            if (!respuesta.ok) {
                mostrarAlertaEdicion(resultado.error || 'No se pudo actualizar la publicación.');
                return;
            }

            publicacionActual = resultado.post;
            mostrarPublicacion(publicacionActual);
            modalEditar.hide();
        } catch (error) {
            mostrarAlertaEdicion('Error de conexión. Inténtalo de nuevo.');
        } finally {
            botonGuardarEdicion.disabled = false;
        }
    });

    const campoJuego = document.getElementById('campo-juego-publicacion');
    const listaSugerenciasJuegos = document.getElementById('lista-sugerencias-juegos');
    campoJuego.addEventListener('input', async () => {
        const termino = campoJuego.value.trim();
        if (!termino) {
            listaSugerenciasJuegos.replaceChildren();
            return;
        }
        try {
            const respuesta = await fetch(`/api/juegos?busqueda=${encodeURIComponent(termino)}`);
            if (!respuesta.ok) return;
            const resultado = await respuesta.json();
            listaSugerenciasJuegos.replaceChildren(...(resultado.datos || []).map((juego) => {
                const opcion = document.createElement('option');
                opcion.value = juego.titulo;
                return opcion;
            }));
        } catch (error) {
            console.error(error);
        }
    });

    async function cargarUsuarioActual() {
        try {
            const respuesta = await fetch('/api/auth/me');
            if (!respuesta.ok) throw new Error('No se pudo consultar la sesión actual.');
            const resultado = await respuesta.json();
            actualizarPerfilUsuario(resultado.user);
        } catch (error) {
            console.error(error);
        }
    }

    cargarUsuarioActual();
    if (!idPublicacion) {
        indicadorCarga.textContent = 'Publicación no especificada.';
        return;
    }

    try {
        const respuesta = await fetch(`/api/posts/${encodeURIComponent(idPublicacion)}`);
        const resultado = await respuesta.json();
        if (!respuesta.ok) {
            throw new Error(resultado.error || 'No se pudo cargar la publicación.');
        }

        publicacionActual = resultado;
        mostrarPublicacion(publicacionActual);
        indicadorCarga.classList.add('d-none');
        detallePublicacion.classList.remove('d-none');
    } catch (error) {
        indicadorCarga.textContent = error.message || 'Error: No se pudo cargar la publicación.';
    }
});
