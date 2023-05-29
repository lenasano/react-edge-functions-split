import Page from '../app/page';
import { renderToReadableStream } from 'react-dom/server';

export default async function Handler(req: Request) {
  let didError = false;

  const stream = await renderToReadableStream(<Page />, {
    onError(err: Error) {
      didError = true;
      console.error(err);
    },
  });

  return new Response(stream, {
    status: didError ? 500 : 200,
    headers: { 'Content-Type': 'text/html' },
  });
}
// <App req={req} />