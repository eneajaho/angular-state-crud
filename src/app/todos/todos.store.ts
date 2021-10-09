import { Injectable } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";
import { Observable, switchMap, tap } from "rxjs";
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
      return this.todosService.get(newPayload).pipe(tap({
        next: (data: Todo[]) =>
          this.patchState({
            data, error: null, loading: false, loaded: true, params: newPayload,
            total: 100 // this should be retrieved from headers, or most of the time will come with the response body
          }),
        error: (error: string) =>
          this.patchState({
            error, data: [], loading: false, loaded: false, params: initialState.params
          })
      }));
    })
  ));

}
