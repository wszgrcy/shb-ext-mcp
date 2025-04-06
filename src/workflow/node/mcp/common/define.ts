import * as v from 'valibot';
import { ComponentContext, ComponentInput } from '@shenghuabi/sdk/componentDefine';

export function NODE_DEFINE({ Action }: ComponentInput) {
  return v.object({
    data: v.pipe(
      v.object({
        config: v.pipe(
          v.object({
            name: v.pipe(
              v.string(),
              v.title('服务器名'),
              Action.condition({
                environments: ['default'],
                actions: [
                  Action.define({ type: 'picklist', inputs: { options: [] } }),
                  Action.hookDefine({
                    allFieldsResolved(field) {
                      (field.context as ComponentContext).pluginMethod('getMcpClientList', []).then((options: any) => {
                        field.inputs.update((inputs) => {
                          return { ...inputs, options };
                        });
                      });
                    },
                  }),
                ],
              })
            ),
          }),
          Action.asColumn()
        ),
        value: v.pipe(
          v.optional(v.string(), '{{问题}}'),
          v.title('问题'),
          Action.condition({
            environments: ['display', 'default'],
            actions: [
              Action.define({ type: 'string' }),
              Action.valueChange({
                list: [undefined],
                debounceTime: 100,
                when: ([value]: string[], field) => {
                  field.context.changeHandleByTemplate(field, value, 1);
                },
              }),
            ],
          })
        ),
      }),
      Action.asColumn()
    ),
  });
}
