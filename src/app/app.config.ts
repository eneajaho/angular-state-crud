import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import {
  HttpInterceptorFn,
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { delay } from 'rxjs';
import { provideState, provideStore } from '@ngrx/store';
import { todosReducer } from './todos-ngrx-store/todos.reducer';
import { provideEffects } from '@ngrx/effects';
import { TodosEffects } from './todos-ngrx-store/todos.effects';
import { todosFeatureKey } from './todos-ngrx-store/todos.state';

const delayInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(delay(1000));
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withFetch(), withInterceptors([delayInterceptor])),

    // NGRX Store providers
    provideStore({}),
    provideState({ name: todosFeatureKey, reducer: todosReducer }),
    provideEffects(TodosEffects),
  ],
};
