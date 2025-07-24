// Save user on register
document.getElementById("registerForm")?.addEventListener("submit", function (e) {
  e.preventDefault();
  const username = document.getElementById("regUsername").value;
  const password = document.getElementById("regPassword").value;
  localStorage.setItem("user", JSON.stringify({ username, password }));
  alert("Registered successfully!");
  window.location.href = "login.html";
});

// Validate login
document.getElementById("loginForm")?.addEventListener("submit", function (e) {
  e.preventDefault();
  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;
  const stored = JSON.parse(localStorage.getItem("user"));

  if (stored && username === stored.username && password === stored.password) {
    localStorage.setItem("loggedIn", "true");
    window.location.href = "dashboard.html";
  } else {
    document.getElementById("loginError").textContent = "Invalid login.";
  }
});

// Check login state
if (window.location.pathname.includes("dashboard.html") && localStorage.getItem("loggedIn") !== "true") {
  window.location.href = "login.html";
}

// Logout function
function logout() {
  localStorage.removeItem("loggedIn");
  window.location.href = "login.html";
}

// Save note
function saveNote() {
  const content = document.getElementById("noteEditor").innerHTML.trim();
  if (content) {
    const notes = JSON.parse(localStorage.getItem("notes")) || [];
    notes.push({ text: content, timestamp: new Date().toLocaleString() });
    localStorage.setItem("notes", JSON.stringify(notes));
    document.getElementById("noteEditor").innerHTML = "";
    displayNotes();
  }
}

// Display notes with edit/delete buttons
function displayNotes() {
  const notes = JSON.parse(localStorage.getItem("notes")) || [];
  const list = document.getElementById("notesList");
  if (!list) return;
  list.innerHTML = "";

  notes.forEach((note, index) => {
    const div = document.createElement("div");
    div.className = "col-12 mb-3";
    div.innerHTML = `
      <div class="card shadow-sm bg-light text-dark">
        <div class="card-body">
          <div contenteditable="false" class="note-text mb-2">${note.text}</div>
          <small class="text-muted">${note.timestamp}</small><br>
          <button class="btn btn-sm btn-outline-primary me-2" onclick="editNote(${index})">Edit</button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteNote(${index})">Delete</button>
        </div>
      </div>`;
    list.appendChild(div);
  });
}

// Edit note
function editNote(index) {
  const notes = JSON.parse(localStorage.getItem("notes")) || [];
  const newText = prompt("Edit your note:", notes[index].text.replace(/<[^>]*>?/gm, ""));
  if (newText !== null) {
    notes[index].text = newText;
    localStorage.setItem("notes", JSON.stringify(notes));
    displayNotes();
  }
}

// Delete note
function deleteNote(index) {
  const notes = JSON.parse(localStorage.getItem("notes")) || [];
  if (confirm("Are you sure you want to delete this note?")) {
    notes.splice(index, 1);
    localStorage.setItem("notes", JSON.stringify(notes));
    displayNotes();
  }
}

// Toggle dark/light theme
function toggleTheme() {
  document.body.classList.toggle("dark-mode");
}

// Auto-show notes on dashboard
if (window.location.pathname.includes("dashboard.html")) {
  window.addEventListener("DOMContentLoaded", displayNotes);
}
