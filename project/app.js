// Config
const BACKEND_URL = "http://127.0.0.1:8000";

// Auth helpers
window.isAuthenticated = function() {
  return !!localStorage.getItem('auth');
};

window.saveAuth = function(token) {
  localStorage.setItem('auth', token);
};

window.clearAuth = function() {
  localStorage.removeItem('auth');
};

// Login
window.login = async function(e) {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorDiv = document.getElementById('loginError');
  errorDiv.innerText = '';
  try {
    const res = await fetch(`${BACKEND_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Login failed');
    }
    window.saveAuth('1'); // Just a flag; real auth is cookie-based
    window.location.href = 'index.html';
  } catch (err) {
    errorDiv.innerText = err.message;
  }
};

// Register
window.register = async function(e) {
  e.preventDefault();
  console.log("Register function called");
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const password_confirmation = document.getElementById('password_confirmation').value.trim();
  const errorDiv = document.getElementById('registerError');
  errorDiv.innerText = '';
  if (password !== password_confirmation) {
    errorDiv.innerText = 'Passwords do not match!';
    console.log("Passwords do not match");
    return;
  }
  try {
    console.log("Sending fetch to /register");
    const res = await fetch(`${BACKEND_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, password, password_confirmation })
    });
    console.log("Fetch complete, status:", res.status);
    if (!res.ok) {
      let data = {};
      try {
        data = await res.json();
      } catch (e) {}
      if (data.errors) {
        const messages = Object.values(data.errors).flat().join(' ');
        console.log("Validation errors:", messages);
        throw new Error(messages);
      }
      console.log("Other error:", data.message);
      throw new Error(data.message || 'Registration failed');
    }
    // Success: handle 204 No Content
    alert('Registration successful! Please log in.');
    console.log("Redirecting to login.html");
    window.location.href = 'login.html';
  } catch (err) {
    errorDiv.innerText = err.message;
    console.log("Caught error:", err.message);
  }
};

// Logout
window.logout = async function() {
  await fetch(`${BACKEND_URL}/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Accept': 'application/json' }
  });
  window.clearAuth();
  window.location.href = 'login.html';
};

// Notes
window.loadNotes = async function() {
  const notesList = document.getElementById('notesList');
  const errorDiv = document.getElementById('notesError');
  notesList.innerHTML = '';
  errorDiv.innerText = '';
  try {
    const res = await fetch(`${BACKEND_URL}/api/notes`, {
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
      if (res.status === 401) {
        window.clearAuth();
        window.location.href = 'login.html';
        return;
      }
      throw new Error('Failed to load notes');
    }
    const notes = await res.json();
    if (!Array.isArray(notes) || notes.length === 0) {
      notesList.innerHTML = '<li class="list-group-item text-muted">No notes yet.</li>';
      return;
    }
    notes.forEach(note => {
      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.innerText = note.content || note.body || JSON.stringify(note);
      notesList.appendChild(li);
    });
  } catch (err) {
    errorDiv.innerText = err.message;
  }
};

window.addNote = async function() {
  const noteContent = document.getElementById('noteContent').value.trim();
  const errorDiv = document.getElementById('notesError');
  errorDiv.innerText = '';
  if (!noteContent) {
    errorDiv.innerText = 'Note cannot be empty!';
    return;
  }
  try {
    const res = await fetch(`${BACKEND_URL}/api/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ content: noteContent })
    });
    if (!res.ok) {
      if (res.status === 401) {
        window.clearAuth();
        window.location.href = 'login.html';
        return;
      }
      throw new Error('Failed to add note');
    }
    document.getElementById('noteContent').value = '';
    window.loadNotes();
  } catch (err) {
    errorDiv.innerText = err.message;
  }
}; 