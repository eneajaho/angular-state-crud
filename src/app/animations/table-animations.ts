import {animate, group, query, style, transition, trigger} from "@angular/animations";

export const rowsAnimation = trigger('rowsAnimation', [
    transition('completed <=> uncompleted', [
        style({ background: 'rgba(103,58,183,0.37)' }),
        animate('250ms', style({ background: '#fff' })),
    ]),
    transition(':enter',
        query('.mat-mdc-cell', [
            style({ opacity: '0', background: 'rgba(103,58,183,0.37)' }),
            animate('250ms', style({ opacity: '1', background: '#fff' })),
        ], { optional: true })
    )
]);

export const rowRemoveAnimation = trigger('rowRemoveAnimation', [
    transition('* => removed', group([
        query('.mat-cell', [
            style({ opacity: '1', background: 'rgba(246,0,0,0.11)', transform: 'translateX(0p)' }),
            animate('300ms',
                style({ opacity: '0', background: 'rgba(246,0,0,0.9)', transform: 'translateX(250px)' })
            ),
        ])
    ])),
]);
