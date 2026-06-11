import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Server } from '../../models/server';
import { ServerService } from '../../services/server.service';
import { HeaderComponent } from '../header/header.component';
import { FilterSidebarComponent } from '../filter-sidebar/filter-sidebar.component';
import { ServerCardComponent } from '../server-card/server-card.component';

@Component({
  selector: 'app-server-dashboard',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FilterSidebarComponent, ServerCardComponent],
  templateUrl: './server-dashboard.component.html',
  styleUrl: './server-dashboard.component.scss'
})
export class ServerDashboardComponent implements OnInit {
  servers: Server[] = [];
  filteredServers: Server[] = [];

  constructor(private serverService: ServerService) { }

  ngOnInit(): void {
    this.serverService.getServers().subscribe(servers => {
      this.servers = servers;
      this.filteredServers = [...servers];
    });
  }

  applyFilters(filters: any): void {
    if (
      filters.transport.length === 0 && 
      filters.location.length === 0 && 
      filters.capabilities.length === 0
    ) {
      this.filteredServers = [...this.servers];
      return;
    }
    
    this.serverService.filterServers(filters).subscribe(filteredServers => {
      this.filteredServers = filteredServers;
    });
  }
}
