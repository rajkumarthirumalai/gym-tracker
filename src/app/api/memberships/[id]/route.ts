import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// PATCH /api/memberships/[id] — update status
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const membership = await prisma.membership.update({
    where: { id: Number(id) },
    data: body,
  });
  return NextResponse.json(membership);
}
