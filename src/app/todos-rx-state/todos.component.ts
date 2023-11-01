import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import {RxStateTodosStore} from './todos.store';
import {TodosTableComponent} from "../todos-table.component";
import {TodosFilterComponent} from "../todos-filter.component";

@Component({
    selector: 'todos',
    template: `
        <todos-filter 
            (filtered)="store.actions.loadTodos({ searchQuery: $event })"
        />
        
        @if (error()) { 
            <div>Error: {{ error() }}</div> 
        } @else {
            <todos-table
                [todos]="data()"
                [totalRows]="total()"
                [loading]="loading()"
                (pageChanged)="store.actions.loadTodos($event)"
                (sorted)="store.actions.loadTodos({ sort: $event })"
                (todoToggled)="store.actions.updateTodo($event)"
                (todoRemoved)="store.actions.removeTodo($event)"
            />
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TodosTableComponent, TodosFilterComponent],
    standalone: true
})
export class RxStateTodosComponent implements OnInit {
    store = inject(RxStateTodosStore);

    data = this.store.state.signal('data');
    total = this.store.state.signal('total');
    error = this.store.state.signal('error');
    loading = this.store.state.signal('loading');

    ngOnInit() {
        this.store.actions.loadTodos({pageSize: 10, pageIndex: 1});
    }
}
