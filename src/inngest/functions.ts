import { prisma } from "@/lib/prisma";
import { inngest } from "./client";

export const syncShopifyCustomer = inngest.createFunction(
  {
    id: "sync-shopify-customer",
    retries: 3,
    triggers: { event: "shopify/customer.created" },
  },
  async ({ event, step }) => {
    const customer = await step.run("upsert-customer", async () => {
      return prisma.customer.upsert({
        where: { email: event.data.email },
        update: {
          firstName: event.data.firstName,
          lastName: event.data.lastName,
        },
        create: {
          email: event.data.email,
          firstName: event.data.firstName,
          lastName: event.data.lastName,
        },
      });
    });

    await step.run("log-interaction", async () => {
      return prisma.interaction.create({
        data: {
          customerId: customer.id,
          type: "NOTE",
          summary: "Synced from Shopify",
        },
      });
    });

    return { customerId: customer.id };
  },
);
