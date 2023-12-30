import {
  Component,
  ChangeDetectionStrategy,
  computed,
  signal,
  Input,
  Output,
  EventEmitter,
  OnInit,
  effect,
} from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { TitleCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'table-columns-settings',
  template: `
    <button [matMenuTriggerFor]="menu" mat-icon-button type="button">
      <mat-icon>settings</mat-icon>
    </button>
    <mat-menu #menu="matMenu">
      <div (cdkDropListDropped)="drop($event)" cdkDropList>
        @for (column of allColumns(); track $index) {
          <button [cdkDragData]="column" cdkDrag mat-menu-item>
            <mat-icon cdkDragHandle>drag_indicator</mat-icon>
            <mat-checkbox
              [checked]="column.enabled"
              (click)="$event.stopPropagation()"
              (change)="toggleColumnVisibility(column.title, $event.checked)" />
            <span>{{ column.title | titlecase }}</span>
          </button>
        }
      </div>
    </mat-menu>
  `,
  standalone: true,
  imports: [
    MatMenuModule,
    MatButtonModule,
    DragDropModule,
    MatCheckboxModule,
    MatIconModule,
    TitleCasePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableColumnSettings implements OnInit {
  @Input() columns: string[] = [];
  @Output() columnsChange = new EventEmitter<string[]>();

  constructor() {
    effect(() => this.columnsChange.emit(this.shownColumns()));
  }

  ngOnInit() {
    this.enabledColumns.set(this.columns);
    this.sortedColumns.set(this.columns);
  }

  private enabledColumns = signal<string[]>([]);
  private sortedColumns = signal<string[]>([]);

  // because sortedColumns includes all columns, we filter out the ones that are not enabled
  allColumns = computed(() =>
    this.sortedColumns().map(column => ({
      title: column,
      enabled: this.enabledColumns().includes(column),
    })),
  );

  shownColumns = computed(() =>
    this.sortedColumns().filter(column =>
      this.enabledColumns().includes(column),
    ),
  );

  protected drop(event: CdkDragDrop<{ title: string; enabled: boolean }[]>) {
    const sortedColumns = this.sortedColumns();
    moveItemInArray(sortedColumns, event.previousIndex, event.currentIndex);
    this.sortedColumns.set([...sortedColumns]);
  }

  protected toggleColumnVisibility(column: string, enabled: boolean) {
    if (enabled) {
      this.enabledColumns.set([...this.enabledColumns(), column]);
    } else {
      this.enabledColumns.set(this.enabledColumns().filter(c => c !== column));
    }
  }
}
