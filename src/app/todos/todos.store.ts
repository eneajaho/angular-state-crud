import { Injectable } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";
import { catchError, concatMap, EMPTY, Observable, switchMap, tap } from "rxjs";
import { Todo } from "./todo.model";
import { GetTodosPayload, TodosService } from "./todos.service";

export interface TodosState {
  data: Todo[];
  params: GetTodosPayload,
  total: number;
  loading: boolean;
  loaded: boolean;
  error: string | null;
}

const initialState: TodosState = {
  data: [],
  params: {
    pageIndex: 0,
    pageSize: 0,
    sort: null,
    searchQuery: '',
  },
  total: 0,
  loaded: false,
  loading: false,
  error: null,
}

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
