export default async function handler(req) {
    return new Response(JSON.stringify('"op": "not implemented"'), {
        status: 200,
        headers: { 'content-type': 'application/json' }
    });
}