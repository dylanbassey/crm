import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import InteractionForm from "./interaction-form";
import { deleteCustomer, FormState } from "@/app/actions";
import { DeleteCustomerButton } from "../delete-customer";
import Link from "next/link";
import { formatGBP } from "@/lib/format";

async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      interactions: {
        orderBy: { createdAt: "desc" },
      },
      orders: {
        orderBy: { placedAt: "desc" },
        include: {
          items: {
            include: { product: true },
          },
        },
      },
    },
  });

  function orderTotalCents(order: {
    items: { quantity: number; unitPriceCents: number }[];
  }) {
    return order.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPriceCents,
      0,
    );
  }

  if (!customer) return notFound();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">
        {customer.firstName} {customer.lastName}
      </h1>
      <p className="text-neutral-600">{customer.email}</p>
      <div className="mt-2 flex gap-2 text-sm">
        <span className="rounded-full bg-neutral-100 px-3 py-1">
          {customer.tier}
        </span>
        <span className="rounded-full bg-neutral-100 px-3 py-1">
          {customer.stage}
        </span>
      </div>

      <InteractionForm customerId={customer.id} />

      <h2 className="mt-8 text-lg font-medium">History</h2>
      {customer.interactions.length === 0 ? (
        <p></p>
      ) : (
        <ul className="mt-2 space-y-2">
          {customer?.interactions.map((int) => (
            <li key={int.id} className="rounded border px-3 py-2">
              <span className="font-medium">{int.type}</span> - {int.summary}
            </li>
          ))}
        </ul>
      )}
      <h2 className="mt-8 text-lg font-medium">Orders</h2>
      {customer.orders.length === 0 ? (
        <p className="mt-2 text-neutral-500">No orders yet.</p>
      ) : (
        <ul className="mt-2 space-y-3">
          {customer.orders.map((order) => (
            <li key={order.id} className="rounded border p-3">
              <div className="flex justify-between font-medium">
                <span>{order.number}</span>
                <span>{formatGBP(orderTotalCents(order))}</span>
              </div>
              <p className="text-sm text-neutral-500">{order.status}</p>
              <ul className="mt-2 text-sm text-neutral-700">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.quantity} x {item.product.name} -{" "}
                    {formatGBP(item.quantity * item.unitPriceCents)}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}

      <Link href={`/customers/${customer.id}/edit`}>Edit Customer</Link>

      <DeleteCustomerButton customerId={customer.id} />
    </div>
  );
}

export default CustomerPage;
