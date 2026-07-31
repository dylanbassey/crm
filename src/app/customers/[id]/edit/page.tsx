import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EditCustomerForm } from "./edit-customer-form";

export default async function Edit({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
  });

  if (!customer) return notFound();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Edit customer</h1>
      <EditCustomerForm customer={customer} />
    </div>
  );
}
