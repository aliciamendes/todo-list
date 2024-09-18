import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
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
  imports: [RouterModule, ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css', './responsive.component.css'],
})
export class HomepageComponent implements OnInit {
  notes: Note[] = [];
  isNote = false;
  placeholder: string = '';
  openMenuIndex: number | null = null;

  getStringInput = new FormGroup({
    descriptionNote: new FormControl<string>('', [
      Validators.minLength(3),
      Validators.required,
    ]),
    descriptionEditNote: new FormControl<string>('', [
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;

    if (!target.closest('.moreOptions') && !target.closest('.buttonMore')) {
      this.openMenuIndex = null;
    }

    if (target.closest('.moreOptions') && !target.closest('.buttonMore')) {
      this.openMenuIndex = null;
    }
  }

  ngOnInit(): void {
    this.getNotes();
    this.getPlaceholder();
  }

  toggleMenu(index: number) {
    if (this.openMenuIndex === index) {
      this.openMenuIndex = null;
    } else {
      this.openMenuIndex = index;
    }
  }

  getPlaceholder() {
    this.placeholder = generatePlaceholder();
    this.cdRef.detectChanges();
  }

  getNotes() {
    this.service.findNotes().subscribe({
      next: (value: any) => {
        this.notes = value;
        this.isNote = true;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        this.isNote = false;
      },
    });
  }

  addedNote() {
    const description = this.getStringInput.get('descriptionNote')
      ?.value as string;

    if (description.length < 3) {
      this.toastr.info('Minimum three characters!', 'Invalid entry!');
      return;
    }

    const myNote: Note = {
      id: generateUID(),
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

  deleteNote(raw: Note) {
    this.notes = this.notes.filter((item: Note) => item.id !== raw.id);
    this.service.saveNote(this.notes);
  }

  selectedNote: Note | null = null;
  editMenu(item: Note) {
    this.selectedNote = item;
  }

  verify(item: Note) {
    return this.selectedNote?.id == item.id ? true : false;
  }

  saveEdit(description: string) {
    if (this.selectedNote) {
      this.notes = this.notes.map((note) => {
        if (note.id === this.selectedNote!.id) {
          return { ...note, description };
        }
        return note;
      });
      this.selectedNote = null;
    }

    this.service.saveNote(this.notes);
  }

  updateNote(raw: any) {
    const description = this.getStringInput.get('descriptionEditNote')
      ?.value as string;

    if (description.length < 3) {
      this.toastr.info('Minimum three characters!', 'Invalid entry!');
      return;
    }
  }

  isDone() {
    return `${this.notes.filter((i) => i.done === true).length}/${
      this.notes.length
    }`;
  }

  handleDone(index: number) {
    this.notes[index].done = !this.notes[index].done;

    this.notes.sort((a: Note, b: Note) => {
      return a.done === b.done ? 0 : a.done ? 1 : -1;
    });

    this.service.saveNote(this.notes);
    this.isDone();
  }

  getTextDecoration(note: Note) {
    return note.done ? 'line-through' : 'none';
  }
}
