import { Client } from '@modelcontextprotocol/sdk/client/index.js';

export interface Options {
  getMcpClientList: () =>Promise<{ label: string; value: string }[]> ;
  getMcpClientObj: () => Promise<Record<string, Client>>;
}
