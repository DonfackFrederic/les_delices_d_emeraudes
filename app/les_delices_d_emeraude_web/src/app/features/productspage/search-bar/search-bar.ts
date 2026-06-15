import {
  Component, Input, Output, EventEmitter,
  OnInit, OnDestroy, signal, ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search-bar.html',
  styleUrls: ['./search-bar.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBar implements OnInit, OnDestroy {
  @Input() value       = '';
  @Input() placeholder = 'Rechercher…';
  @Input() debounceMs  = 300;

  @Output() searched = new EventEmitter<string>();

  protected model  = signal('');
  private   input$ = new Subject<string>();
  private   kill$  = new Subject<void>();

  ngOnInit(): void {
    this.model.set(this.value);
    this.input$
      .pipe(debounceTime(this.debounceMs), distinctUntilChanged(), takeUntil(this.kill$))
      .subscribe(q => this.searched.emit(q));
  }

  ngOnDestroy(): void { this.kill$.next(); this.kill$.complete(); }

  onInput(val: string): void { this.model.set(val); this.input$.next(val.trim()); }
  clear():              void { this.model.set('');  this.input$.next(''); }
}