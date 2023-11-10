import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RxStateTodosStore } from "./todos.store";
import { TodosTableComponent } from "../todos-table.component";
import { TodosFilterComponent } from "../todos-filter.component";
import { ActivatedRoute, Router } from "@angular/router";
import { map } from "rxjs";

@Component({
  selector: "todos",
  template: `
    <todos-filter
      [searchValue]="store.searchQuery()"
      (filtered)="setSearchParam($event)"
    />

    @if (store.error()) {
    <div>Error: {{ store.error() }}</div>
    } @else {
    <todos-table
      [todos]="store.data()"
      [totalRows]="store.total()"
      [loading]="store.loading()"
      (pageChanged)="store.actions.loadTodos($event)"
      (sorted)="store.actions.loadTodos({ sort: $event })"
      (todoToggled)="store.actions.updateTodo($event)"
      (todoRemoved)="store.actions.removeTodo($event)"
    />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TodosTableComponent, TodosFilterComponent],
  standalone: true,
})
export class RxStateTodosComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private searchQueryParam$ = this.route.queryParams.pipe(
    map(({ searchQuery }) => ({ searchQuery: (searchQuery || "") as string }))
  );

  store = inject(RxStateTodosStore);

  constructor() {
    this.store.state.connect("params", this.searchQueryParam$);
    this.store.actions.loadTodos({ pageSize: 10, pageIndex: 1 });
  }

  setSearchParam(searchQuery: string) {
    this.router.navigate([], {
      queryParams: { searchQuery: searchQuery || null },
      queryParamsHandling: "merge",
    });
  }
}
