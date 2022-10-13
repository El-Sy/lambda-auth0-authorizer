import * as auth0 from '@libs/auth0'

let data;

const authenticate: any = async (event, context) => {
  try {
    data = await auth0.authenticate(event);
  }
  catch (err) {
      console.log(err);
      return context.fail("Unauthorized");
  }
  return data;
};

export const main = authenticate;
