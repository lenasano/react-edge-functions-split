import { SplitFactory, PluggableStorage, ErrorLogger } from '@splitsoftware/splitio-browserjs';
import { EdgeConfigWrapper } from '@splitsoftware/vercel-integration-utils';

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
// Request example: https://<HOST>/api/edge/split/flag/{flagname}


// Run API route as an Edge function rather than a Serverless one, because the SDK uses Fetch API to flush data, which is available in Edge runtime but not in Serverless.
export const config = { runtime: "edge" };


export async function get(flagname: string): Promise<string> {

    /** @type {SplitIO.IAsyncClient} */
    const factory = SplitFactory({
        core: {
            authorizationKey: process.env.SPLIT_SDK_KEY_EDGE,
            key: 'doesnt_matter_getting_default_treatment'
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
    });
    
    const client = factory.client();

    // Wait to load feature flag definitions from the Edge Config
    await client.ready();

    const treatment = await client.getTreatment( flagname );

    // Flush impressions asynchronously. Avoid 'await' in order to not delay the response.
    client.destroy().then( () =>
        console.log('api/edge/split/flags/{flagname} : client.destroy() completed')
    );

    return treatment;
}


export default async function handler(req) {

    // Extract Split feature flag name from request url
    const { flagname } = req.query;

    const treatment = await get(flagname);

    return new Response(JSON.stringify({ treatment }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
    });
}