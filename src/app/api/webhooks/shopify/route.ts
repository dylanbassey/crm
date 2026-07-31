import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-shopify-hmac-sha256") ?? "";

  const expected = crypto
    .createHmac("sha256", process.env.SHOPIFY_WEBHOOK_SECRET!)
    .update(rawBody, "utf8")
    .digest("base64");

  const valid =
    signature.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));

  if (!valid) {
    return new Response("Invalid signature", { status: 401 });
  }

  const payload = JSON.parse(rawBody);

  await inngest.send({
    name: "shopify/customer.created",
    data: {
      email: payload.email,
      firstName: payload.firstName ?? "",
      lastName: payload.lastName ?? "",
    },
  });

  return new Response("OK", { status: 200 });
}
