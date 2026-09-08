Deno.serve((req) => {
  return new Response(
    JSON.stringify({ status: 'ok' }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    },
  );
});
