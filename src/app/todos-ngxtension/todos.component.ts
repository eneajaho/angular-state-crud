import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  untracked,
} from '@angular/core';
import { NgxtensionTodosStore } from './todos.store';
import { TodosFilterComponent } from '../todos-filter.component';
import { Router } from '@angular/router';
import { injectQueryParams } from 'ngxtension/inject-query-params';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TableColumnSettings } from '../utils/table-columns-settings/table-columns-settings.component';
import { TruncatePipe } from '../truncate.pipe';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'todos',
  template: `
    <div
      style="display: flex; justify-content: space-between; align-items: center">
      <todos-filter
        [searchValue]="store.searchQuery()"
        (filtered)="setSearchParam($event)" />

      <button
        (click)="openAddTodoDialog()"
        mat-raised-button
        color="primary"
        type="button">
        <mat-icon>add</mat-icon>
        Add todo
      </button>
    </div>

    @if (state.status === 'error') {
      <div>Error: {{ state.error }}</div>
    } @else {
      <div class="mat-elevation-z8" style="position: relative;">
        @if (state.status === 'loading') {
          <mat-progress-bar mode="indeterminate" />
        }

        <div style="position: absolute; right: 10px; top: 5px; z-index: 10">
          <table-columns-settings [(columns)]="columns" />
        </div>

        <table
          class="full-width-table"
          [dataSource]="state.result"
          (matSortChange)="store.setParams({ sort: $event })"
          mat-table
          aria-label="Todos"
          matSort>
          <ng-container matColumnDef="id">
            <th *matHeaderCellDef mat-header-cell mat-sort-header>Id</th>
            <td *matCellDef="let row" mat-cell>
              @if (row.isChanging) {
                <mat-spinner diameter="20" />
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
                (click)="!row.isChanging ? store.updateTodo(row) : ''">
                check_circle
              </mat-icon>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th *matHeaderCellDef mat-header-cell mat-sort-header>Title</th>
            <td *matCellDef="let row" mat-cell>
              <button
                [disabled]="row.isChanging"
                (click)="store.removeTodo(row.id)"
                mat-stroked-button
                color="warn">
                <mat-icon>delete</mat-icon>
                <span>Remove</span>
              </button>
            </td>
          </ng-container>

          <tr *matHeaderRowDef="columns" mat-header-row></tr>
          <tr
            *matRowDef="let row; columns: columns"
            [class.is-changing]="row.isChanging"
            mat-row></tr>
        </table>

        <mat-paginator
          [length]="state.total"
          [pageIndex]="0"
          [pageSize]="10"
          [showFirstLastButtons]="true"
          [pageSizeOptions]="[5, 10, 20]"
          (page)="store.setParams($event)"
          aria-label="Select page" />
      </div>
    }
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
  imports: [
    TodosFilterComponent,
    MatProgressBarModule,
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
  standalone: true,
})
export class NgxtensionTodosComponent {
  private router = inject(Router);
  private modal = inject(MatDialog);

  searchQueryParam = injectQueryParams('searchQuery');

  store = inject(NgxtensionTodosStore);

  get state() {
    return this.store.state();
  }

  constructor() {
    effect(() => {
      const searchQuery = this.searchQueryParam() || '';
      untracked(() => this.store.setParams({ searchQuery }));
    });
  }

  openAddTodoDialog(): void {
    import('../add-todo.modal').then(({ AddTodoModal }) => {
      const dialogRef = this.modal.open(AddTodoModal, {
        width: '400px',
        data: { title: '' },
      });

      dialogRef.afterClosed().subscribe((result: string | undefined) => {
        console.log('The dialog was closed', result);
        if (!result) return;
        this.store.addTodo(result);
      });
    });
  }

  setSearchParam(searchQuery: string) {
    this.router.navigate([], {
      queryParams: { searchQuery: searchQuery || null },
      queryParamsHandling: 'merge',
    });
  }

  columns = ALL_COLUMNS;
}

const ALL_COLUMNS = ['id', 'title', 'user', 'actions', 'completed'];
