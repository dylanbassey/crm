"use client";

import { createInteraction, FormState } from "@/app/actions";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

const initialState: FormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="border rounded bg-neutral-600 px-3 py-2"
    >
      {pending ? "Saving..." : "Log interaction"}
    </button>
  );
}

export default function InteractionForm({
  customerId,
}: {
  customerId: string;
}) {
  const action = createInteraction.bind(null, customerId);
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="mt-4 flex flex-col gap-2 max-w-sm">
      <select name="type" className="border rounded px-3 py-2">
        <option value="NOTE">NOTE</option>
        <option value="CALL">CALL</option>
        <option value="EMAIL">EMAIL</option>
        <option value="FITTING">FITTING</option>
        <option value="MEETING">MEETING</option>
      </select>

      <input
        name="summary"
        placeholder="What happened?"
        className="border rounded px-3 py-2"
      />
      {state.errors?.summary && (
        <p className="text-sm text-red-600">{state.errors.summary[0]}</p>
      )}
      <SubmitButton />
    </form>
  );
}
