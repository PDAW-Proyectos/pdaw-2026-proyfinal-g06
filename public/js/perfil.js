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

    const perfilNoAutenticado = document.getElementById('perfil-no-autenticado');
    const botonLoginPerfil = document.getElementById('boton-login-perfil');
    const perfilContenido = document.getElementById('perfil-contenido');
    const perfilAvatarGrande = document.getElementById('perfil-avatar-grande');
    const perfilNombre = document.getElementById('perfil-nombre');
    const perfilCorreo = document.getElementById('perfil-correo');
    const perfilTotalPublicaciones = document.getElementById('perfil-total-publicaciones');
    const perfilTotalPuntuaciones = document.getElementById('perfil-total-puntuaciones');
    const perfilTotalVotos = document.getElementById('perfil-total-votos');
    const perfilBadgeAdmin = document.getElementById('perfil-badge-admin');
    const perfilStatsUsuario = document.getElementById('perfil-stats-usuario');
    const perfilStatsAdmin = document.getElementById('perfil-stats-admin');
    const perfilVistaUsuario = document.getElementById('perfil-vista-usuario');
    const perfilVistaAdmin = document.getElementById('perfil-vista-admin');
    const adminTotalUsuarios = document.getElementById('admin-total-usuarios');
    const adminTotalReportadas = document.getElementById('admin-total-reportadas');
    const listaAdminUsuarios = document.getElementById('lista-admin-usuarios');
    const listaAdminReportadas = document.getElementById('lista-admin-reportadas');
    const panelAdminUsuarios = document.getElementById('panel-admin-usuarios');
    const panelAdminReportadas = document.getElementById('panel-admin-reportadas');
    const botonesTabAdmin = document.querySelectorAll('[data-tab-admin]');
    const listaPublicacionesPerfil = document.getElementById('lista-publicaciones-perfil');
    const listaPuntuacionesPerfil = document.getElementById('lista-puntuaciones-perfil');
    const panelPublicacionesPerfil = document.getElementById('panel-publicaciones-perfil');
    const panelPuntuacionesPerfil = document.getElementById('panel-puntuaciones-perfil');
    const botonesTabPerfil = document.querySelectorAll('[data-tab-perfil]');
    const filtroCategoriaPerfil = document.getElementById('filtro-categoria-perfil');

    const modalCrearPublicacion = bootstrap.Modal.getOrCreateInstance(document.getElementById('modal-crear-publicacion'));
    const formularioCrearPublicacion = document.getElementById('formulario-crear-publicacion');
    const campoTituloPublicacion = document.getElementById('campo-titulo-publicacion');
    const campoContenidoPublicacion = document.getElementById('campo-contenido-publicacion');
    const campoCategoriaPublicacion = document.getElementById('campo-categoria-publicacion');
    const botonEnviarPublicacion = document.getElementById('boton-enviar-publicacion');
    const contenedorToasts = document.getElementById('contenedor-toasts');

    let usuarioActual = null;
    let publicacionesUsuario = [];
    let puntuacionesUsuario = [];
    let filtroActual = 'todas';
    let publicacionEnEdicion = null;

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

    botonLoginPerfil.addEventListener('click', () => {
        mostrarFormularioLogin();
        modalAutenticacion.show();
    });

    function aplicarEstadoAutenticacion(usuario) {
        usuarioActual = usuario || null;
        if (usuarioActual) {
            const nombre = usuarioActual.name || usuarioActual.nombre || usuarioActual.email;
            const inicial = nombre.trim().charAt(0).toUpperCase();
            nombreUsuario.textContent = nombre;
            avatarUsuario.textContent = inicial;
            botonAbrirAutenticacion.classList.add('d-none');
            perfilUsuario.classList.remove('d-none');
            perfilUsuario.classList.add('d-flex');

            perfilAvatarGrande.textContent = inicial;
            perfilNombre.textContent = nombre;
            perfilCorreo.textContent = usuarioActual.email || '';
            perfilNoAutenticado.classList.add('d-none');
            perfilContenido.classList.remove('d-none');

            const esAdmin = usuarioActual.rol === 'admin';
            if (perfilBadgeAdmin) perfilBadgeAdmin.classList.toggle('d-none', !esAdmin);
            if (perfilStatsUsuario) {
                perfilStatsUsuario.classList.toggle('d-none', esAdmin);
                perfilStatsUsuario.classList.toggle('d-flex', !esAdmin);
            }
            if (perfilStatsAdmin) {
                perfilStatsAdmin.classList.toggle('d-none', !esAdmin);
                perfilStatsAdmin.classList.toggle('d-flex', esAdmin);
            }
            if (perfilVistaUsuario) perfilVistaUsuario.classList.toggle('d-none', esAdmin);
            if (perfilVistaAdmin) perfilVistaAdmin.classList.toggle('d-none', !esAdmin);
        } else {
            nombreUsuario.textContent = '';
            avatarUsuario.textContent = '';
            botonAbrirAutenticacion.classList.remove('d-none');
            perfilUsuario.classList.add('d-none');
            perfilUsuario.classList.remove('d-flex');

            perfilContenido.classList.add('d-none');
            perfilNoAutenticado.classList.remove('d-none');
        }
    }

    async function verificarSesion() {
        try {
            const resp = await fetch('/api/auth/me');
            if (!resp.ok) {
                aplicarEstadoAutenticacion(null);
                return;
            }
            const datos = await resp.json();
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
            const resp = await fetch(`/api/auth/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
            const res = await resp.json();
            if (!resp.ok) throw new Error(res.error || 'No se pudo completar la operación.');
            aplicarEstadoAutenticacion(res.user || res.usuario);
            modalAutenticacion.hide();
            formulario.reset();
            await cargarDatosSegunRol();
        } catch (err) {
            mostrarToast(err.message, 'danger');
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
            publicacionesUsuario = [];
            puntuacionesUsuario = [];
            listaPublicacionesPerfil.replaceChildren();
            if (listaPuntuacionesPerfil) listaPuntuacionesPerfil.replaceChildren();
        } catch (err) {
            mostrarToast('No se pudo cerrar sesión.', 'danger');
        }
    });

    function renderizarPublicacionesPerfil() {
        const filtradas = filtroActual === 'todas'
            ? publicacionesUsuario
            : publicacionesUsuario.filter((p) => (p.category || p.categoria) === filtroActual);

        if (!filtradas.length) {
            const vacio = document.createElement('div');
            vacio.className = 'superficie-tarjeta rounded-4 p-4 text-center text-muted fs-sm';
            vacio.textContent = filtroActual === 'todas'
                ? 'Todavía no creaste ninguna publicación.'
                : 'No hay publicaciones en esta categoría.';
            listaPublicacionesPerfil.replaceChildren(vacio);
            return;
        }

        const tarjetas = filtradas.map((publicacion) => {
            const tarjeta = document.createElement('article');
            tarjeta.className = 'superficie-tarjeta tarjeta-publicacion d-flex align-items-stretch gap-3 p-3 rounded-4';

            const juego = publicacion.game || publicacion.juego || '';
            const portadaUrl = publicacion.imagenJuego || (publicacion.datosJuego && publicacion.datosJuego.imagen);
            if (portadaUrl) {
                const img = document.createElement('img');
                img.src = portadaUrl;
                img.alt = juego;
                img.className = 'publicacion-portada post-cover rounded-3 align-self-center';
                img.addEventListener('error', () => img.classList.add('d-none'), { once: true });
                tarjeta.append(img);
            }

            const cuerpo = document.createElement('div');
            cuerpo.className = 'flex-grow-1 min-w-0 d-flex flex-column justify-content-between py-1';

            const superior = document.createElement('div');
            const metaJuego = document.createElement('div');
            metaJuego.className = 'd-flex align-items-center flex-wrap gap-2 mb-1';

            const spanJuego = document.createElement('span');
            spanJuego.className = 'fs-xs fw-semibold text-primary';
            spanJuego.textContent = juego;

            const sep = document.createElement('span');
            sep.className = 'text-muted fs-xs';
            sep.textContent = '·';

            const spanCat = document.createElement('span');
            spanCat.className = 'badge rounded-pill bg-body-tertiary text-body-secondary border';
            spanCat.textContent = publicacion.category || publicacion.categoria || '';

            metaJuego.append(spanJuego, sep, spanCat);

            if (publicacion.requiereRevision) {
                const badgeVerif = document.createElement('span');
                badgeVerif.className = 'badge rounded-pill text-bg-warning';
                badgeVerif.textContent = 'En verificación';
                metaJuego.append(badgeVerif);
            }

            const enlace = document.createElement('a');
            enlace.href = `/juego.html?titulo=${encodeURIComponent(juego)}&postId=${encodeURIComponent(publicacion.id)}`;
            enlace.className = 'text-decoration-none text-body-emphasis d-block';
            const titulo = document.createElement('h3');
            titulo.className = 'fs-5 fw-bold mb-0 text-truncate';
            titulo.textContent = publicacion.title || 'Sin título';
            enlace.append(titulo);

            superior.append(metaJuego, enlace);

            const fecha = new Date(publicacion.createdAt).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });
            const metaFecha = document.createElement('div');
            metaFecha.className = 'text-muted fs-xs mt-2';
            metaFecha.textContent = fecha;

            cuerpo.append(superior, metaFecha);

            const derecha = document.createElement('div');
            derecha.className = 'd-flex flex-column align-items-end justify-content-between flex-shrink-0';

            const badgeVotos = document.createElement('span');
            badgeVotos.className = 'badge rounded-pill bg-body-tertiary text-body border px-2 py-1';
            badgeVotos.innerHTML = `<i class="bi bi-arrow-up text-primary me-1"></i>${publicacion.puntajeVotos ?? 0}`;

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
                    await cargarDatosSegunRol();
                } catch (err) {
                    mostrarToast(err.message, 'danger');
                }
            });
            liDel.append(btnDel);

            menu.append(liEdit, liDel);
            dropdown.append(btnMenu, menu);
            derecha.append(badgeVotos, dropdown);

            tarjeta.append(cuerpo, derecha);
            return tarjeta;
        });

        listaPublicacionesPerfil.replaceChildren(...tarjetas);
    }

    async function cargarPublicacionesUsuario() {
        if (!usuarioActual) return;
        try {
            const resp = await fetch('/api/posts');
            const res = await resp.json();
            if (!resp.ok) throw new Error(res.error || 'No se pudieron cargar tus publicaciones.');
            const todas = res.data || [];
            publicacionesUsuario = todas.filter((p) => {
                const autor = p.author || p.autor;
                return autor && String(autor.id) === String(usuarioActual.id);
            });
            perfilTotalPublicaciones.textContent = String(publicacionesUsuario.length);
            const totalVotos = publicacionesUsuario.reduce((acc, p) => acc + (Number(p.puntajeVotos) || 0), 0);
            perfilTotalVotos.textContent = String(totalVotos);
            renderizarPublicacionesPerfil();
        } catch (err) {
            mostrarToast(err.message, 'danger');
        }
    }

    if (filtroCategoriaPerfil) {
        filtroCategoriaPerfil.addEventListener('change', () => {
            filtroActual = filtroCategoriaPerfil.value || 'todas';
            renderizarPublicacionesPerfil();
        });
    }

    formularioCrearPublicacion.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!publicacionEnEdicion) return;
        botonEnviarPublicacion.disabled = true;
        try {
            const resp = await fetch(`/api/posts/${encodeURIComponent(publicacionEnEdicion.id)}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: campoTituloPublicacion.value.trim(),
                    content: campoContenidoPublicacion.value.trim(),
                    category: campoCategoriaPublicacion.value
                })
            });
            const res = await resp.json();
            if (!resp.ok) throw new Error(res.error || 'No se pudo actualizar.');
            modalCrearPublicacion.hide();
            mostrarToast('Publicación actualizada.', 'success');
            await cargarDatosSegunRol();
        } catch (err) {
            mostrarToast(err.message, 'danger');
        } finally {
            botonEnviarPublicacion.disabled = false;
        }
    });

    function renderizarPuntuacionesPerfil() {
        if (!listaPuntuacionesPerfil) return;
        if (!puntuacionesUsuario.length) {
            const vacio = document.createElement('div');
            vacio.className = 'superficie-tarjeta rounded-4 p-4 text-center text-muted fs-sm';
            vacio.textContent = 'Todavía no puntuaste ningún videojuego.';
            listaPuntuacionesPerfil.replaceChildren(vacio);
            return;
        }

        const tarjetas = puntuacionesUsuario.map((item) => {
            const tarjeta = document.createElement('article');
            tarjeta.className = 'superficie-tarjeta tarjeta-publicacion d-flex align-items-center justify-content-between gap-3 p-3 rounded-4';

            const info = document.createElement('div');
            info.className = 'min-w-0 flex-grow-1';

            const enlace = document.createElement('a');
            enlace.href = `/juego.html?titulo=${encodeURIComponent(item.juego)}`;
            enlace.className = 'text-decoration-none text-body-emphasis fw-bold fs-6 d-block text-truncate';
            enlace.textContent = item.juego;

            const estrellas = document.createElement('div');
            estrellas.className = 'd-flex align-items-center gap-1 mt-1';
            for (let i = 1; i <= 5; i++) {
                const icono = document.createElement('i');
                icono.className = i <= Number(item.nota)
                    ? 'bi bi-star-fill text-warning fs-sm'
                    : 'bi bi-star text-muted fs-sm';
                estrellas.append(icono);
            }
            const textoNota = document.createElement('span');
            textoNota.className = 'text-muted fs-xs ms-2';
            textoNota.textContent = `${item.nota} / 5`;
            estrellas.append(textoNota);

            info.append(enlace, estrellas);

            const botonEliminar = document.createElement('button');
            botonEliminar.type = 'button';
            botonEliminar.className = 'btn btn-link btn-sm text-danger text-decoration-none p-2 flex-shrink-0';
            botonEliminar.setAttribute('aria-label', `Eliminar puntuación de ${item.juego}`);
            botonEliminar.title = 'Eliminar puntuación';
            botonEliminar.innerHTML = '<i class="bi bi-trash"></i>';
            botonEliminar.addEventListener('click', async () => {
                try {
                    const resp = await fetch(`/api/juegos/puntuaciones?juego=${encodeURIComponent(item.juego)}`, {
                        method: 'DELETE'
                    });
                    if (!resp.ok) throw new Error('No se pudo eliminar la puntuación.');
                    mostrarToast('Puntuación eliminada.', 'success');
                    await cargarPuntuacionesUsuario();
                } catch (err) {
                    mostrarToast(err.message, 'danger');
                }
            });

            tarjeta.append(info, botonEliminar);
            return tarjeta;
        });

        listaPuntuacionesPerfil.replaceChildren(...tarjetas);
    }

    async function cargarPuntuacionesUsuario() {
        if (!usuarioActual) return;
        try {
            const resp = await fetch('/api/juegos/mis-puntuaciones');
            const res = await resp.json();
            if (!resp.ok) throw new Error(res.error || 'No se pudieron cargar tus puntuaciones.');
            puntuacionesUsuario = res.datos || [];
            if (perfilTotalPuntuaciones) {
                perfilTotalPuntuaciones.textContent = String(puntuacionesUsuario.length);
            }
            renderizarPuntuacionesPerfil();
        } catch (err) {
            mostrarToast(err.message, 'danger');
        }
    }

    botonesTabPerfil.forEach((btn) => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tabPerfil;
            botonesTabPerfil.forEach((b) => {
                const activo = b === btn;
                b.classList.toggle('btn-primary', activo);
                b.classList.toggle('btn-outline-secondary', !activo);
                b.setAttribute('aria-selected', String(activo));
            });
            if (panelPublicacionesPerfil) {
                panelPublicacionesPerfil.classList.toggle('d-none', tab !== 'publicaciones');
            }
            if (panelPuntuacionesPerfil) {
                panelPuntuacionesPerfil.classList.toggle('d-none', tab !== 'puntuaciones');
            }
        });
    });

    async function cargarUsuariosAdmin() {
        if (!listaAdminUsuarios || !usuarioActual || usuarioActual.rol !== 'admin') return;
        try {
            const resp = await fetch('/api/admin/usuarios');
            const res = await resp.json();
            if (!resp.ok) throw new Error(res.error || 'No se pudieron cargar los usuarios.');
            const usuarios = res.datos || [];
            if (adminTotalUsuarios) adminTotalUsuarios.textContent = String(usuarios.length);

            if (!usuarios.length) {
                const vacio = document.createElement('div');
                vacio.className = 'superficie-tarjeta rounded-4 p-4 text-center text-muted fs-sm';
                vacio.textContent = 'No hay usuarios registrados.';
                listaAdminUsuarios.replaceChildren(vacio);
                return;
            }

            const tarjetas = usuarios.map((u) => {
                const tarjeta = document.createElement('article');
                tarjeta.className = 'superficie-tarjeta d-flex align-items-center justify-content-between gap-3 p-3 rounded-4';

                const izq = document.createElement('div');
                izq.className = 'd-flex align-items-center gap-3 min-w-0';

                const av = document.createElement('div');
                av.className = 'avatar bg-body-tertiary text-body-emphasis fw-bold rounded-circle d-flex justify-content-center align-items-center border flex-shrink-0';
                av.textContent = (u.name || u.email || 'U').trim().charAt(0).toUpperCase();

                const info = document.createElement('div');
                info.className = 'min-w-0';
                const filaNombre = document.createElement('div');
                filaNombre.className = 'd-flex align-items-center gap-2';
                const nombre = document.createElement('span');
                nombre.className = 'fw-bold fs-sm text-truncate';
                nombre.textContent = u.name || 'Sin nombre';
                filaNombre.append(nombre);

                if (u.rol === 'admin') {
                    const badge = document.createElement('span');
                    badge.className = 'badge rounded-pill text-bg-danger';
                    badge.textContent = 'Admin';
                    filaNombre.append(badge);
                }

                const correo = document.createElement('div');
                correo.className = 'text-muted fs-xs text-truncate';
                correo.textContent = u.email || '';

                info.append(filaNombre, correo);
                izq.append(av, info);
                tarjeta.append(izq);

                if (u.rol !== 'admin' && String(u.id) !== String(usuarioActual.id)) {
                    const btnDel = document.createElement('button');
                    btnDel.type = 'button';
                    btnDel.className = 'btn btn-outline-danger btn-sm rounded-pill px-3 flex-shrink-0';
                    btnDel.innerHTML = '<i class="bi bi-trash me-1"></i>Eliminar';
                    btnDel.addEventListener('click', async () => {
                        const ok = await confirmarConToast(`¿Eliminar al usuario "${u.name}"?`);
                        if (!ok) return;
                        try {
                            const r = await fetch(`/api/admin/usuarios/${encodeURIComponent(u.id)}`, { method: 'DELETE' });
                            const data = await r.json();
                            if (!r.ok) throw new Error(data.error || 'No se pudo eliminar el usuario.');
                            mostrarToast('Usuario eliminado.', 'success');
                            await cargarUsuariosAdmin();
                        } catch (err) {
                            mostrarToast(err.message, 'danger');
                        }
                    });
                    tarjeta.append(btnDel);
                }

                return tarjeta;
            });

            listaAdminUsuarios.replaceChildren(...tarjetas);
        } catch (err) {
            mostrarToast(err.message, 'danger');
        }
    }

    async function cargarReportadasAdmin() {
        if (!listaAdminReportadas || !usuarioActual || usuarioActual.rol !== 'admin') return;
        try {
            const resp = await fetch('/api/admin/publicaciones-reportadas');
            const res = await resp.json();
            if (!resp.ok) throw new Error(res.error || 'No se pudieron cargar las publicaciones reportadas.');
            const publicaciones = res.datos || [];
            if (adminTotalReportadas) adminTotalReportadas.textContent = String(publicaciones.length);

            if (!publicaciones.length) {
                const vacio = document.createElement('div');
                vacio.className = 'superficie-tarjeta rounded-4 p-4 text-center text-muted fs-sm';
                vacio.textContent = 'No hay publicaciones con 3 o más reportes.';
                listaAdminReportadas.replaceChildren(vacio);
                return;
            }

            const tarjetas = publicaciones.map((publicacion) => {
                const tarjeta = document.createElement('article');
                tarjeta.className = 'superficie-tarjeta d-flex align-items-center justify-content-between gap-3 p-3 rounded-4';

                const info = document.createElement('div');
                info.className = 'min-w-0 flex-grow-1';

                const juego = publicacion.game || publicacion.juego || '';
                const badges = document.createElement('div');
                badges.className = 'd-flex align-items-center flex-wrap gap-2 mb-1';

                const spanJuego = document.createElement('span');
                spanJuego.className = 'fs-xs fw-semibold text-primary';
                spanJuego.textContent = juego;

                const spanReportes = document.createElement('span');
                spanReportes.className = 'badge rounded-pill text-bg-warning';
                spanReportes.textContent = `${publicacion.cantidadReportes || 3} reportes`;

                badges.append(spanJuego, spanReportes);

                const enlace = document.createElement('a');
                enlace.href = `/juego.html?titulo=${encodeURIComponent(juego)}&postId=${encodeURIComponent(publicacion.id)}`;
                enlace.className = 'text-decoration-none text-body-emphasis fw-bold fs-6 d-block text-truncate';
                enlace.textContent = publicacion.title || 'Sin título';

                const autor = publicacion.author || publicacion.autor;
                const meta = document.createElement('div');
                meta.className = 'text-muted fs-xs mt-1';
                meta.textContent = `Por ${(autor && (autor.name || autor.nombre)) || 'Usuario'}`;

                info.append(badges, enlace, meta);

                const btnDel = document.createElement('button');
                btnDel.type = 'button';
                btnDel.className = 'btn btn-outline-danger btn-sm rounded-pill px-3 flex-shrink-0';
                btnDel.innerHTML = '<i class="bi bi-trash me-1"></i>Eliminar';
                btnDel.addEventListener('click', async () => {
                    const ok = await confirmarConToast('¿Eliminar esta publicación reportada?');
                    if (!ok) return;
                    try {
                        const r = await fetch(`/api/posts/${encodeURIComponent(publicacion.id)}`, { method: 'DELETE' });
                        const data = await r.json();
                        if (!r.ok) throw new Error(data.error || 'No se pudo eliminar.');
                        mostrarToast('Publicación eliminada.', 'success');
                        await cargarReportadasAdmin();
                    } catch (err) {
                        mostrarToast(err.message, 'danger');
                    }
                });

                tarjeta.append(info, btnDel);
                return tarjeta;
            });

            listaAdminReportadas.replaceChildren(...tarjetas);
        } catch (err) {
            mostrarToast(err.message, 'danger');
        }
    }

    botonesTabAdmin.forEach((btn) => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tabAdmin;
            botonesTabAdmin.forEach((b) => {
                const activo = b === btn;
                b.classList.toggle('btn-primary', activo);
                b.classList.toggle('btn-outline-secondary', !activo);
                b.setAttribute('aria-selected', String(activo));
            });
            if (panelAdminUsuarios) panelAdminUsuarios.classList.toggle('d-none', tab !== 'usuarios');
            if (panelAdminReportadas) panelAdminReportadas.classList.toggle('d-none', tab !== 'reportadas');
        });
    });

    async function cargarDatosSegunRol() {
        if (!usuarioActual) return;
        if (usuarioActual.rol === 'admin') {
            await Promise.all([cargarUsuariosAdmin(), cargarReportadasAdmin()]);
        } else {
            await Promise.all([cargarPublicacionesUsuario(), cargarPuntuacionesUsuario()]);
        }
    }

    await verificarSesion();
    await cargarDatosSegunRol();
});

