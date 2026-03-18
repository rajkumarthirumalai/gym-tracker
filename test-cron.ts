import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Checking Database Connection...");
  
  const plan = await prisma.plan.findFirst();
  if (!plan) return console.log("❌ No plans found! Exiting.");

  // Simulate an expired user
  console.log(`📝 Inserting a dummy user for the ${plan.name} plan that expired 2 days ago...`);
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  
  const customer = await prisma.customer.create({
    data: {
      name: "Rajkumar (Expired User " + Math.floor(Math.random() * 1000) + ")",
      phone: "9" + Math.floor(100000000 + Math.random() * 900000000).toString(),
      notes: "Testing automated reminders",
      memberships: {
        create: {
          planId: plan.id,
          startDate: new Date(twoDaysAgo.getTime() - plan.duration * 86400000), // joined long ago
          expiryDate: twoDaysAgo, // expired 2 days ago
          status: "active", // forgot to update it to expired
          payments: {
            create: { amount: plan.price, note: "Paid fully but expired" }
          }
        }
      }
    }
  });

  console.log(`✅ Created expired user ${customer.name}.`);

  // Run the reminder logic
  console.log("\n🚀 Triggering reminder logic...");
  
  const activeMemberships = await prisma.membership.findMany({
    where: { status: "active" },
    include: { customer: true, plan: true, payments: true }
  });

  const pendingList: string[] = [];
  const expiredList: string[] = [];
  
  for (const m of activeMemberships) {
    const totalPaid = m.payments.reduce((sum, p) => sum + p.amount, 0);
    if (totalPaid < m.plan.price) {
      const pendingAmount = m.plan.price - totalPaid;
      pendingList.push(`• ${m.customer.name} (📞 ${m.customer.phone}) - Pending ₹${pendingAmount}`);
    }

    const today = new Date();
    if (m.expiryDate < today) {
      const daysExpired = Math.floor((today.getTime() - m.expiryDate.getTime()) / (1000 * 60 * 60 * 24));
      expiredList.push(`• ${m.customer.name} (📞 ${m.customer.phone}) - Expired ${daysExpired} days ago`);
    }
  }

  let message = "";
  if (pendingList.length > 0) message += `💸 PENDING BALANCES:\n${pendingList.join("\n")}\n\n`;
  if (expiredList.length > 0) message += `⏳ EXPIRED PLAN RENEWALS:\n${expiredList.join("\n")}`;

  if (message.trim().length > 0) {
    const subject = "Muscle War Alerts";
    console.log(`\n📬 Sending Ntfy Push Notification...`);
    console.log(`--- [PUSH PAYLOAD START] ---`);
    console.log(`Title: ${subject}`);
    console.log(`Body:\n${message.trim()}`);
    console.log(`--- [PUSH PAYLOAD END] ---\n`);

    const result = await fetch("https://ntfy.sh/mwf-reminders", {
      method: "POST",
      body: message.trim(),
      headers: {
        "Title": subject,
        "Tags": "rotating_light,moneybag",
      }
    });

    if (result.ok) {
      console.log("✅ Push Sent Successfully! Open https://ntfy.sh/mwf-reminders");
    } else {
      console.log("❌ Failed to send push.");
    }
  } else {
    console.log("✅ No conditions met for push notification.");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
