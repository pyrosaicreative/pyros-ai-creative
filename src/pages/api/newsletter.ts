import type { APIRoute } from "astro";

const FORM_ID = "9682576";

export const GET: APIRoute = async () => {
  return new Response("Newsletter API OK");
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email } = await request.json();

    if (!email) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Email is required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // STEP 1 - Create subscriber

    const createSubscriber = await fetch(
      "https://api.kit.com/v4/subscribers",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Kit-Api-Key": import.meta.env.KIT_API_KEY,
        },
        body: JSON.stringify({
          email_address: email,
        }),
      }
    );

    const subscriberData = await createSubscriber.json();

const subscriberId = subscriberData.subscriber.id;

    if (!createSubscriber.ok) {
      return new Response(JSON.stringify(subscriberData), {
        status: createSubscriber.status,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // STEP 2 - Add subscriber to form

    const addToForm = await fetch(
  `https://api.kit.com/v4/forms/${FORM_ID}/subscribers`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Kit-Api-Key": import.meta.env.KIT_API_KEY,
    },
    body: JSON.stringify({
      email_address: email,
      referrer: "https://pyrosaicreative.com/tutorials",
    }),
  }
);

    const formData = await addToForm.json();

    if (!addToForm.ok) {
      return new Response(JSON.stringify(formData), {
        status: addToForm.status,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Server error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};