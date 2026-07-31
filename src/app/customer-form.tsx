"use client";

import { useActionState } from "react";
import { createCustomer, type FormState } from "./actions";

const initialState: FormState = {};

export function CustomerForm() {
  const [state, formAction, pendingState] = useActionState(
    createCustomer,
    initialState,
  );

  return (
    <div>
      <form action={formAction} className="mt-6 flex flex-col gap-2 max-w-sm">
        <input
          name="firstName"
          placeholder="First Name"
          required
          className="border rounded  px-3 py-2"
        />
        {state.errors?.firstName && (
          <p className="text-red-600 text-sm">{state.errors.firstName[0]}</p>
        )}
        <input
          name="lastName"
          placeholder="Last Name"
          required
          className="border rounded px-3 py-2"
        />
        {state.errors?.lastName && (
          <p className="text-sm text-red-600">{state.errors.lastName[0]}</p>
        )}
        <input
          name="email"
          placeholder="Email"
          required
          className="border rounded px-3 py-2"
        />
        {state.errors?.email && (
          <p className="text-sm text-red-600">{state.errors.email[0]}</p>
        )}
        <button
          className="mt-2 px-3 py-2 bg-white text-black rounded max-w-2xs"
          disabled={pendingState}
        >
          {pendingState ? "Saving..." : "Add Customer"}
        </button>
      </form>
    </div>
  );
}
