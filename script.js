// Helper to get and save users
function getUsers() {
  return JSON.parse(localStorage.getItem('users') || '{}');
}

function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

function getCurrentUser() {
  return localStorage.getItem('currentUser');
}

function setCurrentUser(username) {
  localStorage.setItem('currentUser', username);
}

function logout() {
  localStorage.removeItem('currentUser');
  location.href = 'login.html';
}

// Sign-up logic
const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.onsubmit = e => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    const users = getUsers();
    if (users[username]) return alert('Username already exists.');

    users[username] = {
      email,
      password,
      friends: [],
      blocked: [],
      plus: false,
      theme: 'default',
      pinned: [],
      notes: {}
    };
    saveUsers(users);
    alert('Account created! Please log in.');
    location.href = 'login.html';
  };
}

// Login logic
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.onsubmit = e => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const users = getUsers();

    if (!users[username] || users[username].password !== password)
      return alert('Invalid credentials.');

    setCurrentUser(username);
    location.href = 'dashboard.html';
  };
}

// Dashboard setup
if (location.pathname.includes('dashboard.html')) {
  const currentUser = getCurrentUser();
  if (!currentUser) location.href = 'login.html';

  const users = getUsers();
  const user = users[currentUser];
  document.getElementById('welcomeUser').textContent = `Welcome, ${currentUser}${user.plus ? '⁺' : ''}`;

  const friendsList = document.getElementById('friendsList');
  user.pinned.concat(user.friends.filter(f => !user.pinned.includes(f))).forEach(friend => {
    const li = document.createElement('li');
    li.textContent = `${friend}${users[friend]?.plus ? '⁺' : ''}`;
    li.onclick = () => localStorage.setItem('chatWith', friend);
    friendsList.appendChild(li);
  });
}

// Add friend
function addFriend() {
  const users = getUsers();
  const currentUser = getCurrentUser();
  const input = document.getElementById('addFriendInput').value.trim();
  if (!users[input]) return alert('User not found.');
  if (input === currentUser) return alert('You cannot add yourself.');
  const user = users[currentUser];
  if (user.friends.includes(input)) return alert('Already friends.');
  user.friends.push(input);
  saveUsers(users);
  alert('Friend added!');
  location.reload();
}

// Settings
if (location.pathname.includes('settings.html')) {
  const currentUser = getCurrentUser();
  const users = getUsers();
  const user = users[currentUser];

  document.getElementById('themeSelector').value = user.theme;
  setTheme(user.theme);

  window.setTheme = function () {
    const theme = document.getElementById('themeSelector').value;
    document.body.className = theme;
    user.theme = theme;
    saveUsers(users);
  };

  window.changeUsername = function () {
    const newUsername = document.getElementById('newUsername').value.trim();
    if (!newUsername || newUsername === currentUser) return;
    if (users[newUsername]) return alert('Username taken.');

    users[newUsername] = { ...user };
    delete users[currentUser];
    saveUsers(users);
    setCurrentUser(newUsername);
    alert('Username changed!');
    location.href = 'dashboard.html';
  };

  window.togglePlus = function () {
    user.plus = true;
    saveUsers(users);
    alert('Plus mode activated!');
  };
}

// Chat logic
if (location.pathname.includes('chat.html')) {
  const currentUser = getCurrentUser();
  const users = getUsers();
  const user = users[currentUser];
  const chatWith = localStorage.getItem('chatWith');
  const chatInput = document.getElementById('chatInput');
  const chatBox = document.getElementById('chatBox');
  const select = document.getElementById('chatWith');
  const quickReplies = document.getElementById('quickReplies');

  user.friends.forEach(f => {
    const opt = document.createElement('option');
    opt.value = f;
    opt.textContent = f;
    if (f === chatWith) opt.selected = true;
    select.appendChild(opt);
  });

  function loadMessages() {
    const friend = select.value;
    const convoKey = [currentUser, friend].sort().join('_');
    const messages = JSON.parse(localStorage.getItem(`chat_${convoKey}`) || '[]');
    chatBox.innerHTML = messages.map(m => `<p><strong>${m.sender}:</strong> ${m.text}</p>`).join('');
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  window.sendMessage = function () {
    const friend = select.value;
    if (!friend) return;

    const text = chatInput.value.trim();
    if (!text) return;

    const convoKey = [currentUser, friend].sort().join('_');
    const messages = JSON.parse(localStorage.getItem(`chat_${convoKey}`) || '[]');
    const maxLen = user.plus ? 500 : 100;
    if (text.length > maxLen) return alert(`Max ${maxLen} chars`);

    messages.push({ sender: currentUser, text });
    localStorage.setItem(`chat_${convoKey}`, JSON.stringify(messages));
    chatInput.value = '';
    loadMessages();
  };

  if (user.plus) {
    ['brb', 'gtg', 'lol', 'ty'].forEach(reply => {
      const btn = document.createElement('button');
      btn.textContent = reply;
      btn.onclick = () => {
        chatInput.value = reply;
        sendMessage();
      };
      quickReplies.appendChild(btn);
    });
  }

  select.onchange = loadMessages;
  loadMessages();
}

// Apply theme on load
(function () {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  const users = getUsers();
  const theme = users[currentUser]?.theme || 'default';
  document.body.className = theme;
})();
