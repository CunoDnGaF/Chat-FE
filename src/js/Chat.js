import ChatAPI from "./api/ChatAPI";

export default class Chat {
  constructor(container) {
    this.container = container;
    this.websocket = null;
    this.user = null;
  }

  init() {
    this.onEnterChatHandler();
    this.registerEvents();
  }

  start() {
    const api = new ChatAPI('new-user');
    const modal = this.container.querySelector('.modal');
    const chatContainer = this.container.querySelector('.chat-container');
    const modalButton = this.container.querySelector('.modal-button');

    modalButton.addEventListener('click', async () => {
      const nickName = this.container.querySelector('.nickname-input').value;

      if(!nickName) {
        alert('Please enter a nickname');
        return;
      }

      try{
        const result = await api.createNewUser(nickName);

        if(result.status === 'ok') {
          modal.classList.add('unactive');
          chatContainer.classList.remove('unactive');
          this.user = nickName;
          this.init();
        } else {
          alert(result.message);
        }
      } catch(e) {
        alert(e);
      }
    });
  }

  registerEvents() {
    window.addEventListener('beforeunload', () => this.exitChat());
    
    this.messageForm = this.container.querySelector('.message-form');

    this.messageForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.sendMessage();
    });
  }

  onEnterChatHandler() {
    this.websocket = new WebSocket('ws://chat-be-jgtb.onrender.com/ws');
    this.subscribeOnEvents();
  }

  subscribeOnEvents() {
    this.websocket.addEventListener('message', (e) => {
      const message = JSON.parse(e.data);

    if (!message.type) {
      this.updateUserList(message);
    }
    if (message.type === 'send') {
      this.renderMessage(message);
    }
    });
  }

  sendMessage() {
    const message = this.container.querySelector('.message-field').value;
    
    if(!message) {
      return;
    }

    let data = {
      type: 'send',
      message: {text: message, time: new Date()},
      user: this.user
    };

    this.websocket.send(JSON.stringify(data));
    
    this.container.querySelector('.message-field').value = '';
  }

  renderMessage({ user, message }) {
    const name = user;
    const { text, time } = message;
    let messageOwner;

    const messageBody = document.createElement('div');
    messageBody.classList.add('message');

    if(name === this.user){
      messageOwner = 'You'
      messageBody.classList.add('you');
    } else {
      messageOwner = name;
    }

    messageBody.innerHTML = `
    <div class="message-header">
      <span class="message-owner">${messageOwner}</span>
      <span class="message-date">${new Date(time).toLocaleString('ru-RU')}</span>
    </div>
    <span class="message-content">${text}</span>
    `;

    this.chatScreen = this.container.querySelector('.chat-screen');
    this.chatScreen.append(messageBody);
  }

  updateUserList(users) {
    const userList = this.container.querySelector('.chat-users');

    userList.innerHTML = users.map((user) => {
        let userName;

        if(user.name === this.user){
          userName = 'You'
        } else {
          userName = user.name;
        }

        return `
        <div class="user">
          <div class="user-photo">
          </div>
          <span class="user-name">${userName}</span>
        </div>
    `;
      }).join('');
  }

  exitChat() {
    const data = {
      type: 'exit',
      user: this.user,
    };
    this.websocket.send(JSON.stringify(data));
  }
}