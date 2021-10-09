import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TodosStore } from './todos.store';

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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodosComponent implements OnInit {

  constructor(public store: TodosStore) {}

  ngOnInit() {
    this.store.loadTodos({ pageSize: 10, pageIndex: 1 });
  }

}
