import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Todo } from './todo.model';
import { Sort } from '@angular/material/sort/sort';

@Component({
  selector: 'todos-table',
  template: `
    <div class="loading-shade" *ngIf="loading">
      <mat-spinner></mat-spinner>
    </div>
    
    <div class="mat-elevation-z8">
      <table [dataSource]="todos" mat-table class="full-width-table" aria-label="Todos"
             matSort (matSortChange)="sorted.emit($event)">
        
        <!-- Id Column -->
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Id</th>
          <td mat-cell *matCellDef="let row">{{row.id}}</td>
        </ng-container>

        <!-- Title Column -->
        <ng-container matColumnDef="title">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Title</th>
          <td mat-cell *matCellDef="let row">{{row.title}}</td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
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
    }
    
    .loading-shade {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 56px;
      right: 0;
      background: rgba(0, 0, 0, 0.15);
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  ` ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodosTableComponent {

  @Input() todos: Todo[] = [];
  @Input() totalRows = 0;
  @Input() loading = false;

  @Output() sorted = new EventEmitter<Sort>();
  @Output() pageChanged = new EventEmitter<PageEvent>();

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = [ 'id', 'title' ];

}
