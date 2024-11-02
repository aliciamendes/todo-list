import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  inject,
  OnInit,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { map, Observable, shareReplay } from 'rxjs';
import { Note } from '../core/modules/interface';
import { NoteService } from '../core/services/note.service';
import { generatePlaceholder } from '../core/services/random-placeholder.service';
import { generateUID } from '../core/services/random-uuid.service';
import { ThemeManagerService } from '../core/services/theme-manager.service';
import { sortingNotes } from './../core/services/order_notes.service';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [
    RouterModule,
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    MatIconModule,
    RouterLink,
    RouterLinkActive,
    MatTooltipModule,
    MatSelectModule,
  ],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss', './responsive.component.scss'],
})
export class HomepageComponent implements OnInit {
  notes: Note[] = [];
  isNote = false;
  placeholder: string = '';
  openMenuIndex: number | null = null;
  selectedNote: Note | null = null;
  isPin: boolean = false;
  options: any;

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

  ngOnInit(): void {
    this.getNotes();
    this.getPlaceholder();

    this.options = [
      {
        name: 'ASC',
        function: () => {
          this.notes = sortingNotes(this.notes, 'asc');
          this.service.saveNote(this.notes);
        },
      },
      {
        name: 'DESC',
        function: () => {
          this.notes = sortingNotes(this.notes, 'desc');
          this.service.saveNote(this.notes);
        },
      },
    ];
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

  toggleMenu(index: number) {
    if (this.openMenuIndex === index) {
      this.openMenuIndex = null;
    } else {
      this.openMenuIndex = index;
    }
  }

  getPlaceholder() {
    this.cdRef.detectChanges();
    this.placeholder = generatePlaceholder();
  }

  getNotes() {
    this.service.findNotes().subscribe({
      next: (value: any) => {
        this.notes = value;
        this.isNote = true;
        this.cdRef.detectChanges();
      },
    });
  }

  deleteNote(raw: Note) {
    this.notes = this.notes.filter((item: Note) => item.id !== raw.id);
    this.service.saveNote(this.notes);
  }

  pinNote(raw: Note) {
    const index = this.notes.indexOf(raw);

    if (index > -1) {
      this.notes.splice(index, 1);
      raw.isPinned = true;
      this.isPin = raw.isPinned;
      this.notes.unshift(raw);

      if (raw.isPinned === true) {
      }
    } else {
      raw.isPinned = true;
      this.notes.unshift(raw);
    }

    this.service.saveNote(this.notes);
    this.getNotes();
  }

  unpinNote(raw: Note) {
    this.isPin = true;

    const index = this.notes.indexOf(raw);
    if (index > -1) {
      raw.isPinned = false;
      this.isPin = raw.isPinned;
      this.notes.splice(index, 1);
      this.notes.push(raw);
    }

    this.service.saveNote(this.notes);
    this.getNotes();
  }

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
    this.toastMiddleNotes();
  }

  toastMiddleNotes() {
    let notes = 0;
    this.notes.forEach((item: Note) => {
      if (item.done) {
        notes++;
      }
    });

    if (notes === Math.round(this.notes.length / 2)) {
      this.toastr.info("we're almost done", 'Yahoo');
    }
  }

  getTextDecoration(note: Note) {
    return note.done ? 'line-through' : 'none';
  }

  getColor(note: Note) {
    return note.done ? '#A1A1A3' : '#B8B8B8';
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
      description: description,
      done: false,
      isPinned: false,
    };

    this.notes.push(myNote);
    this.service.saveNote(this.notes);
    this.isNote = true;
    this.getStringInput.patchValue({ descriptionNote: '' });
    this.isDone();
    this.getNotes();
  }

  private breakpointObserver = inject(BreakpointObserver);

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  private themeManager = inject(ThemeManagerService);
  theme = this.themeManager.theme;

  toggleTheme() {
    this.themeManager.toggleTheme();
  }
}
