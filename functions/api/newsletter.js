export async function onRequest(context) {
  // Gestione CORS
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

    const data = await response.json();

    if (!response.ok) {
      return Response.json(data, {
        status: response.status,
      });
    }

    return Response.json({
      success: true,
      message: "Successfully subscribed!",
    });
  } catch (err) {
    return Response.json(
      {
        success: false,
        message: "Server error",
      },
      {
        status: 500,
      }
    );
  }
}