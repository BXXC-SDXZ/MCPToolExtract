import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ServerDashboardComponent } from './components/server-dashboard/server-dashboard.component';
import { HeaderComponent } from './components/header/header.component';
import { FilterSidebarComponent } from './components/filter-sidebar/filter-sidebar.component';
import { ServerCardComponent } from './components/server-card/server-card.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    ServerDashboardComponent,
    HeaderComponent,
    FilterSidebarComponent,
    ServerCardComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'mcp-hub-ui';
}
