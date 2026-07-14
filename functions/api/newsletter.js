export async function onRequest(context) {
  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (context.request.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
    });
  }

  try {
    const { email } = await context.request.json();

    if (!email) {
      return Response.json(
        {
          success: false,
          message: "Email is required",
        },
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://api.kit.com/v4/forms/9682576/subscribers",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Kit-Api-Key": context.env.KIT_API_KEY,
        },
        body: JSON.stringify({
          email_address: email,
          referrer: "https://pyrosaicreative.com/tutorials",
        }),
      }
    );

    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      return Response.json(
        {
          success: false,
          status: response.status,
          kit: data,
        },
        {
          status: response.status,
        }
      );
    }

    return Response.json({
      success: true,
      kit: data,
    });

  } catch (err) {
    return Response.json(
      {
        success: false,
        message: err.message,
        error: String(err),
      },
      {
        status: 500,
      }
    );
  }
}