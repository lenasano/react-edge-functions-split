import { SplitFactory, PluggableStorage, ErrorLogger } from '@splitsoftware/splitio-browserjs';
import { EdgeConfigWrapper } from '@splitsoftware/vercel-integration-utils';
 

import { Timer, createTimer } from "../util/utils"

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
// Request example: https://<HOST>/api/edge/split/flag/{flagname}


// Run API route as an Edge function rather than a Serverless one, because the SDK uses Fetch API to flush data, which is available in Edge runtime but not in Serverless.
export const config = { runtime: "edge" };


export async function getFlagsWithDuration(flagname: string): Promise<string> {
    return `{ { p: "Split from the cloud", content: ${await getFlagWithDuration(flagname, getSplitFlag)} }, { p :"Split at the Edge", content: ${await getFlagWithDuration(flagname, getSplitFlagEdge)}} }`;
}

export function SplitInfo({ p, content }) {
    return <p><b>{ p } < /b>: {JSON.stringify(content)}</p >;
}

async function getFlagWithDuration(flagname: string, getFunction: (string, Timer) => Promise<string>): Promise<string> {

    let stopwatch: Timer = createTimer();

    const flagResult = await getFunction(flagname, stopwatch);

    const split: string = JSON.stringify(
        { flagResult, duration: stopwatch.duration() }
    );

    return split;
}

export async function getSplitFlag(flagname: string, timer?: Timer): Promise<string> {

    // This function retrieves Split payload from Split Cloud, thus incurring request/response travel time.
    // It is based on the docs: https://help.split.io/hc/en-us/articles/360058730852-Browser-SDK

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

    await client.ready()

    const treatment = await client.getTreatment(flagname)

    if (timer) timer.stop()

    await client.destroy()

    return treatment
}


export async function getSplitFlagEdge(flagname: string, timer?: Timer): Promise<string> {

    console.log(`hey friends! config key is ${process.env.EDGE_CONFIG_ITEM_KEY}`);

    // This function retrieves Split payload from Vercel's Edge Config.
    // It is based on the example: https://github.com/splitio/vercel-integration-utils/blob/main/example/pages/api/get-treatment.js

    /** @type {SplitIO.IAsyncClient} */
    const factory = SplitFactory({
        core: {
            authorizationKey: process.env.SPLIT_SDK_KEY_EDGE,   // Vercel environment variable is available only on the server (missing the 'NEXT_PUBLIC_' prefix)
            key: 'user_id_doesnt_matter_getting_default_treatment'
        },
        mode: 'consumer_partial',
        storage: PluggableStorage({
            wrapper: EdgeConfigWrapper({
                // The Edge Config item where Split stores feature flag definitions, specified in the Split integration step
                edgeConfigKey: process.env.EDGE_CONFIG_ITEM_KEY
            })
        }),
        debug: 'INFO'
    });
    const client = factory.client();

    await client.ready();

    const treatment = await client.getTreatment(flagname);
    
    if (timer) timer.stop()

    await client.destroy();
    
    return treatment;
}