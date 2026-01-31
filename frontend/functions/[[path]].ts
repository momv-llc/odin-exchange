// frontend/functions/[[path]].ts
// Простой passthrough для Next.js
export async function onRequest(context: { next: () => Promise<Response> }) {
  return context.next();
}
