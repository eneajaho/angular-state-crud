import { createReducer, on } from '@ngrx/store';
import { GetTodosPayload } from '../todos.service';
import { Todo } from '../todo.model';
import { TodoActions } from './todos.actions';

export interface TodosFeatureState {
  data: Todo[];
  isChanging: number[];
  params: GetTodosPayload;
  total: number;
  loading: boolean;
  loaded: boolean;
  error: string | null;
}

const initialState: TodosFeatureState = {
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

export const todosReducer = createReducer(
  initialState,
  on(TodoActions.load, state => ({
    ...state,
    loading: true,
    loaded: false,
    error: null,
  })),
  on(TodoActions.loadSuccess, (state, { data, params }) => ({
    ...state,
    data,
    params,
    loading: false,
    loaded: true,
    error: null,
    total: 100, // this should be retrieved from headers, or most of the time will come with the response body
  })),
  on(TodoActions.loadError, (state, { error }) => ({
    ...state,
    loading: false,
    loaded: false,
    error,
  })),

  on(TodoActions.createSuccess, (state, { todo }) => ({
    ...state,
    data: [todo, ...state.data],
  })),

  on(TodoActions.createError, (state, { error }) => ({
    ...state,
    error,
  })),

  on(TodoActions.update, (state, { todo }) => ({
    ...state,
    isChanging: [...state.isChanging, todo.id],
  })),

  on(TodoActions.updateSuccess, (state, { todo }) => ({
    ...state,
    data: state.data.map(item => (item.id === todo.id ? todo : item)),
    isChanging: state.isChanging.filter(id => id !== todo.id),
  })),

  on(TodoActions.updateError, (state, { todo, error }) => ({
    ...state,
    error,
    isChanging: state.isChanging.filter(id => id !== todo.id),
  })),

  on(TodoActions.remove, (state, { id }) => ({
    ...state,
    isChanging: [...state.isChanging, id],
  })),

  on(TodoActions.removeSuccess, (state, { id }) => ({
    ...state,
    data: state.data.filter(item => item.id !== id),
    isChanging: state.isChanging.filter(itemId => itemId !== id),
  })),

  on(TodoActions.removeError, (state, { id, error }) => ({
    ...state,
    error,
    isChanging: state.isChanging.filter(itemId => itemId !== id),
  })),
);
