import { environment } from '../environments/environment';
import { map, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Todo } from './todo.model';
import { Sort } from '@angular/material/sort';

export interface GetTodosPayload {
  searchQuery: string;
  pageSize: number;
  pageIndex: number;
  sort: Sort | null;
}

@Injectable({ providedIn: 'root' })
export class TodosService {
  constructor(private http: HttpClient) {}

  get(payload: Partial<GetTodosPayload>): Observable<Todo[]> {
    const path = `${environment.api}/todos`;

    let params = new HttpParams();

    if (payload) {
      if (payload.pageIndex) {
        params = params.set('_page', payload.pageIndex);
      }
      if (payload.pageSize) {
        params = params.set('_limit', payload.pageSize);
      }
      if (payload.searchQuery && payload.searchQuery !== '') {
        params = params.set('q', payload.searchQuery);
      }
      if (payload.sort) {
        params = params.set('_sort', payload.sort.active);
        params = params.set('_order', payload.sort.direction);
      }
    }

    return this.http.get<Todo[]>(path, { params });

    // _page=7&_limit=20&_sort=views&_order=asc _like=server  ?q=internet
  }

  add(todo: string): Observable<Todo> {
    const path = `${environment.api}/todos`;
    const payload = {
      userId: Math.floor(Math.random() * 200),
      title: todo + Math.floor(Math.random() * 200),
      completed: false,
    };
    return this.http.post<Todo>(path, payload);
  }

  toggle(todo: Todo): Observable<Todo> {
    const path = `${environment.api}/todos/${todo.id}`;
    return this.http.put<Todo>(path, { ...todo, completed: !todo.completed });
  }

  remove(todoId: number): Observable<number> {
    const path = `${environment.api}/todos/${todoId}`;
    return this.http.delete<unknown>(path).pipe(map(() => todoId));
  }
}
