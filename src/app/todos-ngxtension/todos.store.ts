import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import {
  catchError,
  concatMap,
  map,
  of,
  pipe,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { Todo } from '../todo.model';
import { TodosService } from '../todos.service';
import { computedFrom } from 'ngxtension/computed-from';
import { createEffect } from 'ngxtension/create-effect';
import { connect } from 'ngxtension/connect';
import { ApiCallState } from '../utils/api-call-state.model';
import { Sort } from '@angular/material/sort';

interface GetParamsPayload {
  pageIndex: number;
  pageSize: number;
  sort: Sort | null;
  searchQuery: string;
  updateIndex: number;
}

@Injectable({ providedIn: 'root' })
export class NgxtensionTodosStore {
  private todosService = inject(TodosService);

  state = signal<ApiCallState<Todo[]>>({} as ApiCallState<Todo[]>);
  private isChanging = signal<number[]>([]);
  private params = signal<GetParamsPayload>({
    pageIndex: 1,
    pageSize: 10,
    sort: null,
    searchQuery: '',
    updateIndex: 0,
  });

  private allTodosState: Signal<ApiCallState<Todo[]>> = computedFrom(
    [this.params],
    pipe(
      switchMap(([params]) => {
        return this.todosService.get(params).pipe(
          map(res => ({ status: 'loaded' as const, result: res, total: 100 })),
          startWith({ status: 'loading' as const, result: [], total: 0 }),
          catchError(err => of({ status: 'error' as const, error: err })),
        );
      }),
    ),
  );

  constructor() {
    connect(this.state, this.allTodosState);
  }

  setParams = (params: Partial<GetParamsPayload>) => {
    this.params.update(p => ({ ...p, ...params }));
  };

  data = computed(() => {
    const state = this.state();
    if (state?.status === 'loaded') {
      return state.result.map(
        x =>
          ({
            ...x,
            isChanging: this.isChanging().includes(x.id),
          }) as Todo & { isChanging: boolean },
      );
    }
    return [];
  });

  searchQuery = computed(() => this.params().searchQuery);

  addTodo = createEffect<string>(
    pipe(
      concatMap(title =>
        this.todosService.add(title).pipe(
          tap(todo => {
            const state = this.state();
            const todos = state.status === 'loaded' ? state.result : [];
            todos.unshift(todo);
            this.state.update(s => ({ ...s, result: [...todos] }));
          }),
        ),
      ),
    ),
  );

  updateTodo = createEffect<Todo>(
    pipe(
      tap(todo => this.isChanging.update(x => [...x, todo.id])),
      concatMap(todo =>
        this.todosService.toggle(todo).pipe(
          tap(() => {
            const state = this.state();
            const todos = state.status === 'loaded' ? state.result : [];

            this.state.update(s => ({
              ...s,
              result: todos.map(item => ({
                ...item,
                completed:
                  item.id === todo.id ? todo.completed : item.completed,
              })),
            }));

            this.isChanging.update(x => x.filter(id => id !== todo.id));

            console.log(this.isChanging().length, todos.length);
          }),
        ),
      ),
    ),
  );

  removeTodo = createEffect<number>(
    pipe(
      tap(id => this.isChanging.update(x => [...x, id])),
      concatMap(todoId =>
        this.todosService.remove(todoId).pipe(
          tap(() => {
            const state = this.state();
            const todos = state.status === 'loaded' ? state.result : [];

            this.state.update(s => ({
              ...s,
              result: todos.filter(x => x.id !== todoId),
            }));

            this.isChanging.update(x => x.filter(id => id !== todoId));

            if (todos.length === 2) {
              this.refresh();
            }
          }),
        ),
      ),
    ),
  );

  refresh() {
    this.params.update(s => ({
      ...s,
      updateIndex: s.updateIndex + 1,
    }));
  }
}
