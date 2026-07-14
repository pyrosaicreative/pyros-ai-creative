export async function onRequestPost(context) {
  return new Response(
    JSON.stringify({
      success: true,
      message: "Cloudflare Function is working!"
    }),
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
}