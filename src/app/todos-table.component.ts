import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { Todo } from './todo.model';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgIf } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { TruncatePipe } from './truncate.pipe';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'todos-table',
  template: `
    <div class="mat-elevation-z8">
      <mat-progress-bar *ngIf="loading" mode="indeterminate"></mat-progress-bar>

      <table
        class="full-width-table"
        [dataSource]="todos"
        (matSortChange)="sorted.emit($event)"
        mat-table
        aria-label="Todos"
        matSort>
        <ng-container matColumnDef="id">
          <th *matHeaderCellDef mat-header-cell mat-sort-header>Id</th>
          <td *matCellDef="let row" mat-cell>
            @if (row.isChanging) {
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              {{ row.id }}
            }
          </td>
        </ng-container>

        <ng-container matColumnDef="title">
          <th *matHeaderCellDef mat-header-cell mat-sort-header>Title</th>
          <td *matCellDef="let row" mat-cell>
            {{ row.title | truncate: 50 }}
          </td>
        </ng-container>

        <ng-container matColumnDef="user">
          <th *matHeaderCellDef mat-header-cell mat-sort-header>User</th>
          <!--<td mat-cell *matCellDef="let row">{{ row.userId }}</td>-->
          <td *matCellDef="let row" mat-cell>John</td>
        </ng-container>

        <ng-container matColumnDef="completed">
          <th *matHeaderCellDef mat-header-cell mat-sort-header>Completed</th>
          <td *matCellDef="let row" mat-cell>
            <mat-icon
              [style.color]="row.completed ? '#00bb00' : 'grey'"
              (click)="!row.isChanging ? todoToggled.emit(row) : ''">
              check_circle
            </mat-icon>
          </td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th *matHeaderCellDef mat-header-cell mat-sort-header>Title</th>
          <td *matCellDef="let row" mat-cell>
            <button
              [disabled]="row.isChanging"
              (click)="todoRemoved.emit(row.id)"
              mat-stroked-button
              color="warn">
              <mat-icon>delete</mat-icon>
              <span>Remove</span>
            </button>
          </td>
        </ng-container>

        <tr *matHeaderRowDef="displayedColumns" mat-header-row></tr>
        <tr
          *matRowDef="let row; columns: displayedColumns"
          [class.is-changing]="row.isChanging"
          mat-row></tr>
      </table>

      <mat-paginator
        [length]="totalRows"
        [pageIndex]="0"
        [pageSize]="10"
        [showFirstLastButtons]="true"
        [pageSizeOptions]="[5, 10, 20]"
        (page)="pageChanged.emit($event)"
        aria-label="Select page">
      </mat-paginator>
    </div>
  `,
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
    NgIf,
    MatTableModule,
    MatSortModule,
    TruncatePipe,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
  ],
})
export class TodosTableComponent {
  @Input() todos: (Todo & { isChanging?: boolean })[] = [];
  @Input() totalRows = 0;
  @Input() loading = false;

  @Output() sorted = new EventEmitter<Sort>();
  @Output() pageChanged = new EventEmitter<PageEvent>();

  @Output() todoToggled = new EventEmitter<Todo>();
  @Output() todoRemoved = new EventEmitter<number>();

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['id', 'title', 'user', 'completed', 'actions'];
}
