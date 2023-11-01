import {inject, Injectable} from "@angular/core";
import {rxState} from "@rx-angular/state"
import {catchError, concatMap, map, of, switchMap, tap} from "rxjs";
import {GetTodosPayload, TodosService} from "../todos.service";
import {rxActions} from "@rx-angular/state/actions";
import {Todo} from "../todo.model";

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

@Injectable({providedIn: 'root'})
export class RxStateTodosStore {
    private todosService = inject(TodosService);

    actions = rxActions<{
        loadTodos: Partial<GetTodosPayload>,
        addTodo: string,
        updateTodo: Todo,
        removeTodo: number,
    }>();

    state = rxState<TodosState>(({set, connect, get}) => {
        set(initialState);

        connect(
            this.actions.loadTodos$.pipe(
                tap(() => set({loading: true, loaded: false, error: null})),
                switchMap(payload => {
                    const currentParams = get('params');
                    const newPayload = {...currentParams, ...payload};
                    return this.todosService.get(newPayload).pipe(
                        map((data: Todo[]) => ({
                            data, error: null, loading: false,
                            loaded: true, params: newPayload, total: 100
                        })),
                        catchError(err => of({ error: err.message })
                    ));
                }),
            ),
        );

        connect(
            'data',
            this.actions.addTodo$.pipe(
                concatMap(payload => this.todosService.add(payload))
            ),
            (state, todo) => {
                state.data.unshift(todo);
                return state.data;
            }
        );

        connect(
            'data',
            this.actions.updateTodo$.pipe(
                concatMap(payload => this.todosService.toggle(payload))
            ),
            (state, todo) => state.data.map(item => {
                if (todo.id === item.id) {
                    item.completed = todo.completed;
                }
                return item;
            })
        );

        connect(
            'data',
            this.actions.removeTodo$.pipe(
                concatMap(payload => this.todosService.remove(payload))
            ),
            (state, todoId) => state.data.filter(x => x.id !== todoId)
        );
    });
}
