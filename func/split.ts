import { SplitFactory } from '@splitsoftware/splitio-browserjs';

import { Timer, createTimer } from "../util/utils"

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
// Request example: https://<HOST>/api/edge/split/flag/{flagname}


// Run API route as an Edge function rather than a Serverless one, because the SDK uses Fetch API to flush data, which is available in Edge runtime but not in Serverless.
export const config = { runtime: "experimental-edge" };


export async function getFlagWithDuration(flagname: string): Promise<string> {

    let stopwatch: Timer = createTimer();

    const flagResult = await getSplitFlag(flagname, stopwatch);

    const split: string = JSON.stringify(
        { flagResult, duration: stopwatch.duration() }
    );

    return split;
}


export async function getSplitFlag(flagname: string, timer?: Timer): Promise<string> {

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

    const treatment = await client.getTreatment(flagname)

    if (timer) timer.stop()

    console.log(`split result is ${treatment}`)

    await client.destroy()

    return treatment
}