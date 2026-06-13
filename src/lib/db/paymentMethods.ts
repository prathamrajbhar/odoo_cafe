import { prisma } from "@/lib/prisma";
import { PaymentType } from "@/generated/prisma/client";

export function getAll() {
  return prisma.paymentMethod.findMany({
    orderBy: { type: "asc" },
  });
}

export function getById(id: string) {
  return prisma.paymentMethod.findUnique({
    where: { id },
  });
}

export async function update(
  id: string,
  isActiveOrData?: boolean | { isActive?: boolean; upiId?: string | null },
  upiId?: string | null
) {
  let active: boolean | undefined = undefined;
  let upi: string | null | undefined = undefined;

  if (typeof isActiveOrData === "object" && isActiveOrData !== null) {
    active = isActiveOrData.isActive;
    upi = isActiveOrData.upiId;
  } else {
    active = isActiveOrData;
    if (upiId !== undefined) {
      upi = upiId;
    }
  }

  const existing = await getById(id);
  if (!existing) {
    throw new Error("Payment method not found");
  }

  // Validation: upiId can only be set on UPI payment method
  if (upi !== undefined && upi !== null && existing.type !== PaymentType.UPI) {
    throw new Error("upiId can only be set on UPI payment method");
  }

  const updateData: { isActive?: boolean; upiId?: string | null } = {};
  if (active !== undefined) updateData.isActive = active;
  if (upi !== undefined) updateData.upiId = upi;

  return prisma.paymentMethod.update({
    where: { id },
    data: updateData,
  });
}

export async function seedPaymentMethods() {
  const methods = [PaymentType.CASH, PaymentType.CARD, PaymentType.UPI];
  for (const type of methods) {
    await prisma.paymentMethod.upsert({
      where: { type },
      update: {},
      create: {
        type,
        isActive: false,
        upiId: null,
      },
    });
  }
}
