# NgRx Component Store Crud      
[![Netlify Status](https://api.netlify.com/api/v1/badges/6b9b71d8-a9b1-49e9-9afa-19a47c7bfa59/deploy-status)](https://app.netlify.com/sites/component-store-crud/deploys)

### Features
- Component Store for CRUD state
- Smart / Dumb component architecture
- Angular Material components 
- Table animations (on add, update, remove)
- Error, Loading state handling


### Code parts

#### TodosStore
```ts

@Injectable({ providedIn: 'root' })
export class TodosStore extends ComponentStore<TodosState> {

  constructor(private todosService: TodosService) {
    super(initialState);
  }

  loadTodos = this.effect((payload$: Observable<Partial<GetTodosPayload>>) => payload$.pipe(
    tap(() => this.patchState({ loading: true, loaded: false, error: null })),
    switchMap(payload => {
      const currentPayload = this.get(s => s.params);
      const newPayload = { ...currentPayload, ...payload };
      return this.todosService.get(newPayload).pipe(
        tap((data: Todo[]) =>
          this.patchState({
            data, error: null, loading: false, loaded: true, params: newPayload,
            total: 100 // this should be retrieved from headers, or most of the time will come with the response body
          })
        ),
        catchError(error => {
          this.patchState({
            error, data: [], loading: false, loaded: false, params: initialState.params
          });
          return EMPTY; // we return EMPTY in order to keep the effect observable alive
        })
      );
    })
  ));

  addTodo = this.effect((title$: Observable<string>) => title$.pipe(
    concatMap(todoTitle => this.todosService.add(todoTitle).pipe(
      tap(todo => {
        const todos = this.get(s => s.data);
        todos.unshift(todo);
        this.patchState({ data: [ ...todos ] })
      }),
      catchError(error => {
        console.error('Cannot add todo with title: ' + todoTitle, error);
        return EMPTY;
      })
    ))
  ));

  updateTodo = this.effect((todo$: Observable<Todo>) => todo$.pipe(
    concatMap(todo => this.todosService.toggle(todo).pipe(
      tap(todo => {
        const todos = this.get(s => s.data);
        this.patchState({
          // data: todos.map(x => x.id === todo.id ? { ...x, ...todo } : x)
          // in order to not loose the reference of the item and reanimate the enter transition
          // we dont change the reference of the item but only the needed key
          data: todos.map(item => {
            if (item.id === todo.id) {
              item.completed = todo.completed;
            }
            return item;
          })
        })
      }),
      catchError(error => {
        console.error('Cannot update todo with ID: ' + todo.id, error);
        return EMPTY;
      })
    ))
  ));

  removeTodo = this.effect((todoId$: Observable<number>) => todoId$.pipe(
    concatMap(todoId => this.todosService.remove(todoId).pipe(
      tap(todoId => {
        const todos = this.get(s => s.data);
        this.patchState({
          data: todos.filter(x => x.id !== todoId)
        })
      }),
      catchError(error => {
        console.error('Cannot delete todo with ID: ' + todoId, error);
        return EMPTY;
      })
    ))
  ));

}

```



#### Todos component 
```html
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
```

```ts
@Component({
  selector: 'todos',
  template: `...`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodosComponent implements OnInit {

  constructor(public store: TodosStore) {}

  ngOnInit() {
    this.store.loadTodos({ pageSize: 10, pageIndex: 1 });
  }
  
}
```


![image](https://user-images.githubusercontent.com/25394362/136675191-71680362-0e3e-4d09-91fd-103dd9dfd715.png)


#### Built with Angular ❤️
