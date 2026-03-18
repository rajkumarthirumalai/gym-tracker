import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST /api/payments — add payment to a membership
export async function POST(req: Request) {
  const body = await req.json();
  const { membershipId, amount, note } = body;

  const payment = await prisma.payment.create({
    data: {
      membershipId: Number(membershipId),
      amount: Number(amount),
      note: note ?? "",
      date: new Date(),
    },
  });
  return NextResponse.json(payment, { status: 201 });
}
