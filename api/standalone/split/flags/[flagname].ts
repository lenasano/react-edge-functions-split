import { NextRequest, NextFetchEvent } from "next/server";
import { SplitFactory } from '@splitsoftware/splitio-browserjs';

import { Timer, createTimer } from "../../../../util/utils"
import { getSplitFlag } from "../../../../func/split"

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
// Request example: https://<HOST>/api/edge/split/flag/{flagname}


// Run API route as an Edge function rather than a Serverless one, because the SDK uses Fetch API to flush data, which is available in Edge runtime but not in Serverless.
export const config = { runtime: "experimental-edge" };

let ne: NextFetchEvent = null;


export default async function handler(req: NextRequest, event: NextFetchEvent) {
    
    ne = event;

    // extract Split feature flag name from request url
    const { searchParams } = new URL(req.url);
    const flagname = searchParams.get('flagname');

    let stopwatch: Timer = createTimer();

    const treatment = await getSplitFlag(flagname, stopwatch); // todo: pass ne if it will be used (maybe not needed?)

    ne = null;

    return new Response(JSON.stringify({ treatment, duration: stopwatch.duration() }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
    });
}