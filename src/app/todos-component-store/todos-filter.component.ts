import {ChangeDetectionStrategy, Component, EventEmitter, Output} from '@angular/core';
import {FormControl, ReactiveFormsModule, UntypedFormControl} from '@angular/forms';
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";

@Component({
    selector: 'todos-filter',
    template: `
        <form>
            <mat-form-field appearance="fill">
                <mat-label>Search query</mat-label>
                <input matInput [formControl]="searchControl" placeholder="Search todos...">
            </mat-form-field>

            <button mat-raised-button color="primary" type="button"
                    (click)="filtered.emit(searchControl.value)">
                <mat-icon>search</mat-icon>
                <span>Search</span>
            </button>
        </form>
    `,
    styles: `
    form {
      display: flex;
      align-items: center;
      gap: 10px;
        
        button {
          margin-bottom: 15px;
          margin-left: 15px;
            
            mat-icon {
                margin-right: 4px;
            }
        }
    }
  `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatInputModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule
    ]
})
export class TodosFilterComponent {

    searchControl = new FormControl('', {nonNullable: true});

    @Output() filtered = new EventEmitter<string>();

}
