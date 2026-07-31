"use server";

import { Prisma } from "@/generated/prisma/client";
import { PrismaClientKnownRequestError } from "@/generated/prisma/internal/prismaNamespace";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const CustomerScheme = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.email("Enter a valid email address").trim(),
});

const InteractionScheme = z.object({
  type: z.enum(["NOTE", "CALL", "EMAIL", "FITTING", "MEETING"]),
  summary: z.string().trim().min(1, "Summary is required"),
});

export type FormState = {
  errors?: Record<string, string[]>;
  message?: string;
};

export async function createCustomer(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = CustomerScheme.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await prisma.customer.create({
      data: parsed.data,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        errors: { email: ["A customer with this email already exists"] },
      };
    }
    throw error;
  }

  revalidatePath("/");
  return { message: "Customer created" };
}

export async function createInteraction(
  customerId: string,
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = InteractionScheme.safeParse({
    type: formData.get("type"),
    summary: formData.get("summary"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await prisma.interaction.create({
      data: { ...parsed.data, customerId },
    });
  } catch (error) {
    console.log(error);
  }

  revalidatePath(`/customers/${customerId}`);
  return { message: "Interaction logged" };
}

export async function deleteCustomer(
  customerId: string,
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await prisma.customer.delete({ where: { id: customerId } });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return {
        message: "Can't delete this customer — they have existing orders.",
      };
    }
    return { message: "Something went wrong deleting this customer." };
  }

  revalidatePath("/");
  redirect("/");
}

export async function updateCustomer(
  customerId: string,
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = CustomerScheme.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await prisma.customer.update({
      where: { id: customerId },
      data: parsed.data,
    });
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        errors: { email: ["A customer with this email already exists"] },
      };
    }
    return { message: "Something went wrong." };
  }

  revalidatePath("/");
  revalidatePath(`customers/${customerId}`);
  redirect("/");
}
