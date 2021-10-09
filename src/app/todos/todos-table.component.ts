import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Todo } from './todo.model';
import { Sort } from '@angular/material/sort/sort';
import { animate, group, query, style, transition, trigger } from '@angular/animations';

export const rowsAnimation = trigger('rowsAnimation', [
  transition('completed <=> uncompleted', [
    style({ background: 'rgba(103,58,183,0.37)' }),
    animate('250ms', style({ background: '#fff' })),
  ]),
  transition(':enter',
    query('.mat-cell', [
      style({ opacity: '0', background: 'rgba(103,58,183,0.37)' }),
      animate('250ms', style({ opacity: '1', background: '#fff' })),
    ])
  )
]);

export const rowRemoveAnimation = trigger('rowRemoveAnimation', [
  transition('* => removed', group([
    query('.mat-cell', [
      style({ opacity: '1', background: 'rgba(246,0,0,0.11)', transform: 'translateX(0p)' }),
      animate('300ms',
        style({ opacity: '0', background: 'rgba(246,0,0,0.9)', transform: 'translateX(250px)' })
      ),
    ])
  ])),
]);

@Component({
  selector: 'todos-table',
  template: `
    <div class="mat-elevation-z8">
      <mat-progress-bar *ngIf="loading" mode="indeterminate"></mat-progress-bar>

      <table [dataSource]="todos" mat-table class="full-width-table" aria-label="Todos"
             matSort (matSortChange)="sorted.emit($event)">

        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Id</th>
          <td mat-cell *matCellDef="let row">{{row.id}}</td>
        </ng-container>

        <ng-container matColumnDef="title">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Title</th>
          <td mat-cell *matCellDef="let row">{{row.title}}</td>
        </ng-container>

        <ng-container matColumnDef="user">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>UserId</th>
          <td mat-cell *matCellDef="let row">{{ row.userId }}</td>
        </ng-container>

        <ng-container matColumnDef="completed">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Completed</th>
          <td mat-cell *matCellDef="let row">
            <mat-icon
              [color]="row.completed ? 'primary' : 'warn'"
              (click)="todoToggled.emit(row)">
              check_circle
            </mat-icon>
          </td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Title</th>
          <td mat-cell *matCellDef="let row">
            <button mat-stroked-button color="warn" (click)="removeTodo(row)">
              <mat-icon>delete</mat-icon>
              <span>Remove</span>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row
            [@rowRemoveAnimation]="row === removedTodo ? 'removed' : ''"
            [@rowsAnimation]="row.completed ? 'completed' : 'uncompleted'"
            *matRowDef="let row; columns: displayedColumns;">
        </tr>
      </table>

      <mat-paginator
        [length]="totalRows"
        [pageIndex]="0"
        [pageSize]="10"
        [showFirstLastButtons]="true"
        (page)="pageChanged.emit($event)"
        [pageSizeOptions]="[5, 10, 20]"
        aria-label="Select page">
      </mat-paginator>
    </div>
  `,
  styles: [ `
    .full-width-table {
      width: 100%;
      overflow: hidden;
    }

    mat-icon {
      cursor: pointer;
    }
  ` ],
  animations: [ rowsAnimation, rowRemoveAnimation ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodosTableComponent {

  removedTodo: Todo | null = null; // will be used to animate the removed todo

  @Input() todos: Todo[] = [];
  @Input() totalRows = 0;
  @Input() loading = false;

  @Output() sorted = new EventEmitter<Sort>();
  @Output() pageChanged = new EventEmitter<PageEvent>();

  @Output() todoToggled = new EventEmitter<Todo>();
  @Output() todoRemoved = new EventEmitter<number>();

  removeTodo(todo: Todo): void {
    this.removedTodo = todo;

    this.todoRemoved.emit(todo.id);

    setTimeout(() => {
      this.removedTodo = null;
    }, 0);
  }

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = [ 'id', 'title', 'user', 'completed', 'actions' ];

}
