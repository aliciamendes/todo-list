import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
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
  placeholder: string = '';

  getStringInput = new FormGroup({
    descriptionNote: new FormControl<string>('', [
      Validators.minLength(3),
      Validators.required,
    ]),
  });

  constructor(
    private service: NoteService,
    private cdRef: ChangeDetectorRef,
    private toastr: ToastrService
  ) {
    this.notes = [];
  }

  ngOnInit(): void {
    this.getNotes();
    this.getPlaceholder();
  }

  getPlaceholder() {
    this.placeholder = generatePlaceholder();
    this.cdRef.detectChanges();
  }

  addedNote() {
    const noteUid = generateUID();
    const description = this.getStringInput.get('descriptionNote')
      ?.value as string;

    if (description.length < 3) {
      this.toastr.info('Minimum three characters!', 'Invalid entry!');
      return;
    }

    const myNote: Note = {
      id: noteUid,
      done: false,
      description: description,
    };

    this.notes.push(myNote);

    this.service.saveNote(this.notes);

    this.isNote = true;

    this.getStringInput.patchValue({ descriptionNote: '' });

    this.isDone();
    this.getNotes();
  }

  isDone() {
    return `${this.listNotes.filter((i) => i.done === true).length}/${
      this.listNotes.length
    }`;
  }

  getNotes() {
    this.service.findNotes().subscribe({
      next: (value: any) => {
        this.listNotes = value;
        this.isNote = true;
        this.cdRef.detectChanges();
      },
    });
  }

  handleDone(index: number) {
    this.listNotes[index].done = !this.listNotes[index].done;

    if (this.listNotes && this.listNotes[index]) {
      this.listNotes[index].done = !this.listNotes[index].done;
    }

    this.service.saveNote(this.listNotes);

    this.isDone();
  }

  getTextDecoration(note: Note) {
    return note.done ? 'line-through' : 'none';
  }
}
