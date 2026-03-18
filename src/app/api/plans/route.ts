import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/plans
export async function GET() {
  const plans = await prisma.plan.findMany({
    where: { active: true },
    orderBy: { duration: "asc" },
  });
  return NextResponse.json(plans);
}

// POST /api/plans
export async function POST(req: Request) {
  const body = await req.json();
  const plan = await prisma.plan.create({ data: body });
  return NextResponse.json(plan, { status: 201 });
}

// PATCH /api/plans/[id] (toggling active)
