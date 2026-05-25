# Sistema de Notificações - AuroraGaleria

## Visão Geral

O sistema de notificações foi implementado para fornecer feedback visual ao usuário em ações importantes como cadastro, login, compra de ingressos e agendamento de visitas.

## Características

✅ **Animações suaves** - Transições deslizantes e elegantes  
✅ **Responsivo** - Funciona em qualquer tamanho de tela  
✅ **Múltiplos tipos** - Success, Error, Warning, Info  
✅ **Auto-fechamento** - Desaparece automaticamente após timeout  
✅ **Fechamento manual** - Botão X para fechar manualmente  
✅ **Posicionamento fixo** - Sempre visível, aparece no topo direito  

## Tipos de Notificação

### 🟢 Success (Verde)
Usado para ações bem-sucedidas.
```javascript
notifications.success('Cadastro concluído com sucesso!');
```

### 🔴 Error (Vermelho)
Usado para erros e falhas.
```javascript
notifications.error('Erro ao realizar o cadastro!');
```

### 🟡 Warning (Amarelo)
Usado para alertas e avisos.
```javascript
notifications.warning('Verifique seus dados!');
```

### 🔵 Info (Azul)
Usado para informações gerais.
```javascript
notifications.info('Processando sua solicitação...');
```

## Uso

### Uso Básico

```javascript
// Notificação de sucesso que desaparece em 4 segundos (padrão)
notifications.success('Operação realizada com sucesso!');

// Notificação que não desaparece automaticamente
notifications.show('Mensagem', 'info', 0);

// Notificação customizada com duração
notifications.show('Mensagem customizada', 'success', 6000);
```

### Em Formulários

As notificações já estão configuradas para os seguintes formulários:

1. **Cadastro** - Exibe "✓ Cadastro concluído com sucesso!"
2. **Login** - Exibe "✓ Login concluído com sucesso!"
3. **Compra de Ingressos** - Exibe "✓ Ingresso comprado com sucesso!"
4. **Agendamento de Visita** - Exibe "✓ Visita agendada com sucesso!"
5. **Compra de Produtos** - Exibe "✓ [Nome do Produto] adicionado ao carrinho!"

### Usar em Controladores (C#)

Para passar mensagens do servidor:

```csharp
// No Controller
ViewBag.Notification = new {
    Message = "Cadastro realizado com sucesso!",
    Type = "success" // success, error, warning, info
};
```

```html
<!-- No View -->
@if (ViewBag.Notification != null) {
    <script>
        notifications.@ViewBag.Notification.Type('@ViewBag.Notification.Message');
    </script>
}
```

## Estrutura HTML

O container de notificações está localizado em `_Layout.cshtml`:

```html
<div id="notificationContainer" class="notification-container"></div>
```

## Estilos CSS

Os estilos estão em `site.css`:

- `.notification-container` - Posicionamento e layout do container
- `.notification-banner` - Estilos gerais do banner
- `.notification-banner.success` - Estilos para notificação de sucesso
- `.notification-banner.error` - Estilos para notificação de erro
- `.notification-banner.warning` - Estilos para notificação de aviso
- `.notification-banner.info` - Estilos para notificação de informação
- Animações: `slideIn` e `slideOut`

## Duração Padrão

- Success: 4000ms (4 segundos)
- Error: 5000ms (5 segundos)
- Warning: 4000ms (4 segundos)
- Info: 3000ms (3 segundos)

## Customização

Para alterar as durações padrão, edite o arquivo `site.js`:

```javascript
success(message, duration = 4000) { // Altere 4000 para o valor desejado
    return this.show(message, 'success', duration);
}
```

Para alterar cores e estilos, edite as classes CSS em `site.css`:

```css
.notification-banner.success {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    /* Altere as cores aqui */
}
```

## Responsividade

O sistema é totalmente responsivo:
- **Desktop**: Notificação aparece no canto superior direito
- **Mobile**: Notificação se adapta ao tamanho da tela (margem esquerda e direita)

## Troubleshooting

**Notificação não aparece?**
- Verifique se o `#notificationContainer` existe no HTML
- Verifique se o `site.js` está carregado antes de usar
- Abra o console (F12) para verificar erros

**Notificação não fecha?**
- Se `duration = 0`, a notificação não fecha automaticamente
- Clique no botão X para fechar manualmente
- Ou defina uma duração: `notifications.success('Msg', 3000)`

**Estilos não aparecem?**
- Verifique se o `site.css` está sendo carregado
- Limpe o cache do navegador (Ctrl + Shift + Delete)
