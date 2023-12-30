import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TableColumnSettings } from '../utils/table-columns-settings/table-columns-settings.component';
import { TruncatePipe } from '../truncate.pipe';
import { Todo } from '../todo.model';

@Component({
  selector: 'todos-table',
  template: ``,
  styles: `
      .full-width-table {
        width: 100%;
        overflow: hidden;
      }

      mat-icon {
        cursor: pointer;
      }

      .is-changing {
        background: #673ab73b;
        transition: 0.25s background;
      }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatProgressBarModule,
    MatTableModule,
    MatSortModule,
    TruncatePipe,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    TableColumnSettings,
  ],
})
export class TodosTable {
  @Input() todos: (Todo & { isChanging?: boolean })[] = [];
  @Input() totalRows = 0;
  @Input() loading = false;

  @Output() sorted = new EventEmitter<Sort>();
  @Output() pageChanged = new EventEmitter<PageEvent>();

  @Output() todoToggled = new EventEmitter<Todo>();
  @Output() todoRemoved = new EventEmitter<number>();

  columns = ALL_COLUMNS;
}

const ALL_COLUMNS = ['id', 'title', 'user', 'actions', 'completed'];
