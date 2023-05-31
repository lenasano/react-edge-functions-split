import { NextRequest, NextFetchEvent, URLPattern } from "next/server";
import { SplitFactory } from '@splitsoftware/splitio-browserjs';

import { Timer, createTimer } from "../../../../util/utils"

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
// Request example: https://<HOST>/api/edge/split/flag/{flagname}


// Run API route as an Edge function rather than a Serverless one, because the SDK uses Fetch API to flush data, which is available in Edge runtime but not in Serverless.
export const config = { runtime: "experimental-edge" };

let ne: NextFetchEvent = null;


export async function get(flagname: string, timer?: Timer): Promise<string> {

    // instantiate the SDK
    const factory = SplitFactory({
        core: {
            authorizationKey: process.env.SPLIT_SDK_KEY_STNDALN,
            key: 'user_id_doesnt_matter_getting_default_treatment'
        },
        debug: "INFO"
    })

    // and get the client instance
    const client = factory.client()

    console.log(`hello from split: ${client !== null}`)

    await client.ready()

    console.log("split is ready")

    const treatment = await client.getTreatment( flagname )

    if (timer) timer.stop()

    console.log(`split result is ${treatment}`)

    ne !== null ? ne.waitUntil(client.destroy()) : await client.destroy()

    return treatment
}

export default async function handler(req: NextRequest, event: NextFetchEvent) {
    
    ne = event;

    // extract Split feature flag name from request url
    const { searchParams } = new URL(req.url);
    const flagname = searchParams.get('flagname');

    let stopwatch: Timer = createTimer();

    const treatment = await get(flagname, stopwatch);

    ne = null;

    return new Response(JSON.stringify({ treatment, duration: stopwatch.duration() }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
    });
}