import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Server } from '../models/server';

@Injectable({
  providedIn: 'root'
})
export class ServerService {
  private servers: Server[] = [
    {
      id: '1',
      name: 'IoT Data Collector',
      status: 'Online',
      location: 'local',
      version: 'v1.2.0',
      lastUpdated: '2 days ago',
      transport: 'websockets',
      security: 'Partial',
      capabilities: ['apis', 'database']
    },
    {
      id: '2',
      name: 'Legacy Document Server',
      status: 'Offline',
      location: 'remote',
      version: 'v0.9.5',
      lastUpdated: '4 weeks ago',
      transport: 'stdio',
      security: 'None',
      capabilities: ['files']
    },
    {
      id: '3',
      name: 'API Gateway',
      status: 'Online',
      location: 'remote',
      version: 'v3.1.0',
      lastUpdated: '12 hours ago',
      transport: 'websockets',
      security: 'Compliant',
      capabilities: ['apis', 'auth']
    },
    {
      id: '4',
      name: 'ML Training Server',
      status: 'Online',
      location: 'remote',
      version: 'v2.0.1',
      lastUpdated: '5 days ago',
      transport: 'websockets',
      security: 'Partial',
      capabilities: ['apis', 'ml']
    },
    {
      id: '5',
      name: 'Primary Data Server',
      status: 'Online',
      location: 'local',
      version: 'v2.4.1',
      lastUpdated: '2 hours ago',
      transport: 'websockets',
      security: 'Compliant',
      capabilities: ['files', 'database']
    },
    {
      id: '6',
      name: 'Analytics Backend',
      status: 'Offline',
      location: 'remote',
      version: 'v1.8.3',
      lastUpdated: '3 days ago',
      transport: 'sse',
      security: 'Partial',
      capabilities: ['apis', 'auth']
    },
    {
      id: '7',
      name: 'User Auth Server',
      status: 'Online',
      location: 'remote',
      version: 'v3.0.2',
      lastUpdated: '1 day ago',
      transport: 'websockets',
      security: 'Compliant',
      capabilities: ['auth', 'users']
    }
  ];

  constructor() { }

  getServers(): Observable<Server[]> {
    return of(this.servers);
  }

  filterServers(filters: {
    transport?: string[],
    location?: string[],
    capabilities?: string[]
  }): Observable<Server[]> {
    let filteredServers = [...this.servers];
    
    if (filters.transport && filters.transport.length > 0) {
      filteredServers = filteredServers.filter(server => 
        filters.transport?.includes(server.transport));
    }
    
    if (filters.location && filters.location.length > 0) {
      filteredServers = filteredServers.filter(server => 
        filters.location?.includes(server.location));
    }
    
    if (filters.capabilities && filters.capabilities.length > 0) {
      filteredServers = filteredServers.filter(server => 
        server.capabilities.some(cap => filters.capabilities?.includes(cap)));
    }
    
    return of(filteredServers);
  }
}
