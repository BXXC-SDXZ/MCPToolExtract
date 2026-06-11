export interface Server {
  id: string;
  name: string;
  status: 'Online' | 'Offline';
  location: 'local' | 'remote';
  version: string;
  lastUpdated: string;
  transport: 'websockets' | 'stdio' | 'sse';
  security: 'Compliant' | 'Partial' | 'None';
  capabilities: string[];
}
