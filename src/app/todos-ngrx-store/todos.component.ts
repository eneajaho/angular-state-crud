import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TodosTableComponent } from '../todos-table.component';
import { TodosFilterComponent } from '../todos-filter.component';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { Store } from '@ngrx/store';
import { TodoActions } from './todos.actions';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'todos',
  template: `
    <!-- <todos-filter
      [searchValue]="store.searchQuery()"
      (filtered)="setSearchParam($event)" />

    @if (store.error()) {
      <div>Error: {{ store.error() }}</div>
    } @else {
      <todos-table
        [todos]="store.data()"
        [totalRows]="store.total()"
        [loading]="store.loading()"
        (pageChanged)="store.loadTodos($event)"
        (sorted)="store.loadTodos({ sort: $event })"
        (todoToggled)="store.updateTodo($event)"
        (todoRemoved)="store.removeTodo($event)" />
    } -->
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TodosTableComponent, TodosFilterComponent],
  standalone: true,
})
export class NgrxStoreTodosComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private store = inject(Store);

  private searchQueryParam$ = this.route.queryParams.pipe(
    map(({ searchQuery }) => ({ searchQuery: (searchQuery || '') as string })),
  );

  constructor() {
    this.searchQueryParam$
      .pipe(takeUntilDestroyed())
      .subscribe(({ searchQuery }) => {
        this.store.dispatch(TodoActions.load({ payload: { searchQuery } }));
      });
  }

  setSearchParam(searchQuery: string) {
    this.router.navigate([], {
      queryParams: { searchQuery: searchQuery || null },
      queryParamsHandling: 'merge',
    });
  }
}
