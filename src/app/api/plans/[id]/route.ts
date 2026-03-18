import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await prisma.plan.update({
      where: { id: Number(id) },
      data: body,
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Check if memberships use this plan to avoid hard 500 error
    const membershipCount = await prisma.membership.count({
      where: { planId: Number(id) },
    });
    
    if (membershipCount > 0) {
      return NextResponse.json({ error: "Cannot delete plan: There are existing members using it. Clear them first." }, { status: 400 });
    }

    const deleted = await prisma.plan.delete({
      where: { id: Number(id) },
    });
    
    return NextResponse.json(deleted);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
