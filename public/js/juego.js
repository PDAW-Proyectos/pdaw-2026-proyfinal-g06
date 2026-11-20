document.addEventListener('DOMContentLoaded', async () => {
    const elementoHtml = document.documentElement;
    const botonTema = document.getElementById('theme-toggle');
    const iconoTema = botonTema.querySelector('i');
    const temaGuardado = localStorage.getItem('theme');
    if (temaGuardado) {
        elementoHtml.setAttribute('data-bs-theme', temaGuardado);
        actualizarIconoTema(temaGuardado);
    }

    function actualizarIconoTema(tema) {
        iconoTema.classList.toggle('bi-sun', tema === 'dark');
        iconoTema.classList.toggle('bi-moon', tema !== 'dark');
    }

    botonTema.addEventListener('click', () => {
        const temaNuevo = elementoHtml.getAttribute('data-bs-theme') === 'light' ? 'dark' : 'light';
        elementoHtml.setAttribute('data-bs-theme', temaNuevo);
        localStorage.setItem('theme', temaNuevo);
        actualizarIconoTema(temaNuevo);
    });

    const formularioLogin = document.getElementById('login-form');
    const formularioRegistro = document.getElementById('register-form');
    const tituloModalAutenticacion = document.getElementById('auth-modal-title');
    const textoAlternarAutenticacion = document.getElementById('auth-switch-prompt');
    const botonAlternarAutenticacion = document.getElementById('auth-switch');
    const modalAutenticacion = bootstrap.Modal.getOrCreateInstance(document.getElementById('auth-modal'));
    const botonAbrirAutenticacion = document.getElementById('auth-trigger');
    const perfilUsuario = document.getElementById('user-profile');
    const nombreUsuario = document.getElementById('user-name');
    const avatarUsuario = document.getElementById('user-avatar');
    const botonCerrarSesion = document.getElementById('logout-button');

    const modalCrearPublicacion = bootstrap.Modal.getOrCreateInstance(document.getElementById('modal-crear-publicacion'));
    const formularioCrearPublicacion = document.getElementById('formulario-crear-publicacion');
    const tituloModalCrearPublicacion = document.getElementById('titulo-modal-crear-publicacion');
    const botonEnviarPublicacion = document.getElementById('boton-enviar-publicacion');
    const campoTituloPublicacion = document.getElementById('campo-titulo-publicacion');
    const campoContenidoPublicacion = document.getElementById('campo-contenido-publicacion');
    const campoCategoriaPublicacion = document.getElementById('campo-categoria-publicacion');

    const modalReportar = bootstrap.Modal.getOrCreateInstance(document.getElementById('modal-reportar-publicacion'));
    const formularioReportar = document.getElementById('formulario-reportar-publicacion');
    const campoMotivoReporte = document.getElementById('campo-motivo-reporte');
    const botonEnviarReporte = document.getElementById('boton-enviar-reporte');

    const indicadorCargaJuego = document.getElementById('indicador-carga-juego');
    const vistaJuego = document.getElementById('vista-juego');
    const juegoPortada = document.getElementById('juego-portada');
    const juegoGeneros = document.getElementById('juego-generos');
    const juegoPuntajeIgdb = document.getElementById('juego-puntaje-igdb');
    const juegoTitulo = document.getElementById('juego-titulo');
    const juegoPlataformas = document.getElementById('juego-plataformas');
    const juegoDescripcion = document.getElementById('juego-descripcion');
    const juegoPuntajeComunidad = document.getElementById('juego-puntaje-comunidad');
    const estrellasNotaJuego = document.getElementById('estrellas-nota-juego');
    const botonEliminarNotaJuego = document.getElementById('boton-eliminar-nota-juego');
    const botonNuevaPublicacionJuego = document.getElementById('boton-nueva-publicacion-juego');
    const cantidadPublicacionesJuego = document.getElementById('cantidad-publicaciones-juego');
    const listaPublicacionesJuego = document.getElementById('lista-publicaciones-juego');
    const contenedorToasts = document.getElementById('contenedor-toasts');

    const parametros = new URLSearchParams(window.location.search);
    const tituloParametro = (parametros.get('titulo') || '').trim();
    const postIdResaltado = parametros.get('postId');

    let usuarioActual = null;
    let juegoActual = null;
    let publicacionEnEdicion = null;
    let idPublicacionAReportar = null;
    const estadoComentariosPorPost = new Map();

    function mostrarToast(mensaje, tipo = 'danger') {
        if (!contenedorToasts || !mensaje) return;
        const elementoToast = document.createElement('div');
        elementoToast.className = 'toast toast-respawn align-items-center border';
        elementoToast.setAttribute('role', 'status');
        elementoToast.setAttribute('aria-live', 'polite');

        const cuerpo = document.createElement('div');
        cuerpo.className = 'd-flex align-items-center p-3 gap-2';

        const icono = document.createElement('i');
        if (tipo === 'success') {
            icono.className = 'bi bi-check-circle-fill text-primary fs-5';
        } else if (tipo === 'warning') {
            icono.className = 'bi bi-exclamation-circle-fill text-warning fs-5';
        } else {
            icono.className = 'bi bi-exclamation-triangle-fill text-danger fs-5';
        }

        const texto = document.createElement('div');
        texto.className = 'toast-body p-0 fs-sm fw-medium flex-grow-1';
        texto.textContent = mensaje;

        const botonCerrar = document.createElement('button');
        botonCerrar.type = 'button';
        botonCerrar.className = 'btn-close ms-2';
        botonCerrar.setAttribute('data-bs-dismiss', 'toast');
        botonCerrar.setAttribute('aria-label', 'Cerrar');

        cuerpo.append(icono, texto, botonCerrar);
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

    function mostrarFormularioLogin() {
        formularioLogin.classList.remove('d-none');
        formularioRegistro.classList.add('d-none');
        tituloModalAutenticacion.textContent = 'Iniciar sesión';
        textoAlternarAutenticacion.textContent = '¿No tienes cuenta?';
        botonAlternarAutenticacion.textContent = 'Regístrate';
    }

    function mostrarFormularioRegistro() {
        formularioLogin.classList.add('d-none');
        formularioRegistro.classList.remove('d-none');
        tituloModalAutenticacion.textContent = 'Crear cuenta';
        textoAlternarAutenticacion.textContent = '¿Ya tienes cuenta?';
        botonAlternarAutenticacion.textContent = 'Inicia sesión';
    }

    botonAlternarAutenticacion.addEventListener('click', () => {
        if (formularioLogin.classList.contains('d-none')) mostrarFormularioLogin();
        else mostrarFormularioRegistro();
    });

    function aplicarEstadoAutenticacion(usuario) {
        usuarioActual = usuario || null;
        if (usuarioActual) {
            const nombre = usuarioActual.name || usuarioActual.nombre || usuarioActual.email;
            nombreUsuario.textContent = nombre;
            avatarUsuario.textContent = nombre.trim().charAt(0).toUpperCase();
            botonAbrirAutenticacion.classList.add('d-none');
            perfilUsuario.classList.remove('d-none');
            perfilUsuario.classList.add('d-flex');
        } else {
            nombreUsuario.textContent = '';
            avatarUsuario.textContent = '';
            botonAbrirAutenticacion.classList.remove('d-none');
            perfilUsuario.classList.add('d-none');
            perfilUsuario.classList.remove('d-flex');
        }
    }

    async function verificarSesion() {
        try {
            const respuesta = await fetch('/api/auth/me');
            if (!respuesta.ok) {
                aplicarEstadoAutenticacion(null);
                return;
            }
            const datos = await respuesta.json();
            aplicarEstadoAutenticacion(datos.user || datos.usuario || null);
        } catch (error) {
            aplicarEstadoAutenticacion(null);
        }
    }

    async function manejarAuthSubmit(formulario, endpoint) {
        const boton = formulario.querySelector('button[type="submit"]');
        boton.disabled = true;
        const datos = Object.fromEntries(new FormData(formulario));
        try {
            const respuesta = await fetch(`/api/auth/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
            const resultado = await respuesta.json();
            if (!respuesta.ok) throw new Error(resultado.error || 'No se pudo completar la operación.');
            aplicarEstadoAutenticacion(resultado.user || resultado.usuario);
            modalAutenticacion.hide();
            formulario.reset();
            await cargarDatosJuego();
        } catch (error) {
            mostrarToast(error.message, 'danger');
        } finally {
            boton.disabled = false;
        }
    }

    formularioLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        manejarAuthSubmit(formularioLogin, 'login');
    });

    function obtenerFaltantesContrasena(contrasena) {
        const valor = typeof contrasena === 'string' ? contrasena : '';
        const faltantes = [];
        if (valor.length < 8) faltantes.push('mínimo 8 caracteres');
        if (valor.length > 20) faltantes.push('máximo 20 caracteres');
        if (!/[A-Z]/.test(valor)) faltantes.push('una mayúscula');
        if (!/[0-9]/.test(valor)) faltantes.push('un número');
        if (!/[^A-Za-z0-9]/.test(valor)) faltantes.push('un carácter especial');
        return faltantes;
    }

    const campoContrasenaRegistro = document.getElementById('register-password');
    const ayudaContrasenaRegistro = document.getElementById('password-help');
    if (campoContrasenaRegistro && ayudaContrasenaRegistro) {
        campoContrasenaRegistro.addEventListener('input', () => {
            const valor = campoContrasenaRegistro.value;
            if (!valor) {
                ayudaContrasenaRegistro.className = 'form-text';
                ayudaContrasenaRegistro.textContent = 'Entre 8 y 20 caracteres, una mayúscula, un número y un carácter especial.';
                return;
            }
            const faltantes = obtenerFaltantesContrasena(valor);
            if (faltantes.length === 0) {
                ayudaContrasenaRegistro.className = 'form-text text-success';
                ayudaContrasenaRegistro.textContent = 'Contraseña válida.';
            } else {
                ayudaContrasenaRegistro.className = 'form-text text-danger';
                ayudaContrasenaRegistro.textContent = `Falta: ${faltantes.join(', ')}.`;
            }
        });
    }

    formularioRegistro.addEventListener('submit', (e) => {
        e.preventDefault();
        const faltantes = obtenerFaltantesContrasena(formularioRegistro.elements.password.value);
        if (faltantes.length > 0) {
            mostrarToast(`La contraseña no cumple: ${faltantes.join(', ')}`, 'danger');
            return;
        }
        manejarAuthSubmit(formularioRegistro, 'register');
    });

    botonCerrarSesion.addEventListener('click', async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            aplicarEstadoAutenticacion(null);
            await cargarPublicacionesJuego();
            if (juegoActual) await cargarPuntuacionJuego(juegoActual.titulo);
        } catch (error) {
            mostrarToast('No se pudo cerrar sesión.', 'danger');
        }
    });

    function actualizarVistaEstrellas(resumen) {
        const promedio = Number(resumen && resumen.promedio) || 0;
        const cantidadVotos = Number(resumen && resumen.cantidadVotos) || 0;
        const miPuntuacion = resumen ? resumen.miPuntuacion : null;

        juegoPuntajeComunidad.textContent = cantidadVotos > 0
            ? `${promedio} / 5 (${cantidadVotos} ${cantidadVotos === 1 ? 'voto' : 'votos'})`
            : 'Sin votos aún';

        estrellasNotaJuego.querySelectorAll('[data-nota-juego]').forEach((boton) => {
            const valor = Number(boton.dataset.notaJuego);
            const activa = Boolean(miPuntuacion && valor <= Number(miPuntuacion));
            boton.classList.toggle('text-warning', activa);
            boton.classList.toggle('text-muted', !activa);
            const icono = boton.querySelector('i');
            if (icono) {
                icono.classList.toggle('bi-star-fill', activa);
                icono.classList.toggle('bi-star', !activa);
            }
        });
        if (botonEliminarNotaJuego) {
            botonEliminarNotaJuego.classList.toggle('d-none', !miPuntuacion);
        }
    }

    async function cargarPuntuacionJuego(nombreJuego) {
        try {
            const respuesta = await fetch(`/api/juegos/puntuaciones?juego=${encodeURIComponent(nombreJuego)}`);
            const resultado = await respuesta.json();
            if (respuesta.ok && resultado.datos) {
                actualizarVistaEstrellas(resultado.datos);
            }
        } catch (error) {
        }
    }

    estrellasNotaJuego.addEventListener('click', async (evento) => {
        const boton = evento.target.closest('[data-nota-juego]');
        if (!boton || !juegoActual) return;
        if (!usuarioActual) {
            mostrarFormularioLogin();
            modalAutenticacion.show();
            return;
        }
        const nota = Number(boton.dataset.notaJuego);
        try {
            const respuesta = await fetch('/api/juegos/puntuaciones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ juego: juegoActual.titulo, nota })
            });
            const resultado = await respuesta.json();
            if (!respuesta.ok) throw new Error(resultado.error || 'No se pudo guardar la puntuación.');
            actualizarVistaEstrellas(resultado.datos);
            mostrarToast('¡Puntuación guardada!', 'success');
        } catch (error) {
            mostrarToast(error.message, 'danger');
        }
    });

    if (botonEliminarNotaJuego) {
        botonEliminarNotaJuego.addEventListener('click', async () => {
            if (!juegoActual) return;
            if (!usuarioActual) {
                mostrarFormularioLogin();
                modalAutenticacion.show();
                return;
            }
            try {
                const respuesta = await fetch(`/api/juegos/puntuaciones?juego=${encodeURIComponent(juegoActual.titulo)}`, {
                    method: 'DELETE'
                });
                const resultado = await respuesta.json();
                if (!respuesta.ok) throw new Error(resultado.error || 'No se pudo eliminar la puntuación.');
                actualizarVistaEstrellas(resultado.datos);
                mostrarToast('Puntuación eliminada.', 'success');
            } catch (error) {
                mostrarToast(error.message, 'danger');
            }
        });
    }

    function renderizarFichaJuego(juego) {
        juegoActual = juego;
        document.title = `${juego.titulo} - respawn.`;
        juegoTitulo.textContent = juego.titulo;
        juegoDescripcion.textContent = juego.descripcion || 'Sin descripción disponible.';

        if (juego.imagen) {
            juegoPortada.src = juego.imagen;
            juegoPortada.alt = juego.titulo;
            juegoPortada.classList.remove('d-none');
        } else {
            juegoPortada.classList.add('d-none');
        }

        const generos = Array.isArray(juego.generos) ? juego.generos : [];
        juegoGeneros.replaceChildren(...generos.map((g) => {
            const span = document.createElement('span');
            span.className = 'badge rounded-pill bg-body-tertiary text-body-secondary border';
            span.textContent = g;
            return span;
        }));

        const plataformas = Array.isArray(juego.plataformas) ? juego.plataformas : [];
        juegoPlataformas.textContent = plataformas.length
            ? `Plataformas: ${plataformas.join(', ')}`
            : '';

        if (juego.puntaje > 0) {
            juegoPuntajeIgdb.textContent = `IGDB ${juego.puntaje} / 10`;
            juegoPuntajeIgdb.classList.remove('d-none');
        } else {
            juegoPuntajeIgdb.classList.add('d-none');
        }

        actualizarVistaEstrellas({
            promedio: juego.puntajeComunidad || 0,
            cantidadVotos: juego.cantidadVotos || 0,
            miPuntuacion: juego.miPuntuacion ?? null
        });
    }

    function actualizarEstadoVisualVoto(contenedorVotos, puntajeVotos, miVoto) {
        const elementoPuntaje = contenedorVotos.querySelector('.puntaje-votos');
        const botonArriba = contenedorVotos.querySelector('[data-accion-voto="1"]');
        const botonAbajo = contenedorVotos.querySelector('[data-accion-voto="-1"]');
        if (elementoPuntaje) elementoPuntaje.textContent = String(puntajeVotos ?? 0);
        if (botonArriba) {
            botonArriba.classList.toggle('text-primary', miVoto === 1);
            botonArriba.classList.toggle('fw-bold', miVoto === 1);
            botonArriba.classList.toggle('text-muted', miVoto !== 1);
        }
        if (botonAbajo) {
            botonAbajo.classList.toggle('text-danger', miVoto === -1);
            botonAbajo.classList.toggle('fw-bold', miVoto === -1);
            botonAbajo.classList.toggle('text-muted', miVoto !== -1);
        }
    }

    function crearElementoComentario(comentario, idPost, contenedorComentarios) {
        const articulo = document.createElement('article');
        articulo.className = 'p-3 rounded-3 bg-body-tertiary border mb-2';

        const encabezado = document.createElement('div');
        encabezado.className = 'd-flex align-items-center gap-2 mb-1';

        const nombreAutor = (comentario.author && comentario.author.name) || 'Usuario';
        const avatar = document.createElement('div');
        avatar.className = 'avatar bg-body text-muted fw-bold rounded-circle d-flex justify-content-center align-items-center flex-shrink-0';
        avatar.textContent = nombreAutor.trim().charAt(0).toUpperCase();

        const autor = document.createElement('span');
        autor.className = 'fw-semibold fs-xs';
        autor.textContent = nombreAutor;

        const fecha = document.createElement('time');
        fecha.className = 'text-muted fs-xs ms-auto';
        const fechaObj = new Date(comentario.createdAt);
        fecha.textContent = Number.isNaN(fechaObj.getTime())
            ? ''
            : fechaObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

        encabezado.append(avatar, autor, fecha);
        articulo.append(encabezado);

        const estado = estadoComentariosPorPost.get(idPost) || { enRespuesta: null, enEdicion: null };
        const esAutor = usuarioActual && comentario.author && String(usuarioActual.id) === String(comentario.author.id);

        if (estado.enEdicion === comentario.id && esAutor) {
            const formEdit = document.createElement('form');
            formEdit.className = 'mt-2';
            const textarea = document.createElement('textarea');
            textarea.className = 'form-control form-control-sm mb-2';
            textarea.rows = 2;
            textarea.value = comentario.content || '';
            const btns = document.createElement('div');
            btns.className = 'd-flex justify-content-end gap-2';
            const btnCancelar = document.createElement('button');
            btnCancelar.type = 'button';
            btnCancelar.className = 'btn btn-outline-secondary btn-sm';
            btnCancelar.textContent = 'Cancelar';
            btnCancelar.addEventListener('click', () => {
                estado.enEdicion = null;
                cargarComentariosDePost(idPost, contenedorComentarios);
            });
            const btnGuardar = document.createElement('button');
            btnGuardar.type = 'submit';
            btnGuardar.className = 'btn btn-primary btn-sm';
            btnGuardar.textContent = 'Guardar';
            btns.append(btnCancelar, btnGuardar);
            formEdit.append(textarea, btns);
            formEdit.addEventListener('submit', async (e) => {
                e.preventDefault();
                if (!textarea.value.trim()) return;
                btnGuardar.disabled = true;
                try {
                    const resp = await fetch(`/api/posts/${encodeURIComponent(idPost)}/comments/${encodeURIComponent(comentario.id)}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ content: textarea.value.trim() })
                    });
                    const res = await resp.json();
                    if (!resp.ok) throw new Error(res.error || 'No se pudo editar.');
                    estado.enEdicion = null;
                    await cargarComentariosDePost(idPost, contenedorComentarios);
                } catch (err) {
                    mostrarToast(err.message, 'danger');
                } finally {
                    btnGuardar.disabled = false;
                }
            });
            articulo.append(formEdit);
        } else {
            const texto = document.createElement('p');
            texto.className = comentario.deleted ? 'text-muted fst-italic fs-sm mb-2' : 'fs-sm mb-2';
            texto.textContent = comentario.deleted ? 'Este comentario fue eliminado.' : (comentario.content || '');
            articulo.append(texto);

            const acciones = document.createElement('div');
            acciones.className = 'd-flex align-items-center gap-3';

            const btnResponder = document.createElement('button');
            btnResponder.type = 'button';
            btnResponder.className = 'btn btn-link btn-sm text-decoration-none p-0 fs-xs';
            btnResponder.textContent = 'Responder';
            btnResponder.addEventListener('click', () => {
                if (!usuarioActual) {
                    mostrarFormularioLogin();
                    modalAutenticacion.show();
                    return;
                }
                estado.enRespuesta = estado.enRespuesta === comentario.id ? null : comentario.id;
                estado.enEdicion = null;
                cargarComentariosDePost(idPost, contenedorComentarios);
            });
            acciones.append(btnResponder);

            if (esAutor && !comentario.deleted) {
                const btnEditar = document.createElement('button');
                btnEditar.type = 'button';
                btnEditar.className = 'btn btn-link btn-sm text-decoration-none p-0 fs-xs';
                btnEditar.textContent = 'Editar';
                btnEditar.addEventListener('click', () => {
                    estado.enEdicion = comentario.id;
                    estado.enRespuesta = null;
                    cargarComentariosDePost(idPost, contenedorComentarios);
                });

                const btnEliminar = document.createElement('button');
                btnEliminar.type = 'button';
                btnEliminar.className = 'btn btn-link btn-sm text-danger text-decoration-none p-0 fs-xs';
                btnEliminar.textContent = 'Eliminar';
                btnEliminar.addEventListener('click', async () => {
                    const ok = await confirmarConToast('¿Eliminar este comentario?');
                    if (!ok) return;
                    try {
                        const resp = await fetch(`/api/posts/${encodeURIComponent(idPost)}/comments/${encodeURIComponent(comentario.id)}`, { method: 'DELETE' });
                        if (!resp.ok) throw new Error('No se pudo eliminar el comentario.');
                        await cargarComentariosDePost(idPost, contenedorComentarios);
                    } catch (err) {
                        mostrarToast(err.message, 'danger');
                    }
                });
                acciones.append(btnEditar, btnEliminar);
            }
            articulo.append(acciones);
        }

        if (estado.enRespuesta === comentario.id && usuarioActual) {
            const formResp = document.createElement('form');
            formResp.className = 'mt-2';
            const inputResp = document.createElement('input');
            inputResp.type = 'text';
            inputResp.className = 'form-control form-control-sm mb-2';
            inputResp.placeholder = 'Escribe una respuesta...';
            const btnsResp = document.createElement('div');
            btnsResp.className = 'd-flex justify-content-end gap-2';
            const btnCancelResp = document.createElement('button');
            btnCancelResp.type = 'button';
            btnCancelResp.className = 'btn btn-outline-secondary btn-sm';
            btnCancelResp.textContent = 'Cancelar';
            btnCancelResp.addEventListener('click', () => {
                estado.enRespuesta = null;
                cargarComentariosDePost(idPost, contenedorComentarios);
            });
            const btnEnvResp = document.createElement('button');
            btnEnvResp.type = 'submit';
            btnEnvResp.className = 'btn btn-primary btn-sm';
            btnEnvResp.textContent = 'Responder';
            btnsResp.append(btnCancelResp, btnEnvResp);
            formResp.append(inputResp, btnsResp);
            formResp.addEventListener('submit', async (e) => {
                e.preventDefault();
                if (!inputResp.value.trim()) return;
                btnEnvResp.disabled = true;
                try {
                    const resp = await fetch(`/api/posts/${encodeURIComponent(idPost)}/comments`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ content: inputResp.value.trim(), parentId: comentario.id })
                    });
                    if (!resp.ok) throw new Error('No se pudo publicar la respuesta.');
                    estado.enRespuesta = null;
                    await cargarComentariosDePost(idPost, contenedorComentarios);
                } catch (err) {
                    mostrarToast(err.message, 'danger');
                } finally {
                    btnEnvResp.disabled = false;
                }
            });
            articulo.append(formResp);
        }

        if (comentario.replies && comentario.replies.length > 0) {
            const hilo = document.createElement('div');
            hilo.className = 'comment-thread mt-2';
            comentario.replies.forEach((r) => hilo.appendChild(crearElementoComentario(r, idPost, contenedorComentarios)));
            articulo.append(hilo);
        }

        return articulo;
    }

    async function cargarComentariosDePost(idPost, contenedorComentarios) {
        if (!estadoComentariosPorPost.has(idPost)) {
            estadoComentariosPorPost.set(idPost, { enRespuesta: null, enEdicion: null });
        }
        try {
            const resp = await fetch(`/api/posts/${encodeURIComponent(idPost)}/comments`);
            const res = await resp.json();
            if (!resp.ok) throw new Error(res.error || 'Error al cargar comentarios.');
            const comentarios = res.comments || [];

            const porId = new Map();
            comentarios.forEach((c) => porId.set(c.id, { ...c, replies: [] }));
            const raices = [];
            porId.forEach((c) => {
                const padre = c.parentId ? porId.get(c.parentId) : null;
                if (padre) padre.replies.push(c);
                else raices.push(c);
            });

            const lista = document.createElement('div');
            if (raices.length > 0) {
                raices.forEach((c) => lista.appendChild(crearElementoComentario(c, idPost, contenedorComentarios)));
            }

            const formNuevo = document.createElement('form');
            formNuevo.className = 'd-flex gap-2 mt-2';
            const inputNuevo = document.createElement('input');
            inputNuevo.type = 'text';
            inputNuevo.className = 'form-control form-control-sm rounded-pill px-3';
            inputNuevo.placeholder = usuarioActual ? 'Escribe un comentario...' : 'Inicia sesión para comentar...';
            const btnNuevo = document.createElement('button');
            btnNuevo.type = 'submit';
            btnNuevo.className = 'btn btn-outline-primary btn-sm rounded-pill px-3 flex-shrink-0';
            btnNuevo.textContent = 'Comentar';
            formNuevo.append(inputNuevo, btnNuevo);

            formNuevo.addEventListener('submit', async (e) => {
                e.preventDefault();
                if (!usuarioActual) {
                    mostrarFormularioLogin();
                    modalAutenticacion.show();
                    return;
                }
                if (!inputNuevo.value.trim()) return;
                btnNuevo.disabled = true;
                try {
                    const respPost = await fetch(`/api/posts/${encodeURIComponent(idPost)}/comments`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ content: inputNuevo.value.trim() })
                    });
                    const resPost = await respPost.json();
                    if (!respPost.ok) throw new Error(resPost.error || 'No se pudo comentar.');
                    await cargarComentariosDePost(idPost, contenedorComentarios);
                } catch (err) {
                    mostrarToast(err.message, 'danger');
                } finally {
                    btnNuevo.disabled = false;
                }
            });

            contenedorComentarios.replaceChildren(lista, formNuevo);
        } catch (error) {
            contenedorComentarios.textContent = '';
        }
    }

    function crearTarjetaPublicacion(publicacion) {
        const tarjeta = document.createElement('article');
        tarjeta.id = `post-${publicacion.id}`;
        tarjeta.className = 'superficie-tarjeta rounded-4 p-4';
        if (postIdResaltado && String(publicacion.id) === String(postIdResaltado)) {
            tarjeta.classList.add('border-primary');
        }

        const barraSuperior = document.createElement('div');
        barraSuperior.className = 'd-flex justify-content-between align-items-start gap-3 mb-2';

        const etiquetas = document.createElement('div');
        etiquetas.className = 'd-flex align-items-center flex-wrap gap-2';
        const categoria = document.createElement('span');
        categoria.className = 'badge rounded-pill bg-body-tertiary text-body-secondary border';
        categoria.textContent = publicacion.category || publicacion.categoria || 'General';
        etiquetas.append(categoria);

        if (publicacion.requiereRevision || publicacion.estadoVerificacion === 'en_verificacion') {
            const verificacion = document.createElement('span');
            verificacion.className = 'badge rounded-pill text-bg-warning';
            verificacion.textContent = 'En verificación';
            etiquetas.append(verificacion);
        }

        const controlesDerecha = document.createElement('div');
        controlesDerecha.className = 'd-flex align-items-center gap-2 flex-shrink-0';

        const pillVotos = document.createElement('div');
        pillVotos.className = 'd-flex align-items-center gap-1 bg-body-tertiary px-2 py-1 rounded-pill border';
        const btnUp = document.createElement('button');
        btnUp.type = 'button';
        btnUp.className = 'btn btn-sm btn-link text-decoration-none p-1 text-muted';
        btnUp.dataset.accionVoto = '1';
        btnUp.innerHTML = '<i class="bi bi-arrow-up"></i>';
        const spanVotos = document.createElement('span');
        spanVotos.className = 'fw-semibold puntaje-votos px-1';
        const btnDown = document.createElement('button');
        btnDown.type = 'button';
        btnDown.className = 'btn btn-sm btn-link text-decoration-none p-1 text-muted';
        btnDown.dataset.accionVoto = '-1';
        btnDown.innerHTML = '<i class="bi bi-arrow-down"></i>';
        pillVotos.append(btnUp, spanVotos, btnDown);
        actualizarEstadoVisualVoto(pillVotos, publicacion.puntajeVotos ?? 0, publicacion.miVoto ?? 0);

        pillVotos.addEventListener('click', async (e) => {
            const btn = e.target.closest('[data-accion-voto]');
            if (!btn) return;
            if (!usuarioActual) {
                mostrarFormularioLogin();
                modalAutenticacion.show();
                return;
            }
            const valor = Number(btn.dataset.accionVoto);
            try {
                const resp = await fetch(`/api/posts/${encodeURIComponent(publicacion.id)}/voto`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ valor })
                });
                const res = await resp.json();
                if (!resp.ok) throw new Error(res.error || 'No se pudo votar.');
                actualizarEstadoVisualVoto(pillVotos, res.puntajeVotos, res.miVoto);
            } catch (err) {
                mostrarToast(err.message, 'danger');
            }
        });

        controlesDerecha.append(pillVotos);

        const autor = publicacion.author || publicacion.autor;
        const esAdmin = Boolean(usuarioActual && usuarioActual.rol === 'admin');
        const esAutor = Boolean(usuarioActual && autor && String(autor.id) === String(usuarioActual.id));
        if (usuarioActual) {
            const dropdown = document.createElement('div');
            dropdown.className = 'dropdown';
            const btnMenu = document.createElement('button');
            btnMenu.type = 'button';
            btnMenu.className = 'btn btn-sm btn-link text-muted text-decoration-none p-1 rounded-circle';
            btnMenu.setAttribute('data-bs-toggle', 'dropdown');
            btnMenu.setAttribute('aria-label', 'Opciones');
            btnMenu.innerHTML = '<i class="bi bi-three-dots"></i>';

            const menu = document.createElement('ul');
            menu.className = 'dropdown-menu dropdown-menu-end shadow-sm';

            if (esAdmin) {
                const liDel = document.createElement('li');
                const btnDel = document.createElement('button');
                btnDel.type = 'button';
                btnDel.className = 'dropdown-item d-flex align-items-center gap-2 text-danger';
                btnDel.innerHTML = '<i class="bi bi-trash"></i><span>Eliminar</span>';
                btnDel.addEventListener('click', async () => {
                    const ok = await confirmarConToast('¿Eliminar esta publicación?');
                    if (!ok) return;
                    try {
                        const resp = await fetch(`/api/posts/${encodeURIComponent(publicacion.id)}`, { method: 'DELETE' });
                        if (!resp.ok) throw new Error('No se pudo eliminar.');
                        mostrarToast('Publicación eliminada.', 'success');
                        await cargarPublicacionesJuego();
                    } catch (err) {
                        mostrarToast(err.message, 'danger');
                    }
                });
                liDel.append(btnDel);
                menu.append(liDel);
            } else if (esAutor) {
                const liEdit = document.createElement('li');
                const btnEdit = document.createElement('button');
                btnEdit.type = 'button';
                btnEdit.className = 'dropdown-item d-flex align-items-center gap-2';
                btnEdit.innerHTML = '<i class="bi bi-pencil"></i><span>Editar</span>';
                btnEdit.addEventListener('click', () => {
                    publicacionEnEdicion = publicacion;
                    campoTituloPublicacion.value = publicacion.title || '';
                    campoContenidoPublicacion.value = publicacion.content || '';
                    campoCategoriaPublicacion.value = publicacion.category || '';
                    tituloModalCrearPublicacion.textContent = 'Editar publicación';
                    botonEnviarPublicacion.textContent = 'Guardar cambios';
                    modalCrearPublicacion.show();
                });
                liEdit.append(btnEdit);

                const liDel = document.createElement('li');
                const btnDel = document.createElement('button');
                btnDel.type = 'button';
                btnDel.className = 'dropdown-item d-flex align-items-center gap-2 text-danger';
                btnDel.innerHTML = '<i class="bi bi-trash"></i><span>Eliminar</span>';
                btnDel.addEventListener('click', async () => {
                    const ok = await confirmarConToast('¿Eliminar esta publicación?');
                    if (!ok) return;
                    try {
                        const resp = await fetch(`/api/posts/${encodeURIComponent(publicacion.id)}`, { method: 'DELETE' });
                        if (!resp.ok) throw new Error('No se pudo eliminar.');
                        mostrarToast('Publicación eliminada.', 'success');
                        await cargarPublicacionesJuego();
                    } catch (err) {
                        mostrarToast(err.message, 'danger');
                    }
                });
                liDel.append(btnDel);
                menu.append(liEdit, liDel);
            } else {
                const liRep = document.createElement('li');
                const btnRep = document.createElement('button');
                const yaReportado = Boolean(publicacion.yaReportado);
                btnRep.type = 'button';
                btnRep.className = yaReportado
                    ? 'dropdown-item d-flex align-items-center gap-2 text-muted'
                    : 'dropdown-item d-flex align-items-center gap-2 text-warning';
                btnRep.disabled = yaReportado;
                btnRep.innerHTML = yaReportado
                    ? '<i class="bi bi-flag-fill"></i><span>Reportado</span>'
                    : '<i class="bi bi-flag"></i><span>Reportar</span>';
                btnRep.addEventListener('click', () => {
                    if (yaReportado) return;
                    idPublicacionAReportar = publicacion.id;
                    campoMotivoReporte.value = '';
                    modalReportar.show();
                });
                liRep.append(btnRep);
                menu.append(liRep);
            }

            dropdown.append(btnMenu, menu);
            controlesDerecha.append(dropdown);
        }

        barraSuperior.append(etiquetas, controlesDerecha);

        const titulo = document.createElement('h3');
        titulo.className = 'h5 fw-bold text-body-emphasis mb-2';
        titulo.textContent = publicacion.title || 'Sin título';

        const meta = document.createElement('div');
        meta.className = 'd-flex align-items-center gap-2 text-muted fs-xs mb-3';
        const nombreAutor = (autor && (autor.name || autor.nombre)) || 'Usuario';
        const fecha = new Date(publicacion.createdAt).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
        meta.textContent = `${nombreAutor} · ${fecha}`;

        const contenido = document.createElement('p');
        contenido.className = 'fs-sm text-body-secondary mb-3';
        contenido.style.whiteSpace = 'pre-wrap';
        contenido.textContent = publicacion.content || '';

        const seccionComentarios = document.createElement('div');
        seccionComentarios.className = 'pt-3 border-top';

        tarjeta.append(barraSuperior, titulo, meta, contenido, seccionComentarios);
        cargarComentariosDePost(publicacion.id, seccionComentarios);
        return tarjeta;
    }

    async function cargarPublicacionesJuego() {
        if (!juegoActual) return;
        try {
            const resp = await fetch(`/api/posts?game=${encodeURIComponent(juegoActual.titulo)}`);
            const res = await resp.json();
            if (!resp.ok) throw new Error(res.error || 'No se pudieron cargar las publicaciones.');
            const publicaciones = res.data || [];
            cantidadPublicacionesJuego.textContent = String(publicaciones.length);

            if (!publicaciones.length) {
                const vacio = document.createElement('div');
                vacio.className = 'superficie-tarjeta rounded-4 p-4 text-center text-muted fs-sm';
                vacio.textContent = 'Todavía no hay publicaciones para este juego. ¡Sé el primero en opinar!';
                listaPublicacionesJuego.replaceChildren(vacio);
                return;
            }

            listaPublicacionesJuego.replaceChildren(...publicaciones.map(crearTarjetaPublicacion));

            if (postIdResaltado) {
                const objetivo = document.getElementById(`post-${postIdResaltado}`);
                if (objetivo) {
                    objetivo.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        } catch (error) {
            mostrarToast(error.message, 'danger');
        }
    }

    botonNuevaPublicacionJuego.addEventListener('click', () => {
        if (!usuarioActual) {
            mostrarFormularioLogin();
            modalAutenticacion.show();
            return;
        }
        publicacionEnEdicion = null;
        formularioCrearPublicacion.reset();
        tituloModalCrearPublicacion.textContent = `Nueva publicación sobre ${juegoActual.titulo}`;
        botonEnviarPublicacion.textContent = 'Publicar';
        modalCrearPublicacion.show();
    });

    formularioCrearPublicacion.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!juegoActual) return;
        botonEnviarPublicacion.disabled = true;
        const payload = {
            title: campoTituloPublicacion.value.trim(),
            content: campoContenidoPublicacion.value.trim(),
            category: campoCategoriaPublicacion.value
        };
        try {
            const url = publicacionEnEdicion
                ? `/api/posts/${encodeURIComponent(publicacionEnEdicion.id)}`
                : '/api/posts';
            const method = publicacionEnEdicion ? 'PATCH' : 'POST';
            if (!publicacionEnEdicion) payload.game = juegoActual.titulo;

            const resp = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const res = await resp.json();
            if (!resp.ok) throw new Error(res.error || 'No se pudo guardar la publicación.');
            modalCrearPublicacion.hide();
            mostrarToast(publicacionEnEdicion ? 'Publicación actualizada.' : '¡Publicación creada!', 'success');
            await cargarPublicacionesJuego();
        } catch (err) {
            mostrarToast(err.message, 'danger');
        } finally {
            botonEnviarPublicacion.disabled = false;
        }
    });

    formularioReportar.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!idPublicacionAReportar) return;
        const motivo = campoMotivoReporte.value.trim();
        if (motivo.length < 5) {
            mostrarToast('El motivo debe tener al menos 5 caracteres.', 'warning');
            return;
        }
        botonEnviarReporte.disabled = true;
        try {
            const resp = await fetch(`/api/posts/${encodeURIComponent(idPublicacionAReportar)}/reportes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ motivo })
            });
            const res = await resp.json();
            if (!resp.ok) throw new Error(res.error || 'No se pudo enviar el reporte.');
            modalReportar.hide();
            mostrarToast('Reporte enviado.', 'success');
            await cargarPublicacionesJuego();
        } catch (err) {
            mostrarToast(err.message, 'danger');
        } finally {
            botonEnviarReporte.disabled = false;
        }
    });

    async function cargarDatosJuego() {
        let juego = null;
        try {
            const guardado = sessionStorage.getItem('juegoSeleccionado');
            if (guardado) {
                const parsed = JSON.parse(guardado);
                if (parsed && (!tituloParametro || String(parsed.titulo || '').toLowerCase() === tituloParametro.toLowerCase())) {
                    juego = parsed;
                }
            }
        } catch (error) {
        }

        if (!juego && tituloParametro) {
            try {
                const resp = await fetch(`/api/juegos?busqueda=${encodeURIComponent(tituloParametro)}`);
                if (resp.ok) {
                    const res = await resp.json();
                    const lista = res.datos || [];
                    juego = lista.find((g) => String(g.titulo || '').toLowerCase() === tituloParametro.toLowerCase()) || lista[0] || null;
                }
            } catch (error) {
            }
        }

        if (!juego) {
            if (!tituloParametro) {
                indicadorCargaJuego.textContent = 'No se indicó ningún videojuego.';
                return;
            }
            juego = {
                titulo: tituloParametro,
                descripcion: 'Ficha creada a partir de las publicaciones de la comunidad.',
                generos: [],
                plataformas: [],
                puntaje: 0
            };
        }

        renderizarFichaJuego(juego);
        indicadorCargaJuego.classList.add('d-none');
        vistaJuego.classList.remove('d-none');
        await Promise.all([
            cargarPuntuacionJuego(juego.titulo),
            cargarPublicacionesJuego()
        ]);
    }

    await verificarSesion();
    await cargarDatosJuego();
});

