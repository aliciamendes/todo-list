import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NoteService } from '../../services/note.service';
import { generatePlaceholder } from '../../services/random-placeholder.service';
import { generateUID } from '../../services/random-uuid.service';

type Note = {
  id: string;
  done: boolean;
  description: string | null;
};

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css',
})
export class HomepageComponent implements OnInit {
  notes: Note[] = [];
  listNotes: Note[] = [];
  isNote = false;

  constructor(private service: NoteService) {
    this.notes = [];
  }

  getStringInput = new FormGroup({
    descriptionNote: new FormControl<string>('', [
      Validators.minLength(3),
      Validators.required,
    ]),
  });

  getPlaceholder() {
    return generatePlaceholder();
  }

  ngOnInit(): void {
    this.getNotes();
    console.log(this.listNotes);
  }

  addedNote() {
    const noteUid = generateUID();
    const description = this.getStringInput.get('descriptionNote')
      ?.value as string;

    const myNote: Note = {
      id: noteUid,
      done: false,
      description: description,
    };

    this.notes.push(myNote);

    this.service.saveNote(this.notes);
    this.getNotes();
    this.isNote = true;
    this.isDone();

    this.getStringInput.patchValue({ descriptionNote: '' });
  }

  isDone() {
    return `${
      this.listNotes.filter((i) => {
        i.done;
      }).length
    }/${this.listNotes.length}`;
  }

  getNotes() {
    this.listNotes = this.service.findNotes();
  }

  handleDone(index: number) {
    this.listNotes[index].done = !this.listNotes[index].done;
    this.service.saveNote(this.listNotes);
  }

  getTextDecoration(note: Note) {
    return note.done ? 'line-through' : 'none';
  }
}
