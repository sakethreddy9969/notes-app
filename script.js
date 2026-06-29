// Dynamic API URL: Use localhost when testing locally, otherwise use your deployed production HTTPS API.
const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:8000/api'
  : 'https://your-notes-api-backend.com/api'; // <-- Replace with your production Laravel HTTPS domain

// --- Toast System ---
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast-message ${type}`;
  
  let icon = 'fa-check-circle';
  if (type === 'error') icon = 'fa-exclamation-triangle';
  if (type === 'info') icon = 'fa-info-circle';

  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'toast-out 0.3s forwards';
    toast.addEventListener('animationend', () => toast.remove());
  }, 3000);
}

// --- Page Guarding & Redirection ---
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('notes_api_token');
  const path = window.location.pathname;

  // Restore theme preference
  const currentTheme = localStorage.getItem('theme');
  if (currentTheme === 'light') {
    document.body.classList.add('light-mode');
  }

  if (path.includes('dashboard.html')) {
    if (!token) {
      window.location.href = 'login.html';
      return;
    }
    // Load dashboard contents
    initDashboard();
  } else if (path.includes('login.html') || path.includes('register.html')) {
    if (token) {
      window.location.href = 'dashboard.html';
    }
  }
});

// --- Authentication Operations ---

// Register Form Submit
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  const passwordConfirm = document.getElementById('regPasswordConfirm').value;
  const submitBtn = document.getElementById('registerSubmitBtn');

  if (password !== passwordConfirm) {
    showToast('Passwords do not match.', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.querySelector('span').textContent = 'Registering...';

  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name,
        email,
        password,
        password_confirmation: passwordConfirm
      })
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.errors ? Object.values(data.errors).flat().join(' ') : (data.message || 'Registration failed.');
      throw new Error(errorMsg);
    }

    localStorage.setItem('notes_api_token', data.access_token);
    localStorage.setItem('notes_user', JSON.stringify(data.user));
    
    showToast('Registered successfully!');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1000);

  } catch (err) {
    showToast(err.message, 'error');
    submitBtn.disabled = false;
    submitBtn.querySelector('span').textContent = 'Register';
  }
});

// Login Form Submit
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const submitBtn = document.getElementById('loginSubmitBtn');

  submitBtn.disabled = true;
  submitBtn.querySelector('span').textContent = 'Logging in...';

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.errors ? Object.values(data.errors).flat().join(' ') : (data.message || 'Invalid credentials.');
      throw new Error(errorMsg);
    }

    localStorage.setItem('notes_api_token', data.access_token);
    localStorage.setItem('notes_user', JSON.stringify(data.user));

    showToast('Welcome back!');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1000);

  } catch (err) {
    showToast(err.message, 'error');
    submitBtn.disabled = false;
    submitBtn.querySelector('span').textContent = 'Login';
  }
});

// Logout Operation
async function logout() {
  const token = localStorage.getItem('notes_api_token');
  if (!token) {
    clearAuthAndRedirect();
    return;
  }

  showToast('Logging out...', 'info');

  try {
    await fetch(`${API_URL}/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
  } catch (err) {
    console.error('Logout API call failed:', err);
  } finally {
    clearAuthAndRedirect();
  }
}

function clearAuthAndRedirect() {
  localStorage.removeItem('notes_api_token');
  localStorage.removeItem('notes_user');
  window.location.href = 'login.html';
}

// --- Dashboard Operations ---

let allNotes = [];
let activeTagFilter = '';

function initDashboard() {
  // Set User Profile Display
  const user = JSON.parse(localStorage.getItem('notes_user') || '{}');
  document.getElementById('userNameLabel').textContent = user.name || 'User';
  document.getElementById('userEmailLabel').textContent = user.email || 'user@example.com';
  
  // Set Search Input event
  document.getElementById('searchInput')?.addEventListener('input', handleSearchAndFilters);

  // Fetch initial notes
  fetchNotes();
}

async function fetchNotes() {
  const token = localStorage.getItem('notes_api_token');
  const loadingState = document.getElementById('notesLoadingState');
  const emptyState = document.getElementById('emptyState');
  const notesList = document.getElementById('notesList');

  if (loadingState) loadingState.style.display = 'flex';
  if (emptyState) emptyState.style.display = 'none';
  if (notesList) notesList.style.display = 'none';

  try {
    const response = await fetch(`${API_URL}/notes`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        clearAuthAndRedirect();
        return;
      }
      throw new Error('Could not load notes.');
    }

    allNotes = await response.json();
    
    // Update Stats and Tag sidebar
    updateStatsAndSidebar();
    
    // Render list
    renderNotesGrid();

  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    if (loadingState) loadingState.style.display = 'none';
  }
}

function updateStatsAndSidebar() {
  const statTotal = document.getElementById('statTotal');
  const statPrivate = document.getElementById('statPrivate');
  const statPublic = document.getElementById('statPublic');
  const statTags = document.getElementById('statTags');
  const totalNotesBadge = document.getElementById('totalNotesBadge');

  if (statTotal) statTotal.textContent = allNotes.length;
  if (totalNotesBadge) totalNotesBadge.textContent = allNotes.length;

  const privateCount = allNotes.filter(n => n.visibility === 'private').length;
  const publicCount = allNotes.filter(n => n.visibility === 'public').length;
  
  if (statPrivate) statPrivate.textContent = privateCount;
  if (statPublic) statPublic.textContent = publicCount;

  // Extract unique tags and calculate occurrences
  const tagCounts = {};
  allNotes.forEach(note => {
    if (note.tags) {
      const tags = note.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
      tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });

  const uniqueTagsList = Object.keys(tagCounts);
  if (statTags) statTags.textContent = uniqueTagsList.length;

  // Update tag sidebar items
  const sidebarContainer = document.getElementById('tagFilterList');
  if (!sidebarContainer) return;

  // Keep the first item (Show All) and remove others
  const showAllItem = document.getElementById('tagFilterAll');
  sidebarContainer.innerHTML = '';
  if (showAllItem) sidebarContainer.appendChild(showAllItem);

  uniqueTagsList.sort().forEach(tag => {
    const item = document.createElement('div');
    item.className = `tag-filter-item ${activeTagFilter === tag ? 'active' : ''}`;
    item.onclick = () => filterByTag(tag);
    item.innerHTML = `
      <span>#${tag}</span>
      <span class="tag-filter-badge">${tagCounts[tag]}</span>
    `;
    sidebarContainer.appendChild(item);
  });
}

function renderNotesGrid() {
  const notesList = document.getElementById('notesList');
  const emptyState = document.getElementById('emptyState');
  if (!notesList) return;

  // Filter notes based on activeTagFilter and search query
  const query = document.getElementById('searchInput')?.value.toLowerCase() || '';
  
  const filtered = allNotes.filter(note => {
    // 1. Tag filter
    if (activeTagFilter) {
      if (!note.tags) return false;
      const tags = note.tags.split(',').map(t => t.trim().toLowerCase());
      if (!tags.includes(activeTagFilter)) return false;
    }
    // 2. Text Search Query
    if (query) {
      const titleMatch = note.title.toLowerCase().includes(query);
      const contentMatch = note.content.toLowerCase().includes(query);
      const tagMatch = note.tags ? note.tags.toLowerCase().includes(query) : false;
      return titleMatch || contentMatch || tagMatch;
    }
    return true;
  });

  if (filtered.length === 0) {
    notesList.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';
  notesList.style.display = 'grid';
  notesList.innerHTML = '';

  filtered.forEach(note => {
    const card = document.createElement('div');
    card.className = 'glass-panel note-card';
    
    // Process tags array
    const tagsHtml = note.tags 
      ? note.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => `<span class="tag-pill" onclick="filterByTag('${tag.toLowerCase()}'); event.stopPropagation();">#${tag}</span>`).join('') 
      : '';

    const isPublic = note.visibility === 'public';
    const badgeText = isPublic ? '<i class="fa-solid fa-globe"></i> Public' : '<i class="fa-solid fa-lock"></i> Private';
    const badgeClass = isPublic ? 'public' : 'private';
    const dateStr = new Date(note.created_at || note.timestamp).toLocaleDateString();

    card.innerHTML = `
      <div class="note-header">
        <h5 class="note-title">${escapeHTML(note.title)}</h5>
        <span class="note-badge ${badgeClass}">${badgeText}</span>
      </div>
      <div class="note-content">${note.content}</div>
      <div class="note-tags">${tagsHtml}</div>
      <div class="note-footer">
        <div class="note-date">Saved on ${dateStr}</div>
        <div class="note-actions">
          ${isPublic ? `<button class="btn-action share" title="Get share link" onclick="shareNote(${note.id}); event.stopPropagation();"><i class="fa-solid fa-share-nodes"></i></button>` : ''}
          <button class="btn-action edit" title="Edit Note" onclick="editNote(${note.id}); event.stopPropagation();"><i class="fa-solid fa-pen"></i></button>
          <button class="btn-action delete" title="Delete Note" onclick="deleteNote(${note.id}); event.stopPropagation();"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    `;

    notesList.appendChild(card);
  });
}

function handleSearchAndFilters() {
  renderNotesGrid();
}

function filterByTag(tag) {
  activeTagFilter = tag;
  
  // Update sidebar active classes
  const items = document.querySelectorAll('.tag-filter-item');
  items.forEach(item => {
    item.classList.remove('active');
  });

  if (!tag) {
    document.getElementById('tagFilterAll')?.classList.add('active');
  } else {
    // Find the tag item clicked
    const tagElements = Array.from(items);
    const match = tagElements.find(el => el.textContent.includes(`#${tag}`));
    if (match) match.classList.add('active');
  }

  renderNotesGrid();
}

// --- Note Create / Update / Delete Action ---

function createNewNoteBtnClick() {
  document.getElementById('editingNoteId').value = '';
  document.getElementById('editorTitle').textContent = 'Create Note';
  document.getElementById('noteTitle').value = '';
  quill.setContents([]);
  document.getElementById('tagsInput').value = '';
  document.getElementById('noteVisibility').value = 'private';
  
  const panel = document.getElementById('editorPanel');
  panel.style.display = 'block';
  panel.scrollIntoView({ behavior: 'smooth' });
}

function closeEditorPanel() {
  document.getElementById('editorPanel').style.display = 'none';
  document.getElementById('editingNoteId').value = '';
}

async function saveNote() {
  const token = localStorage.getItem('notes_api_token');
  const title = document.getElementById('noteTitle').value.trim();
  const content = quill.root.innerHTML.trim();
  const tags = document.getElementById('tagsInput').value.trim();
  const visibility = document.getElementById('noteVisibility').value;
  const noteId = document.getElementById('editingNoteId').value;
  const saveBtn = document.getElementById('saveNoteBtn');

  if (!title) {
    showToast('Note title is required.', 'error');
    return;
  }

  if (quill.getText().trim() === '') {
    showToast('Note content cannot be empty.', 'error');
    return;
  }

  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

  const isEditing = noteId !== '';
  const url = isEditing ? `${API_URL}/notes/${noteId}` : `${API_URL}/notes`;
  const method = isEditing ? 'PUT' : 'POST';

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ title, content, tags, visibility })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to save note.');
    }

    showToast(isEditing ? 'Note updated successfully!' : 'Note created successfully!');
    closeEditorPanel();
    fetchNotes();

  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Note';
  }
}

function editNote(id) {
  const note = allNotes.find(n => n.id === id);
  if (!note) return;

  document.getElementById('editingNoteId').value = note.id;
  document.getElementById('editorTitle').textContent = 'Edit Note';
  document.getElementById('noteTitle').value = note.title;
  quill.root.innerHTML = note.content;
  document.getElementById('tagsInput').value = note.tags || '';
  document.getElementById('noteVisibility').value = note.visibility;

  const panel = document.getElementById('editorPanel');
  panel.style.display = 'block';
  panel.scrollIntoView({ behavior: 'smooth' });
}

async function deleteNote(id) {
  if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
    return;
  }

  const token = localStorage.getItem('notes_api_token');
  showToast('Deleting note...', 'info');

  try {
    const response = await fetch(`${API_URL}/notes/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Could not delete note.');
    }

    showToast('Note deleted successfully.');
    fetchNotes();

  } catch (err) {
    showToast(err.message, 'error');
  }
}

// --- Public Share Modal Operations ---

function shareNote(id) {
  const modal = document.getElementById('shareModal');
  const input = document.getElementById('shareLinkInput');
  if (!modal || !input) return;

  // Build the public link pointing to view.html?id=XXX
  const shareLink = `${window.location.origin}/view.html?id=${id}`;
  input.value = shareLink;

  modal.classList.add('active');
}

function closeShareModal() {
  document.getElementById('shareModal')?.classList.remove('active');
}

function copyShareLink() {
  const input = document.getElementById('shareLinkInput');
  if (!input) return;

  input.select();
  input.setSelectionRange(0, 99999); // For mobile devices

  try {
    navigator.clipboard.writeText(input.value);
    showToast('Link copied to clipboard!');
  } catch (err) {
    // Fallback copy
    document.execCommand('copy');
    showToast('Link copied to clipboard!');
  }
}

// --- Theme Toggling ---
function toggleTheme() {
  const body = document.body;
  body.classList.toggle('light-mode');
  
  if (body.classList.contains('light-mode')) {
    localStorage.setItem('theme', 'light');
    showToast('Switched to Slate Light theme', 'info');
  } else {
    localStorage.setItem('theme', 'dark');
    showToast('Switched to Obsidian Dark theme', 'info');
  }
}

// --- Utility Functions ---
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
