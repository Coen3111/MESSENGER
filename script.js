// Utility functions
function getUsers() {
  return JSON.parse(localStorage.getItem('users')) || [];
}

function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem('currentUser'));
}

function setCurrentUser(user) {
  localStorage.setItem('currentUser', JSON.stringify(user));
}

// Authentication
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const logoutBtn = document.getElementById('logoutBtn');

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('loginUsername').value;
      const password = document.getElementById('loginPassword').value;
      const users = getUsers();
      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
        setCurrentUser(user);
        window.location.href = 'dashboard.html';
      } else {
        alert('Invalid credentials');
      }
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('signupUsername').value;
      const password = document.getElementById('signupPassword').value;
      let users = getUsers();
      if (users.find(u => u.username === username)) {
        alert('Username already exists');
        return;
      }
      const newUser = { username, password, friends: [], messages: {}, settings: { plus: false, theme: 'light' } };
      users.push(newUser);
      saveUsers(users);
      setCurrentUser(newUser);
      window.location.href = 'dashboard.html';
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('currentUser');
      window.location.href = 'login.html';
    });
  }

  // Dashboard functionality
  const addFriendBtn = document.getElementById('addFriendBtn');
  const friendsList = document.getElementById('friendsList');
  const chatWindow = document.getElementById('chatWindow');
  const chatWith = document.getElementById('chatWith');
  const sendBtn = document.getElementById('sendBtn');
  const messageInput = document.getElementById('messageInput');
  const quickReplies = document.getElementById('quickReplies');

  if (addFriendBtn) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      window.location.href = 'login.html';
      return;
    }

    // Load friends
    function loadFriends() {
      friendsList.innerHTML = '';
      currentUser.friends.forEach(friend => {
        const li = document.createElement('li');
        li.textContent = friend;
        li.addEventListener('click', () => {
          chatWith.textContent = `Chat with ${friend}`;
          loadMessages(friend);
        });
        friendsList.appendChild(li);
      });
    }

    loadFriends();

    addFriendBtn.addEventListener('click', () => {
      const friendUsername = document.getElementById('addFriendInput').value;
      const users = getUsers();
      const friend = users.find(u => u.username === friendUsername);
      if (!friend) {
        alert('User not found');
        return;
      }
      if (friendUsername === currentUser.username) {
        alert('Cannot add yourself
::contentReference[oaicite:0]{index=0}
 
