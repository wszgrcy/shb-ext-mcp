import * as vscode from 'vscode';
import { manifestFactory } from './manifest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { GlobalAllConfig } from './config';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { BehaviorSubject } from 'rxjs';
import { shbPluginRegister } from '@shenghuabi/sdk';
let dispose$$: Promise<() => void> | undefined;
export function activate(context: vscode.ExtensionContext) {
  let mcpObject: Record<string, Client> = {};
  let mcpList: any[] = [];
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      const result = e.affectsConfiguration('shb-mcp.server');
      if (result) {
        event.next(undefined);
      }
    })
  );
  const event = new BehaviorSubject(undefined);
  event.subscribe(() => {
    mcpList = [];
    mcpObject = {};
    const sseList = (GlobalAllConfig.get('sse') ?? []) as any[];
    sseList.forEach(async (item) => {
      const mcp = new Client({ name: 'mcp', version: '1.0.0' });
      const transport = new SSEClientTransport(new URL(item.url), {
        requestInit: { headers: { Authorization: `Bearer ${item.authorization.bearerToken}` } },
      });
      await mcp.connect(transport);
      const version = mcp.getServerVersion()!;
      mcpObject[version.name] = mcp;
      mcpList.push({ label: `${version.name}(${version.version})`, value: version.name });
    });
    const stdioList = (GlobalAllConfig.get('stdio') ?? []) as any[];
    stdioList.forEach(async (item) => {
      const mcp = new Client({ name: 'mcp', version: '1.0.0' });
      const transport = new StdioClientTransport({
        command: item.command,
        args: item.args,
        env: item.env,
        cwd: item.cwd,
      });
      await mcp.connect(transport);
      const version = mcp.getServerVersion()!;
      mcpObject[version.name] = mcp;
      mcpList.push({ label: `${version.name}(${version.version})`, value: version.name });
    });
  });
  dispose$$ = shbPluginRegister(
    context,
    manifestFactory({
      async getMcpClientList() {
        return mcpList;
      },
      async getMcpClientObj() {
        return mcpObject;
      },
    })
  );
}
export function deactivate() {
  dispose$$?.then((fn) => fn());
}
