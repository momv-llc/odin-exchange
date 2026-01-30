// frontend/functions/[[path]].ts
export const onRequest: PagesFunction = async (context) => {
  return context.next();
};