import { prisma } from "@/lib/prisma";
import { CustomerForm } from "./customer-form";
import Link from "next/link";
import { CustomerTier, Prisma } from "@/generated/prisma/client";
import { formatGBP } from "@/lib/format";

type CustomerWithOrders = Prisma.CustomerGetPayload<{
  include: { orders: { include: { items: true } } };
}>;

type EnrichedCustomer = CustomerWithOrders & {
  orderCount: number;
  totalSpendCents: number;
};

const TIER_STYLES: Record<CustomerTier, string> = {
  STANDARD: "bg-neutral-100 text-neutral-700",
  PREMIUM: "bg-blue-100 text-blue-800",
  VIP: "bg-amber-100 text-amber-900",
};

const SORT_KEYS = ["name", "email", "tier", "orders", "spend"] as const;
type SortKey = (typeof SORT_KEYS)[number];

const COLUMN_SORTS = {
  name: { lastName: "asc" },
  email: { email: "asc" },
  tier: { tier: "asc" },
} satisfies Partial<Record<SortKey, Prisma.CustomerOrderByWithRelationInput>>;

function parseSort(raw: string | undefined): SortKey {
  return SORT_KEYS.includes(raw as SortKey) ? (raw as SortKey) : "name";
}

function orderTotalCents(
  items: { quantity: number; unitPriceCents: number }[],
): number {
  return items.reduce(
    (total, item) => total + item.quantity * item.unitPriceCents,
    0,
  );
}

function SortLink({
  label,
  sortKey,
  query,
  currentSort,
}: Readonly<{
  label: string;
  sortKey: SortKey;
  query?: string;
  currentSort?: string;
}>) {
  const params = new URLSearchParams();
  if (query) params.set("query", query);
  params.set("sort", sortKey);

  const isActive = currentSort === sortKey;

  return (
    <Link
      href={`/?${params.toString()}`}
      className={`hover:underline ${isActive ? "text-neutral-900" : ""}`}
    >
      {label}
    </Link>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; sort?: string }>;
}) {
  const { query, sort } = await searchParams;
  const sortKey = parseSort(sort);

  const where: Prisma.CustomerWhereInput = query
    ? {
        OR: [
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      }
    : {};

  const orderBy: Prisma.CustomerOrderByWithRelationInput =
    sortKey in COLUMN_SORTS
      ? COLUMN_SORTS[sortKey as keyof typeof COLUMN_SORTS]
      : { lastName: "asc" };

  const customers = await prisma.customer.findMany({
    where,
    include: { orders: { include: { items: true } } },
    orderBy,
  });

  const enriched: EnrichedCustomer[] = customers.map((customer) => ({
    ...customer,
    orderCount: customer.orders.length,
    totalSpendCents: customer.orders.reduce(
      (sum, order) => sum + orderTotalCents(order.items),
      0,
    ),
  }));

  const sorted = [...enriched];
  if (sortKey === "spend") {
    sorted.sort((a, b) => b.totalSpendCents - a.totalSpendCents);
  } else if (sortKey === "orders") {
    sorted.sort((a, b) => b.orderCount - a.orderCount);
  }

  const totalRevenueCents = enriched.reduce(
    (sum, c) => sum + c.totalSpendCents,
    0,
  );

  const byTier: Record<CustomerTier, number> = {
    STANDARD: 0,
    PREMIUM: 0,
    VIP: 0,
  };
  for (const customer of enriched) {
    byTier[customer.tier] += 1;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Customers</h1>
      <CustomerForm />

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Customers" value={enriched.length} />
        <Stat label="VIP" value={byTier.VIP} />
        <Stat label="Total revenue" value={formatGBP(totalRevenueCents)} />
        <Stat
          label="Orders"
          value={enriched.reduce((sum, c) => sum + c.orderCount, 0)}
        />
      </div>

      <form className="mt-6 flex gap-2">
        <input
          type="search"
          name="query"
          defaultValue={query ?? ""}
          placeholder="Search name or email..."
          className="w-64 rounded border px-3 py-2 text-sm"
        />
        <button className="rounded border px-4 py-2 text-sm">Search</button>
      </form>

      <table className="mt-8 w-full text-left text-sm">
        <thead className="border-b border-neutral-200 text-neutral-500">
          <tr>
            <th className="pb-2 font-medium">
              <SortLink label="Name" sortKey="name" query={query} currentSort={sortKey} />
            </th>
            <th className="pb-2 font-medium">
              <SortLink label="Email" sortKey="email" query={query} currentSort={sortKey} />
            </th>
            <th className="pb-2 font-medium">
              <SortLink label="Tier" sortKey="tier" query={query} currentSort={sortKey} />
            </th>
            <th className="pb-2 font-medium text-right">
              <SortLink label="Orders" sortKey="orders" query={query} currentSort={sortKey} />
            </th>
            <th className="pb-2 font-medium text-right">
              <SortLink label="Spend" sortKey="spend" query={query} currentSort={sortKey} />
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((customer) => (
            <tr
              key={customer.id}
              className="border-b border-neutral-100 hover:bg-neutral-50"
            >
              <td className="py-3">
                <Link
                  href={`/customers/${customer.id}`}
                  className="font-medium hover:underline"
                >
                  {customer.firstName} {customer.lastName}
                </Link>
              </td>
              <td className="py-3 text-neutral-600">{customer.email}</td>
              <td className="py-3">
                <Badge tier={customer.tier} />
              </td>
              <td className="py-3 text-right tabular-nums">{customer.orderCount}</td>
              <td className="py-3 text-right tabular-nums">
                {formatGBP(customer.totalSpendCents)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-neutral-200 p-4">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function Badge({ tier }: { tier: CustomerTier }) {
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-medium ${TIER_STYLES[tier]}`}>
      {tier}
    </span>
  );
}