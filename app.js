let currentUser = null;
let selectedFriend = null;

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || {};
}

function signup() {
  const username = usernameInput().value;
  const password = passwordInput().value;
  let users = getUsers();

  if (users[username]) return alert("User exists!");

  users[username] = {
    password,
    friends: [],
    pinned: [],
    blocked: [],
    messages: {},
    notes: {},
    plus: false,
    theme: "default"
  };

  saveUsers(users);
  alert("Signed up!");
}

function login() {
  const username = usernameInput().value;
  const password = passwordInput().value;
  let users = getUsers();

  if (users[username]?.password !== password) {
    alert("Wrong login!");
    return;
  }

  currentUser = username;
  document.getElementById("auth-section").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
  refreshUI();
}

function logout() {
  currentUser = null;
  location.reload();
}

function usernameInput() {
  return document.getElementById("username");
}

function passwordInput() {
  return document.getElementById("password");
}

function refreshUI() {
  const users = getUsers();
  const user = users[currentUser];

  // Theme
  document.body.className = user.theme || "default";
  document.getElementById("theme-select").value = user.theme;

  // Title
  const title = document.getElementById("title");
  title.innerText = user.plus ? "ChatSpace⁺" : "ChatSpace";
  title.classList.toggle("plus", user.plus);

  // Perk UI
  document.getElementById("theme-select").classList.toggle("hidden", !user.plus);
  document.getElementById("quick-replies").classList.toggle("hidden", !user.plus);

  // Friends
  const flist = document.getElementById("friends-list");
  flist.innerHTML = "";
  const pinned = user.pinned || [];

  const all = [...pinned.map(f => ({ name: f, pinned: true })), ...user.friends.filter(f => !pinned.includes(f)).map(f => ({ name: f }))];

  all.forEach(friend => {
    const li = document.createElement("li");
    li.className = "friend-entry";
    li.innerHTML = `
      <span class="${friend.pinned ? 'pinned' : ''}" onclick="openChat('${friend.name}')">${friend.name} ${user.plus ? '⁺' : ''}</span>
      ${user.plus ? `<button onclick="togglePin('${friend.name}')">📌</button>` : ''}
    `;
    flist.appendChild(li);
  });

  // Blocked
  const blist = document.getElementById("blocked-list");
  blist.innerHTML = "";
  user.blocked.forEach(b => {
    const li = document.createElement("li");
    li.innerText = b;
    blist.appendChild(li);
  });
}

function addFriend() {
  const username = document.getElementById("add-user").value;
  let users = getUsers();

  if (!users[username] || username === currentUser) return alert("Invalid user.");
  if (users[currentUser].blocked.includes(username)) return alert("User is blocked.");

  if (!users[currentUser].friends.includes(username)) {
    users[currentUser].friends.push(username);
    saveUsers(users);
    refreshUI();
  }
}

function openChat(friend) {
  selectedFriend = friend;
  document.getElementById("chat-user").innerText = "Chatting with " + friend;
  loadMessages();

  const users = getUsers();
  const user = users[currentUser];
  const noteField = document.getElementById("friend-note");

  if (user.plus) {
    noteField.classList.remove("hidden");
    noteField.value = user.notes[friend] || "";
    noteField.oninput = () => {
      user.notes[friend] = noteField.value;
      saveUsers(users);
    };
  } else {
    noteField.classList.add("hidden");
  }
}

function loadMessages() {
  const users = getUsers();
  const messages = users[currentUser].messages[selectedFriend] || [];

  const msgDiv = document.getElementById("messages");
  msgDiv.innerHTML = "";

  messages.forEach(msg => {
    const div = document.createElement("div");
    div.innerText = `${msg.from}: ${msg.text}`;
    msgDiv.appendChild(div);
  });
}

function sendMessage() {
  const input = document.getElementById("message-input");
  const text = input.value.trim();
  if (!selectedFriend || !text) return;

  const users = getUsers();
  const user = users[currentUser];

  const limit = user.plus ? 500 : 100;
  if (text.length > limit) return alert("Message too long!");

  users[currentUser].messages[selectedFriend] = users[currentUser].messages[selectedFriend] || [];
  users[selectedFriend].messages[currentUser] = users[selectedFriend].messages[currentUser] || [];

  const msg = { from: currentUser, text };
  users[currentUser].messages[selectedFriend].push(msg);
  users[selectedFriend].messages[currentUser].push(msg);

  saveUsers(users);
  input.value = "";
  loadMessages();
}

function quickReply(text) {
  document.getElementById("message-input").value = text;
}

function activatePlus() {
  const users = getUsers();
  users[currentUser].plus = true;
  saveUsers(users);
  refreshUI();
  alert("Plus Activated!");
}

function togglePin(friend) {
  const users = getUsers();
  const user = users[currentUser];
  user.pinned = user.pinned || [];
  const index = user.pinned.indexOf(friend);

  if (index >= 0) user.pinned.splice(index, 1);
  else user.pinned.push(friend);

  saveUsers(users);
  refreshUI();
}

function setTheme(theme) {
  const users = getUsers();
  users[currentUser].theme = theme;
  saveUsers(users);
  refreshUI();
}
