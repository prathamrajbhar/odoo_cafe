import { prisma } from "@/lib/prisma";
import { PaymentType } from "@/generated/prisma/client";

export function getAll() {
  return prisma.paymentMethod.findMany({
    orderBy: { createdAt: "asc" },
  });
}

export function getById(id: string) {
  return prisma.paymentMethod.findUnique({
    where: { id },
  });
}

export async function create(data: {
  name: string;
  type: PaymentType;
  upiId?: string | null;
}) {
  return prisma.paymentMethod.create({
    data: {
      name: data.name,
      type: data.type,
      isActive: false,
      upiId: data.type === PaymentType.UPI ? (data.upiId ?? null) : null,
    },
  });
}

export async function update(
  id: string,
  data: {
    name?: string;
    isActive?: boolean;
    upiId?: string | null;
  }
) {
  const existing = await getById(id);
  if (!existing) {
    throw new Error("Payment method not found");
  }

  // upiId can only be set on UPI payment methods
  if (
    data.upiId !== undefined &&
    data.upiId !== null &&
    existing.type !== PaymentType.UPI
  ) {
    throw new Error("upiId can only be set on UPI payment method");
  }

  const updateData: { name?: string; isActive?: boolean; upiId?: string | null } = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.upiId !== undefined) updateData.upiId = data.upiId;

  return prisma.paymentMethod.update({
    where: { id },
    data: updateData,
  });
}

export async function remove(id: string) {
  const existing = await getById(id);
  if (!existing) {
    throw new Error("Payment method not found");
  }
  return prisma.paymentMethod.delete({ where: { id } });
}

export async function seedPaymentMethods() {
  const methods = [PaymentType.CASH, PaymentType.CARD, PaymentType.UPI];
  const existing = await prisma.paymentMethod.findMany();

  for (const type of methods) {
    const hasMethod = existing.some((m) => m.type === type);
    if (!hasMethod) {
      let defaultName = "";
      if (type === PaymentType.CASH) defaultName = "Cash Drawer";
      else if (type === PaymentType.CARD) defaultName = "Credit/Debit Card Terminal";
      else if (type === PaymentType.UPI) defaultName = "Store UPI QR";

      await prisma.paymentMethod.create({
        data: {
          type,
          name: defaultName,
          isActive: false,
          upiId: null,
        },
      });
    }
  }
}
