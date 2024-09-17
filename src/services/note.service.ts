import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NoteService {
  private TASK_KEY = 'task';

  saveNote(noteToSave: object) {
    const note = JSON.stringify(noteToSave);
    localStorage.setItem(this.TASK_KEY, note);
  }

  findNotes(): Observable<any[]> {
    const raw = localStorage.getItem(this.TASK_KEY);
    return of(JSON.parse(raw || '[]'));
  }

  deleteNote() {}

  updateNote() {}
}
