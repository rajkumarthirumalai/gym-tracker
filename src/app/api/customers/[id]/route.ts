import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const customer = await prisma.customer.findUnique({
      where: { id: Number(id) },
      include: {
        memberships: {
          include: {
            plan: true,
            payments: {
              orderBy: { date: 'desc' }
            }
          },
          orderBy: { startDate: 'desc' },
        },
      },
    });

    if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(customer);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();
    const updated = await prisma.customer.update({
      where: { id: Number(id) },
      data,
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const customerId = Number(id);

    // Delete payments individually to avoid DB-level ON DELETE CASCADE issues if not configured correctly
    const memberships = await prisma.membership.findMany({ where: { customerId } });
    const membershipIds = memberships.map(m => m.id);
    
    if (membershipIds.length > 0) {
      await prisma.payment.deleteMany({
        where: { membershipId: { in: membershipIds } }
      });
      await prisma.membership.deleteMany({
        where: { customerId }
      });
    }

    await prisma.customer.delete({
      where: { id: customerId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete customer error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
