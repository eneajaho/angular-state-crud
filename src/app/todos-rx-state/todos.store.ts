import { inject, Injectable } from "@angular/core";
import { rxState } from "@rx-angular/state";
import {
  catchError,
  concatMap,
  map,
  mergeMap,
  of,
  startWith,
  switchMap,
  withLatestFrom,
} from "rxjs";
import { GetTodosPayload, TodosService } from "../todos.service";
import { rxActions } from "@rx-angular/state/actions";
import { insert, remove } from "@rx-angular/cdk/transformations";
import { Todo } from "../todo.model";

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
    searchQuery: "",
  },
  total: 0,
  loaded: false,
  loading: false,
  error: null,
};

@Injectable({ providedIn: "root" })
export class RxStateTodosStore {
  private todosService = inject(TodosService);

  actions = rxActions<{
    loadTodos: Partial<GetTodosPayload>;
    addTodo: string;
    updateTodo: Todo;
    removeTodo: number;
  }>();

  state = rxState<TodosState>(({ set, connect, get, select }) => {
    set(initialState);

    connect(
      this.actions.loadTodos$.pipe(
        switchMap((payload) => {
          set((s) => ({ loading: true, loaded: false, error: null }));
          const newPayload = { ...get("params"), ...payload };
          return this.todosService.get(newPayload).pipe(
            map((data: Todo[]) => ({
              data,
              error: null,
              loading: false,
              loaded: true,
              params: newPayload,
              total: 100,
            })),
            catchError((err) => of({ error: err.message }))
          );
        })
      )
    );

    connect(
      "data",
      this.actions.addTodo$.pipe(
        concatMap((payload) => this.todosService.add(payload))
      ),
      (state, todo) => {
        state.data.unshift(todo);
        return state.data;
      }
    );

    connect(
      this.actions.updateTodo$.pipe(
        mergeMap((todo) => {
          set((s) => ({ isChanging: insert(s.isChanging, todo.id) }));
          return this.todosService.toggle(todo);
        })
      ),
      (state, todo) => {
        return {
          data: state.data.map((item) => ({
            ...item,
            completed: item.id === todo.id ? todo.completed : item.completed,
          })),
          isChanging: remove(state.isChanging, todo.id),
        };
      }
    );

    connect(
      this.actions.removeTodo$.pipe(
        concatMap((todoId) => {
          set((s) => ({ isChanging: insert(s.isChanging, todoId) }));
          return this.todosService.remove(todoId);
        })
      ),
      (state, todoId) => ({
        ...this.state,
        data: remove(state.data, [], (item) => item.id === todoId),
        isChanging: remove(state.isChanging, todoId),
      })
    );
  });

  data = this.state.computed(({ isChanging, data }) =>
    data().map((item) => ({
      ...item,
      isChanging: isChanging().includes(item.id),
    }))
  );

  total = this.state.signal("total");
  error = this.state.signal("error");
  loading = this.state.signal("loading");
  searchQuery = this.state.computed(({ params }) => params().searchQuery || "");
}
