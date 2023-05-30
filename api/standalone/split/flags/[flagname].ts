import type { NextFetchEvent, NextRequest } from "next/server";
import { SplitFactory } from '@splitsoftware/splitio-browserjs';

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
// Request example: https://<HOST>/api/edge/split/flag/{flagname}


// Run API route as an Edge function rather than a Serverless one, because the SDK uses Fetch API to flush data, which is available in Edge runtime but not in Serverless.
export const config = { runtime: "edge" };

let ne: NextFetchEvent = null;


export async function get(flagname: string): Promise<string> {

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

    console.log(`split result is ${treatment}`)

    ne !== null ? ne.waitUntil(client.destroy()) : await client.destroy();

    return treatment;
}

export default async function handler(req: NextRequest, event: NextFetchEvent) {

    ne = event;

    // Extract Split feature flag name from request url
    const { flagname } = req.query;

    const treatment = await get( flagname );

    return new Response(JSON.stringify({ treatment }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
    });
}