import { Routes } from '@angular/router';
import { ComponentStoreTodosComponent } from './todos-component-store/todos.component';
import { RxStateTodosComponent } from './todos-rx-state/todos.component';
import { NgrxStoreTodosComponent } from './todos-ngrx-store/todos.component';
import { NgxtensionTodosComponent } from './todos-ngxtension/todos.component';

export const routes: Routes = [
  { path: 'component-store', component: ComponentStoreTodosComponent },
  { path: 'rx-state', component: RxStateTodosComponent },
  { path: 'ngxtension', component: NgxtensionTodosComponent },
  {
    path: 'ngrx-store',
    component: NgrxStoreTodosComponent,
  },
  { path: '**', redirectTo: 'rx-state' },
];
