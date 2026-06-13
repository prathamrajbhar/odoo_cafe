import "dotenv/config";
import { PrismaClient, PaymentType, PromoType, DiscountType, OrderStatus, KDSStatus, Role, Status } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg(process.env.DATABASE_URL as string);
const prisma = new PrismaClient({ adapter });

async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}

async function main() {
  console.log("[seed] Starting Indian cafe seed...");

  // ─── Clean existing data (order matters for FK constraints) ───
  await prisma.kdsTicketItem.deleteMany();
  await prisma.kdsTicket.deleteMany();
  await prisma.orderLine.deleteMany();
  await prisma.order.deleteMany();
  await prisma.session.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.paymentMethod.deleteMany();
  await prisma.table.deleteMany();
  await prisma.floor.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  // ─── Users ───────────────────────────────────────────────────
  const adminHash = await hashPassword("Admin@1234");
  const emp1Hash  = await hashPassword("Staff@1234");
  const emp2Hash  = await hashPassword("Staff@1234");
  const emp3Hash  = await hashPassword("Staff@1234");

  const admin = await prisma.user.create({
    data: {
      name: "Arjun Sharma",
      email: "admin@odoocafe.in",
      passwordHash: adminHash,
      role: Role.ADMIN,
      status: Status.ACTIVE,
    },
  });

  const emp1 = await prisma.user.create({
    data: {
      name: "Priya Patel",
      email: "priya@odoocafe.in",
      passwordHash: emp1Hash,
      role: Role.EMPLOYEE,
      status: Status.ACTIVE,
    },
  });

  const emp2 = await prisma.user.create({
    data: {
      name: "Rohan Mehta",
      email: "rohan@odoocafe.in",
      passwordHash: emp2Hash,
      role: Role.EMPLOYEE,
      status: Status.ACTIVE,
    },
  });

  await prisma.user.create({
    data: {
      name: "Sunita Yadav",
      email: "sunita@odoocafe.in",
      passwordHash: emp3Hash,
      role: Role.EMPLOYEE,
      status: Status.DISABLED,
    },
  });

  console.log("[seed] users created");

  // ─── Categories ───────────────────────────────────────────────
  const catChai      = await prisma.category.create({ data: { name: "Chai & Tea",     colorHex: "#c0392b" } });
  const catCoffee    = await prisma.category.create({ data: { name: "Coffee",          colorHex: "#6f4e37" } });
  const catJuices    = await prisma.category.create({ data: { name: "Fresh Juices",    colorHex: "#e67e22" } });
  const catSnacks    = await prisma.category.create({ data: { name: "Snacks",          colorHex: "#27ae60" } });
  const catMainCourse = await prisma.category.create({ data: { name: "Main Course",   colorHex: "#57344f" } });
  const catDesserts  = await prisma.category.create({ data: { name: "Desserts",        colorHex: "#8e44ad" } });
  const catBiryani   = await prisma.category.create({ data: { name: "Biryani",         colorHex: "#d35400" } });

  console.log("[seed] categories created");

  // ─── Products ─────────────────────────────────────────────────
  const products = await prisma.product.createManyAndReturn({
    data: [
      // Chai & Tea
      { name: "Masala Chai",           categoryId: catChai.id,       price: 30,  taxRate: 5,  description: "Spiced tea with ginger, cardamom & milk" },
      { name: "Adrak Chai",            categoryId: catChai.id,       price: 25,  taxRate: 5,  description: "Strong ginger-infused tea" },
      { name: "Green Tea",             categoryId: catChai.id,       price: 40,  taxRate: 5,  description: "Darjeeling green tea" },
      { name: "Kashmiri Kahwa",        categoryId: catChai.id,       price: 60,  taxRate: 5,  description: "Saffron & almond Kashmiri tea" },
      // Coffee
      { name: "Filter Kaapi",          categoryId: catCoffee.id,     price: 45,  taxRate: 18, description: "South Indian drip coffee with chicory" },
      { name: "Cappuccino",            categoryId: catCoffee.id,     price: 120, taxRate: 18, description: "Double espresso with steamed milk foam" },
      { name: "Cold Coffee",           categoryId: catCoffee.id,     price: 110, taxRate: 18, description: "Chilled blended coffee with ice cream" },
      { name: "Cafe Latte",            categoryId: catCoffee.id,     price: 130, taxRate: 18, description: "Espresso with silky steamed milk" },
      // Juices
      { name: "Fresh Sugarcane Juice", categoryId: catJuices.id,     price: 40,  taxRate: 5,  description: "Chilled fresh-pressed sugarcane" },
      { name: "Mango Lassi",           categoryId: catJuices.id,     price: 80,  taxRate: 5,  description: "Thick Alphonso mango yogurt drink" },
      { name: "Nimbu Pani",            categoryId: catJuices.id,     price: 30,  taxRate: 5,  description: "Fresh lime water with black salt" },
      { name: "Watermelon Juice",      categoryId: catJuices.id,     price: 60,  taxRate: 5,  description: "Seasonal fresh watermelon" },
      // Snacks
      { name: "Samosa (2 pcs)",        categoryId: catSnacks.id,     price: 30,  taxRate: 5,  description: "Crispy potato-filled pastry with chutney" },
      { name: "Aloo Tikki",            categoryId: catSnacks.id,     price: 50,  taxRate: 5,  description: "Pan-fried potato patty with tamarind chutney" },
      { name: "Veg Sandwich",          categoryId: catSnacks.id,     price: 60,  taxRate: 5,  description: "Grilled with cucumber, tomato & green chutney" },
      { name: "Pav Bhaji",             categoryId: catSnacks.id,     price: 80,  taxRate: 5,  description: "Spiced mixed vegetable mash with buttered pav" },
      { name: "Bread Pakora",          categoryId: catSnacks.id,     price: 45,  taxRate: 5,  description: "Stuffed bread fritters with mint chutney" },
      // Main Course
      { name: "Dal Tadka",             categoryId: catMainCourse.id, price: 120, taxRate: 5,  description: "Yellow lentils tempered with cumin & garlic" },
      { name: "Paneer Butter Masala",  categoryId: catMainCourse.id, price: 180, taxRate: 5,  description: "Cottage cheese in creamy tomato gravy" },
      { name: "Chole Bhature",         categoryId: catMainCourse.id, price: 130, taxRate: 5,  description: "Spiced chickpea curry with fried bread" },
      { name: "Rajma Chawal",          categoryId: catMainCourse.id, price: 110, taxRate: 5,  description: "Kidney bean curry with steamed basmati rice" },
      // Biryani
      { name: "Veg Dum Biryani",       categoryId: catBiryani.id,    price: 160, taxRate: 5,  description: "Slow-cooked aromatic basmati with vegetables" },
      { name: "Chicken Biryani",       categoryId: catBiryani.id,    price: 220, taxRate: 5,  description: "Hyderabadi style dum chicken biryani" },
      { name: "Mutton Biryani",        categoryId: catBiryani.id,    price: 280, taxRate: 5,  description: "Lucknowi style slow-cooked mutton biryani" },
      // Desserts
      { name: "Gulab Jamun (2 pcs)",   categoryId: catDesserts.id,   price: 60,  taxRate: 5,  description: "Soft milk-solid dumplings in rose syrup" },
      { name: "Kulfi",                 categoryId: catDesserts.id,   price: 70,  taxRate: 5,  description: "Traditional Indian ice cream — kesar pista" },
      { name: "Gajar Halwa",           categoryId: catDesserts.id,   price: 80,  taxRate: 5,  description: "Slow-cooked carrot pudding with khoya & nuts" },
      { name: "Rasgulla",              categoryId: catDesserts.id,   price: 50,  taxRate: 5,  description: "Spongy cottage cheese balls in light sugar syrup" },
    ],
  });

  console.log(`[seed] ${products.length} products created`);

  // ─── Payment Methods ──────────────────────────────────────────
  await prisma.paymentMethod.create({ data: { type: PaymentType.CASH, isActive: true } });
  await prisma.paymentMethod.create({ data: { type: PaymentType.CARD, isActive: true } });
  await prisma.paymentMethod.create({ data: { type: PaymentType.UPI,  isActive: true, upiId: "odoocafe@hdfcbank" } });

  console.log("[seed] payment methods created");

  // ─── Floors & Tables ─────────────────────────────────────────
  const gFloor = await prisma.floor.create({ data: { name: "Ground Floor" } });
  const fFloor = await prisma.floor.create({ data: { name: "First Floor" } });
  const terrace = await prisma.floor.create({ data: { name: "Terrace" } });

  const gTables = await Promise.all(
    [
      { number: 1, seats: 2 }, { number: 2, seats: 2 }, { number: 3, seats: 4 },
      { number: 4, seats: 4 }, { number: 5, seats: 6 }, { number: 6, seats: 8 },
      { number: 7, seats: 4 }, { number: 8, seats: 4 },
    ].map((t) => prisma.table.create({ data: { ...t, floorId: gFloor.id, isActive: true } }))
  );

  const fTables = await Promise.all(
    [
      { number: 9,  seats: 4 }, { number: 10, seats: 4 }, { number: 11, seats: 6 },
      { number: 12, seats: 6 }, { number: 13, seats: 2 }, { number: 14, seats: 2 },
    ].map((t) => prisma.table.create({ data: { ...t, floorId: fFloor.id, isActive: true } }))
  );

  await Promise.all(
    [
      { number: 15, seats: 4 }, { number: 16, seats: 4 }, { number: 17, seats: 6 },
      { number: 18, seats: 4, isActive: false }, // inactive
    ].map((t) => prisma.table.create({ data: { floorId: terrace.id, isActive: true, ...t } }))
  );

  console.log("[seed] floors & tables created");

  // ─── Promotions ───────────────────────────────────────────────
  const masalaChai = products.find((p) => p.name === "Masala Chai")!;
  const chickenBiryani = products.find((p) => p.name === "Chicken Biryani")!;

  await prisma.promotion.create({
    data: {
      name: "WELCOME10 — New Customer Coupon",
      promoType: PromoType.COUPON,
      code: "WELCOME10",
      discountValue: 10,
      discountType: DiscountType.PERCENT,
      isActive: true,
    },
  });

  await prisma.promotion.create({
    data: {
      name: "DIWALI100 — Festival Flat Off",
      promoType: PromoType.COUPON,
      code: "DIWALI100",
      discountValue: 100,
      discountType: DiscountType.FIXED,
      isActive: true,
    },
  });

  await prisma.promotion.create({
    data: {
      name: "3 Chai Free Samosa",
      promoType: PromoType.PRODUCT_BASED,
      productId: masalaChai.id,
      minQty: 3,
      discountValue: 15,
      discountType: DiscountType.PERCENT,
      isActive: true,
    },
  });

  await prisma.promotion.create({
    data: {
      name: "Biryani Combo Discount",
      promoType: PromoType.PRODUCT_BASED,
      productId: chickenBiryani.id,
      minQty: 2,
      discountValue: 50,
      discountType: DiscountType.FIXED,
      isActive: true,
    },
  });

  await prisma.promotion.create({
    data: {
      name: "Order ₹500+ Get 5% Off",
      promoType: PromoType.ORDER_BASED,
      minOrderAmount: 500,
      discountValue: 5,
      discountType: DiscountType.PERCENT,
      isActive: true,
    },
  });

  await prisma.promotion.create({
    data: {
      name: "Order ₹1000+ Get ₹75 Off",
      promoType: PromoType.ORDER_BASED,
      minOrderAmount: 1000,
      discountValue: 75,
      discountType: DiscountType.FIXED,
      isActive: true,
    },
  });

  console.log("[seed] promotions created");

  // ─── Customers ────────────────────────────────────────────────
  const customers = await Promise.all([
    prisma.customer.create({ data: { name: "Kavya Reddy",     email: "kavya.reddy@gmail.com",  phone: "9876543210" } }),
    prisma.customer.create({ data: { name: "Amit Joshi",      email: "amit.joshi@yahoo.co.in", phone: "9845012345" } }),
    prisma.customer.create({ data: { name: "Neha Singh",      email: "neha.singh@outlook.com", phone: "7890123456" } }),
    prisma.customer.create({ data: { name: "Suresh Kumar",    phone: "9012345678" } }),
    prisma.customer.create({ data: { name: "Meera Nair",      email: "meera.nair@gmail.com",   phone: "8765432109" } }),
    prisma.customer.create({ data: { name: "Vikas Agarwal",   email: "vikas.agarwal@gmail.com" } }),
    prisma.customer.create({ data: { name: "Pooja Iyer",      phone: "9543210987" } }),
    prisma.customer.create({ data: { name: "Rahul Desai",     email: "rahul.desai@hotmail.com", phone: "9321456789" } }),
  ]);

  console.log("[seed] customers created");

  // ─── Session + Orders ─────────────────────────────────────────
  // Past closed session
  const session1 = await prisma.session.create({
    data: {
      openedByUserId: emp1.id,
      openedAt: new Date("2026-06-12T09:00:00.000Z"),
      closedAt: new Date("2026-06-12T22:00:00.000Z"),
      closingSaleAmount: 14850,
    },
  });

  // Helper to create a paid order with lines
  async function createOrder(
    orderNumber: string,
    sessionId: string,
    tableId: string,
    employeeId: string,
    customerId: string | null,
    lines: { product: (typeof products)[0]; qty: number }[],
    status: OrderStatus = OrderStatus.PAID
  ) {
    let subtotal = 0;
    let taxAmount = 0;

    for (const line of lines) {
      const price = Number(line.product.price);
      const lineTotal = price * line.qty;
      subtotal += lineTotal;
      taxAmount += lineTotal * (line.product.taxRate / 100);
    }

    const total = subtotal + taxAmount;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        sessionId,
        tableId,
        customerId,
        employeeId,
        status,
        subtotal,
        taxAmount: Math.round(taxAmount * 100) / 100,
        discountAmount: 0,
        total: Math.round(total * 100) / 100,
      },
    });

    const orderLines = await Promise.all(
      lines.map((line) =>
        prisma.orderLine.create({
          data: {
            orderId: order.id,
            productId: line.product.id,
            qty: line.qty,
            unitPrice: Number(line.product.price),
            lineTotal: Number(line.product.price) * line.qty,
          },
        })
      )
    );

    // KDS ticket for non-cancelled orders
    if (status !== OrderStatus.CANCELLED) {
      const ticket = await prisma.kdsTicket.create({
        data: {
          orderId: order.id,
          status: status === OrderStatus.PAID ? KDSStatus.COMPLETED : KDSStatus.TO_COOK,
        },
      });

      await Promise.all(
        orderLines.map((ol) =>
          prisma.kdsTicketItem.create({
            data: { ticketId: ticket.id, orderLineId: ol.id, isStruckThrough: status === OrderStatus.PAID },
          })
        )
      );
    }

    return order;
  }

  const p = (name: string) => products.find((x) => x.name === name)!;

  // 12 paid orders from yesterday's session
  await createOrder("ORD-001", session1.id, gTables[0].id, emp1.id, customers[0].id, [
    { product: p("Masala Chai"),          qty: 2 },
    { product: p("Samosa (2 pcs)"),       qty: 1 },
    { product: p("Veg Sandwich"),         qty: 1 },
  ]);

  await createOrder("ORD-002", session1.id, gTables[2].id, emp1.id, customers[1].id, [
    { product: p("Chicken Biryani"),      qty: 2 },
    { product: p("Mango Lassi"),          qty: 2 },
    { product: p("Gulab Jamun (2 pcs)"),  qty: 1 },
  ]);

  await createOrder("ORD-003", session1.id, gTables[4].id, emp2.id, customers[2].id, [
    { product: p("Paneer Butter Masala"), qty: 2 },
    { product: p("Dal Tadka"),            qty: 1 },
    { product: p("Filter Kaapi"),         qty: 3 },
    { product: p("Kulfi"),                qty: 2 },
  ]);

  await createOrder("ORD-004", session1.id, gTables[6].id, emp2.id, null, [
    { product: p("Cappuccino"),           qty: 2 },
    { product: p("Veg Sandwich"),         qty: 2 },
    { product: p("Cold Coffee"),          qty: 1 },
  ]);

  await createOrder("ORD-005", session1.id, fTables[1].id, emp1.id, customers[3].id, [
    { product: p("Mutton Biryani"),       qty: 3 },
    { product: p("Nimbu Pani"),           qty: 3 },
    { product: p("Rasgulla"),             qty: 2 },
  ]);

  await createOrder("ORD-006", session1.id, fTables[2].id, emp1.id, customers[4].id, [
    { product: p("Chole Bhature"),        qty: 2 },
    { product: p("Masala Chai"),          qty: 4 },
    { product: p("Gajar Halwa"),          qty: 2 },
  ]);

  await createOrder("ORD-007", session1.id, gTables[1].id, emp2.id, customers[5].id, [
    { product: p("Pav Bhaji"),            qty: 2 },
    { product: p("Fresh Sugarcane Juice"), qty: 2 },
  ]);

  await createOrder("ORD-008", session1.id, fTables[0].id, emp2.id, null, [
    { product: p("Veg Dum Biryani"),      qty: 2 },
    { product: p("Kashmiri Kahwa"),       qty: 2 },
  ]);

  await createOrder("ORD-009", session1.id, gTables[3].id, emp1.id, customers[6].id, [
    { product: p("Aloo Tikki"),           qty: 2 },
    { product: p("Adrak Chai"),           qty: 3 },
    { product: p("Bread Pakora"),         qty: 2 },
  ]);

  await createOrder("ORD-010", session1.id, fTables[3].id, emp1.id, customers[7].id, [
    { product: p("Rajma Chawal"),         qty: 2 },
    { product: p("Cafe Latte"),           qty: 2 },
    { product: p("Kulfi"),                qty: 3 },
  ]);

  await createOrder("ORD-011", session1.id, gTables[5].id, emp2.id, null, [
    { product: p("Chicken Biryani"),      qty: 4 },
    { product: p("Mango Lassi"),          qty: 4 },
    { product: p("Gulab Jamun (2 pcs)"),  qty: 2 },
    { product: p("Watermelon Juice"),     qty: 2 },
  ]);

  // One cancelled order
  await createOrder("ORD-012", session1.id, gTables[7].id, emp2.id, customers[0].id, [
    { product: p("Cappuccino"),           qty: 1 },
  ], OrderStatus.CANCELLED);

  // Active session (today) with draft orders
  const session2 = await prisma.session.create({
    data: {
      openedByUserId: admin.id,
      openedAt: new Date(),
    },
  });

  await createOrder("ORD-013", session2.id, gTables[0].id, admin.id, customers[1].id, [
    { product: p("Filter Kaapi"),         qty: 2 },
    { product: p("Samosa (2 pcs)"),       qty: 2 },
  ], OrderStatus.DRAFT);

  await createOrder("ORD-014", session2.id, fTables[1].id, emp1.id, customers[4].id, [
    { product: p("Veg Dum Biryani"),      qty: 1 },
    { product: p("Green Tea"),            qty: 1 },
  ], OrderStatus.DRAFT);

  console.log("[seed] sessions & orders created");

  console.log("\n========================================");
  console.log("  ADMIN LOGIN CREDENTIALS");
  console.log("========================================");
  console.log("  Email    : admin@odoocafe.in");
  console.log("  Password : Admin@1234");
  console.log("========================================");
  console.log("  EMPLOYEE LOGIN (example)");
  console.log("  Email    : priya@odoocafe.in");
  console.log("  Password : Staff@1234");
  console.log("========================================\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
