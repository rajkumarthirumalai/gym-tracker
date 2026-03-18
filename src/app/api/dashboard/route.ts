import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const today = new Date();

  const [totalCustomers, activeMembers, expiredMembers, expiringToday, expiringThisWeek] =
    await Promise.all([
      prisma.customer.count(),
      prisma.membership.count({ where: { status: "active", expiryDate: { gte: today } } }),
      prisma.membership.count({ where: { expiryDate: { lt: today }, status: { not: "stopped" } } }),
      prisma.membership.findMany({
        where: {
          expiryDate: {
            gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
            lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
          },
          status: "active",
        },
        include: { customer: true, plan: true },
      }),
      prisma.membership.findMany({
        where: {
          expiryDate: {
            gte: today,
            lt: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
          },
          status: "active",
        },
        include: { customer: true, plan: true },
        orderBy: { expiryDate: "asc" },
      }),
    ]);

  // Pending payments: memberships where paid < plan price
  const allActiveMemberships = await prisma.membership.findMany({
    where: { status: "active", expiryDate: { gte: today } },
    include: { plan: true, payments: true },
  });

  const pendingPaymentCount = allActiveMemberships.filter((m) => {
    const paid = m.payments.reduce((s, p) => s + p.amount, 0);
    return paid < m.plan.price;
  }).length;

  return NextResponse.json({
    totalCustomers,
    activeMembers,
    expiredMembers,
    pendingPaymentCount,
    expiringToday,
    expiringThisWeek,
  });
}
