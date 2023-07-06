import { SplitFactory, PluggableStorage, ErrorLogger } from '@splitsoftware/splitio-browserjs';
import { EdgeConfigWrapper } from '@splitsoftware/vercel-integration-utils';
import * as EdgeConfigClient from '@vercel/edge-config';


import { Timer, createTimer } from "../../util/utils"


// Run this code as an Edge function rather than a Serverless one, because the SDK uses Fetch API to flush data, which is available in Edge runtime but not in Serverless.
export const config = { runtime: "edge" };


export async function getFlagsWithDuration(flagname: string): Promise<string> {
    return `[ { "p": "Split from the cloud", "content": ${await getFlagWithDuration(flagname, getSplitFlag)} }, { "p": "Split at the Edge", "content": ${await getFlagWithDuration(flagname, getSplitFlagEdge)} } ]`;
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

    // Instantiate the SDK ...
    const factory = SplitFactory({
        core: {
            authorizationKey: process.env.SPLIT_SDK_KEY_STNDALN,
            key: 'user_id_doesnt_matter_getting_default_treatment'
        },
        debug: "INFO"
    });
    // ... and get the client instance.
    const client = factory.client();

    await client.ready();

    const treatment = await client.getTreatment(flagname);

    if (timer) timer.stop();

    await client.destroy();

    return treatment;
}


export async function getSplitFlagEdge(flagname: string, timer?: Timer): Promise<string> {

    // This function retrieves the Split payload (roll-out plan) from Vercel Edge Config.
    // It is based on the example: https://github.com/splitio/vercel-integration-utils/blob/main/example/pages/api/get-treatment.js
    console.log(`item key is ${process.env.EDGE_CONFIG_ITEM_KEY}`);
    /** @type {SplitIO.IAsyncClient} */
    const factory = SplitFactory({
        core: {
            authorizationKey: process.env.SPLIT_SDK_KEY_EDGE,       // Note that this the Vercel environment variable is available only on the server (since it is missing the 'NEXT_PUBLIC_' prefix).
            key: 'user_id_doesnt_matter_getting_default_treatment'
        },
        mode: 'consumer_partial',
        storage: PluggableStorage({
            wrapper: EdgeConfigWrapper({
                // For a linked Split environment, the SDK can read the feature flag data cached in Edge Config.
                // The item key can be copied from the Split Integration configuration page.
                edgeConfigItemKey: process.env.EDGE_CONFIG_ITEM_KEY,
                // The default client that reads from the Edge Config stored in process.env.EDGE_CONFIG.
                edgeConfig: EdgeConfigClient
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