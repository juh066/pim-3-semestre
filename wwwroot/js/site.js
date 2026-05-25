// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// ============================================
// NOTIFICATION SYSTEM
// ============================================

class NotificationManager {
    constructor() {
        this.container = document.getElementById('notificationContainer');
    }

    /**
     * Exibe uma notificação na tela
     * @param {string} message - Mensagem a exibir
     * @param {string} type - Tipo de notificação: 'success', 'error', 'warning', 'info'
     * @param {number} duration - Duração em ms (0 = infinito)
     */
    show(message, type = 'info', duration = 4000) {
        const notification = document.createElement('div');
        notification.className = `notification-banner ${type}`;
        
        const content = document.createElement('div');
        content.className = 'notification-content';
        content.textContent = message;
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'notification-close';
        closeBtn.innerHTML = '×';
        closeBtn.onclick = () => this.remove(notification);
        
        notification.appendChild(content);
        notification.appendChild(closeBtn);
        
        this.container.appendChild(notification);
        
        // Auto-remove após o tempo especificado
        if (duration > 0) {
            setTimeout(() => this.remove(notification), duration);
        }
        
        return notification;
    }

    /**
     * Remove uma notificação com animação
     */
    remove(notification) {
        notification.classList.add('hide');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 400);
    }

    // Métodos de conveniência para cada tipo
    success(message, duration = 4000) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = 5000) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration = 4000) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration = 3000) {
        return this.show(message, 'info', duration);
    }
}

// Inicializar gerenciador global
const notifications = new NotificationManager();

async function readApiMessage(response, fallback) {
    try {
        const data = await response.json();
        if (data.errors) {
            const messages = Object.values(data.errors).flat();
            if (messages.length > 0) {
                return messages.join(' ');
            }
        }

        return data.message || fallback;
    } catch {
        return fallback;
    }
}

async function postJson(url, body = {}) {
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify(body)
    });
}

function formatCurrency(value) {
    return Number(value || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

function formatDate(value) {
    if (!value) {
        return '';
    }

    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('pt-BR');
}

// ============================================
// USER PROFILE MANAGEMENT
// ============================================

class UserProfileManager {
    constructor() {
        this.profileIcon = document.getElementById('userProfileIcon');
        this.userNameEl = document.getElementById('userName');
        this.userInitialsEl = document.getElementById('userInitials');
        this.userIconSvg = document.getElementById('userIconSvg');
        this.loggedInActions = document.getElementById('loggedInActions');
        this.authModalGrid = document.querySelector('.auth-modal-grid');
        this.logoutBtn = document.getElementById('logoutBtn');
        
        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', () => this.logout());
        }

        const authModal = document.getElementById('authModal');
        if (authModal) {
            authModal.addEventListener('shown.bs.modal', () => {
                if (this.profileIcon?.classList.contains('is-logged-in')) {
                    window.userRecordsManager?.load();
                }
            });
        }
        
        this.loadUserProfile();
    }

    /**
     * Salva o perfil do usuário APÓS LOGIN (não após cadastro)
     */
    saveUserProfile(name, isLogin = false) {
        if (name && name.trim()) {
            if (isLogin) {
                this.displayUserProfile(name.trim());
            }
        }
    }

    /**
     * Carrega o perfil do usuário (ao abrir página)
     * Só exibe se estava com login anterior
     */
    async loadUserProfile() {
        try {
            const response = await fetch('/auth/me', { credentials: 'same-origin' });
            if (!response.ok) {
                this.clearUserProfile();
                return;
            }

            const user = await response.json();
            this.displayUserProfile(user.name);
        } catch (e) {
            console.log('Erro ao carregar perfil:', e);
            this.clearUserProfile();
        }
    }

    /**
     * Exibe o perfil do usuário no botão da navbar
     */
    displayUserProfile(name) {
        if (this.profileIcon && this.userNameEl) {
            this.userNameEl.textContent = name;
            this.profileIcon.classList.add('is-logged-in');
            this.profileIcon.setAttribute('aria-label', `Usuário conectado: ${name}`);
            this.profileIcon.setAttribute('title', name);
        }

        if (this.userInitialsEl) {
            this.userInitialsEl.textContent = this.getInitials(name);
        }

        if (this.userIconSvg) {
            this.userIconSvg.style.display = 'none';
        }

        if (this.loggedInActions) {
            this.loggedInActions.hidden = false;
        }

        if (this.authModalGrid) {
            this.authModalGrid.hidden = true;
        }

        window.cartManager?.load();
        window.userRecordsManager?.load();
    }

    getInitials(name) {
        return name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map(part => part.charAt(0).toUpperCase())
            .join('');
    }

    /**
     * Remove o perfil do usuário (logout)
     */
    logout() {
        this.logoutAsync();
    }

    async logoutAsync() {
        if (this.profileIcon) {
            await postJson('/auth/logout');
            this.clearUserProfile();
            notifications.info('Você foi desconectado.');
        }
    }

    clearUserProfile() {
        if (this.profileIcon) {
            this.profileIcon.classList.remove('is-logged-in');
            this.profileIcon.setAttribute('aria-label', 'Abrir login e cadastro');
            this.profileIcon.setAttribute('title', 'Login e Cadastro');
        }

        if (this.userNameEl) {
            this.userNameEl.textContent = '';
        }

        if (this.userInitialsEl) {
            this.userInitialsEl.textContent = '';
        }

        if (this.userIconSvg) {
            this.userIconSvg.style.display = '';
        }

        if (this.loggedInActions) {
            this.loggedInActions.hidden = true;
        }

        if (this.authModalGrid) {
            this.authModalGrid.hidden = false;
        }

        window.cartManager?.clear();
        window.userRecordsManager?.clear();
    }
}

// Inicializar gerenciador de perfil global
const userProfile = new UserProfileManager();

class UserRecordsManager {
    constructor() {
        this.ticketsList = document.getElementById('userTicketsList');
        this.ticketsEmpty = document.getElementById('userTicketsEmpty');
        this.appointmentsList = document.getElementById('userAppointmentsList');
        this.appointmentsEmpty = document.getElementById('userAppointmentsEmpty');
    }

    async load() {
        await Promise.all([
            this.loadList('/user-actions/tickets', this.ticketsList, this.ticketsEmpty, 'ingresso'),
            this.loadList('/user-actions/appointments', this.appointmentsList, this.appointmentsEmpty, 'agendamento')
        ]);
    }

    async loadList(url, listEl, emptyEl, type) {
        if (!listEl || !emptyEl) {
            return;
        }

        try {
            const response = await fetch(url, { credentials: 'same-origin' });
            if (response.status === 401) {
                this.clear();
                return;
            }

            if (!response.ok) {
                listEl.innerHTML = '';
                emptyEl.textContent = `Não foi possível carregar seus ${type}s agora.`;
                emptyEl.hidden = false;
                return;
            }

            this.renderList(await response.json(), listEl, emptyEl);
        } catch {
            listEl.innerHTML = '';
            emptyEl.textContent = `Não foi possível carregar seus ${type}s agora.`;
            emptyEl.hidden = false;
        }
    }

    renderList(items, listEl, emptyEl) {
        listEl.innerHTML = '';
        emptyEl.hidden = items.length > 0;

        items.forEach(item => {
            const row = document.createElement('article');
            row.className = 'user-record-card';

            const content = document.createElement('div');
            content.className = 'user-record-content';

            const title = document.createElement('strong');
            title.textContent = item.eventName;

            const meta = document.createElement('span');
            meta.textContent = `${formatDate(item.date)} • Quantidade: ${item.quantity}`;

            const status = document.createElement('span');
            status.className = `user-record-status ${item.status === 'past' ? 'is-past' : 'is-available'}`;
            status.textContent = item.status === 'past' ? 'Indisponível / passado' : 'Disponível';

            content.appendChild(title);
            content.appendChild(meta);
            row.appendChild(content);
            row.appendChild(status);
            listEl.appendChild(row);
        });
    }

    clear() {
        if (this.ticketsList) {
            this.ticketsList.innerHTML = '';
        }

        if (this.appointmentsList) {
            this.appointmentsList.innerHTML = '';
        }

        if (this.ticketsEmpty) {
            this.ticketsEmpty.hidden = false;
        }

        if (this.appointmentsEmpty) {
            this.appointmentsEmpty.hidden = false;
        }
    }
}

// ============================================
// SHOPPING CART
// ============================================

class CartManager {
    constructor() {
        this.button = document.getElementById('cartButton');
        this.countEl = document.getElementById('cartCount');
        this.drawer = document.getElementById('cartDrawer');
        this.backdrop = document.getElementById('cartBackdrop');
        this.closeButton = document.getElementById('cartCloseButton');
        this.itemsEl = document.getElementById('cartItems');
        this.emptyEl = document.getElementById('cartEmpty');
        this.totalEl = document.getElementById('cartTotal');
        this.checkoutButton = document.getElementById('cartCheckoutButton');

        this.cart = { items: [], count: 0, total: 0 };

        this.button?.addEventListener('click', () => this.open());
        this.closeButton?.addEventListener('click', () => this.close());
        this.backdrop?.addEventListener('click', () => this.close());
        this.checkoutButton?.addEventListener('click', () => this.checkout());

        this.load();
    }

    async load() {
        try {
            const response = await fetch('/cart', { credentials: 'same-origin' });
            if (response.status === 401) {
                this.clear();
                return;
            }

            if (!response.ok) {
                return;
            }

            this.render(await response.json());
        } catch (e) {
            console.log('Erro ao carregar carrinho:', e);
        }
    }

    async add(product) {
        const response = await postJson('/cart/items', product);

        if (response.status === 401) {
            notifications.error('❌ Faça login para adicionar produtos ao carrinho.');
            const authModal = document.getElementById('authModal');
            if (authModal) {
                bootstrap.Modal.getOrCreateInstance(authModal).show();
            }
            return false;
        }

        if (!response.ok) {
            notifications.error(await readApiMessage(response, 'Não foi possível adicionar o produto ao carrinho.'));
            return false;
        }

        this.render(await response.json());
        this.open();
        return true;
    }

    async checkout() {
        const response = await postJson('/cart/checkout');

        if (response.status === 401) {
            notifications.error('❌ Faça login para finalizar a compra.');
            return;
        }

        if (!response.ok) {
            notifications.error(await readApiMessage(response, 'Não foi possível finalizar a compra.'));
            return;
        }

        this.render(await response.json());
        notifications.success('✓ Compra finalizada com sucesso!');
    }

    open() {
        if (this.drawer) {
            this.drawer.classList.add('is-open');
            this.drawer.setAttribute('aria-hidden', 'false');
        }

        if (this.backdrop) {
            this.backdrop.hidden = false;
            this.backdrop.classList.add('is-open');
        }

        this.load();
    }

    close() {
        if (this.drawer) {
            this.drawer.classList.remove('is-open');
            this.drawer.setAttribute('aria-hidden', 'true');
        }

        if (this.backdrop) {
            this.backdrop.classList.remove('is-open');
            setTimeout(() => {
                if (!this.backdrop.classList.contains('is-open')) {
                    this.backdrop.hidden = true;
                }
            }, 200);
        }
    }

    clear() {
        this.render({ items: [], count: 0, total: 0 });
    }

    render(cart) {
        this.cart = {
            items: Array.from(cart.items || []),
            count: cart.count || 0,
            total: cart.total || 0
        };

        if (this.countEl) {
            this.countEl.textContent = this.cart.count;
            this.countEl.hidden = this.cart.count === 0;
        }

        if (this.totalEl) {
            this.totalEl.textContent = formatCurrency(this.cart.total);
        }

        if (this.checkoutButton) {
            this.checkoutButton.disabled = this.cart.count === 0;
        }

        if (this.emptyEl) {
            this.emptyEl.hidden = this.cart.count > 0;
        }

        if (!this.itemsEl) {
            return;
        }

        this.itemsEl.innerHTML = '';
        this.cart.items.forEach(item => {
            const row = document.createElement('div');
            row.className = 'cart-item';

            const details = document.createElement('div');
            details.className = 'cart-item-details';

            const name = document.createElement('strong');
            name.textContent = item.productName;

            const price = document.createElement('span');
            price.textContent = `${item.quantity} x ${formatCurrency(item.unitPrice)}`;

            const subtotal = document.createElement('span');
            subtotal.className = 'cart-item-subtotal';
            subtotal.textContent = formatCurrency(item.subtotal);

            details.appendChild(name);
            details.appendChild(price);
            row.appendChild(details);
            row.appendChild(subtotal);
            this.itemsEl.appendChild(row);
        });
    }
}

// ============================================
// EVENT LISTENERS PARA FORMULÁRIOS
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    window.userRecordsManager = new UserRecordsManager();
    window.cartManager = new CartManager();

    // Formulário de Cadastro - NÃO mostra ícone
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Obter dados do formulário
            const nameInput = this.querySelector('input[type="text"]');
            const cpfInput = document.getElementById('cpfInput');
            const emailInput = this.querySelector('input[type="email"]');
            const passwordInput = this.querySelector('input[type="password"]');
            const userName = nameInput ? nameInput.value : 'Usuário';
            const cpf = cpfInput ? cpfInput.value : '';
            const password = passwordInput ? passwordInput.value : '';
            
            // Validar CPF
            if (!cpf || cpf.length !== 11) {
                notifications.error('❌ CPF deve ter exatamente 11 dígitos!');
                return;
            }
            
            // Validar se é apenas números
            if (!/^\d+$/.test(cpf)) {
                notifications.error('❌ CPF deve conter apenas números!');
                return;
            }

            if (password.length < 6) {
                notifications.error('❌ A senha deve ter pelo menos 6 caracteres!');
                return;
            }
            
            const response = await postJson('/auth/register', {
                name: userName,
                cpf: cpf,
                email: emailInput ? emailInput.value : '',
                password: password
            });

            if (!response.ok) {
                notifications.error(await readApiMessage(response, 'Não foi possível concluir o cadastro.'));
                return;
            }

            notifications.success('✓ Cadastro concluído com sucesso! Faça login para continuar.');
            registerForm.reset();
        });
    }

    // Formulário de Login - MOSTRA ícone
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Obter o email 
            const emailInput = this.querySelector('input[type="email"]');
            const passwordInput = this.querySelector('input[type="password"]');
            const response = await postJson('/auth/login', {
                email: emailInput ? emailInput.value : '',
                password: passwordInput ? passwordInput.value : ''
            });

            if (!response.ok) {
                notifications.error(await readApiMessage(response, 'Email ou senha incorretos.'));
                return;
            }
            
            const user = await response.json();
            userProfile.saveUserProfile(user.name, true);
            window.cartManager?.load();
            
            notifications.success('✓ Login concluído com sucesso!');
            const authModal = document.getElementById('authModal');
            const modalInstance = authModal ? bootstrap.Modal.getInstance(authModal) : null;
            if (modalInstance) {
                modalInstance.hide();
            }
            loginForm.reset();
        });
    }

    // Função auxiliar: verificar se usuário está logado
    async function ensureAuthenticatedResponse(response, fallbackMessage) {
        if (response.status === 401) {
            notifications.error('❌ Você precisa estar logado para continuar!');
            return false;
        }

        if (!response.ok) {
            notifications.error(await readApiMessage(response, fallbackMessage));
            return false;
        }

        return true;
    }

    // Formulário de Compra de Ingressos - REQUER LOGIN
    const ticketForm = document.getElementById('ticketForm');
    if (ticketForm) {
        ticketForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const nameInput = this.querySelector('input[type="text"]');
            const dateInput = this.querySelector('input[type="date"]');
            const quantityInput = this.querySelector('input[type="number"]');
            const response = await postJson('/user-actions/tickets', {
                visitorName: nameInput ? nameInput.value : '',
                visitDate: dateInput ? dateInput.value : '',
                quantity: quantityInput ? Number(quantityInput.value) : 1,
                eventName: 'Galeria Aurora'
            });
            if (!await ensureAuthenticatedResponse(response, 'Não foi possível comprar o ingresso.')) {
                return;
            }
            
            notifications.success('✓ Ingresso comprado com sucesso!');
            window.userRecordsManager?.load();
            setTimeout(() => ticketForm.reset(), 500);
        });
    }

    // Formulário de Agendamento de Visita - REQUER LOGIN
    const agendaForm = document.getElementById('agendaForm');
    if (agendaForm) {
        agendaForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const nameInput = this.querySelector('input[type="text"]');
            const emailInput = this.querySelector('input[type="email"]');
            const dateInput = this.querySelector('input[type="date"]');
            const response = await postJson('/user-actions/appointments', {
                visitorName: nameInput ? nameInput.value : '',
                email: emailInput ? emailInput.value : '',
                visitDate: dateInput ? dateInput.value : '',
                eventName: 'Visita à Galeria Aurora'
            });
            if (!await ensureAuthenticatedResponse(response, 'Não foi possível agendar a visita.')) {
                return;
            }
            
            notifications.success('✓ Visita agendada com sucesso!');
            window.userRecordsManager?.load();
            setTimeout(() => agendaForm.reset(), 500);
        });
    }

    // Botões de compra da loja - REQUER LOGIN
    const shopButtons = document.querySelectorAll('.product button');
    shopButtons.forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();

            const product = this.closest('.product');
            const productName = product.dataset.productName || product.querySelector('h3').textContent;
            const added = await window.cartManager?.add({
                productId: Number(product.dataset.productId),
                productName,
                unitPrice: Number(product.dataset.productPrice)
            });

            if (!added) {
                return;
            }

            notifications.success(`✓ ${productName} adicionado ao carrinho!`);
        });
    });
});

// Write your JavaScript code.
