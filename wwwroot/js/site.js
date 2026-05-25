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

// ============================================
// USER PROFILE MANAGEMENT
// ============================================

class UserProfileManager {
    constructor() {
        this.profileIcon = document.getElementById('userProfileIcon');
        this.userNameEl = document.getElementById('userName');
        this.logoutBtn = document.getElementById('logoutBtn');
        
        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', () => this.logout());
        }
        
        this.loadUserProfile();
    }

    /**
     * Salva o perfil do usuário APÓS LOGIN (não após cadastro)
     */
    saveUserProfile(name, isLogin = false) {
        if (name && name.trim()) {
            localStorage.setItem('auroraUser', JSON.stringify({
                name: name.trim(),
                timestamp: new Date().toISOString(),
                isLoggedIn: isLogin
            }));
            
            // Só exibe o ícone se for login
            if (isLogin) {
                this.displayUserProfile(name.trim());
            }
        }
    }

    /**
     * Carrega o perfil do usuário (ao abrir página)
     * Só exibe se estava com login anterior
     */
    loadUserProfile() {
        const userData = localStorage.getItem('auroraUser');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                // Só mostra se tiver isLoggedIn = true
                if (user.isLoggedIn) {
                    this.displayUserProfile(user.name);
                }
            } catch (e) {
                console.log('Erro ao carregar perfil:', e);
            }
        }
    }

    /**
     * Exibe o perfil do usuário (ícone fixo)
     */
    displayUserProfile(name) {
        if (this.profileIcon && this.userNameEl) {
            this.userNameEl.textContent = name;
            this.profileIcon.style.display = 'flex';
        }
    }

    /**
     * Remove o perfil do usuário (logout)
     */
    logout() {
        if (this.profileIcon) {
            this.profileIcon.classList.add('hide-profile');
            setTimeout(() => {
                localStorage.removeItem('auroraUser');
                this.profileIcon.style.display = 'none';
                this.profileIcon.classList.remove('hide-profile');
                this.userNameEl.textContent = '';
                notifications.info('Você foi desconectado.');
            }, 400);
        }
    }
}

// Inicializar gerenciador de perfil global
const userProfile = new UserProfileManager();

// ============================================
// EVENT LISTENERS PARA FORMULÁRIOS
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Formulário de Cadastro - NÃO mostra ícone
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Obter dados do formulário
            const nameInput = this.querySelector('input[type="text"]');
            const cpfInput = document.getElementById('cpfInput');
            const emailInput = this.querySelector('input[type="email"]');
            const userName = nameInput ? nameInput.value : 'Usuário';
            const cpf = cpfInput ? cpfInput.value : '';
            
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
            
            // Salvar APENAS como cadastro (não mostra ícone)
            localStorage.setItem('auroraUserCadastro', JSON.stringify({
                name: userName.trim(),
                cpf: cpf,
                email: emailInput ? emailInput.value : '',
                timestamp: new Date().toISOString()
            }));
            
            notifications.success('✓ Cadastro concluído com sucesso!');
            setTimeout(() => registerForm.reset(), 500);
        });
    }

    // Formulário de Login - MOSTRA ícone
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Obter o email 
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput ? emailInput.value : 'Usuário';
            
            // Verificar se tem cadastro anterior
            const cadastroData = localStorage.getItem('auroraUserCadastro');
            let userName = email.split('@')[0];
            
            if (cadastroData) {
                try {
                    const cadastro = JSON.parse(cadastroData);
                    userName = cadastro.name;
                } catch (e) {
                    console.log('Erro ao ler cadastro:', e);
                }
            }
            
            // AGORA sim, salvar com isLoggedIn = true
            userProfile.saveUserProfile(userName, true);
            
            notifications.success('✓ Login concluído com sucesso!');
            setTimeout(() => loginForm.reset(), 500);
        });
    }

    // Função auxiliar: verificar se usuário está logado
    function isUserLoggedIn() {
        const userData = localStorage.getItem('auroraUser');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                return user.isLoggedIn === true;
            } catch (e) {
                return false;
            }
        }
        return false;
    }

    // Formulário de Compra de Ingressos - REQUER LOGIN
    const ticketForm = document.getElementById('ticketForm');
    if (ticketForm) {
        ticketForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!isUserLoggedIn()) {
                notifications.error('❌ Você precisa estar logado para comprar ingressos!');
                return;
            }
            
            notifications.success('✓ Ingresso comprado com sucesso!');
            setTimeout(() => ticketForm.reset(), 500);
        });
    }

    // Formulário de Agendamento de Visita - REQUER LOGIN
    const agendaForm = document.getElementById('agendaForm');
    if (agendaForm) {
        agendaForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!isUserLoggedIn()) {
                notifications.error('❌ Você precisa estar logado para agendar uma visita!');
                return;
            }
            
            notifications.success('✓ Visita agendada com sucesso!');
            setTimeout(() => agendaForm.reset(), 500);
        });
    }

    // Botões de compra da loja - REQUER LOGIN
    const shopButtons = document.querySelectorAll('.product button');
    shopButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (!isUserLoggedIn()) {
                notifications.error('❌ Você precisa estar logado para comprar na loja!');
                return;
            }
            
            const productName = this.closest('.product').querySelector('h3').textContent;
            notifications.success(`✓ ${productName} adicionado ao carrinho!`);
        });
    });
});

// Write your JavaScript code.
