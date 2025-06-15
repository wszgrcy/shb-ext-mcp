import { ManifestInput } from '@shenghuabi/sdk/server';
import { NODE_DEFINE } from '../common/define';
import { Options } from '../../../../type';

export function mcpRunner(input: ManifestInput, options: Options) {
  return class extends input.provider.workflow.NodeRunnerBase {
    #chat = input.inject(input.provider.root.ChatService);
    #chatUtil = input.inject(input.provider.root.ChatUtilService);
    override async run() {
      const node = this.getParsedNode(NODE_DEFINE(input.componentDefine as any));
      const mcpName = node.data.config.name;
      const client = (await options.getMcpClientObj())[mcpName];
      const chatInput = this.#chatUtil.interpolate(node.data.value, this.inputValueObject$$());
      const instance = await this.#chat.chat();
      const tools = await client.listTools();
      const toolResult = await instance.callTool({
        messages: [
          {
            role: 'user',
            content: [{ type: 'text', text: chatInput }],
          },
        ],
        tools: tools.tools.map((item) => ({
          type: 'function',
          function: {
            name: item.name,
            description: item.description,
            parameters: item.inputSchema,
          },
        })),
      });

      return async () => {
        if (toolResult.type === 'text') {
          return { value: toolResult.text };
        } else {
          const result = await client.callTool({ name: toolResult.function.name, arguments: toolResult.function.arguments });
          return { value: (result.content as any)[0].text };
        }
      };
    }
  };
}
