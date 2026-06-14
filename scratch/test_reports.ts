import "dotenv/config";
import { getKPIs, getSalesTrend, getTopCategories, getTopProducts, getTopOrders } from "../src/lib/db/reports";
import { prisma } from "../src/lib/prisma";

async function test() {
  console.log("Running report tests...");
  try {
    const kpis = await getKPIs({ period: "today" });
    console.log("KPIs:", kpis);

    const trend = await getSalesTrend({ period: "today" });
    console.log("Trend count:", trend.length);
    console.log("Trend sum:", trend.reduce((sum, t) => sum + t.revenue, 0));

    const cats = await getTopCategories({ period: "today" });
    console.log("Categories:", cats);

    const prods = await getTopProducts({ period: "today" });
    console.log("Products:", prods);

    const orders = await getTopOrders({ period: "today" });
    console.log("Orders count:", orders.length);
  } catch (err) {
    console.error("Error running reports:", err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
