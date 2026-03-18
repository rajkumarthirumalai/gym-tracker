import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/customers/[id]
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id: Number(id) },
    include: {
      memberships: {
        include: { plan: true, payments: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(customer);
}

// PATCH /api/customers/[id]
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const customer = await prisma.customer.update({
    where: { id: Number(id) },
    data: body,
  });
  return NextResponse.json(customer);
}
