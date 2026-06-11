import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Server } from '../../models/server';

// Mock data for performance and security (can be replaced with real data)
const PERFORMANCE_DATA = {
  responseTime: 62,
  memoryUsed: 482,
  memoryTotal: 1024
};
const SECURITY_DATA = {
  compliant: true,
  methods: [
    'Token-based Auth',
    'OAuth',
    'API Keys',
    'Mutual TLS'
  ],
  enabled: ['Token-based Auth', 'API Keys']
};

@Component({
  selector: 'app-server-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './server-modal.component.html',
  styleUrl: './server-modal.component.scss'
})
export class ServerModalComponent {
  @Input() server!: Server;
  @Input() capability!: string;
  @Input() show = false;
  @Output() close = new EventEmitter<void>();

  activeTab: 'overview' | 'capabilities' | 'performance' | 'security' = 'overview';

  onClose() {
    this.close.emit();
  }

  setTab(tab: 'overview' | 'capabilities' | 'performance' | 'security') {
    this.activeTab = tab;
  }

  // Capability details for Capabilities tab
  getCapabilityDetails(cap: string) {
    switch (cap) {
      case 'files':
        return {
          name: 'File System',
          icon: 'bi-folder',
          desc: 'Access and manage files stored on the server. Create, read, update, and delete operations.',
          methods: [
            'listFiles(path: string) - List files in a directory',
            'readFile(path: string) - Read file contents',
            'writeFile(path: string, data: string|Buffer) - Write to a file',
            'deleteFile(path: string) - Delete a file',
            'createDirectory(path: string) - Create a directory'
          ]
        };
      case 'database':
        return {
          name: 'Database',
          icon: 'bi-database',
          desc: 'Query and manage structured data on the server.',
          methods: [
            'query(sql: string) - Run a SQL query',
            'insert(table: string, data: object) - Insert data',
            'update(table: string, id: string, data: object) - Update data',
            'delete(table: string, id: string) - Delete data'
          ]
        };
      case 'apis':
        return {
          name: 'APIs',
          icon: 'bi-gear',
          desc: 'Expose and consume RESTful or RPC APIs.',
          methods: [
            'get(endpoint: string)',
            'post(endpoint: string, data: object)',
            'put(endpoint: string, data: object)',
            'delete(endpoint: string)'
          ]
        };
      case 'auth':
        return {
          name: 'Authentication',
          icon: 'bi-key',
          desc: 'User authentication and authorization services.',
          methods: [
            'login(username: string, password: string)',
            'logout()',
            'refreshToken(token: string)'
          ]
        };
      case 'users':
        return {
          name: 'User Management',
          icon: 'bi-person',
          desc: 'Manage user accounts, roles, and permissions.',
          methods: [
            'createUser(data: object)',
            'deleteUser(id: string)',
            'updateUser(id: string, data: object)',
            'listUsers()'
          ]
        };
      case 'ml':
        return {
          name: 'Machine Learning',
          icon: 'bi-cpu',
          desc: 'Run and manage ML models and training jobs.',
          methods: [
            'trainModel(config: object)',
            'predict(input: object)',
            'listModels()'
          ]
        };
      default:
        return {
          name: cap,
          icon: 'bi-question-circle',
          desc: 'No details available.',
          methods: []
        };
    }
  }

  get performance() {
    return PERFORMANCE_DATA;
  }

  get security() {
    return SECURITY_DATA;
  }
} 