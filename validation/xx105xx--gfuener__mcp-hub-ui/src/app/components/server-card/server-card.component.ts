import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Server } from '../../models/server';
import { ServerModalComponent } from '../server-modal/server-modal.component';

@Component({
  selector: 'app-server-card',
  standalone: true,
  imports: [CommonModule, ServerModalComponent],
  templateUrl: './server-card.component.html',
  styleUrl: './server-card.component.scss'
})
export class ServerCardComponent {
  @Input() server!: Server;

  showModal = false;
  selectedCapability: string | null = null;

  openModal(capability: string) {
    this.selectedCapability = capability;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedCapability = null;
  }
}
