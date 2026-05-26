// Avisos simples usados nas ações do site.


class Avisos {
    constructor() {
        this.container = document.getElementById('notificationContainer');
    }

    show(message, type = 'info', duration = 4000) {
        const notification = document.createElement('div');
        notification.className = `notification-banner ${type}`;
        
        const content = document.createElement('div');
        content.className = 'notification-content';
        content.textContent = this.cleanMessage(message);
        
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

    cleanMessage(message) {
        return String(message || '').replace(/^[^\p{L}\p{N}]+\s*/u, '');
    }

    remove(notification) {
        notification.classList.add('hide');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 400);
    }

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

const avisos = new Avisos();

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

// Perfil e dados do usuário logado.

class PerfilUsuario {
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
                    window.registrosUsuario?.load();
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

        window.carrinho?.load();
        window.registrosUsuario?.load();
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
            avisos.info('Você foi desconectado.');
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

        window.carrinho?.clear();
        window.registrosUsuario?.clear();
    }
}

// Inicializar gerenciador de perfil global
const perfilUsuario = new PerfilUsuario();

class RegistrosUsuario {
    constructor() {
        this.ticketsList = document.getElementById('userTicketsList');
        this.ticketsEmpty = document.getElementById('userTicketsEmpty');
        this.appointmentsList = document.getElementById('userAppointmentsList');
        this.appointmentsEmpty = document.getElementById('userAppointmentsEmpty');
        this.purchasesList = document.getElementById('userPurchasesList');
        this.purchasesEmpty = document.getElementById('userPurchasesEmpty');
    }

    async load() {
        await Promise.all([
            this.loadList('/user-actions/tickets', this.ticketsList, this.ticketsEmpty, 'ingresso'),
            this.loadList('/user-actions/appointments', this.appointmentsList, this.appointmentsEmpty, 'agendamento'),
            this.loadPurchases()
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

    async loadPurchases() {
        if (!this.purchasesList || !this.purchasesEmpty) {
            return;
        }

        try {
            const response = await fetch('/user-actions/purchases', { credentials: 'same-origin' });
            if (response.status === 401) {
                this.clear();
                return;
            }

            if (!response.ok) {
                this.purchasesList.innerHTML = '';
                this.purchasesEmpty.textContent = 'Não foi possível carregar suas compras agora.';
                this.purchasesEmpty.hidden = false;
                return;
            }

            this.renderPurchases(await response.json());
        } catch {
            this.purchasesList.innerHTML = '';
            this.purchasesEmpty.textContent = 'Não foi possível carregar suas compras agora.';
            this.purchasesEmpty.hidden = false;
        }
    }

    renderPurchases(purchases) {
        this.purchasesList.innerHTML = '';
        this.purchasesEmpty.textContent = 'Nenhuma compra realizada.';
        this.purchasesEmpty.hidden = purchases.length > 0;

        purchases.forEach(purchase => {
            const row = document.createElement('article');
            row.className = 'user-record-card';

            const content = document.createElement('div');
            content.className = 'user-record-content';

            const title = document.createElement('strong');
            title.textContent = purchase.productName;

            const meta = document.createElement('span');
            meta.textContent = `${purchase.quantity}x ${purchase.productName} • ${formatCurrency(purchase.totalPrice)}`;

            const situation = document.createElement('span');
            situation.textContent = `Situação: ${purchase.situation}`;

            const status = document.createElement('span');
            status.className = `user-record-status ${this.getPurchaseStatusClass(purchase.status)}`;
            status.textContent = this.getPurchaseStatusLabel(purchase.status);

            content.appendChild(title);
            content.appendChild(meta);
            content.appendChild(situation);
            row.appendChild(content);
            row.appendChild(status);
            this.purchasesList.appendChild(row);
        });
    }

    getPurchaseStatusClass(status) {
        const normalized = String(status || '').toLowerCase();

        if (normalized.includes('transportadora')) {
            return 'is-shipping-contact';
        }

        if (normalized.includes('trânsito') || normalized.includes('transito')) {
            return 'is-in-transit';
        }

        if (normalized.includes('entregue')) {
            return 'is-delivered';
        }

        return 'is-available';
    }

    getPurchaseStatusLabel(status) {
        const normalized = String(status || '').toLowerCase();

        if (normalized.includes('transportadora')) {
            return 'Contatando transportadora';
        }

        if (normalized.includes('trânsito') || normalized.includes('transito')) {
            return 'Em trânsito';
        }

        if (normalized.includes('entregue')) {
            return 'Entregue';
        }

        return 'Confirmado';
    }

    clear() {
        if (this.ticketsList) {
            this.ticketsList.innerHTML = '';
        }

        if (this.appointmentsList) {
            this.appointmentsList.innerHTML = '';
        }

        if (this.purchasesList) {
            this.purchasesList.innerHTML = '';
        }

        if (this.ticketsEmpty) {
            this.ticketsEmpty.hidden = false;
        }

        if (this.appointmentsEmpty) {
            this.appointmentsEmpty.hidden = false;
        }

        if (this.purchasesEmpty) {
            this.purchasesEmpty.textContent = 'Nenhuma compra realizada.';
            this.purchasesEmpty.hidden = false;
        }
    }
}

class Pagamento {
    constructor() {
        this.modalEl = document.getElementById('paymentModal');
        this.form = document.getElementById('paymentForm');
        this.cardNumber = document.getElementById('paymentCardNumber');
        this.cardName = document.getElementById('paymentCardName');
        this.expiry = document.getElementById('paymentExpiry');
        this.cvv = document.getElementById('paymentCvv');
        this.cep = document.getElementById('paymentCep');
        this.cardIcon = document.getElementById('paymentCardIcon');
        this.confirmButton = document.getElementById('paymentConfirmButton');

        this.errors = {
            cardNumber: document.getElementById('paymentCardNumberError'),
            cardName: document.getElementById('paymentCardNameError'),
            expiry: document.getElementById('paymentExpiryError'),
            cvv: document.getElementById('paymentCvvError'),
            cep: document.getElementById('paymentCepError')
        };

        this.form?.addEventListener('submit', (event) => this.submit(event));
        this.cardNumber?.addEventListener('input', () => this.formatCardNumber());
        this.cardName?.addEventListener('input', () => this.formatCardName());
        this.expiry?.addEventListener('input', () => this.formatExpiry());
        this.cvv?.addEventListener('input', () => this.formatDigits(this.cvv, 3));
        this.cep?.addEventListener('input', () => this.formatCep());
    }

    open() {
        if (!this.modalEl) {
            return;
        }

        this.clearErrors();
        bootstrap.Modal.getOrCreateInstance(this.modalEl).show();
    }

    async submit(event) {
        event.preventDefault();

        if (!this.validate()) {
            return;
        }

        if (this.confirmButton) {
            this.confirmButton.disabled = true;
        }

        const completed = await window.carrinho?.completeCheckout();

        if (this.confirmButton) {
            this.confirmButton.disabled = false;
        }

        if (!completed) {
            return;
        }

        bootstrap.Modal.getOrCreateInstance(this.modalEl).hide();
        window.carrinho?.close();
        this.form?.reset();
        this.updateCardIcon('');
    }

    formatCardNumber() {
        const digits = this.onlyDigits(this.cardNumber.value).slice(0, 16);
        this.cardNumber.value = digits.replace(/(.{4})/g, '$1 ').trim();
        this.updateCardIcon(digits);
    }

    formatCardName() {
        this.cardName.value = this.cardName.value.replace(/[0-9]/g, '').slice(0, 60);
    }

    formatExpiry() {
        const digits = this.onlyDigits(this.expiry.value).slice(0, 4);
        this.expiry.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    }

    formatCep() {
        const digits = this.onlyDigits(this.cep.value).slice(0, 8);
        this.cep.value = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
    }

    formatDigits(input, maxLength) {
        input.value = this.onlyDigits(input.value).slice(0, maxLength);
    }

    validate() {
        this.clearErrors();

        const cardDigits = this.onlyDigits(this.cardNumber.value);
        const name = this.cardName.value.trim();
        const expiry = this.expiry.value.trim();
        const cvvDigits = this.onlyDigits(this.cvv.value);
        const cepDigits = this.onlyDigits(this.cep.value);
        let isValid = true;

        if (cardDigits.length !== 16) {
            this.setError('cardNumber', 'Número do cartão deve ter 16 dígitos');
            isValid = false;
        }

        if (name.length < 3 || name.length > 60) {
            this.setError('cardName', 'Nome deve ter entre 3 e 60 caracteres');
            isValid = false;
        }

        if (!/^\d{2}\/\d{2}$/.test(expiry)) {
            this.setError('expiry', 'Validade deve estar no formato MM/AA');
            isValid = false;
        }

        if (cvvDigits.length !== 3) {
            this.setError('cvv', 'CVV deve ter 3 dígitos');
            isValid = false;
        }

        if (cepDigits.length !== 8) {
            this.setError('cep', 'CEP inválido');
            isValid = false;
        }

        return isValid;
    }

    setError(field, message) {
        if (this.errors[field]) {
            this.errors[field].textContent = message;
        }
    }

    clearErrors() {
        Object.values(this.errors).forEach(error => {
            if (error) {
                error.textContent = '';
            }
        });
    }

    updateCardIcon(digits) {
        if (!this.cardIcon) {
            return;
        }

        if (digits.startsWith('4')) {
            this.cardIcon.textContent = 'VISA';
            return;
        }

        const prefix2 = Number(digits.slice(0, 2));
        const prefix4 = Number(digits.slice(0, 4));
        if ((prefix2 >= 51 && prefix2 <= 55) || (prefix4 >= 2221 && prefix4 <= 2720)) {
            this.cardIcon.textContent = 'MC';
            return;
        }

        this.cardIcon.textContent = 'CARD';
    }

    onlyDigits(value) {
        return String(value || '').replace(/\D/g, '');
    }
}

// Carrinho de compras.

class Carrinho {
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
            avisos.error('Faça login para adicionar produtos ao carrinho.');
            const authModal = document.getElementById('authModal');
            if (authModal) {
                bootstrap.Modal.getOrCreateInstance(authModal).show();
            }
            return false;
        }

        if (!response.ok) {
            avisos.error(await readApiMessage(response, 'Não foi possível adicionar o produto ao carrinho.'));
            return false;
        }

        this.render(await response.json());
        this.open();
        return true;
    }

    async checkout() {
        window.pagamento?.open();
    }

    async completeCheckout() {
        const response = await postJson('/cart/checkout');

        if (response.status === 401) {
            avisos.error('Faça login para finalizar a compra.');
            return false;
        }

        if (!response.ok) {
            avisos.error(await readApiMessage(response, 'Não foi possível finalizar a compra.'));
            return false;
        }

        this.render(await response.json());
        window.registrosUsuario?.load();
        avisos.success('Compra finalizada com sucesso!');
        return true;
    }

    async removeItem(itemId) {
        const response = await fetch(`/cart/items/${itemId}`, {
            method: 'DELETE',
            credentials: 'same-origin'
        });

        if (response.status === 401) {
            avisos.error('Faça login para remover produtos do carrinho.');
            return;
        }

        if (!response.ok) {
            avisos.error(await readApiMessage(response, 'Não foi possível remover o produto do carrinho.'));
            return;
        }

        this.render(await response.json());
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
            this.checkoutButton.hidden = this.cart.count === 0;
        }

        const totalRow = this.totalEl?.closest('.cart-total-row');
        if (totalRow) {
            totalRow.hidden = this.cart.count === 0;
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

            const removeButton = document.createElement('button');
            removeButton.className = 'cart-item-remove';
            removeButton.type = 'button';
            removeButton.setAttribute('aria-label', `Remover ${item.productName} do carrinho`);
            removeButton.title = 'Remover';
            removeButton.textContent = '×';
            removeButton.addEventListener('click', () => this.removeItem(item.id));

            const actions = document.createElement('div');
            actions.className = 'cart-item-actions';
            actions.appendChild(subtotal);
            actions.appendChild(removeButton);

            details.appendChild(name);
            details.appendChild(price);
            row.appendChild(details);
            row.appendChild(actions);
            this.itemsEl.appendChild(row);
        });
    }
}

// Formulários da página.

document.addEventListener('DOMContentLoaded', function() {
    window.registrosUsuario = new RegistrosUsuario();
    window.pagamento = new Pagamento();
    window.carrinho = new Carrinho();

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
                avisos.error('CPF deve ter exatamente 11 dígitos!');
                return;
            }
            
            // Validar se é apenas números
            if (!/^\d+$/.test(cpf)) {
                avisos.error('CPF deve conter apenas números!');
                return;
            }

            if (password.length < 6) {
                avisos.error('A senha deve ter pelo menos 6 caracteres!');
                return;
            }
            
            const response = await postJson('/auth/register', {
                name: userName,
                cpf: cpf,
                email: emailInput ? emailInput.value : '',
                password: password
            });

            if (!response.ok) {
                avisos.error(await readApiMessage(response, 'Não foi possível concluir o cadastro.'));
                return;
            }

            avisos.success('Cadastro concluído com sucesso! Faça login para continuar.');
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
                avisos.error(await readApiMessage(response, 'Email ou senha incorretos.'));
                return;
            }
            
            const user = await response.json();
            perfilUsuario.saveUserProfile(user.name, true);
            window.carrinho?.load();
            
            avisos.success('Login concluído com sucesso!');
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
            avisos.error('Você precisa estar logado para continuar!');
            return false;
        }

        if (!response.ok) {
            avisos.error(await readApiMessage(response, fallbackMessage));
            return false;
        }

        return true;
    }

    const exposicoes = {
        'Arte Contemporânea': { inicio: '2026-05-15', fim: '2026-06-30' },
        'Modernismo Brasileiro': { inicio: '2026-07-01', fim: '2026-08-15' },
        'Fotografia Urbana': { inicio: '2026-08-20', fim: '2026-09-30' }
    };

    function prepararData(select, dateInput) {
        if (!select || !dateInput) {
            return;
        }

        const exposicao = exposicoes[select.value];
        dateInput.value = '';

        if (!exposicao) {
            dateInput.type = 'text';
            dateInput.placeholder = 'Selecione uma exposição primeiro';
            dateInput.disabled = true;
            dateInput.removeAttribute('min');
            dateInput.removeAttribute('max');
            return;
        }

        dateInput.type = 'date';
        dateInput.placeholder = '';
        dateInput.disabled = false;
        dateInput.min = exposicao.inicio;
        dateInput.max = exposicao.fim;
    }

    function dataValida(exposicaoNome, data) {
        const exposicao = exposicoes[exposicaoNome];
        return Boolean(exposicao && data && data >= exposicao.inicio && data <= exposicao.fim);
    }

    // Formulário de Compra de Ingressos - REQUER LOGIN
    const ticketForm = document.getElementById('ticketForm');
    if (ticketForm) {
        const exhibitionSelect = document.getElementById('ticketExhibition');
        const dateInput = document.getElementById('ticketVisitDate');
        exhibitionSelect?.addEventListener('change', () => prepararData(exhibitionSelect, dateInput));
        prepararData(exhibitionSelect, dateInput);

        ticketForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const quantityInput = this.querySelector('input[type="number"]');
            const eventName = exhibitionSelect ? exhibitionSelect.value : '';
            const visitDate = dateInput ? dateInput.value : '';

            if (!dataValida(eventName, visitDate)) {
                avisos.error('Escolha uma data dentro do período da exposição.');
                return;
            }

            const response = await postJson('/user-actions/tickets', {
                visitDate,
                quantity: quantityInput ? Number(quantityInput.value) : 1,
                eventName
            });
            if (!await ensureAuthenticatedResponse(response, 'Não foi possível comprar o ingresso.')) {
                return;
            }
            
            avisos.success('Ingresso comprado com sucesso!');
            window.registrosUsuario?.load();
            setTimeout(() => {
                ticketForm.reset();
                prepararData(exhibitionSelect, dateInput);
            }, 500);
        });
    }

    // Formulário de Agendamento de Visita - REQUER LOGIN
    const agendaForm = document.getElementById('agendaForm');
    if (agendaForm) {
        const exhibitionSelect = document.getElementById('agendaExhibition');
        const dateInput = document.getElementById('agendaVisitDate');
        exhibitionSelect?.addEventListener('change', () => prepararData(exhibitionSelect, dateInput));
        prepararData(exhibitionSelect, dateInput);

        agendaForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const eventName = exhibitionSelect ? exhibitionSelect.value : '';
            const visitDate = dateInput ? dateInput.value : '';

            if (!dataValida(eventName, visitDate)) {
                avisos.error('Escolha uma data dentro do período da exposição.');
                return;
            }

            const response = await postJson('/user-actions/appointments', {
                visitDate,
                eventName
            });
            if (!await ensureAuthenticatedResponse(response, 'Não foi possível agendar a visita.')) {
                return;
            }
            
            avisos.success('Visita agendada com sucesso!');
            window.registrosUsuario?.load();
            setTimeout(() => {
                agendaForm.reset();
                prepararData(exhibitionSelect, dateInput);
            }, 500);
        });
    }

    // Botões de compra da loja - REQUER LOGIN
    const shopButtons = document.querySelectorAll('.product button');
    shopButtons.forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();

            const product = this.closest('.product');
            const productName = product.dataset.productName || product.querySelector('h3').textContent;
            await window.carrinho?.add({
                productId: Number(product.dataset.productId),
                productName,
                unitPrice: Number(product.dataset.productPrice)
            });
        });
    });
});

// Write your JavaScript code.
