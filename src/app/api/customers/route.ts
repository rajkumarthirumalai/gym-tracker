import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/customers?phone=xxx or list all
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone");
  const search = searchParams.get("search");
  const status = searchParams.get("status");

  if (phone) {
    const customer = await prisma.customer.findUnique({
      where: { phone },
      include: {
        memberships: {
          include: { plan: true, payments: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    return NextResponse.json(customer);
  }

  const where: Record<string, unknown> = {};
  if (status && status !== "all") where.status = status;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
    ];
  }

  const customers = await prisma.customer.findMany({
    where,
    include: {
      memberships: {
        include: { plan: true, payments: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(customers);
}

// POST /api/customers — create new customer
export async function POST(req: Request) {
  const body = await req.json();
  const { name, phone, email, notes } = body;

  const existing = await prisma.customer.findUnique({ where: { phone } });
  if (existing) {
    return NextResponse.json(
      { error: "Customer with this phone already exists", customer: existing },
      { status: 409 }
    );
  }

  const customer = await prisma.customer.create({
    data: { name, phone, email, notes: notes ?? "" },
  });
  return NextResponse.json(customer, { status: 201 });
}
