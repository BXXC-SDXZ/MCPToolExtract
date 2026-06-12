import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-filter-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-sidebar.component.html',
  styleUrl: './filter-sidebar.component.scss'
})
export class FilterSidebarComponent implements OnInit {
  @Output() filtersChanged = new EventEmitter<any>();
  
  activeFilters: {
    transport: string[],
    location: string[],
    capabilities: string[]
  } = {
    transport: [],
    location: [],
    capabilities: []
  };

  constructor() { }

  ngOnInit(): void {
  }

  toggleFilter(type: 'transport' | 'location' | 'capabilities', value: string, event: any): void {
    if (event.target.checked) {
      this.activeFilters[type].push(value);
    } else {
      this.activeFilters[type] = this.activeFilters[type].filter(item => item !== value);
    }
    
    this.filtersChanged.emit(this.activeFilters);
  }
}
