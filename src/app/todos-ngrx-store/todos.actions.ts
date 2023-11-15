import { createActionGroup, props } from '@ngrx/store';
import { GetTodosPayload } from '../todos.service';
import { Todo } from '../todo.model';

export const TodoActions = createActionGroup({
  source: 'TodosCRUD',
  events: {
    load: props<{ payload: Partial<GetTodosPayload> }>(),
    loadSuccess: props<{ data: Todo[]; params: GetTodosPayload }>(),
    loadError: props<{ error: string }>(),
    create: props<{ title: string }>(),
    createSuccess: props<{ todo: Todo }>(),
    createError: props<{ error: string }>(),
    update: props<{ todo: Todo }>(),
    updateSuccess: props<{ todo: Todo }>(),
    updateError: props<{ error: string; todo: Todo }>(),
    remove: props<{ id: number }>(),
    removeSuccess: props<{ id: number }>(),
    removeError: props<{ id: number; error: string }>(),
  },
});
