import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET all payments with membership+customer+plan for the payments page
export async function GET() {
  const payments = await prisma.payment.findMany({
    include: {
      membership: {
        include: {
          plan: true,
          customer: true,
        },
      },
    },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(payments);
}
