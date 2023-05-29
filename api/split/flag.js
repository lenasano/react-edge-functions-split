import { SplitFactory } from '@splitsoftware/splitio-browserjs';

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
// Request example: https://<HOST>/api/get-treatment?userKey=<USER_KEY>

// @REPLACE with the feature flag name you want to evaluate
const FEATURE_FLAG_NAME = 'test_split';

// Run API route as an Edge function rather than a Serverless one, because the SDK uses Fetch API to flush data, which is available in Edge runtime but not in Serverless.
export const config = { runtime: "edge" };

export default async function handler(req) {

    // instantiate the SDK
    const factory = SplitFactory({
        core: {
            authorizationKey: process.env.SPLIT_SDK_KEY_STNDALN,
            // key represents your internal user id, or the account id that
            // the user belongs to.
            // This could also be a cookie you generate for anonymous users
            key: 'doesnt_matter_getting_default_treatment'
        },
        debug: "INFO"
    })

    // and get the client instance
    const client = factory.client()

    console.log(`hello from split: ${client !== null}`)

    await client.ready()

    console.log("split is ready")

    const treatment = await client.getTreatment("first_split")

    console.log(`split result is ${treatment}`)

    client.destroy()


    return new Response(JSON.stringify({ treatment }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
    });
}