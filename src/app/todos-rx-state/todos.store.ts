import { inject, Injectable } from '@angular/core';
import { rxState } from '@rx-angular/state';
import { concatMap, map, mergeMap, Observable, tap } from 'rxjs';
import { GetTodosPayload, TodosService } from '../todos.service';
import { rxActions } from '@rx-angular/state/actions';
import { insert, remove } from '@rx-angular/cdk/transformations';
import { Todo } from '../todo.model';
import { rxStateful$ } from '@angular-kit/rx-stateful';
import { HttpErrorResponse } from '@angular/common/http';

export interface TodosState {
  data: Todo[];
  isChanging: number[];
  params: Partial<GetTodosPayload>;
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
export class RxStateTodosStore {
  private todosService = inject(TodosService);

  actions = rxActions<{
    loadTodos: Partial<GetTodosPayload>;
    addTodo: string;
    updateTodo: Todo;
    removeTodo: number;
  }>();

  state = rxState<TodosState>(({ set, connect, get }) => {
    set(initialState);

    const loadTodoRequest$ = rxStateful$<
      Todo[],
      Partial<GetTodosPayload>,
      HttpErrorResponse
    >(
      payload =>
        this.todosService.get({ ...get('params'), ...payload }).pipe(
          tap(() => {
            set(() => ({ params: { ...get('params'), ...payload } }));
          }),
        ),
      {
        sourceTriggerConfig: {
          trigger: this.actions.loadTodos$,
        },
        errorMappingFn: (error: HttpErrorResponse) => error?.message,
      },
    );

    const loading$: Observable<Partial<TodosState>> = loadTodoRequest$.pipe(
      map(v => ({
        loading: v.isSuspense,
        loaded: !v.isSuspense,
        error: (v.error as unknown as string) ?? null,
      })),
    );

    connect(loading$);
    connect(
      loadTodoRequest$.pipe(
        map(v => ({
          data: v.value ?? [],
          error: null,
          total: v.value?.length ?? 0,
        })),
      ),
    );

    connect(
      'data',
      this.actions.addTodo$.pipe(
        concatMap(payload => this.todosService.add(payload)),
      ),
      (state, todo) => {
        state.data.unshift(todo);
        return state.data;
      },
    );

    connect(
      this.actions.updateTodo$.pipe(
        mergeMap(todo => {
          set(s => ({ isChanging: insert(s.isChanging, todo.id) }));
          return this.todosService.toggle(todo);
        }),
      ),
      (state, todo) => {
        return {
          data: state.data.map(item => ({
            ...item,
            completed: item.id === todo.id ? todo.completed : item.completed,
          })),
          isChanging: remove(state.isChanging, todo.id),
        };
      },
    );

    connect(
      this.actions.removeTodo$.pipe(
        concatMap(todoId => {
          set(s => ({ isChanging: insert(s.isChanging, todoId) }));
          return this.todosService.remove(todoId);
        }),
      ),
      (state, todoId) => ({
        ...this.state,
        data: remove(state.data, [], item => item.id === todoId),
        isChanging: remove(state.isChanging, todoId),
      }),
    );
  });

  data = this.state.computed(({ isChanging, data }) =>
    data().map(item => ({
      ...item,
      isChanging: isChanging().includes(item.id),
    })),
  );

  total = this.state.signal('total');
  error = this.state.signal('error');
  loading = this.state.signal('loading');
  searchQuery = this.state.computed(({ params }) => params().searchQuery || '');

  constructor() {
    this.state.select().subscribe(console.log);
  }
}
