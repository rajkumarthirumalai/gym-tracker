import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/memberships — list with filters
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get("customerId");

  const where: Record<string, unknown> = {};
  if (customerId) where.customerId = Number(customerId);

  const memberships = await prisma.membership.findMany({
    where,
    include: { plan: true, payments: true, customer: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(memberships);
}

// POST /api/memberships — create new membership (new or renewal)
export async function POST(req: Request) {
  const body = await req.json();
  const { customerId, planId, startDate, initialPayment } = body;

  const plan = await prisma.plan.findUnique({ where: { id: Number(planId) } });
  if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

  const start = new Date(startDate);
  const expiry = new Date(start);
  expiry.setDate(expiry.getDate() + plan.duration);

  const membership = await prisma.membership.create({
    data: {
      customerId: Number(customerId),
      planId: Number(planId),
      startDate: start,
      expiryDate: expiry,
      status: "active",
      payments: initialPayment > 0
        ? { create: { amount: Number(initialPayment), date: start } }
        : undefined,
    },
    include: { plan: true, payments: true },
  });

  // Also mark customer active
  await prisma.customer.update({
    where: { id: Number(customerId) },
    data: { status: "active" },
  });

  return NextResponse.json(membership, { status: 201 });
}
