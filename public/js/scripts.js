document.addEventListener('DOMContentLoaded', () => {
    const htmlElement = document.documentElement;
    const themeBtn = document.getElementById('theme-toggle');
    const icon = themeBtn.querySelector('i');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const authTitle = document.getElementById('auth-modal-title');
    const authSwitchPrompt = document.getElementById('auth-switch-prompt');
    const authSwitch = document.getElementById('auth-switch');
    const authMessage = document.getElementById('auth-message');
    const authModalElement = document.getElementById('auth-modal');
    const authModal = bootstrap.Modal.getOrCreateInstance(authModalElement);
    const authTrigger = document.getElementById('auth-trigger');
    const userProfile = document.getElementById('user-profile');
    const userName = document.getElementById('user-name');
    const userAvatar = document.getElementById('user-avatar');
    const logoutButton = document.getElementById('logout-button');

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        htmlElement.setAttribute('data-bs-theme', savedTheme);
        updateIcon(savedTheme);
    }

    themeBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-bs-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-bs-theme', newTheme);
        
        localStorage.setItem('theme', newTheme);
        
        updateIcon(newTheme);
    });

    function updateIcon(theme) {
        if (theme === 'dark') {
            icon.classList.remove('bi-moon');
            icon.classList.add('bi-sun');
        } else {
            icon.classList.remove('bi-sun');
            icon.classList.add('bi-moon');
        }
    }

    function showAuthMessage(message, type = 'danger') {
        authMessage.textContent = message;
        authMessage.className = `alert alert-${type}`;
    }

    function clearAuthMessage() {
        authMessage.textContent = '';
        authMessage.className = 'alert d-none';
    }

    function showLoginForm() {
        loginForm.classList.remove('d-none');
        registerForm.classList.add('d-none');
        authTitle.textContent = 'Iniciar sesión';
        authSwitchPrompt.textContent = '¿No tienes cuenta?';
        authSwitch.textContent = 'Regístrate';
        clearAuthMessage();
    }

    function showRegisterForm() {
        loginForm.classList.add('d-none');
        registerForm.classList.remove('d-none');
        authTitle.textContent = 'Crear cuenta';
        authSwitchPrompt.textContent = '¿Ya tienes cuenta?';
        authSwitch.textContent = 'Inicia sesión';
        clearAuthMessage();
    }

    function updateUserProfile(user) {
        if (!user) {
            authTrigger.classList.remove('d-none');
            userProfile.classList.add('d-none');
            userProfile.classList.remove('d-flex');
            return;
        }

        userName.textContent = user.name;
        userAvatar.textContent = user.name.trim().charAt(0).toUpperCase();
        authTrigger.classList.add('d-none');
        userProfile.classList.remove('d-none');
        userProfile.classList.add('d-flex');
    }

    async function sendAuthRequest(endpoint, form) {
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        clearAuthMessage();

        try {
            const response = await fetch(`/api/auth/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.fromEntries(new FormData(form)))
            });
            const result = await response.json();

            if (!response.ok) {
                showAuthMessage(result.error || 'No se pudo completar la solicitud.');
                return null;
            }

            return result;
        } catch (error) {
            showAuthMessage('No se pudo conectar con el servidor. Inténtalo de nuevo.');
            return null;
        } finally {
            submitButton.disabled = false;
        }
    }

    authSwitch.addEventListener('click', () => {
        if (loginForm.classList.contains('d-none')) {
            showLoginForm();
        } else {
            showRegisterForm();
        }
    });

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!loginForm.reportValidity()) return;

        const result = await sendAuthRequest('login', loginForm);
        if (!result) return;

        updateUserProfile(result.user);
        loginForm.reset();
        authModal.hide();
    });

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!registerForm.reportValidity()) return;

        const result = await sendAuthRequest('register', registerForm);
        if (!result) return;

        const registeredEmail = registerForm.elements.email.value;
        registerForm.reset();
        showLoginForm();
        document.getElementById('login-email').value = registeredEmail;
        showAuthMessage('Cuenta creada. Ahora inicia sesión con tu correo y contraseña.', 'success');
        document.getElementById('login-password').focus();
    });

    logoutButton.addEventListener('click', async () => {
        logoutButton.disabled = true;
        try {
            const response = await fetch('/api/auth/logout', { method: 'POST' });
            if (!response.ok) {
                showAuthMessage('No se pudo cerrar la sesión. Inténtalo de nuevo.');
                return;
            }
            updateUserProfile(null);
        } catch (error) {
            showAuthMessage('No se pudo conectar con el servidor. Inténtalo de nuevo.');
        } finally {
            logoutButton.disabled = false;
        }
    });

    authModalElement.addEventListener('show.bs.modal', showLoginForm);

    fetch('/api/auth/me')
        .then(async (response) => {
            if (!response.ok) throw new Error('No se pudo consultar la sesión actual.');
            const result = await response.json();
            updateUserProfile(result.user);
        })
        .catch((error) => {
            console.error(error);
        });
});