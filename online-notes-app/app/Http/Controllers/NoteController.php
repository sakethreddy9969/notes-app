<?php

namespace App\Http\Controllers;

use App\Models\Note;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NoteController extends Controller
{
    public function index()
    {
        $notes = Note::where('user_id', Auth::id())->orderBy('created_at', 'desc')->get();
        return response()->json($notes);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|max:255',
            'content' => 'required',
            'tags' => 'nullable|string',
            'visibility' => 'required|in:public,private'
        ]);

        $note = Note::create([
            'user_id' => Auth::id(),
            'title' => $request->title,
            'content' => $request->content,
            'tags' => $request->tags,
            'visibility' => $request->visibility
        ]);

        return response()->json([
            'message' => 'Note created successfully!',
            'note' => $note
        ], 201);
    }

    public function show(Note $note)
    {
        if ($note->user_id !== Auth::id() && $note->visibility !== 'public') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        return response()->json($note);
    }

    public function update(Request $request, Note $note)
    {
        if ($note->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'title' => 'required|max:255',
            'content' => 'required',
            'tags' => 'nullable|string',
            'visibility' => 'required|in:public,private'
        ]);

        $note->update($request->all());

        return response()->json([
            'message' => 'Note updated successfully!',
            'note' => $note
        ]);
    }

    public function destroy(Note $note)
    {
        if ($note->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $note->delete();

        return response()->json([
            'message' => 'Note deleted successfully!'
        ]);
    }

    // Public route to view a public note by ID
    public function showPublic($id)
    {
        $note = Note::findOrFail($id);
        if ($note->visibility !== 'public') {
            return response()->json(['message' => 'Note is private'], 403);
        }
        return response()->json($note);
    }
}
