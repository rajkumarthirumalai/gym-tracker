import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const plan = await prisma.plan.update({
    where: { id: Number(id) },
    data: body,
  });
  return NextResponse.json(plan);
}
