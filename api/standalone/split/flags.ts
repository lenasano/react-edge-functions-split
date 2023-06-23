
// Run this API route as an Edge function rather than a Serverless one, because the SDK uses Fetch API to flush data, which is available in Edge runtime but not in Serverless.
export const config = { runtime: "edge" };


export default async function handler(req) {

    // This is a stub.
    //
    // It is possible to retrieve the results of n feature flags by using the SplitFactory.client().getTreatments() function.
    // See https://help.split.io/hc/en-us/articles/360058730852-Browser-SDK#multiple-evaluations-at-once.

    return new Response(JSON.stringify('{"op": "not implemented"}'), {
        status: 200,
        headers: { 'content-type': 'application/json' }
    });
}