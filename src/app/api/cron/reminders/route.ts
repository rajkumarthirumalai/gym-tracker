import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    // 1. Find all active memberships to check for both pending payments and expirations
    const activeMemberships = await prisma.membership.findMany({
      where: {
        status: "active",
      },
      include: {
        customer: true,
        plan: true,
        payments: true,
      }
    });

    const pendingList: string[] = [];
    const expiredList: string[] = [];
    
    for (const m of activeMemberships) {
      // Check partial/pending payments
      const totalPaid = m.payments.reduce((sum: number, p: { amount: number }) => sum + p.amount, 0);
      if (totalPaid < m.plan.price) {
        const pendingAmount = m.plan.price - totalPaid;
        pendingList.push(`• ${m.customer.name} (📞 ${m.customer.phone}) - Pending ₹${pendingAmount}`);
      }

      // Check if plan has expired but is still marked 'active'
      const today = new Date();
      if (m.expiryDate < today) {
        const daysExpired = Math.floor((today.getTime() - m.expiryDate.getTime()) / (1000 * 60 * 60 * 24));
        expiredList.push(`• ${m.customer.name} (📞 ${m.customer.phone}) - Expired ${daysExpired} days ago`);
      }
    }

    // Build the push notification message
    let message = "";
    if (pendingList.length > 0) {
      message += `💸 PENDING BALANCES:\n${pendingList.join("\n")}\n\n`;
    }
    if (expiredList.length > 0) {
      message += `⏳ EXPIRED PLAN RENEWALS:\n${expiredList.join("\n")}`;
    }

    if (message.trim().length > 0) {
      await fetch("https://ntfy.sh/mwf-reminders", {
        method: "POST",
        body: message.trim(),
        headers: {
          "Title": "Muscle War Alerts",
          "Tags": "rotating_light,moneybag",
        }
      });
      
      return NextResponse.json({ 
        success: true, 
        message: "Alerts pushed!", 
        pendingCount: pendingList.length, 
        expiredCount: expiredList.length 
      });
    }

    return NextResponse.json({ success: true, message: "No pending or expired conditions met!" });

  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
