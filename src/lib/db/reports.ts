import { prisma } from "@/lib/prisma";
import { getPeriodRange, getPreviousPeriodRange } from "@/lib/reports";

function calculatePercentChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
}

async function getRangeKPIs(
  range: { from: Date; to: Date },
  filters: { employeeId?: string | null; sessionId?: string | null; productId?: string | null }
) {
  const orderWhere: any = {
    createdAt: {
      gte: range.from,
      lte: range.to,
    },
  };

  if (filters.employeeId) {
    orderWhere.employeeId = filters.employeeId;
  }
  if (filters.sessionId) {
    orderWhere.sessionId = filters.sessionId;
  }
  if (filters.productId) {
    orderWhere.orderLines = {
      some: {
        productId: filters.productId,
      },
    };
  }

  // Count all orders in range
  const totalOrders = await prisma.order.count({ where: orderWhere });

  // Sum total revenue for PAID orders in range
  const paidWhere = { ...orderWhere, status: "PAID" as const };

  let revenue = 0;

  if (filters.productId) {
    // If filtering by product, sum the line totals of that product in PAID orders
    const paidOrders = await prisma.order.findMany({
      where: paidWhere,
      include: {
        orderLines: {
          where: { productId: filters.productId },
        },
      },
    });

    for (const order of paidOrders) {
      for (const line of order.orderLines) {
        revenue += Number(line.lineTotal);
      }
    }
  } else {
    // Standard order sum
    const revenueSum = await prisma.order.aggregate({
      where: paidWhere,
      _sum: {
        total: true,
      },
    });
    revenue = Number(revenueSum._sum.total || 0);
  }

  const roundedRevenue = Math.round(revenue * 100) / 100;
  const avgOrder = totalOrders > 0 ? roundedRevenue / totalOrders : 0;
  const roundedAvg = Math.round(avgOrder * 100) / 100;

  return {
    totalOrders,
    revenue: roundedRevenue,
    avgOrder: roundedAvg,
  };
}

export async function getKPIs(filters: {
  period: "today" | "week" | "month" | "custom";
  from?: string | null;
  to?: string | null;
  employeeId?: string | null;
  sessionId?: string | null;
  productId?: string | null;
}) {
  const currentRange = getPeriodRange(filters.period, filters.from, filters.to);
  const previousRange = getPreviousPeriodRange(filters.period, currentRange);

  const currentKPIs = await getRangeKPIs(currentRange, filters);
  const previousKPIs = await getRangeKPIs(previousRange, filters);

  const totalOrdersChange = calculatePercentChange(currentKPIs.totalOrders, previousKPIs.totalOrders);
  const revenueChange = calculatePercentChange(currentKPIs.revenue, previousKPIs.revenue);
  const avgOrderChange = calculatePercentChange(currentKPIs.avgOrder, previousKPIs.avgOrder);

  return {
    totalOrders: currentKPIs.totalOrders,
    totalOrdersChange: Math.round(totalOrdersChange * 100) / 100,
    revenue: currentKPIs.revenue,
    revenueChange: Math.round(revenueChange * 100) / 100,
    avgOrder: currentKPIs.avgOrder,
    avgOrderChange: Math.round(avgOrderChange * 100) / 100,
  };
}

export async function getSalesTrend(filters: {
  period: "today" | "week" | "month" | "custom";
  from?: string | null;
  to?: string | null;
  employeeId?: string | null;
  sessionId?: string | null;
  productId?: string | null;
}) {
  const range = getPeriodRange(filters.period, filters.from, filters.to);

  const orderWhere: any = {
    createdAt: {
      gte: range.from,
      lte: range.to,
    },
    status: "PAID",
  };

  if (filters.employeeId) {
    orderWhere.employeeId = filters.employeeId;
  }
  if (filters.sessionId) {
    orderWhere.sessionId = filters.sessionId;
  }

  let orders;
  if (filters.productId) {
    orderWhere.orderLines = {
      some: {
        productId: filters.productId,
      },
    };
    orders = await prisma.order.findMany({
      where: orderWhere,
      include: {
        orderLines: {
          where: { productId: filters.productId },
        },
      },
    });
  } else {
    orders = await prisma.order.findMany({
      where: orderWhere,
    });
  }

  const trendMap: Record<string, number> = {};
  const isToday = filters.period === "today";

  if (isToday) {
    // Initialize 24 hours
    for (let h = 0; h < 24; h++) {
      const label = `${String(h).padStart(2, "0")}:00`;
      trendMap[label] = 0;
    }

    for (const order of orders) {
      const hour = new Date(order.createdAt).getHours();
      const label = `${String(hour).padStart(2, "0")}:00`;

      let amount = 0;
      if (filters.productId && "orderLines" in order) {
        amount = (order.orderLines as any[]).reduce((sum, l) => sum + Number(l.lineTotal), 0);
      } else {
        amount = Number(order.total);
      }
      trendMap[label] += amount;
    }
  } else {
    // Daily grouping label population
    const cur = new Date(range.from.getTime());
    while (cur <= range.to) {
      const dateLabel = cur.toISOString().split("T")[0];
      trendMap[dateLabel] = 0;
      cur.setDate(cur.getDate() + 1);
    }

    for (const order of orders) {
      const dateLabel = new Date(order.createdAt).toISOString().split("T")[0];

      let amount = 0;
      if (filters.productId && "orderLines" in order) {
        amount = (order.orderLines as any[]).reduce((sum, l) => sum + Number(l.lineTotal), 0);
      } else {
        amount = Number(order.total);
      }

      if (trendMap[dateLabel] !== undefined) {
        trendMap[dateLabel] += amount;
      } else {
        trendMap[dateLabel] = amount;
      }
    }
  }

  return Object.entries(trendMap)
    .map(([time, rev]) => ({
      time,
      revenue: Math.round(rev * 100) / 100,
    }))
    .sort((a, b) => a.time.localeCompare(b.time));
}

export async function getTopCategories(filters: {
  period: "today" | "week" | "month" | "custom";
  from?: string | null;
  to?: string | null;
  employeeId?: string | null;
  sessionId?: string | null;
  productId?: string | null;
}) {
  const range = getPeriodRange(filters.period, filters.from, filters.to);

  const orderWhere: any = {
    createdAt: {
      gte: range.from,
      lte: range.to,
    },
    status: "PAID",
  };

  if (filters.employeeId) {
    orderWhere.employeeId = filters.employeeId;
  }
  if (filters.sessionId) {
    orderWhere.sessionId = filters.sessionId;
  }
  if (filters.productId) {
    orderWhere.orderLines = {
      some: {
        productId: filters.productId,
      },
    };
  }

  const orders = await prisma.order.findMany({
    where: orderWhere,
    include: {
      orderLines: {
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  });

  const categoryMap: Record<string, number> = {};
  let totalRev = 0;

  for (const order of orders) {
    for (const line of order.orderLines) {
      if (filters.productId && line.productId !== filters.productId) {
        continue;
      }
      const catName = line.product.category.name;
      const rev = Number(line.lineTotal);
      categoryMap[catName] = (categoryMap[catName] || 0) + rev;
      totalRev += rev;
    }
  }

  const results = Object.entries(categoryMap).map(([name, rev]) => {
    const roundedRev = Math.round(rev * 100) / 100;
    const percent = totalRev > 0 ? (rev / totalRev) * 100 : 0;
    return {
      name,
      revenue: roundedRev,
      percent: Math.round(percent * 100) / 100,
    };
  });

  return results.sort((a, b) => b.revenue - a.revenue);
}

export async function getTopProducts(filters: {
  period: "today" | "week" | "month" | "custom";
  from?: string | null;
  to?: string | null;
  employeeId?: string | null;
  sessionId?: string | null;
  productId?: string | null;
}) {
  const range = getPeriodRange(filters.period, filters.from, filters.to);

  const orderWhere: any = {
    createdAt: {
      gte: range.from,
      lte: range.to,
    },
    status: "PAID",
  };

  if (filters.employeeId) {
    orderWhere.employeeId = filters.employeeId;
  }
  if (filters.sessionId) {
    orderWhere.sessionId = filters.sessionId;
  }
  if (filters.productId) {
    orderWhere.orderLines = {
      some: {
        productId: filters.productId,
      },
    };
  }

  const orders = await prisma.order.findMany({
    where: orderWhere,
    include: {
      orderLines: {
        include: {
          product: true,
        },
      },
    },
  });

  const productMap: Record<string, { qty: number; revenue: number }> = {};

  for (const order of orders) {
    for (const line of order.orderLines) {
      if (filters.productId && line.productId !== filters.productId) {
        continue;
      }
      const prodName = line.product.name;
      if (!productMap[prodName]) {
        productMap[prodName] = { qty: 0, revenue: 0 };
      }
      productMap[prodName].qty += line.qty;
      productMap[prodName].revenue += Number(line.lineTotal);
    }
  }

  const results = Object.entries(productMap).map(([name, data]) => ({
    name,
    qty: data.qty,
    revenue: Math.round(data.revenue * 100) / 100,
  }));

  return results.sort((a, b) => b.revenue - a.revenue);
}

export async function getTopOrders(filters: {
  period: "today" | "week" | "month" | "custom";
  from?: string | null;
  to?: string | null;
  employeeId?: string | null;
  sessionId?: string | null;
  productId?: string | null;
}) {
  const range = getPeriodRange(filters.period, filters.from, filters.to);

  const orderWhere: any = {
    createdAt: {
      gte: range.from,
      lte: range.to,
    },
    status: "PAID",
  };

  if (filters.employeeId) {
    orderWhere.employeeId = filters.employeeId;
  }
  if (filters.sessionId) {
    orderWhere.sessionId = filters.sessionId;
  }
  if (filters.productId) {
    orderWhere.orderLines = {
      some: {
        productId: filters.productId,
      },
    };
  }

  const orders = await prisma.order.findMany({
    where: orderWhere,
    include: {
      customer: { select: { name: true } },
      employee: { select: { name: true } },
    },
    orderBy: {
      total: "desc",
    },
    take: 10,
  });

  return orders.map((o) => ({
    orderNumber: o.orderNumber,
    sessionId: o.sessionId,
    date: o.createdAt,
    customer: o.customer ? o.customer.name : null,
    employee: o.employee.name,
    total: Number(o.total),
  }));
}
