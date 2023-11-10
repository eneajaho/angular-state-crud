import { Routes } from "@angular/router";
import { ComponentStoreTodosComponent } from "./todos-component-store/todos.component";
import { RxStateTodosComponent } from "./todos-rx-state/todos.component";

export const routes: Routes = [
  { path: "component-store", component: ComponentStoreTodosComponent },
  { path: "rx-state", component: RxStateTodosComponent },
  { path: "**", redirectTo: "rx-state" },
];
