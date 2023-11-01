import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {ComponentStoreTodosStore} from './todos.store';
import {TodosTableComponent} from "../todos-table.component";
import {TodosFilterComponent} from "../todos-filter.component";
import {AsyncPipe, NgIf} from "@angular/common";

@Component({
  selector: 'todos',
  template: `
    <ng-container *ngIf="store.state$ | async as vm">

      <todos-filter
          (filtered)="store.loadTodos({ searchQuery: $event })">
      </todos-filter>

      <todos-table
          [todos]="vm.data"
          [totalRows]="vm.total"
          [loading]="vm.loading"
          (pageChanged)="store.loadTodos($event)"
          (sorted)="store.loadTodos({ sort: $event })"
          (todoToggled)="store.updateTodo($event)"
          (todoRemoved)="store.removeTodo($event)">
      </todos-table>

      <div *ngIf="vm.error">
        Error: {{ vm.error }}
      </div>

    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TodosTableComponent,
    TodosFilterComponent,
    AsyncPipe,
    NgIf
  ],
  standalone: true
})
export class ComponentStoreTodosComponent implements OnInit {

  constructor(public store: ComponentStoreTodosStore) {}

  ngOnInit() {
    this.store.loadTodos({ pageSize: 10, pageIndex: 1 });
  }

}
