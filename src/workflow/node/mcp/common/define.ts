import * as v from 'valibot';
import { ComponentContext, ComponentInput } from '@shenghuabi/sdk/componentDefine';
import { debounceTime } from 'rxjs';

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
                  Action.patchAsyncInputs({
                    options: (field) => (field.context as ComponentContext).pluginMethod('getMcpClientList', []),
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
              Action.valueChange((fn) => {
                fn({ list: [undefined] })
                  .pipe(debounceTime(100))
                  .subscribe(({ list: [value], field }) => {
                    if (typeof value !== 'string') {
                      return;
                    }
                    field.context.changeHandleByTemplate(field, value, 1);
                  });
              }),
            ],
          })
        ),
      }),
      Action.asColumn()
    ),
  });
}
