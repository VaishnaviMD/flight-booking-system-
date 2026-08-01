import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

export interface CancellationDialogData {
  reasons: string[];
  refundAmount: string;
}

@Component({
  selector: 'app-booking-cancellation-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
  ],
  templateUrl: './booking-cancellation-modal.component.html',
})
export class BookingCancellationModalComponent {
  constructor(
    private dialogRef: MatDialogRef<BookingCancellationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CancellationDialogData
  ) {}

  selectedReason = '';

  get reason(): string {
    return this.selectedReason || (this.data?.reasons?.[0] ?? '');
  }

  close(): void {
    this.dialogRef.close();
  }

  confirm(): void {
    this.dialogRef.close(this.reason);
  }
}
