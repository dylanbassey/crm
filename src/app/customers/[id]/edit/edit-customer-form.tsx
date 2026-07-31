"use client";

import { FormState, updateCustomer } from "@/app/actions";
import { useActionState } from "react";

const initialState: FormState = {};

export function EditCustomerForm({
  customer,
}: {
  customer: { id: string; email: string; firstName: string; lastName: string };
}) {
  const action = updateCustomer.bind(null, customer.id);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="mt-8 flex flex-col max-w-sm gap-2">
      <input
        name="firstName"
        defaultValue={customer.firstName}
        className="border rounded px-3 py-2"
      />
      {state.errors?.firstName && (
        <p className="text-sm text-red-600 mt-2">{state.errors.firstName[0]}</p>
      )}
      <input
        name="lastName"
        defaultValue={customer.lastName}
        className="border rounded px-3 py-3"
      />
      {state.errors?.lastName && (
        <p className="text-sm text-red-600 mt-2">{state.errors.lastName[0]}</p>
      )}
      <input
        name="email"
        defaultValue={customer.email}
        className="border rounded px-3 py-2"
      />
      {state.errors?.email && (
        <p className="text-sm text-red-600">{state.errors.email[0]}</p>
      )}
      <button
        className="border rounded text-bg-neutral px-3 py-2"
        disabled={pending}
      >
        {pending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
