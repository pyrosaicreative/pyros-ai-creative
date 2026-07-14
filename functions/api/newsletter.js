export async function onRequest(context) {
  return new Response("Function OK", {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
}