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

    //
    // STEP 1 - Create (or fetch) subscriber
    //
    const subscriberResponse = await fetch(
      "https://api.kit.com/v4/subscribers",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Kit-Api-Key": context.env.KIT_API_KEY,
        },
        body: JSON.stringify({
          email_address: email,
        }),
      }
    );

    const subscriberData = await subscriberResponse.json();

    if (!subscriberResponse.ok) {
      return Response.json(
        {
          success: false,
          step: "create_subscriber",
          response: subscriberData,
        },
        {
          status: subscriberResponse.status,
        }
      );
    }

    const subscriberId = subscriberData.subscriber.id;

    //
    // STEP 2 - Add subscriber to form
    //
    const formResponse = await fetch(
      `https://api.kit.com/v4/forms/9682576/subscribers/${subscriberId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Kit-Api-Key": context.env.KIT_API_KEY,
        },
      }
    );

    const formData = await formResponse.json();

    if (!formResponse.ok) {
      return Response.json(
        {
          success: false,
          step: "add_to_form",
          response: formData,
        },
        {
          status: formResponse.status,
        }
      );
    }

    return Response.json({
      success: true,
    });

  } catch (err) {
    return Response.json(
      {
        success: false,
        message: err.message,
      },
      {
        status: 500,
      }
    );
  }
}