import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NoteService {
  private TASK_KEY = 'task';

  constructor() {}

  saveNote(noteToSave: object) {
    const note = JSON.stringify(noteToSave);
    localStorage.setItem(this.TASK_KEY, note);
  }

  findNotes() {
    const raw = localStorage.getItem(this.TASK_KEY);
    return JSON.parse(raw || '[]');
  }

  deleteNote() {}

  updateNote() {}

  toggleNoteDone(noteID: string) {}
}
