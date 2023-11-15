import { createSelector } from '@ngrx/store';
import { TodosFeatureState } from './todos.reducer';

export const todosFeatureKey = 'todosFeature';

export interface AppState {
  [todosFeatureKey]: TodosFeatureState;
}

export const selectTodosFeatureState = (state: AppState) =>
  state[todosFeatureKey];

export const selectTodosData = createSelector(
  selectTodosFeatureState,
  (state: TodosFeatureState) => state.data,
);

export const selectTodosParams = createSelector(
  selectTodosFeatureState,
  (state: TodosFeatureState) => state.params,
);

export const selectTodosLoading = createSelector(
  selectTodosFeatureState,
  (state: TodosFeatureState) => state.loading,
);

export const selectTodosError = createSelector(
  selectTodosFeatureState,
  (state: TodosFeatureState) => state.error,
);
