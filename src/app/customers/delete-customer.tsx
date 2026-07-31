"use client";

import { useActionState } from "react";
import { deleteCustomer, FormState } from "../actions";

const initialState: FormState = {};

export function DeleteCustomerButton({ customerId }: { customerId: string }) {
  const action = deleteCustomer.bind(null, customerId);
  const [state, formAction, pending] = useActionState(action, initialState);
  return (
    <form action={formAction} className="mt-8">
      <button type="submit" disabled={pending}>
        {pending ? "Deleting..." : "Delete customer"};
      </button>
      {state.message && (
        <p className="text-red-600 text-sm mt-2">{state.message}</p>
      )}
    </form>
  );
}
