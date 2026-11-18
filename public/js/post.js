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
    const botonEliminarPublicacion = document.getElementById('boton-eliminar-publicacion');
    const formularioEditar = document.getElementById('formulario-crear-publicacion');
    const botonGuardarEdicion = document.getElementById('boton-enviar-publicacion');
    const alertaEdicion = document.getElementById('alerta-error-publicacion');
    const modalEditar = bootstrap.Modal.getOrCreateInstance(document.getElementById('modal-crear-publicacion'));
    const contenedorVotosDetalle = document.getElementById('contenedor-votos-detalle');
    const botonVotoArribaDetalle = document.getElementById('boton-voto-arriba-detalle');
    const botonVotoAbajoDetalle = document.getElementById('boton-voto-abajo-detalle');
    const puntajeVotosDetalle = document.getElementById('puntaje-votos-detalle');
    const tituloCalificacionJuego = document.getElementById('titulo-calificacion-publicacion');
    const promedioCalificacionJuego = document.getElementById('promedio-calificacion-publicacion');
    const estrellasCalificacionJuego = document.getElementById('estrellas-calificacion-publicacion');
    const estadoCalificacionJuego = document.getElementById('estado-calificacion-publicacion');
    const formularioComentario = document.getElementById('formulario-comentario');
    const campoComentario = document.getElementById('campo-comentario');
    const botonEnviarComentario = document.getElementById('boton-enviar-comentario');
    const avisoInicioSesionComentarios = document.getElementById('aviso-iniciar-sesion-comentarios');
    const botonLoginComentarios = document.getElementById('boton-login-comentarios');
    const listaComentarios = document.getElementById('lista-comentarios');
    const cantidadComentarios = document.getElementById('cantidad-comentarios');
    const alertaComentarios = document.getElementById('alerta-comentarios');
    const idPublicacion = new URLSearchParams(window.location.search).get('id');
    let usuarioActual = null;
    let publicacionActual = null;
    let idComentarioEnRespuesta = null;
    let idComentarioEnEdicion = null;

    const contenedorToasts = document.getElementById('contenedor-toasts');

    function mostrarToast(mensaje, tipo = 'danger') {
        if (!contenedorToasts || !mensaje) return;
        const elementoToast = document.createElement('div');
        elementoToast.className = 'toast toast-respawn align-items-center border';
        elementoToast.setAttribute('role', 'status');
        elementoToast.setAttribute('aria-live', 'polite');
        elementoToast.setAttribute('aria-atomic', 'true');

        const cuerpo = document.createElement('div');
        cuerpo.className = 'd-flex align-items-center p-3 gap-2';

        const iconoEstado = document.createElement('i');
        if (tipo === 'success') {
            iconoEstado.className = 'bi bi-check-circle-fill text-primary fs-5';
        } else if (tipo === 'warning') {
            iconoEstado.className = 'bi bi-exclamation-circle-fill text-warning fs-5';
        } else {
            iconoEstado.className = 'bi bi-exclamation-triangle-fill text-danger fs-5';
        }

        const texto = document.createElement('div');
        texto.className = 'toast-body p-0 fs-sm fw-medium flex-grow-1';
        texto.textContent = mensaje;

        const botonCerrar = document.createElement('button');
        botonCerrar.type = 'button';
        botonCerrar.className = 'btn-close ms-2';
        botonCerrar.setAttribute('data-bs-dismiss', 'toast');
        botonCerrar.setAttribute('aria-label', 'Cerrar');

        cuerpo.append(iconoEstado, texto, botonCerrar);
        elementoToast.appendChild(cuerpo);
        contenedorToasts.appendChild(elementoToast);

        const instancia = bootstrap.Toast.getOrCreateInstance(elementoToast, { delay: 3500 });
        elementoToast.addEventListener('hidden.bs.toast', () => elementoToast.remove(), { once: true });
        instancia.show();
    }

    function confirmarConToast(mensaje) {
        return new Promise((resolver) => {
            if (!contenedorToasts) {
                resolver(true);
                return;
            }
            let resuelto = false;
            const finalizar = (valor) => {
                if (resuelto) return;
                resuelto = true;
                resolver(valor);
            };

            const elementoToast = document.createElement('div');
            elementoToast.className = 'toast toast-respawn border p-3';
            elementoToast.setAttribute('role', 'alert');

            const texto = document.createElement('p');
            texto.className = 'fs-sm fw-medium mb-3';
            texto.textContent = mensaje;

            const acciones = document.createElement('div');
            acciones.className = 'd-flex justify-content-end gap-2';

            const botonCancelar = document.createElement('button');
            botonCancelar.type = 'button';
            botonCancelar.className = 'btn btn-outline-secondary btn-sm';
            botonCancelar.textContent = 'Cancelar';

            const botonConfirmar = document.createElement('button');
            botonConfirmar.type = 'button';
            botonConfirmar.className = 'btn btn-danger btn-sm';
            botonConfirmar.textContent = 'Eliminar';

            acciones.append(botonCancelar, botonConfirmar);
            elementoToast.append(texto, acciones);
            contenedorToasts.appendChild(elementoToast);

            const instancia = bootstrap.Toast.getOrCreateInstance(elementoToast, { autohide: false });
            botonCancelar.addEventListener('click', () => {
                finalizar(false);
                instancia.hide();
            });
            botonConfirmar.addEventListener('click', () => {
                finalizar(true);
                instancia.hide();
            });
            elementoToast.addEventListener('hidden.bs.toast', () => {
                finalizar(false);
                elementoToast.remove();
            }, { once: true });
            instancia.show();
        });
    }

    function mostrarMensajeAutenticacion(mensaje, tipo = 'danger') {
        mostrarToast(mensaje, tipo);
    }

    function limpiarMensajeAutenticacion() {
        return;
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
        if (botonEliminarPublicacion) {
            botonEliminarPublicacion.classList.toggle('d-none', !esAutor);
        }
    }

    function pintarEstrellasJuegoPost(resumen, nombreJuego) {
        if (!estrellasCalificacionJuego || !promedioCalificacionJuego) return;
        const promedio = Number(resumen && resumen.promedio) || 0;
        const cantidadVotos = Number(resumen && resumen.cantidadVotos) || 0;
        const miPuntuacion = resumen ? resumen.miPuntuacion : null;

        if (tituloCalificacionJuego && nombreJuego) {
            tituloCalificacionJuego.textContent = `Puntuar juego: ${nombreJuego}`;
        }

        promedioCalificacionJuego.textContent = cantidadVotos > 0
            ? `${promedio} / 5 (${cantidadVotos} ${cantidadVotos === 1 ? 'voto' : 'votos'} de la comunidad)`
            : 'Sin votos de la comunidad aún';

        const botones = estrellasCalificacionJuego.querySelectorAll('[data-calificacion-publicacion]');
        botones.forEach((boton) => {
            const valor = Number(boton.dataset.calificacionPublicacion);
            const seleccionada = Boolean(miPuntuacion && valor <= Number(miPuntuacion));
            boton.classList.toggle('text-warning', seleccionada);
            boton.classList.toggle('text-muted', !seleccionada);
            const icono = boton.querySelector('i');
            if (icono) {
                icono.classList.toggle('bi-star-fill', seleccionada);
                icono.classList.toggle('bi-star', !seleccionada);
            }
        });

        if (estadoCalificacionJuego) {
            if (!usuarioActual) {
                estadoCalificacionJuego.textContent = 'Inicia sesión para puntuar este videojuego del 1 al 5.';
            } else if (miPuntuacion) {
                estadoCalificacionJuego.textContent = `Tu puntuación para este juego es ${miPuntuacion} / 5 (puedes tocar otra estrella para actualizarla).`;
            } else {
                estadoCalificacionJuego.textContent = 'Selecciona de 1 a 5 estrellas para puntuar este videojuego.';
            }
        }
    }

    async function cargarPuntuacionJuegoEnPost(nombreJuego) {
        if (!nombreJuego || !estrellasCalificacionJuego) return;
        try {
            const respuesta = await fetch(`/api/juegos/puntuaciones?juego=${encodeURIComponent(nombreJuego)}`);
            if (!respuesta.ok) return;
            const resultado = await respuesta.json();
            if (resultado.datos) {
                pintarEstrellasJuegoPost(resultado.datos, nombreJuego);
            }
        } catch (error) {
            return;
        }
    }

    function actualizarEstadoVotoDetalle(puntaje, miVoto) {
        if (puntajeVotosDetalle) {
            puntajeVotosDetalle.textContent = String(puntaje ?? 0);
        }
        if (botonVotoArribaDetalle) {
            botonVotoArribaDetalle.classList.toggle('text-primary', miVoto === 1);
            botonVotoArribaDetalle.classList.toggle('fw-bold', miVoto === 1);
            botonVotoArribaDetalle.classList.toggle('text-muted', miVoto !== 1);
            botonVotoArribaDetalle.setAttribute('aria-pressed', String(miVoto === 1));
        }
        if (botonVotoAbajoDetalle) {
            botonVotoAbajoDetalle.classList.toggle('text-danger', miVoto === -1);
            botonVotoAbajoDetalle.classList.toggle('fw-bold', miVoto === -1);
            botonVotoAbajoDetalle.classList.toggle('text-muted', miVoto !== -1);
            botonVotoAbajoDetalle.setAttribute('aria-pressed', String(miVoto === -1));
        }
    }

    function actualizarPerfilUsuario(usuario) {
        usuarioActual = usuario;
        actualizarFormularioComentarios();
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
        await recargarPublicacionActual();
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
            await recargarPublicacionActual();
        } catch (error) {
            mostrarMensajeAutenticacion('No se pudo conectar con el servidor. Inténtalo de nuevo.');
        } finally {
            botonCerrarSesion.disabled = false;
        }
    });

    if (contenedorVotosDetalle) {
        contenedorVotosDetalle.addEventListener('click', async (evento) => {
            const botonVoto = evento.target.closest('button[data-accion-voto]');
            if (!botonVoto || !idPublicacion) return;

            if (!usuarioActual) {
                mostrarFormularioLogin();
                modalAutenticacion.show();
                return;
            }

            const botones = contenedorVotosDetalle.querySelectorAll('button[data-accion-voto]');
            botones.forEach((boton) => { boton.disabled = true; });

            try {
                const respuesta = await fetch(`/api/posts/${encodeURIComponent(idPublicacion)}/voto`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ valor: Number(botonVoto.dataset.accionVoto) })
                });

                if (respuesta.status === 401) {
                    mostrarFormularioLogin();
                    modalAutenticacion.show();
                    return;
                }
                if (!respuesta.ok) return;

                const resultado = await respuesta.json();
                if (publicacionActual) {
                    publicacionActual.puntajeVotos = resultado.puntajeVotos;
                    publicacionActual.miVoto = resultado.miVoto;
                }
                actualizarEstadoVotoDetalle(resultado.puntajeVotos, resultado.miVoto);
            } catch (error) {
                return;
            } finally {
                botones.forEach((boton) => { boton.disabled = false; });
            }
        });
    }

    if (estrellasCalificacionJuego) {
        estrellasCalificacionJuego.addEventListener('click', async (evento) => {
            const boton = evento.target.closest('[data-calificacion-publicacion]');
            if (!boton || !publicacionActual) return;

            if (!usuarioActual) {
                mostrarFormularioLogin();
                modalAutenticacion.show();
                return;
            }

            const nombreJuego = publicacionActual.game || publicacionActual.juego || '';
            if (!nombreJuego) return;

            const notaElegida = Number(boton.dataset.calificacionPublicacion);
            const botones = estrellasCalificacionJuego.querySelectorAll('[data-calificacion-publicacion]');
            botones.forEach((elemento) => { elemento.disabled = true; });

            try {
                const respuesta = await fetch('/api/juegos/puntuaciones', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ juego: nombreJuego, nota: notaElegida })
                });
                const resultado = await respuesta.json();
                if (!respuesta.ok) {
                    if (estadoCalificacionJuego) {
                        estadoCalificacionJuego.textContent = resultado.error || 'No se pudo guardar tu puntuación.';
                    }
                    return;
                }
                if (resultado.datos) {
                    pintarEstrellasJuegoPost(resultado.datos, nombreJuego);
                }
            } catch (error) {
                if (estadoCalificacionJuego) {
                    estadoCalificacionJuego.textContent = 'Error de conexión al guardar la puntuación.';
                }
            } finally {
                botones.forEach((elemento) => { elemento.disabled = false; });
            }
        });
    }

    function mostrarAlertaEdicion(mensaje) {
        mostrarToast(mensaje, 'danger');
    }

    function actualizarFormularioComentarios() {
        const puedeComentar = Boolean(usuarioActual);
        campoComentario.disabled = !puedeComentar;
        botonEnviarComentario.disabled = !puedeComentar;
        avisoInicioSesionComentarios.classList.toggle('d-none', puedeComentar);
        botonLoginComentarios.classList.toggle('d-none', puedeComentar);
    }

    function mostrarErrorComentarios(mensaje) {
        mostrarToast(mensaje, 'danger');
    }

    function ocultarErrorComentarios() {
        return;
    }

    async function leerRespuestaComentarios(respuesta) {
        const tipoContenido = respuesta.headers.get('content-type') || '';
        if (!tipoContenido.includes('application/json')) {
            throw new Error(
                `El servidor devolvió una página HTML en vez de datos (HTTP ${respuesta.status}). ` +
                'Reinicia la aplicación con "npm run dev" y vuelve a cargar la página.'
            );
        }

        try {
            return await respuesta.json();
        } catch (error) {
            throw new Error('El servidor devolvió una respuesta JSON inválida.');
        }
    }

    function crearFormularioRespuesta(idComentario) {
        const formulario = document.createElement('form');
        formulario.className = 'mt-3';
        formulario.dataset.comentarioPadre = idComentario;
        formulario.noValidate = true;

        const etiqueta = document.createElement('label');
        etiqueta.className = 'form-label fs-sm fw-medium';
        etiqueta.textContent = 'Tu respuesta';

        const campo = document.createElement('textarea');
        campo.className = 'form-control mb-2';
        campo.name = 'content';
        campo.rows = 2;
        campo.maxLength = 2000;
        campo.placeholder = 'Escribe una respuesta...';
        etiqueta.htmlFor = `respuesta-${idComentario}`;
        campo.id = etiqueta.htmlFor;

        const acciones = document.createElement('div');
        acciones.className = 'd-flex justify-content-end gap-2';
        const cancelar = document.createElement('button');
        cancelar.type = 'button';
        cancelar.className = 'btn btn-outline-secondary btn-sm';
        cancelar.dataset.cancelarRespuesta = '';
        cancelar.textContent = 'Cancelar';
        const enviar = document.createElement('button');
        enviar.type = 'submit';
        enviar.className = 'btn btn-primary btn-sm';
        enviar.textContent = 'Responder';
        acciones.append(cancelar, enviar);
        formulario.append(etiqueta, campo, acciones);
        return formulario;
    }

    function crearFormularioEdicion(comentario) {
        const formulario = document.createElement('form');
        formulario.className = 'mt-3';
        formulario.dataset.comentarioEditar = comentario.id;
        formulario.noValidate = true;

        const etiqueta = document.createElement('label');
        etiqueta.className = 'form-label fs-sm fw-medium';
        etiqueta.htmlFor = `edicion-${comentario.id}`;
        etiqueta.textContent = 'Editar comentario';

        const campo = document.createElement('textarea');
        campo.id = etiqueta.htmlFor;
        campo.className = 'form-control mb-2';
        campo.name = 'content';
        campo.rows = 3;
        campo.maxLength = 2000;
        campo.value = comentario.content || '';

        const acciones = document.createElement('div');
        acciones.className = 'd-flex justify-content-end gap-2';
        const cancelar = document.createElement('button');
        cancelar.type = 'button';
        cancelar.className = 'btn btn-outline-secondary btn-sm';
        cancelar.dataset.cancelarEdicion = '';
        cancelar.textContent = 'Cancelar';
        const guardar = document.createElement('button');
        guardar.type = 'submit';
        guardar.className = 'btn btn-primary btn-sm';
        guardar.textContent = 'Guardar';
        acciones.append(cancelar, guardar);
        formulario.append(etiqueta, campo, acciones);
        return formulario;
    }

    function crearElementoComentario(comentario) {
        const articulo = document.createElement('article');
        articulo.className = 'card bg-body-tertiary border-0 rounded-4 mb-3';
        const cuerpo = document.createElement('div');
        cuerpo.className = 'card-body';

        const encabezado = document.createElement('div');
        encabezado.className = 'd-flex align-items-center gap-2 mb-2';
        const avatar = document.createElement('div');
        avatar.className = 'avatar bg-body text-muted fw-bold rounded-circle d-flex justify-content-center align-items-center flex-shrink-0';
        const nombreAutor = comentario.author && comentario.author.name ? comentario.author.name : 'Usuario';
        avatar.textContent = nombreAutor.trim().charAt(0).toUpperCase();
        const autor = document.createElement('span');
        autor.className = 'fw-bold fs-sm';
        autor.textContent = nombreAutor;
        const fecha = document.createElement('time');
        fecha.className = 'text-muted fs-xs ms-auto';
        const fechaComentario = new Date(comentario.createdAt);
        fecha.textContent = Number.isNaN(fechaComentario.getTime())
            ? ''
            : fechaComentario.toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });
        encabezado.append(avatar, autor, fecha);

        const contenido = document.createElement('p');
        contenido.className = 'comment-content mb-2';
        contenido.textContent = comentario.content || '';
        const responder = document.createElement('button');
        responder.type = 'button';
        responder.className = 'btn btn-link btn-sm text-decoration-none p-0';
        responder.dataset.responderComentario = comentario.id;
        responder.textContent = 'Responder';

        cuerpo.append(encabezado);
        const esAutor = usuarioActual && comentario.author
            && String(usuarioActual.id) === String(comentario.author.id);
        if (idComentarioEnEdicion === comentario.id && esAutor) {
            cuerpo.append(crearFormularioEdicion(comentario));
        } else {
            if (comentario.deleted) {
                const eliminado = document.createElement('p');
                eliminado.className = 'comment-content text-muted fst-italic mb-2';
                eliminado.textContent = 'Este comentario fue eliminado.';
                cuerpo.append(eliminado);
            } else {
                cuerpo.append(contenido);
            }

            const acciones = document.createElement('div');
            acciones.className = 'd-flex align-items-center gap-3';
            acciones.append(responder);
            if (esAutor && !comentario.deleted) {
                const editar = document.createElement('button');
                editar.type = 'button';
                editar.className = 'btn btn-link btn-sm text-decoration-none p-0';
                editar.dataset.editarComentario = comentario.id;
                editar.textContent = 'Editar';
                const eliminar = document.createElement('button');
                eliminar.type = 'button';
                eliminar.className = 'btn btn-link btn-sm text-danger text-decoration-none p-0';
                eliminar.dataset.eliminarComentario = comentario.id;
                eliminar.dataset.comentarioPrincipal = String(!comentario.parentId);
                eliminar.textContent = 'Eliminar';
                acciones.append(editar, eliminar);
            }
            cuerpo.append(acciones);
        }

        if (idComentarioEnRespuesta === comentario.id && usuarioActual
            && idComentarioEnEdicion !== comentario.id) {
            cuerpo.append(crearFormularioRespuesta(comentario.id));
        }

        const respuestas = document.createElement('div');
        respuestas.className = 'comment-thread mt-3';
        for (const respuesta of comentario.replies) {
            respuestas.append(crearElementoComentario(respuesta));
        }
        articulo.append(cuerpo);
        if (comentario.replies.length) articulo.append(respuestas);
        return articulo;
    }

    function mostrarComentarios(comentarios) {
        const porId = new Map();
        for (const comentario of comentarios) {
            porId.set(comentario.id, { ...comentario, replies: [] });
        }

        const raices = [];
        for (const comentario of porId.values()) {
            const padre = comentario.parentId ? porId.get(comentario.parentId) : null;
            if (padre) padre.replies.push(comentario);
            else raices.push(comentario);
        }

        cantidadComentarios.textContent = String(comentarios.length);
        listaComentarios.replaceChildren(...raices.map(crearElementoComentario));
        if (!comentarios.length) {
            const vacio = document.createElement('p');
            vacio.className = 'text-muted';
            vacio.textContent = 'Todavía no hay comentarios. ¡Sé el primero en participar!';
            listaComentarios.append(vacio);
        }
    }

    async function cargarComentarios() {
        if (!idPublicacion) return;
        try {
            const respuesta = await fetch(`/api/posts/${encodeURIComponent(idPublicacion)}/comments`);
            const resultado = await leerRespuestaComentarios(respuesta);
            if (!respuesta.ok) {
                throw new Error(resultado.error || 'No se pudieron cargar los comentarios.');
            }
            mostrarComentarios(resultado.comments || []);
            ocultarErrorComentarios();
        } catch (error) {
            mostrarErrorComentarios(error.message || 'Error al cargar los comentarios.');
        }
    }

    async function enviarComentario(contenido, idComentarioPadre, formulario) {
        const botonEnvio = formulario.querySelector('button[type="submit"]');
        botonEnvio.disabled = true;
        ocultarErrorComentarios();
        try {
            const respuesta = await fetch(`/api/posts/${encodeURIComponent(idPublicacion)}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: contenido,
                    ...(idComentarioPadre ? { parentId: idComentarioPadre } : {})
                })
            });
            const resultado = await leerRespuestaComentarios(respuesta);
            if (!respuesta.ok) {
                throw new Error(resultado.error || 'No se pudo publicar el comentario.');
            }

            if (!idComentarioPadre) formularioComentario.reset();
            idComentarioEnRespuesta = null;
            await cargarComentarios();
        } catch (error) {
            mostrarErrorComentarios(error.message || 'Error al publicar el comentario.');
        } finally {
            botonEnvio.disabled = false;
        }
    }

    async function guardarEdicionComentario(idComentario, contenido, formulario) {
        const botonEnvio = formulario.querySelector('button[type="submit"]');
        botonEnvio.disabled = true;
        ocultarErrorComentarios();
        try {
            const respuesta = await fetch(
                `/api/posts/${encodeURIComponent(idPublicacion)}/comments/${encodeURIComponent(idComentario)}`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: contenido })
                }
            );
            const resultado = await leerRespuestaComentarios(respuesta);
            if (!respuesta.ok) {
                throw new Error(resultado.error || 'No se pudo editar el comentario.');
            }
            idComentarioEnEdicion = null;
            await cargarComentarios();
        } catch (error) {
            mostrarErrorComentarios(error.message || 'Error al editar el comentario.');
        } finally {
            botonEnvio.disabled = false;
        }
    }

    async function borrarComentario(idComentario, esComentarioPrincipal) {
        const mensajeConfirmacion = esComentarioPrincipal
            ? '¿Eliminar este comentario y todo el hilo? También se eliminarán todas sus respuestas.'
            : '¿Eliminar este comentario? Se ocultará el texto, pero se conservarán sus respuestas.';
        if (!(await confirmarConToast(mensajeConfirmacion))) return;

        ocultarErrorComentarios();
        try {
            const respuesta = await fetch(
                `/api/posts/${encodeURIComponent(idPublicacion)}/comments/${encodeURIComponent(idComentario)}`,
                { method: 'DELETE' }
            );
            const resultado = await leerRespuestaComentarios(respuesta);
            if (!respuesta.ok) {
                throw new Error(resultado.error || 'No se pudo eliminar el comentario.');
            }
            idComentarioEnRespuesta = null;
            idComentarioEnEdicion = null;
            await cargarComentarios();
        } catch (error) {
            mostrarErrorComentarios(error.message || 'Error al eliminar el comentario.');
        }
    }

    function validarCampoComentario(campo) {
        if (campo.value.trim()) return true;
        mostrarErrorComentarios('El comentario no puede estar vacío.');
        campo.focus();
        return false;
    }

    formularioComentario.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        if (!usuarioActual) {
            modalAutenticacion.show();
            return;
        }
        if (!validarCampoComentario(campoComentario)) return;
        await enviarComentario(campoComentario.value, null, formularioComentario);
    });

    listaComentarios.addEventListener('click', (evento) => {
        const botonEditar = evento.target.closest('[data-editar-comentario]');
        if (botonEditar) {
            idComentarioEnEdicion = botonEditar.dataset.editarComentario;
            idComentarioEnRespuesta = null;
            cargarComentarios();
            return;
        }

        const botonEliminar = evento.target.closest('[data-eliminar-comentario]');
        if (botonEliminar) {
            borrarComentario(
                botonEliminar.dataset.eliminarComentario,
                botonEliminar.dataset.comentarioPrincipal === 'true'
            );
            return;
        }

        if (evento.target.closest('[data-cancelar-edicion]')) {
            idComentarioEnEdicion = null;
            cargarComentarios();
            return;
        }

        const botonResponder = evento.target.closest('[data-responder-comentario]');
        if (botonResponder) {
            if (!usuarioActual) {
                modalAutenticacion.show();
                return;
            }
            const id = botonResponder.dataset.responderComentario;
            idComentarioEnRespuesta = idComentarioEnRespuesta === id ? null : id;
            idComentarioEnEdicion = null;
            cargarComentarios();
            return;
        }

        if (evento.target.closest('[data-cancelar-respuesta]')) {
            idComentarioEnRespuesta = null;
            cargarComentarios();
        }
    });

    listaComentarios.addEventListener('submit', async (evento) => {
        const formulario = evento.target.closest('form[data-comentario-padre]');
        if (formulario) {
            evento.preventDefault();
            if (!validarCampoComentario(formulario.elements.content)) return;
            await enviarComentario(
                formulario.elements.content.value,
                formulario.dataset.comentarioPadre,
                formulario
            );
            return;
        }

        const formularioEdicion = evento.target.closest('form[data-comentario-editar]');
        if (!formularioEdicion) return;
        evento.preventDefault();
        if (!validarCampoComentario(formularioEdicion.elements.content)) return;
        await guardarEdicionComentario(
            formularioEdicion.dataset.comentarioEditar,
            formularioEdicion.elements.content.value,
            formularioEdicion
        );
    });

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
        actualizarEstadoVotoDetalle(
            publicacion.puntajeVotos ?? publicacion.votes ?? 0,
            publicacion.miVoto ?? publicacion.userVote ?? 0
        );

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
        if (informacionJuego) {
            informacionJuego.classList.remove('d-none');
        }
        document.getElementById('juego-descripcion').textContent = datosJuego.descripcion || 'Sin descripción disponible.';
        document.getElementById('juego-generos').textContent = generos || 'Sin datos disponibles.';
        document.getElementById('juego-plataformas').textContent = plataformas || 'Sin datos disponibles.';
        document.getElementById('juego-puntaje').textContent = puntaje || 'Sin puntaje disponible.';
        document.title = `${titulo || 'Publicación'} - respawn.`;
        actualizarBotonEdicion();
        cargarPuntuacionJuegoEnPost(juego);
    }

    botonEditar.addEventListener('click', () => {
        formularioEditar.elements.category.value = publicacionActual.category || publicacionActual.categoria || '';
        formularioEditar.elements.title.value = publicacionActual.title || publicacionActual.titulo || '';
        formularioEditar.elements.content.value = publicacionActual.content || publicacionActual.contenido || '';
        document.getElementById('titulo-modal-crear-publicacion').textContent = 'Editar publicación';
        botonGuardarEdicion.textContent = 'Guardar cambios';
        modalEditar.show();
    });

    if (botonEliminarPublicacion) {
        botonEliminarPublicacion.addEventListener('click', async () => {
            if (!idPublicacion || !(await confirmarConToast('¿Eliminar esta publicación de forma definitiva?'))) return;
            botonEliminarPublicacion.disabled = true;
            try {
                const respuesta = await fetch(`/api/posts/${encodeURIComponent(idPublicacion)}`, {
                    method: 'DELETE'
                });
                if (!respuesta.ok) {
                    mostrarToast('No se pudo eliminar la publicación.', 'danger');
                    return;
                }
                window.location.href = '/';
            } catch (error) {
                mostrarToast('Error de conexión al eliminar la publicación.', 'danger');
            } finally {
                botonEliminarPublicacion.disabled = false;
            }
        });
    }

    formularioEditar.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        if (!formularioEditar.reportValidity()) return;

        botonGuardarEdicion.disabled = true;
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
            mostrarToast('Publicación actualizada.', 'success');
        } catch (error) {
            mostrarAlertaEdicion('Error de conexión. Inténtalo de nuevo.');
        } finally {
            botonGuardarEdicion.disabled = false;
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

    async function recargarPublicacionActual() {
        if (!idPublicacion) return;
        try {
            const respuesta = await fetch(`/api/posts/${encodeURIComponent(idPublicacion)}`);
            if (!respuesta.ok) return;
            publicacionActual = await respuesta.json();
            mostrarPublicacion(publicacionActual);
            await cargarComentarios();
        } catch (error) {
            return;
        }
    }

    await cargarUsuarioActual();
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
        await cargarComentarios();
    } catch (error) {
        indicadorCarga.textContent = error.message || 'Error: No se pudo cargar la publicación.';
    }
});