import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { concatMap, mergeMap, Observable, switchMap, tap } from 'rxjs';
import { Todo } from '../todo.model';
import { GetTodosPayload, TodosService } from '../todos.service';

export interface TodosState {
  data: Todo[];
  isChanging: number[];
  params: GetTodosPayload;
  total: number;
  loading: boolean;
  loaded: boolean;
  error: string | null;
}

const initialState: TodosState = {
  data: [],
  isChanging: [],
  params: {
    pageIndex: 1,
    pageSize: 10,
    sort: null,
    searchQuery: '',
  },
  total: 0,
  loaded: false,
  loading: false,
  error: null,
};

@Injectable({ providedIn: 'root' })
export class ComponentStoreTodosStore extends ComponentStore<TodosState> {
  constructor(private todosService: TodosService) {
    super(initialState);
  }

  data = this.selectSignal(s =>
    s.data.map(item => ({
      ...item,
      isChanging: s.isChanging.includes(item.id),
    })),
  );
  searchQuery = this.selectSignal(s => s.params.searchQuery);
  total = this.selectSignal(s => s.total);
  loading = this.selectSignal(s => s.loading);
  error = this.selectSignal(s => s.error);

  loadTodos = this.effect((payload$: Observable<Partial<GetTodosPayload>>) =>
    payload$.pipe(
      tap(() => this.patchState({ loading: true, loaded: false, error: null })),
      switchMap(payload => {
        const currentPayload = this.get(s => s.params);
        const newPayload = { ...currentPayload, ...payload };
        return this.todosService.get(newPayload).pipe(
          tap((data: Todo[]) =>
            this.patchState({
              data,
              error: null,
              loading: false,
              loaded: true,
              params: newPayload,
              total: 100, // this should be retrieved from headers, or most of the time will come with the response body
            }),
          ),
        );
      }),
    ),
  );

  addTodo = this.effect((title$: Observable<string>) =>
    title$.pipe(
      concatMap(todoTitle =>
        this.todosService.add(todoTitle).pipe(
          tap(todo => {
            const todos = this.get(s => s.data);
            todos.unshift(todo);
            this.patchState({ data: [...todos] });
          }),
        ),
      ),
    ),
  );

  updateTodo = this.effect((todo$: Observable<Todo>) =>
    todo$.pipe(
      mergeMap(todo => {
        this.patchState(s => ({ isChanging: [...s.isChanging, todo.id] }));
        return this.todosService.toggle(todo).pipe(
          tap(todo => {
            this.patchState(s => ({
              data: s.data.map(item => ({
                ...item,
                completed:
                  item.id === todo.id ? todo.completed : item.completed,
              })),
              isChanging: s.isChanging.filter(x => x !== todo.id),
            }));
          }),
        );
      }),
    ),
  );

  removeTodo = this.effect((todoId$: Observable<number>) =>
    todoId$.pipe(
      concatMap(todoId => {
        this.patchState(s => ({ isChanging: [...s.isChanging, todoId] }));
        return this.todosService.remove(todoId).pipe(
          tap(todoId => {
            this.patchState(s => ({
              data: s.data.filter(x => x.id !== todoId),
              isChanging: s.isChanging.filter(x => x !== todoId),
            }));
          }),
        );
      }),
    ),
  );
}
