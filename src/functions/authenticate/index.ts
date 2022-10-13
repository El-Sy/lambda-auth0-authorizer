import { generateHandlerPath } from '@libs/handler-resolver';

export default {
  handler: `${generateHandlerPath(__dirname)}/handler.main`
};
