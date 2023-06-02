import App from '../src/app';
import { renderToString } from 'react-dom/server';

import { getSplitFlag } from '../func/split';
import { Timer, createTimer } from "../util/utils" 

let isCold = true;

async function ssrConsumeSplit(): Promise<string> {
    let stopwatch: Timer = createTimer();

    const flagResult = await getSplitFlag("first_split", stopwatch);

    const split : string = JSON.stringify({ flagResult, duration: stopwatch.duration() });
    //const split = "{ 'treatment': 'ok', duration: 0 }" // JSON.parse( splitString );

    console.log("returning from server-side props")
    return split;
}

export default async function Handler(req: Request) {
  const wasCold = isCold;
  let html: string;
  isCold = false;

    let split: string = await ssrConsumeSplit();

  try {
      html = renderToString(<App req={req} isCold={wasCold} s={split} />);
  } catch (err) {
    console.error('Render error:', err.stack);
    return new Response(
      `<!doctype html><h1>Internal application error</h1>
      <p>The app failed to render. Check your Edge Function logs.</p>`,
      {
        status: 500,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      }
    );
  }

  return new Response(`<!doctype html>` + html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'x-is-cold': wasCold ? 'true' : 'false',
    },
  });
}
