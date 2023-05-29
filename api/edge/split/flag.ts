import { SplitFactory, PluggableStorage, ErrorLogger } from '@splitsoftware/splitio-browserjs';
import { EdgeConfigWrapper } from '@splitsoftware/vercel-integration-utils';

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
// Request example: https://<HOST>/api/get-treatment?userKey=<USER_KEY>

// @REPLACE with the feature flag name you want to evaluate
const FEATURE_FLAG_NAME = 'test_split';

// Run API route as an Edge function rather than a Serverless one, because the SDK uses Fetch API to flush data, which is available in Edge runtime but not in Serverless.
export const config = { runtime: "edge" };

export default async function handler(req) {
    // Extract user key from request query param
    const { searchParams } = new URL(req.url);
    const userKey = searchParams.get('userKey');

    /** @type {SplitIO.IAsyncClient} */
    const client = SplitFactory({
        core: {
            authorizationKey: process.env.SPLIT_SDK_KEY_EDGE,
            key: userKey
        },
        mode: 'consumer_partial',
        storage: PluggableStorage({
            wrapper: EdgeConfigWrapper({
                // The Edge Config item where Split stores feature flag definitions, specified in the Split integration step
                edgeConfigKey: process.env.EDGE_CONFIG_ITEM_KEY
            })
        }),
        // Disable or keep only ERROR log level in production, to minimize performance impact
        debug: ErrorLogger(),
    }).client();

    // Wait to load feature flag definitions from the Edge Config
    await client.ready();

    const treatment = await client.getTreatment("first_split");

    // Flush impressions asynchronously. Avoid 'await' in order to not delay the response.
    client.destroy().then( () =>
        console.log('api/edge/split/flag : client.destroy() completed')
    );

    return new Response(JSON.stringify({ treatment }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
    });
}