document.addEventListener('DOMContentLoaded', function () {
  fetchNotes();

  document.getElementById('save-note').addEventListener('click', function () {
    const noteContent = document.getElementById('note-content').value.trim();

    if (noteContent === '') {
      alert("Note can't be empty.");
      return;
    }

    fetch('http://YOUR_BACKEND_IP:8000/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: noteContent }),
    })
      .then(response => {
        if (!response.ok) throw new Error("Server Error");
        return response.json();
      })
      .then(data => {
        alert(data.message);
        document.getElementById('note-content').value = '';
        fetchNotes();
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Failed to save note. Is the backend running?');
      });
  });
});

function fetchNotes() {
  fetch('http://YOUR_BACKEND_IP:8000/api/notes')
    .then(response => {
      if (!response.ok) throw new Error("Server Error");
      return response.json();
    })
    .then(notes => {
      const notesList = document.getElementById('notes-list');
      notesList.innerHTML = '';

      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-muted">No notes yet.</li>';
        return;
      }

      notes.forEach(note => {
        const li = document.createElement('li');
        li.className = 'note-item list-group-item';
        li.innerText = note.content;
        notesList.appendChild(li);
      });
    })
    .catch(error => {
      console.error('Fetch error:', error);
      document.getElementById('notes-list').innerHTML = '<li class="text-danger">Failed to load notes.</li>';
    });
}
