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

  private isChanging = signal<number[]>([]);

  private params = signal<GetParamsPayload>({
    pageIndex: 1,
    pageSize: 10,
    sort: null,
    searchQuery: '',
    updateIndex: 0,
  });

  setParams = (params: Partial<GetParamsPayload>) => {
    this.params.update(p => ({ ...p, ...params }));
  };

  // @ts-ignore
  state: Signal<ApiCallState<Todo[]>> = computedFrom(
    [this.params],
    pipe(
      switchMap(([params]) => {
        return this.todosService.get(params).pipe(
          startWith({ status: 'loading', result: [], total: 0 }),
          map(res => {
            console.log({ res });
            // @ts-ignore
            if (res['status'] && res.status === 'loading') return res;
            return { status: 'loaded', result: res, total: 100 } as const;
          }),
          catchError(err => of({ status: 'error', error: err } as const)),
        );
      }),
    ),
  );

  data = computed(() => {
    const state = this.state();
    if (state.status === 'loaded') {
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
        this.todosService.add(title).pipe(tap(() => this.refresh())),
      ),
    ),
  );

  updateTodo = createEffect<Todo>(
    pipe(
      tap(todo => this.isChanging.update(x => [...x, todo.id])),
      concatMap(todo =>
        this.todosService.toggle(todo).pipe(
          tap(() => {
            this.isChanging.update(x => x.filter(id => id !== todo.id));
            if (this.isChanging().length === 0) {
              this.refresh();
            }
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
            this.isChanging.update(x => x.filter(id => id !== todoId));
            if (this.isChanging().length === 0) {
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
