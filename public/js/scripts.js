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

    formularioRegistro.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        const faltantes = obtenerFaltantesContrasena(formularioRegistro.elements.password.value);
        if (faltantes.length > 0) {
            mostrarMensajeAutenticacion(`La contraseña no cumple: ${faltantes.join(', ')}`);
            return;
        }
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
    const grupoJuegoPublicacion = document.getElementById('grupo-juego-publicacion');
    const campoJuegoPublicacion = document.getElementById('campo-juego-publicacion');
    const selectorOrdenPublicaciones = document.getElementById('selector-orden-publicaciones');
    const selectorCategoriaPublicaciones = document.getElementById('selector-categoria-publicaciones');
    const contenedorJuegosMejorValorados = document.getElementById('contenedor-juegos-mejor-valorados');

    let estaUsuarioAutenticado = false;
    let idUsuarioActual = null;
    let rolUsuarioActual = null;
    let publicacionEnEdicion = null;

    const actualizarPerfilUsuarioOriginal = actualizarPerfilUsuario;
    actualizarPerfilUsuario = (usuario) => {
        actualizarPerfilUsuarioOriginal(usuario);
        estaUsuarioAutenticado = Boolean(usuario);
        idUsuarioActual = usuario ? usuario.id : null;
        rolUsuarioActual = usuario ? (usuario.rol || 'usuario') : null;
    };

    botonCrearPublicacion.addEventListener('click', () => {
        prepararNuevaPublicacion();
        if (estaUsuarioAutenticado) {
            modalCrearPublicacion.show();
        } else {
            mostrarFormularioLogin();
            modalAutenticacion.show();
        }
    });

    elementoModalCrearPublicacion.addEventListener('show.bs.modal', () => {
        if (alertaErrorPublicacion) {
            alertaErrorPublicacion.classList.add('d-none');
            alertaErrorPublicacion.textContent = '';
        }
    });

    function limpiarJuegoSeleccionado() {
        if (vistaJuegoSeleccionado) {
            vistaJuegoSeleccionado.classList.add('d-none');
            vistaJuegoSeleccionado.classList.remove('d-flex');
        }
        if (imagenJuegoSeleccionado) {
            imagenJuegoSeleccionado.src = '';
            imagenJuegoSeleccionado.alt = '';
            imagenJuegoSeleccionado.classList.remove('d-none');
        }
        if (tituloJuegoSeleccionado) tituloJuegoSeleccionado.textContent = '';
        if (detalleJuegoSeleccionado) detalleJuegoSeleccionado.textContent = '';
    }

    function seleccionarJuegoPublicacion(juego) {
        if (!juego) return;
        if (campoJuegoPublicacion) {
            campoJuegoPublicacion.value = juego.titulo || '';
        }
        if (desplegableJuegosPublicacion) {
            desplegableJuegosPublicacion.classList.add('d-none');
        }
        if (!vistaJuegoSeleccionado) return;

        if (imagenJuegoSeleccionado) {
            if (juego.imagen) {
                imagenJuegoSeleccionado.src = juego.imagen;
                imagenJuegoSeleccionado.alt = juego.titulo || '';
                imagenJuegoSeleccionado.classList.remove('d-none');
            } else {
                imagenJuegoSeleccionado.src = '';
                imagenJuegoSeleccionado.alt = '';
                imagenJuegoSeleccionado.classList.add('d-none');
            }
        }
        if (tituloJuegoSeleccionado) {
            tituloJuegoSeleccionado.textContent = juego.titulo || '';
        }
        if (detalleJuegoSeleccionado) {
            const partes = [];
            if (Array.isArray(juego.generos) && juego.generos.length > 0) {
                partes.push(juego.generos.slice(0, 2).join(', '));
            }
            if (juego.puntaje) {
                partes.push(`IGDB ${juego.puntaje}`);
            }
            detalleJuegoSeleccionado.textContent = partes.join(' · ') || 'Videojuego seleccionado';
        }
        vistaJuegoSeleccionado.classList.remove('d-none');
        vistaJuegoSeleccionado.classList.add('d-flex');
    }

    function prepararNuevaPublicacion() {
        publicacionEnEdicion = null;
        formularioCrearPublicacion.reset();
        limpiarJuegoSeleccionado();
        if (desplegableJuegosPublicacion) {
            desplegableJuegosPublicacion.classList.add('d-none');
            desplegableJuegosPublicacion.replaceChildren();
        }
        grupoJuegoPublicacion.classList.remove('d-none');
        campoJuegoPublicacion.disabled = false;
        document.getElementById('titulo-modal-crear-publicacion').textContent = 'Crear nueva publicación';
        document.getElementById('boton-enviar-publicacion').textContent = 'Publicar';
    }

    function editarPublicacion(publicacion, desdeModalJuego = false) {
        publicacionEnEdicion = publicacion;
        grupoJuegoPublicacion.classList.add('d-none');
        campoJuegoPublicacion.disabled = true;
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

    async function eliminarPublicacionPropia(publicacion) {
        if (!(await confirmarConToast('¿Eliminar esta publicación de forma definitiva?'))) return;
        try {
            const respuesta = await fetch(`/api/posts/${encodeURIComponent(publicacion.id)}`, {
                method: 'DELETE'
            });
            if (!respuesta.ok) {
                mostrarToast('No se pudo eliminar la publicación.', 'danger');
                return;
            }
            mostrarToast('Publicación eliminada.', 'success');
            await cargarPublicaciones();
        } catch (error) {
            mostrarToast('Error de conexión al eliminar la publicación.', 'danger');
        }
    }

    function crearAccionesPublicacion(publicacion, desdeModalJuego = false) {
        const autor = publicacion.author || publicacion.autor;
        const esAdmin = rolUsuarioActual === 'admin';
        const esAutor = Boolean(idUsuarioActual && autor && String(autor.id) === String(idUsuarioActual));
        if (!esAdmin && !esAutor) return null;

        const contenedor = document.createElement('div');
        contenedor.className = 'dropdown';

        const botonMenu = document.createElement('button');
        botonMenu.type = 'button';
        botonMenu.className = 'btn btn-sm btn-link text-muted text-decoration-none p-1 rounded-circle';
        botonMenu.setAttribute('data-bs-toggle', 'dropdown');
        botonMenu.setAttribute('aria-expanded', 'false');
        botonMenu.setAttribute('aria-label', 'Opciones de publicación');
        botonMenu.innerHTML = '<i class="bi bi-three-dots"></i>';

        const menu = document.createElement('ul');
        menu.className = 'dropdown-menu dropdown-menu-end shadow-sm';

        if (!esAdmin && esAutor) {
            const itemEditar = document.createElement('li');
            const botonEditar = document.createElement('button');
            botonEditar.type = 'button';
            botonEditar.className = 'dropdown-item d-flex align-items-center gap-2';
            botonEditar.innerHTML = '<i class="bi bi-pencil"></i><span>Editar</span>';
            botonEditar.addEventListener('click', () => editarPublicacion(publicacion, desdeModalJuego));
            itemEditar.appendChild(botonEditar);
            menu.append(itemEditar);
        }

        const itemEliminar = document.createElement('li');
        const botonEliminar = document.createElement('button');
        botonEliminar.type = 'button';
        botonEliminar.className = 'dropdown-item d-flex align-items-center gap-2 text-danger';
        botonEliminar.innerHTML = '<i class="bi bi-trash"></i><span>Eliminar</span>';
        botonEliminar.addEventListener('click', () => eliminarPublicacionPropia(publicacion));
        itemEliminar.appendChild(botonEliminar);

        menu.append(itemEliminar);
        contenedor.append(botonMenu, menu);
        return contenedor;
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
            if (selectorOrdenPublicaciones && selectorOrdenPublicaciones.value === 'votados') {
                cargarPublicaciones();
            }
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
        const orden = selectorOrdenPublicaciones ? selectorOrdenPublicaciones.value : 'recientes';
        const categoria = selectorCategoriaPublicaciones ? selectorCategoriaPublicaciones.value : '';
        const parametros = new URLSearchParams({ page: String(pagina), orden });
        if (categoria) parametros.set('categoria', categoria);
        try {
            const respuesta = await fetch(`/api/posts?${parametros.toString()}`);
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
                const elementoVerificacion = clon.querySelector('.publicacion-verificacion');
                const elementoTitulo = clon.querySelector('.publicacion-titulo, .post-title');
                const elementoMetadatos = clon.querySelector('.publicacion-metadatos, .post-meta');
                const enlacePublicacion = clon.querySelector('.publicacion-enlace');
                const imagenPortada = clon.querySelector('.publicacion-portada');
                const contenedorVotos = clon.querySelector('[data-contenedor-votos]');
                const juego = publicacion.game || publicacion.juego || '';
                const portada = publicacion.imagenJuego || (publicacion.datosJuego && publicacion.datosJuego.imagen);

                if (elementoJuego) elementoJuego.textContent = juego;
                if (elementoCategoria) elementoCategoria.textContent = publicacion.category || publicacion.categoria || '';
                if (elementoVerificacion) elementoVerificacion.classList.toggle('d-none', !publicacion.requiereRevision);
                if (elementoTitulo) elementoTitulo.textContent = publicacion.title || publicacion.titulo || '';
                if (enlacePublicacion) {
                    enlacePublicacion.href = `/juego.html?titulo=${encodeURIComponent(juego)}&postId=${encodeURIComponent(publicacion.id)}`;
                }
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
                const contenedorAcciones = clon.querySelector('.acciones-publicacion');
                if (acciones && contenedorAcciones) {
                    contenedorAcciones.replaceWith(acciones);
                } else if (contenedorAcciones && !acciones) {
                    contenedorAcciones.remove();
                } else if (acciones && elementoMetadatos) {
                    elementoMetadatos.parentElement.appendChild(acciones);
                }

                return clon;
            });

            contenedorPublicaciones.replaceChildren(...nodosPublicaciones);
        } catch (error) {
            mostrarToast('Error al cargar las publicaciones.', 'danger');
        }
    }

    async function cargarJuegosMejorValorados() {
        if (!contenedorJuegosMejorValorados) return;

        try {
            const respuesta = await fetch('/api/juegos/mejores-puntuados');
            if (!respuesta.ok) throw new Error('Error al cargar los juegos mejor valorados');
            const resultado = await respuesta.json();
            const juegos = Array.isArray(resultado.datos) ? resultado.datos.slice(0, 5) : [];

            if (!juegos.length) {
                const aviso = document.createElement('p');
                aviso.className = 'text-muted fs-sm mb-3';
                aviso.textContent = 'Aún no hay juegos puntuados.';
                contenedorJuegosMejorValorados.replaceChildren(aviso);
                return;
            }

            const elementos = juegos.map((juego) => {
                const elemento = document.createElement('div');
                elemento.className = 'best-rated-game item-ranking-juego d-flex justify-content-between align-items-center gap-3';

                const detalles = document.createElement('div');
                detalles.className = 'flex-grow-1 min-w-0';
                const nombre = document.createElement('button');
                nombre.type = 'button';
                nombre.className = 'btn btn-link d-block w-100 p-0 text-body text-decoration-none fw-semibold fs-sm text-start text-truncate';
                nombre.textContent = juego.juego;
                nombre.addEventListener('click', () => abrirJuegoDesdeRanking(juego));
                detalles.append(nombre);

                const puntaje = document.createElement('span');
                puntaje.className = 'badge rounded-pill bg-body-tertiary text-body border flex-shrink-0';
                const promedio = Number(juego.promedio) || 0;
                const cantidadVotos = Number(juego.cantidadVotos) || 0;
                puntaje.textContent = `${promedio.toFixed(1)} / 5 · ${cantidadVotos} ${cantidadVotos === 1 ? 'voto' : 'votos'}`;

                elemento.append(detalles, puntaje);
                return elemento;
            });

            contenedorJuegosMejorValorados.replaceChildren(...elementos);
        } catch (error) {
            const aviso = document.createElement('p');
            aviso.className = 'text-danger fs-sm mb-3';
            aviso.textContent = 'No se pudieron cargar los juegos mejor valorados.';
            contenedorJuegosMejorValorados.replaceChildren(aviso);
        }
    }

    if (selectorOrdenPublicaciones) {
        selectorOrdenPublicaciones.addEventListener('change', () => {
            cargarPublicaciones(1);
        });
    }

    if (selectorCategoriaPublicaciones) {
        selectorCategoriaPublicaciones.addEventListener('change', () => {
            cargarPublicaciones(1);
        });
    }

    formularioCrearPublicacion.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        const botonEnvio = formularioCrearPublicacion.querySelector('button[type="submit"]');
        botonEnvio.disabled = true;

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
                mostrarToast(
                    resultado.error || (editando ? 'Error al actualizar la publicación.' : 'Error al publicar.'),
                    'danger'
                );
                return;
            }

            prepararNuevaPublicacion();
            modalCrearPublicacion.hide();
            mostrarToast(editando ? 'Publicación actualizada.' : 'Publicación creada.', 'success');
            await cargarPublicaciones();
        } catch (error) {
            mostrarToast('Error de conexión. Inténtalo de nuevo.', 'danger');
        } finally {
            botonEnvio.disabled = false;
        }
    });

    cargarPublicaciones();
    cargarJuegosMejorValorados();
    window.addEventListener('pageshow', (evento) => {
        if (evento.persisted) cargarJuegosMejorValorados();
    });

    const formularioBuscarJuego = document.getElementById('formulario-buscar-juego');
    const campoBuscarJuego = document.getElementById('campo-buscar-juego');
    const contenedorJuegos = document.getElementById('contenedor-juegos');
    const botonJuegosAnterior = document.getElementById('boton-juegos-anterior');
    const botonJuegosSiguiente = document.getElementById('boton-juegos-siguiente');
    const mensajeJuegos = document.getElementById('mensaje-juegos');
    const desplegableJuegosPublicacion = document.getElementById('desplegable-juegos-publicacion');
    const vistaJuegoSeleccionado = document.getElementById('vista-juego-seleccionado');
    const imagenJuegoSeleccionado = document.getElementById('imagen-juego-seleccionado');
    const tituloJuegoSeleccionado = document.getElementById('titulo-juego-seleccionado');
    const detalleJuegoSeleccionado = document.getElementById('detalle-juego-seleccionado');
    const botonLimpiarJuego = document.getElementById('boton-limpiar-juego');

    function actualizarSugerenciasJuegos(juegos, mostrarLista = false) {
        if (!desplegableJuegosPublicacion) return;
        const lista = Array.isArray(juegos) ? juegos.slice(0, 8) : [];

        if (lista.length === 0) {
            if (mostrarLista && campoJuegoPublicacion && campoJuegoPublicacion.value.trim()) {
                const vacio = document.createElement('div');
                vacio.className = 'px-3 py-2 small text-body-secondary';
                vacio.textContent = 'No se encontraron juegos con ese nombre.';
                desplegableJuegosPublicacion.replaceChildren(vacio);
                desplegableJuegosPublicacion.classList.remove('d-none');
            } else {
                desplegableJuegosPublicacion.replaceChildren();
                desplegableJuegosPublicacion.classList.add('d-none');
            }
            return;
        }

        const opciones = lista.map((juego) => {
            const boton = document.createElement('button');
            boton.type = 'button';
            boton.className = 'opcion-juego-selector';

            if (juego.imagen) {
                const img = document.createElement('img');
                img.src = juego.imagen;
                img.alt = juego.titulo || '';
                img.className = 'portada-mini-selector rounded-2';
                img.loading = 'lazy';
                boton.appendChild(img);
            } else {
                const icono = document.createElement('div');
                icono.className = 'portada-mini-selector rounded-2 d-flex align-items-center justify-content-center bg-body-secondary text-body-secondary';
                icono.innerHTML = '<i class="bi bi-controller"></i>';
                boton.appendChild(icono);
            }

            const info = document.createElement('div');
            info.className = 'min-w-0 flex-grow-1';

            const titulo = document.createElement('div');
            titulo.className = 'fw-semibold small text-truncate';
            titulo.textContent = juego.titulo || '';
            info.appendChild(titulo);

            const subtitulo = document.createElement('div');
            subtitulo.className = 'text-body-secondary text-truncate';
            subtitulo.style.fontSize = '0.75rem';
            subtitulo.textContent = Array.isArray(juego.generos) && juego.generos.length > 0
                ? juego.generos.slice(0, 2).join(', ')
                : 'Videojuego';
            info.appendChild(subtitulo);

            boton.appendChild(info);

            if (juego.puntaje) {
                const badge = document.createElement('span');
                badge.className = 'badge text-bg-secondary rounded-pill flex-shrink-0';
                badge.textContent = `${juego.puntaje}`;
                boton.appendChild(badge);
            }

            boton.addEventListener('click', () => {
                seleccionarJuegoPublicacion(juego);
            });

            return boton;
        });

        desplegableJuegosPublicacion.replaceChildren(...opciones);
        if (mostrarLista) {
            desplegableJuegosPublicacion.classList.remove('d-none');
        } else {
            desplegableJuegosPublicacion.classList.add('d-none');
        }
    }

    function renderizarJuegos(juegos) {
        if (!contenedorJuegos) return;
        contenedorJuegos.classList.remove('d-none');

        const juegosAMostrar = campoBuscarJuego && campoBuscarJuego.value.trim()
            ? juegos
            : juegos.slice(0, 8);

        const tarjetas = juegosAMostrar.map((juego) => {
            const tarjeta = document.createElement('button');
            tarjeta.type = 'button';
            tarjeta.className = 'game-card';

            const marcoPortada = document.createElement('div');
            marcoPortada.className = 'game-poster-wrap mb-2';

            if (juego.imagen) {
                const imagen = document.createElement('img');
                imagen.src = juego.imagen;
                imagen.alt = juego.titulo;
                imagen.className = 'game-img';
                marcoPortada.appendChild(imagen);
            } else {
                const iconoVacio = document.createElement('div');
                iconoVacio.className = 'w-100 h-100 d-flex align-items-center justify-content-center text-muted fs-2';
                const icono = document.createElement('i');
                icono.className = 'bi bi-controller';
                iconoVacio.appendChild(icono);
                marcoPortada.appendChild(iconoVacio);
            }

            if (Number(juego.puntaje) > 0) {
                const insigniaNota = document.createElement('span');
                insigniaNota.className = 'game-score-badge';
                insigniaNota.textContent = `${Number(juego.puntaje).toFixed(1)}`;
                marcoPortada.appendChild(insigniaNota);
            }

            const titulo = document.createElement('h4');
            titulo.className = 'game-title fw-bold mb-1';
            titulo.textContent = juego.titulo;

            const genero = document.createElement('p');
            genero.className = 'text-muted fs-xs text-truncate mb-0';
            genero.textContent = Array.isArray(juego.generos) && juego.generos.length
                ? juego.generos[0]
                : 'Videojuego';

            tarjeta.append(marcoPortada, titulo, genero);
            tarjeta.addEventListener('click', () => abrirModalJuego(juego));
            return tarjeta;
        });

        contenedorJuegos.replaceChildren(...tarjetas);
        contenedorJuegos.scrollLeft = 0;
    }

    if (botonJuegosAnterior && contenedorJuegos) {
        botonJuegosAnterior.addEventListener('click', () => {
            contenedorJuegos.scrollBy({ left: -370, behavior: 'smooth' });
        });
    }

    if (botonJuegosSiguiente && contenedorJuegos) {
        botonJuegosSiguiente.addEventListener('click', () => {
            contenedorJuegos.scrollBy({ left: 370, behavior: 'smooth' });
        });
    }

    function abrirModalJuego(juego) {
        if (!juego || !juego.titulo) return;
        try {
            sessionStorage.setItem('juegoSeleccionado', JSON.stringify(juego));
        } catch (error) {
        }
        window.location.href = `/juego.html?titulo=${encodeURIComponent(juego.titulo)}`;
    }

    async function abrirJuegoDesdeRanking(juegoValorado) {
        if (!juegoValorado || !juegoValorado.juego) return;
        try {
            sessionStorage.removeItem('juegoSeleccionado');
        } catch (error) {
        }
        window.location.href = `/juego.html?titulo=${encodeURIComponent(juegoValorado.juego)}`;
    }

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
                mostrarToast(resultado.error || 'Juego no encontrado', 'warning');
                return;
            }

            const juegos = resultado.datos || [];
            renderizarJuegos(juegos);
            actualizarSugerenciasJuegos(juegos);
        } catch (error) {
            if (error.name === 'AbortError') return;
            mostrarToast('Error al consultar videojuegos.', 'danger');
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
            if (contenedorJuegos && !contenedorJuegos.children.length) {
                mostrarToast('No se encontraron juegos. Probá con otro nombre.', 'warning');
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
                if (desplegableJuegosPublicacion) {
                    desplegableJuegosPublicacion.replaceChildren();
                    desplegableJuegosPublicacion.classList.add('d-none');
                }
                return;
            }

            controladorSugerencias = new AbortController();
            try {
                const respuesta = await fetch(`/api/juegos?busqueda=${encodeURIComponent(texto)}`, {
                    signal: controladorSugerencias.signal
                });
                if (!respuesta.ok) return;
                const resultado = await respuesta.json();
                actualizarSugerenciasJuegos(resultado.datos || [], true);
            } catch (error) {
                if (error.name === 'AbortError') return;
            }
        }, 220);

        campoJuegoPublicacion.addEventListener('input', () => {
            limpiarJuegoSeleccionado();
            buscarSugerenciasConDemora(campoJuegoPublicacion.value.trim());
        });

        campoJuegoPublicacion.addEventListener('focus', () => {
            const texto = campoJuegoPublicacion.value.trim();
            if (texto && desplegableJuegosPublicacion && desplegableJuegosPublicacion.children.length > 0) {
                desplegableJuegosPublicacion.classList.remove('d-none');
            } else if (texto) {
                buscarSugerenciasConDemora(texto);
            }
        });

        campoJuegoPublicacion.addEventListener('keydown', (evento) => {
            if (evento.key === 'Escape' && desplegableJuegosPublicacion) {
                desplegableJuegosPublicacion.classList.add('d-none');
            }
        });

        document.addEventListener('click', (evento) => {
            if (!desplegableJuegosPublicacion) return;
            if (!grupoJuegoPublicacion.contains(evento.target)) {
                desplegableJuegosPublicacion.classList.add('d-none');
            }
        });
    }

    if (botonLimpiarJuego) {
        botonLimpiarJuego.addEventListener('click', () => {
            limpiarJuegoSeleccionado();
            if (campoJuegoPublicacion) {
                campoJuegoPublicacion.value = '';
                campoJuegoPublicacion.focus();
            }
            if (desplegableJuegosPublicacion) {
                desplegableJuegosPublicacion.replaceChildren();
                desplegableJuegosPublicacion.classList.add('d-none');
            }
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