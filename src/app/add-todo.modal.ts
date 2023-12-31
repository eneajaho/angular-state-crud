import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-add-todo',
  template: `
    <h1 mat-dialog-title>Add todo</h1>
    <div mat-dialog-content>
      <p>Todo title:</p>
      <mat-form-field>
        <mat-label>Todo title:</mat-label>
        <input [(ngModel)]="data.title" matInput cdkFocusInitial />
      </mat-form-field>

      <div
        mat-dialog-actions
        style="display: flex; justify-content: space-between">
        <button
          [mat-dialog-close]="data.title"
          mat-raised-button
          color="primary">
          <mat-icon>save</mat-icon>
          Add todo
        </button>

        <button (click)="dialogRef.close()" mat-button>
          <mat-icon>close</mat-icon>
          Cancel
        </button>
      </div>
    </div>
  `,
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddTodoModal {
  dialogRef = inject(MatDialogRef);
  data = inject<{ title: string }>(MAT_DIALOG_DATA);
}
