import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { TodosService } from '../todos.service';
import {
  catchError,
  concatMap,
  map,
  mergeMap,
  of,
  switchMap,
  withLatestFrom,
} from 'rxjs';
import { TodoActions } from './todos.actions';
import { Store } from '@ngrx/store';
import { selectTodosParams } from './todos.state';

@Injectable()
export class TodosEffects {
  private actions$ = inject(Actions);
  private todosService = inject(TodosService);
  private store = inject(Store);

  loadTodos$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodoActions.load),
      withLatestFrom(this.store.select(selectTodosParams)),
      switchMap(([{ payload }, params]) => {
        const newPayload = { ...params, ...payload };
        return this.todosService.get(newPayload).pipe(
          map(data => TodoActions.loadSuccess({ data, params: newPayload })),
          catchError(error => of(TodoActions.loadError({ error }))),
        );
      }),
    ),
  );

  addTodo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodoActions.create),
      concatMap(({ title }) =>
        this.todosService.add(title).pipe(
          map(todo => TodoActions.createSuccess({ todo })),
          catchError(error => of(TodoActions.createError({ error }))),
        ),
      ),
    ),
  );

  updateTodo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodoActions.update),
      mergeMap(({ todo }) =>
        this.todosService.toggle(todo).pipe(
          map(() => TodoActions.updateSuccess({ todo })),
          catchError(error => of(TodoActions.updateError({ error, todo }))),
        ),
      ),
    ),
  );

  removeTodo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodoActions.remove),
      concatMap(({ id }) =>
        this.todosService.remove(id).pipe(
          map(() => TodoActions.removeSuccess({ id })),
          catchError(error => of(TodoActions.removeError({ error, id }))),
        ),
      ),
    ),
  );
}
