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
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
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
  imports: [
    RouterModule,
    ReactiveFormsModule,
    CommonModule,
    MenuModule,
    ButtonModule,
  ],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css',
})
export class HomepageComponent implements OnInit {
  notes: Note[] = [];
  isNote = false;
  isEditNote = false;
  placeholder: string = '';
  openMenuIndex: number | null = null;

  getStringInput = new FormGroup({
    descriptionNote: new FormControl<string>('', [
      Validators.minLength(3),
      Validators.required,
    ]),
  });

  items: any;

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

    // Verifica se o clique foi dentro do menu ou do botão
    if (!target.closest('.moreOptions') && !target.closest('.buttonMore')) {
      this.openMenuIndex = null;
    }
  }

  ngOnInit(): void {
    this.getNotes();
    this.getPlaceholder();

    this.items = [{ id: 3, name: 'Item 3' }];
  }

  toggleMenu(index: number) {
    this.openMenuIndex = this.openMenuIndex === index ? null : index;
  }

  getPlaceholder() {
    this.placeholder = generatePlaceholder();
    this.cdRef.detectChanges();
  }

  // ! está inserindo o dobro
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

  editNote() {
    throw new Error('Method not implemented.');
  }

  deleteNote(raw: Note) {
    this.notes = this.notes.filter((item: Note) => item.id !== raw.id);
    this.service.saveNote(this.notes);
  }

  isDone() {
    return `${this.notes.filter((i) => i.done === true).length}/${
      this.notes.length
    }`;
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

  handleDone(index: number) {
    this.notes[index].done = !this.notes[index].done;

    this.service.saveNote(this.notes);
    this.isDone();
  }

  getTextDecoration(note: Note) {
    return note.done ? 'line-through' : 'none';
  }
}
