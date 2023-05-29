import RootLayout from '../app/layout';
import { renderToReadableStream } from 'react-dom/server';

export default async function Handler(req: Request) {
  let didError = false;

  const stream = await renderToReadableStream(<RootLayout />, {
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