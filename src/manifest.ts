import { ManifestFactoy } from '@shenghuabi/sdk/server';
import { mcpRunner } from './workflow/node/mcp/server';
import { Options } from './type';
// sse: { url: string; authorization: { bearerToken: string } }[];
// stdio: { command: string; args: string[]; env?: Record<string, any>; cwd?: string }[];

export const manifestFactory = (options: Options): ManifestFactoy => {
  return (input) => {
    return {
      workflow: {
        node: [
          {
            client: './workflow/node/mcp/client/index.js',
            runner: mcpRunner(input, options),
            config: {
              type: 'mcp',
              label: `mcp服务器`,
              icon: 'handyman',
              color: 'accent',
              help: [`- 使用mcp服务器`].join('\n'),
            },
          },
        ],
        context: {
          getMcpClientList: () => {
            return options.getMcpClientList();
          },
        },
      },
    };
  };
};

