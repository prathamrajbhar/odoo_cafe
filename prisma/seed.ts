import "dotenv/config";
import {
  PrismaClient,
  PaymentType,
  PromoType,
  DiscountType,
  OrderStatus,
  KDSStatus,
  Role,
  Status,
} from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg(process.env.DATABASE_URL as string);
const prisma = new PrismaClient({ adapter });

async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}

// ─── Date helpers ──────────────────────────────────────────────────────────────
function dateAt(year: number, month: number, day: number, hour: number, minute = 0): Date {
  // month is 1-indexed
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

function addMinutes(d: Date, mins: number): Date {
  return new Date(d.getTime() + mins * 60_000);
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

// ─── Order counter ─────────────────────────────────────────────────────────────
let orderCounter = 0;
function nextOrderNumber(): string {
  orderCounter++;
  return `ORD-${String(orderCounter).padStart(4, "0")}`;
}

// ─── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("[seed] 🚀 Starting Indian cafe seed — 3+ months of data...");

  // ── Clean existing data (FK order) ───────────────────────────────────────────
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
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  console.log("[seed] ✅ Cleaned all existing data");

  // ── Users ─────────────────────────────────────────────────────────────────────
  const adminHash = await hashPassword("Admin@1234");
  const staffHash = await hashPassword("Staff@1234");

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
      passwordHash: staffHash,
      role: Role.EMPLOYEE,
      status: Status.ACTIVE,
    },
  });

  const emp2 = await prisma.user.create({
    data: {
      name: "Rohan Mehta",
      email: "rohan@odoocafe.in",
      passwordHash: staffHash,
      role: Role.EMPLOYEE,
      status: Status.ACTIVE,
    },
  });

  const emp3 = await prisma.user.create({
    data: {
      name: "Divya Nair",
      email: "divya@odoocafe.in",
      passwordHash: staffHash,
      role: Role.EMPLOYEE,
      status: Status.ACTIVE,
    },
  });

  await prisma.user.create({
    data: {
      name: "Sunita Yadav",
      email: "sunita@odoocafe.in",
      passwordHash: staffHash,
      role: Role.EMPLOYEE,
      status: Status.DISABLED,
    },
  });

  const employees = [admin, emp1, emp2, emp3];
  console.log("[seed] ✅ Users created");

  // ── Categories ────────────────────────────────────────────────────────────────
  const catChai       = await prisma.category.create({ data: { name: "Chai & Tea",     colorHex: "#c0392b" } });
  const catCoffee     = await prisma.category.create({ data: { name: "Coffee",          colorHex: "#6f4e37" } });
  const catJuices     = await prisma.category.create({ data: { name: "Fresh Juices",    colorHex: "#e67e22" } });
  const catSnacks     = await prisma.category.create({ data: { name: "Snacks",          colorHex: "#27ae60" } });
  const catMainCourse = await prisma.category.create({ data: { name: "Main Course",     colorHex: "#57344f" } });
  const catDesserts   = await prisma.category.create({ data: { name: "Desserts",        colorHex: "#8e44ad" } });
  const catBiryani    = await prisma.category.create({ data: { name: "Biryani",         colorHex: "#d35400" } });
  const catBreakfast  = await prisma.category.create({ data: { name: "Breakfast",       colorHex: "#2980b9" } });
  const catMilkshakes = await prisma.category.create({ data: { name: "Milkshakes",      colorHex: "#16a085" } });

  console.log("[seed] ✅ Categories created");

  // ── Products ──────────────────────────────────────────────────────────────────
  const products = await prisma.product.createManyAndReturn({
    data: [
      // Chai & Tea
      { name: "Masala Chai",           categoryId: catChai.id,       price: 30,  taxRate: 5,  stock: 999, description: "Spiced tea with ginger, cardamom & milk" },
      { name: "Adrak Chai",            categoryId: catChai.id,       price: 25,  taxRate: 5,  stock: 999, description: "Strong ginger-infused tea" },
      { name: "Green Tea",             categoryId: catChai.id,       price: 40,  taxRate: 5,  stock: 999, description: "Darjeeling green tea" },
      { name: "Kashmiri Kahwa",        categoryId: catChai.id,       price: 65,  taxRate: 5,  stock: 999, description: "Saffron & almond Kashmiri tea" },
      { name: "Tulsi Chai",            categoryId: catChai.id,       price: 30,  taxRate: 5,  stock: 999, description: "Holy basil infused tea" },
      { name: "Elaichi Chai",          categoryId: catChai.id,       price: 30,  taxRate: 5,  stock: 999, description: "Cardamom-rich tea" },

      // Coffee
      { name: "Filter Kaapi",          categoryId: catCoffee.id,     price: 45,  taxRate: 18, stock: 999, description: "South Indian drip coffee with chicory" },
      { name: "Cappuccino",            categoryId: catCoffee.id,     price: 120, taxRate: 18, stock: 999, description: "Double espresso with steamed milk foam" },
      { name: "Cold Coffee",           categoryId: catCoffee.id,     price: 110, taxRate: 18, stock: 999, description: "Chilled blended coffee with ice cream" },
      { name: "Cafe Latte",            categoryId: catCoffee.id,     price: 130, taxRate: 18, stock: 999, description: "Espresso with silky steamed milk" },
      { name: "Espresso",              categoryId: catCoffee.id,     price: 80,  taxRate: 18, stock: 999, description: "Rich single shot espresso" },
      { name: "Iced Americano",        categoryId: catCoffee.id,     price: 100, taxRate: 18, stock: 999, description: "Espresso over ice with water" },

      // Fresh Juices
      { name: "Fresh Sugarcane Juice", categoryId: catJuices.id,     price: 40,  taxRate: 5,  stock: 999, description: "Chilled fresh-pressed sugarcane" },
      { name: "Mango Lassi",           categoryId: catJuices.id,     price: 80,  taxRate: 5,  stock: 999, description: "Thick Alphonso mango yogurt drink" },
      { name: "Nimbu Pani",            categoryId: catJuices.id,     price: 30,  taxRate: 5,  stock: 999, description: "Fresh lime water with black salt" },
      { name: "Watermelon Juice",      categoryId: catJuices.id,     price: 60,  taxRate: 5,  stock: 999, description: "Seasonal fresh watermelon" },
      { name: "Orange Juice",          categoryId: catJuices.id,     price: 70,  taxRate: 5,  stock: 999, description: "Freshly squeezed oranges" },
      { name: "Coconut Water",         categoryId: catJuices.id,     price: 50,  taxRate: 5,  stock: 999, description: "Tender green coconut water" },

      // Snacks
      { name: "Samosa (2 pcs)",        categoryId: catSnacks.id,     price: 30,  taxRate: 5,  stock: 999, description: "Crispy potato-filled pastry with chutney" },
      { name: "Aloo Tikki",            categoryId: catSnacks.id,     price: 50,  taxRate: 5,  stock: 999, description: "Pan-fried potato patty with tamarind chutney" },
      { name: "Veg Sandwich",          categoryId: catSnacks.id,     price: 60,  taxRate: 5,  stock: 999, description: "Grilled with cucumber, tomato & green chutney" },
      { name: "Pav Bhaji",             categoryId: catSnacks.id,     price: 80,  taxRate: 5,  stock: 999, description: "Spiced mixed vegetable mash with buttered pav" },
      { name: "Bread Pakora",          categoryId: catSnacks.id,     price: 45,  taxRate: 5,  stock: 999, description: "Stuffed bread fritters with mint chutney" },
      { name: "Bhel Puri",             categoryId: catSnacks.id,     price: 40,  taxRate: 5,  stock: 999, description: "Puffed rice with tangy tamarind chutney" },
      { name: "Vada Pav",              categoryId: catSnacks.id,     price: 35,  taxRate: 5,  stock: 999, description: "Mumbai style spiced potato bun" },

      // Breakfast
      { name: "Masala Dosa",           categoryId: catBreakfast.id,  price: 90,  taxRate: 5,  stock: 999, description: "Crispy rice crepe with spiced potato filling" },
      { name: "Idli Sambhar (3 pcs)",  categoryId: catBreakfast.id,  price: 70,  taxRate: 5,  stock: 999, description: "Steamed rice cakes with lentil stew" },
      { name: "Poha",                  categoryId: catBreakfast.id,  price: 50,  taxRate: 5,  stock: 999, description: "Flattened rice with mustard seeds & curry leaves" },
      { name: "Upma",                  categoryId: catBreakfast.id,  price: 55,  taxRate: 5,  stock: 999, description: "Semolina porridge with vegetables" },
      { name: "Medu Vada (2 pcs)",     categoryId: catBreakfast.id,  price: 60,  taxRate: 5,  stock: 999, description: "Crispy lentil doughnuts with coconut chutney" },
      { name: "Paratha",               categoryId: catBreakfast.id,  price: 70,  taxRate: 5,  stock: 999, description: "Whole wheat flatbread with butter & pickle" },

      // Main Course
      { name: "Dal Tadka",             categoryId: catMainCourse.id, price: 120, taxRate: 5,  stock: 999, description: "Yellow lentils tempered with cumin & garlic" },
      { name: "Paneer Butter Masala",  categoryId: catMainCourse.id, price: 180, taxRate: 5,  stock: 999, description: "Cottage cheese in creamy tomato gravy" },
      { name: "Chole Bhature",         categoryId: catMainCourse.id, price: 130, taxRate: 5,  stock: 999, description: "Spiced chickpea curry with fried bread" },
      { name: "Rajma Chawal",          categoryId: catMainCourse.id, price: 110, taxRate: 5,  stock: 999, description: "Kidney bean curry with steamed basmati rice" },
      { name: "Butter Naan",           categoryId: catMainCourse.id, price: 40,  taxRate: 5,  stock: 999, description: "Soft leavened bread with butter" },
      { name: "Jeera Rice",            categoryId: catMainCourse.id, price: 80,  taxRate: 5,  stock: 999, description: "Fragrant basmati rice with cumin" },
      { name: "Palak Paneer",          categoryId: catMainCourse.id, price: 170, taxRate: 5,  stock: 999, description: "Cottage cheese in creamy spinach gravy" },
      { name: "Matar Paneer",          categoryId: catMainCourse.id, price: 160, taxRate: 5,  stock: 999, description: "Cottage cheese and peas in tomato gravy" },
      { name: "Chicken Curry",         categoryId: catMainCourse.id, price: 200, taxRate: 5,  stock: 999, description: "Home-style chicken in spiced masala" },

      // Biryani
      { name: "Veg Dum Biryani",       categoryId: catBiryani.id,    price: 160, taxRate: 5,  stock: 999, description: "Slow-cooked aromatic basmati with vegetables" },
      { name: "Chicken Biryani",       categoryId: catBiryani.id,    price: 220, taxRate: 5,  stock: 999, description: "Hyderabadi style dum chicken biryani" },
      { name: "Mutton Biryani",        categoryId: catBiryani.id,    price: 280, taxRate: 5,  stock: 999, description: "Lucknowi style slow-cooked mutton biryani" },
      { name: "Prawn Biryani",         categoryId: catBiryani.id,    price: 260, taxRate: 5,  stock: 999, description: "Coastal style prawn biryani" },
      { name: "Egg Biryani",           categoryId: catBiryani.id,    price: 180, taxRate: 5,  stock: 999, description: "Aromatic egg biryani with raita" },

      // Desserts
      { name: "Gulab Jamun (2 pcs)",   categoryId: catDesserts.id,   price: 60,  taxRate: 5,  stock: 999, description: "Soft milk-solid dumplings in rose syrup" },
      { name: "Kulfi",                 categoryId: catDesserts.id,   price: 70,  taxRate: 5,  stock: 999, description: "Traditional Indian ice cream — kesar pista" },
      { name: "Gajar Halwa",           categoryId: catDesserts.id,   price: 80,  taxRate: 5,  stock: 999, description: "Slow-cooked carrot pudding with khoya & nuts" },
      { name: "Rasgulla",              categoryId: catDesserts.id,   price: 50,  taxRate: 5,  stock: 999, description: "Spongy cottage cheese balls in light sugar syrup" },
      { name: "Kheer",                 categoryId: catDesserts.id,   price: 65,  taxRate: 5,  stock: 999, description: "Creamy rice pudding with saffron & pistachios" },
      { name: "Jalebi",                categoryId: catDesserts.id,   price: 55,  taxRate: 5,  stock: 999, description: "Crispy fermented wheat spirals in sugar syrup" },

      // Milkshakes
      { name: "Chocolate Milkshake",   categoryId: catMilkshakes.id, price: 100, taxRate: 18, stock: 999, description: "Thick Belgian chocolate milkshake" },
      { name: "Strawberry Milkshake",  categoryId: catMilkshakes.id, price: 100, taxRate: 18, stock: 999, description: "Fresh strawberry milkshake" },
      { name: "Banana Milkshake",      categoryId: catMilkshakes.id, price: 90,  taxRate: 18, stock: 999, description: "Rich banana milkshake" },
      { name: "Oreo Milkshake",        categoryId: catMilkshakes.id, price: 120, taxRate: 18, stock: 999, description: "Creamy Oreo cookie milkshake" },
    ],
  });

  console.log(`[seed] ✅ ${products.length} products created`);

  // ── Payment Methods ───────────────────────────────────────────────────────────
  await prisma.paymentMethod.create({ data: { type: PaymentType.CASH, name: "Cash", isActive: true } });
  await prisma.paymentMethod.create({ data: { type: PaymentType.CARD, name: "Credit / Debit Card", isActive: true } });
  await prisma.paymentMethod.create({ data: { type: PaymentType.UPI, name: "UPI / QR", isActive: true, upiId: "odoocafe@hdfcbank" } });

  console.log("[seed] ✅ Payment methods created");

  // ── Floors & Tables ───────────────────────────────────────────────────────────
  const gFloor  = await prisma.floor.create({ data: { name: "Ground Floor" } });
  const fFloor  = await prisma.floor.create({ data: { name: "First Floor" } });
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
      { number: 9, seats: 4 }, { number: 10, seats: 4 }, { number: 11, seats: 6 },
      { number: 12, seats: 6 }, { number: 13, seats: 2 }, { number: 14, seats: 2 },
    ].map((t) => prisma.table.create({ data: { ...t, floorId: fFloor.id, isActive: true } }))
  );

  const tTables = await Promise.all(
    [
      { number: 15, seats: 4 }, { number: 16, seats: 4 }, { number: 17, seats: 6 },
      { number: 18, seats: 4 },
    ].map((t) => prisma.table.create({ data: { ...t, floorId: terrace.id, isActive: true } }))
  );

  const allTables = [...gTables, ...fTables, ...tTables];

  console.log("[seed] ✅ Floors & tables created");

  // ── Promotions ────────────────────────────────────────────────────────────────
  const masalaChai     = products.find((p) => p.name === "Masala Chai")!;
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
      name: "HOLI50 — Holi Special",
      promoType: PromoType.COUPON,
      code: "HOLI50",
      discountValue: 50,
      discountType: DiscountType.FIXED,
      isActive: false,
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

  console.log("[seed] ✅ Promotions created");

  // ── Customers ─────────────────────────────────────────────────────────────────
  const customers = await Promise.all([
    prisma.customer.create({ data: { name: "Kavya Reddy",      email: "kavya.reddy@gmail.com",     phone: "9876543210" } }),
    prisma.customer.create({ data: { name: "Amit Joshi",       email: "amit.joshi@yahoo.co.in",    phone: "9845012345" } }),
    prisma.customer.create({ data: { name: "Neha Singh",       email: "neha.singh@outlook.com",    phone: "7890123456" } }),
    prisma.customer.create({ data: { name: "Suresh Kumar",     phone: "9012345678" } }),
    prisma.customer.create({ data: { name: "Meera Nair",       email: "meera.nair@gmail.com",      phone: "8765432109" } }),
    prisma.customer.create({ data: { name: "Vikas Agarwal",    email: "vikas.agarwal@gmail.com" } }),
    prisma.customer.create({ data: { name: "Pooja Iyer",       phone: "9543210987" } }),
    prisma.customer.create({ data: { name: "Rahul Desai",      email: "rahul.desai@hotmail.com",   phone: "9321456789" } }),
    prisma.customer.create({ data: { name: "Anjali Verma",     email: "anjali.verma@gmail.com",    phone: "9988776655" } }),
    prisma.customer.create({ data: { name: "Sanjay Gupta",     phone: "9112233445" } }),
    prisma.customer.create({ data: { name: "Rekha Pillai",     email: "rekha.pillai@gmail.com",    phone: "8899001122" } }),
    prisma.customer.create({ data: { name: "Manoj Tiwari",     email: "manoj.tiwari@yahoo.co.in",  phone: "9765432100" } }),
    prisma.customer.create({ data: { name: "Deepika Chopra",   email: "deepika.c@gmail.com",       phone: "8123456789" } }),
    prisma.customer.create({ data: { name: "Kiran Bose",       phone: "7012345678" } }),
    prisma.customer.create({ data: { name: "Ravi Shankar",     email: "ravi.shankar@gmail.com",    phone: "9456789012" } }),
    prisma.customer.create({ data: { name: "Sunita Krishnan",  email: "sunita.k@outlook.com" } }),
    prisma.customer.create({ data: { name: "Harish Pandey",    phone: "9234567890" } }),
    prisma.customer.create({ data: { name: "Lalitha Menon",    email: "lalitha.menon@gmail.com",   phone: "8901234567" } }),
    prisma.customer.create({ data: { name: "Gopal Rao",        email: "gopal.rao@yahoo.co.in",     phone: "9678901234" } }),
    prisma.customer.create({ data: { name: "Swati Bhatt",      email: "swati.bhatt@gmail.com",     phone: "7890001234" } }),
  ]);

  console.log(`[seed] ✅ ${customers.length} customers created`);

  // ── Order helper ──────────────────────────────────────────────────────────────
  async function createOrder(
    sessionId: string,
    tableId: string,
    employeeId: string,
    customerId: string | null,
    lines: { product: (typeof products)[0]; qty: number }[],
    status: OrderStatus = OrderStatus.PAID,
    createdAt?: Date
  ) {
    let subtotal = 0;
    let taxAmount = 0;

    for (const line of lines) {
      const price = Number(line.product.price);
      const lineTotal = price * line.qty;
      subtotal += lineTotal;
      taxAmount += lineTotal * (line.product.taxRate / 100);
    }

    const total = Math.round((subtotal + taxAmount) * 100) / 100;

    const orderData: Parameters<typeof prisma.order.create>[0]["data"] = {
      orderNumber: nextOrderNumber(),
      sessionId,
      tableId,
      customerId,
      employeeId,
      status,
      subtotal: Math.round(subtotal * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      discountAmount: 0,
      total,
    };

    if (createdAt) {
      (orderData as Record<string, unknown>).createdAt = createdAt;
    }

    const order = await prisma.order.create({ data: orderData });

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

    if (status !== OrderStatus.CANCELLED) {
      const ticket = await prisma.kdsTicket.create({
        data: {
          orderId: order.id,
          status: status === OrderStatus.PAID ? KDSStatus.COMPLETED : KDSStatus.TO_COOK,
          ...(createdAt ? { createdAt } : {}),
        },
      });

      await Promise.all(
        orderLines.map((ol) =>
          prisma.kdsTicketItem.create({
            data: {
              ticketId: ticket.id,
              orderLineId: ol.id,
              isStruckThrough: status === OrderStatus.PAID,
            },
          })
        )
      );
    }

    return order;
  }

  // ── Product lookup helper ─────────────────────────────────────────────────────
  const p = (name: string) => products.find((x) => x.name === name)!;

  // ── Popular product groups for quick building ─────────────────────────────────
  const beverages = [
    p("Masala Chai"), p("Adrak Chai"), p("Filter Kaapi"), p("Cappuccino"),
    p("Cold Coffee"), p("Mango Lassi"), p("Nimbu Pani"), p("Watermelon Juice"),
    p("Coconut Water"), p("Tulsi Chai"), p("Elaichi Chai"),
  ];

  const snackItems = [
    p("Samosa (2 pcs)"), p("Aloo Tikki"), p("Veg Sandwich"), p("Pav Bhaji"),
    p("Bread Pakora"), p("Bhel Puri"), p("Vada Pav"),
  ];

  const breakfastItems = [
    p("Masala Dosa"), p("Idli Sambhar (3 pcs)"), p("Poha"), p("Upma"),
    p("Medu Vada (2 pcs)"), p("Paratha"),
  ];

  const mainItems = [
    p("Dal Tadka"), p("Paneer Butter Masala"), p("Chole Bhature"), p("Rajma Chawal"),
    p("Palak Paneer"), p("Matar Paneer"), p("Chicken Curry"), p("Butter Naan"), p("Jeera Rice"),
  ];

  const biryaniItems = [
    p("Veg Dum Biryani"), p("Chicken Biryani"), p("Mutton Biryani"),
    p("Prawn Biryani"), p("Egg Biryani"),
  ];

  const dessertItems = [
    p("Gulab Jamun (2 pcs)"), p("Kulfi"), p("Gajar Halwa"),
    p("Rasgulla"), p("Kheer"), p("Jalebi"),
  ];

  // ── Build random order lines ───────────────────────────────────────────────────
  function buildMealLines(mealType: "breakfast" | "lunch" | "dinner" | "snacks", tableSize: number) {
    const lines: { product: (typeof products)[0]; qty: number }[] = [];

    if (mealType === "breakfast") {
      const bev = pick(beverages);
      lines.push({ product: bev, qty: randomInt(1, Math.min(tableSize, 3)) });
      const food = pick(breakfastItems);
      lines.push({ product: food, qty: randomInt(1, Math.min(tableSize, 2)) });
      if (Math.random() > 0.5) {
        const extra = pick(snackItems);
        lines.push({ product: extra, qty: 1 });
      }
    } else if (mealType === "lunch") {
      // Main + rice/naan + beverage
      const main = pick(mainItems);
      lines.push({ product: main, qty: randomInt(1, Math.min(tableSize, 3)) });
      if (Math.random() > 0.4) {
        const starch = Math.random() > 0.5 ? p("Butter Naan") : p("Jeera Rice");
        lines.push({ product: starch, qty: randomInt(1, Math.min(tableSize, 2)) });
      }
      if (Math.random() > 0.6) {
        const biryani = pick(biryaniItems);
        lines.push({ product: biryani, qty: randomInt(1, 2) });
      }
      const bev = pick(beverages);
      lines.push({ product: bev, qty: randomInt(1, Math.min(tableSize, 3)) });
      if (Math.random() > 0.7) {
        const dessert = pick(dessertItems);
        lines.push({ product: dessert, qty: randomInt(1, 2) });
      }
    } else if (mealType === "dinner") {
      const biryani = pick(biryaniItems);
      lines.push({ product: biryani, qty: randomInt(1, Math.min(tableSize, 3)) });
      if (Math.random() > 0.4) {
        const main = pick(mainItems.filter((m) => m.name !== "Butter Naan" && m.name !== "Jeera Rice"));
        lines.push({ product: main, qty: randomInt(1, 2) });
      }
      if (Math.random() > 0.4) {
        const bread = p("Butter Naan");
        lines.push({ product: bread, qty: randomInt(2, 4) });
      }
      const bev = pick([...beverages, ...beverages.filter((b) => b.name.includes("Coffee"))]);
      lines.push({ product: bev, qty: randomInt(1, Math.min(tableSize, 3)) });
      if (Math.random() > 0.6) {
        const dessert = pick(dessertItems);
        lines.push({ product: dessert, qty: randomInt(1, 2) });
      }
    } else {
      // snacks
      const snack1 = pick(snackItems);
      lines.push({ product: snack1, qty: randomInt(1, 2) });
      if (Math.random() > 0.5) {
        const snack2 = pick(snackItems.filter((s) => s.id !== snack1.id));
        lines.push({ product: snack2, qty: 1 });
      }
      const bev = pick(beverages);
      lines.push({ product: bev, qty: randomInt(1, Math.min(tableSize, 3)) });
    }

    return lines;
  }

  // ── Generate day data ─────────────────────────────────────────────────────────
  // Date range: 14 March 2026 → 13 June 2026 (92 days = ~3 months)
  // Current date: 14 June 2026 (today) — active session

  const startDate = new Date(2026, 2, 14); // March 14 2026
  const endDate   = new Date(2026, 5, 13); // June 13 2026 (yesterday — fully closed)

  let totalOrders = 0;

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const year  = d.getFullYear();
    const month = d.getMonth() + 1; // 1-indexed
    const day   = d.getDate();
    const dow   = d.getDay(); // 0=Sun, 6=Sat
    const isWeekend = dow === 0 || dow === 6;

    // Decide how many orders for the day (weekends busier)
    const dayOrderCount = isWeekend ? randomInt(20, 35) : randomInt(10, 22);

    // Session for this day
    const sessionOpenHour = 8;
    const sessionCloseHour = 23;

    const openedAt  = dateAt(year, month, day, sessionOpenHour, randomInt(0, 30));
    const closedAt  = dateAt(year, month, day, sessionCloseHour, randomInt(0, 59));

    // Pick a random employee as session opener
    const sessionEmployee = pick(employees);

    const daySales = dayOrderCount * 350; // rough estimate

    const session = await prisma.session.create({
      data: {
        openedByUserId: sessionEmployee.id,
        openedAt,
        closedAt,
        closingSaleAmount: daySales,
      },
    });

    // Generate orders spread across 3 meal windows
    // Breakfast: 08:00-11:00  Lunch: 11:30-15:00  Snacks: 15:00-17:30  Dinner: 18:00-22:30
    const mealWindows: { type: "breakfast" | "lunch" | "snacks" | "dinner"; startH: number; endH: number; weight: number }[] = [
      { type: "breakfast", startH: 8,  endH: 11, weight: isWeekend ? 0.15 : 0.20 },
      { type: "lunch",     startH: 12, endH: 15, weight: isWeekend ? 0.35 : 0.35 },
      { type: "snacks",    startH: 15, endH: 18, weight: isWeekend ? 0.15 : 0.15 },
      { type: "dinner",    startH: 18, endH: 23, weight: isWeekend ? 0.35 : 0.30 },
    ];

    for (let i = 0; i < dayOrderCount; i++) {
      // Pick meal window based on weight
      const rand = Math.random();
      let cumulative = 0;
      let mealWindow = mealWindows[0];
      for (const mw of mealWindows) {
        cumulative += mw.weight;
        if (rand <= cumulative) {
          mealWindow = mw;
          break;
        }
      }

      const hourRange = mealWindow.endH - mealWindow.startH;
      const orderHour = mealWindow.startH + Math.floor(Math.random() * hourRange);
      const orderMin  = randomInt(0, 59);
      const orderTime = dateAt(year, month, day, orderHour, orderMin);

      const table    = pick(allTables);
      const employee = pick(employees);
      const customer = Math.random() > 0.45 ? pick(customers) : null;

      // 5% chance of cancellation
      const isCancelled = Math.random() < 0.05;
      const status = isCancelled ? OrderStatus.CANCELLED : OrderStatus.PAID;

      const lines = buildMealLines(mealWindow.type, table.seats);

      await createOrder(
        session.id,
        table.id,
        employee.id,
        customer?.id ?? null,
        lines,
        status,
        orderTime
      );
      totalOrders++;
    }
  }

  console.log(`[seed] ✅ Generated ${totalOrders} historical orders across 92 days`);

  // ── Today's active session (14 June 2026) ────────────────────────────────────
  const todaySession = await prisma.session.create({
    data: {
      openedByUserId: admin.id,
      openedAt: dateAt(2026, 6, 14, 8, 30),
    },
  });

  // 6 paid orders already done this morning
  await createOrder(todaySession.id, gTables[0].id, emp1.id, customers[0].id, [
    { product: p("Masala Chai"),     qty: 2 },
    { product: p("Masala Dosa"),     qty: 2 },
    { product: p("Samosa (2 pcs)"), qty: 1 },
  ], OrderStatus.PAID, dateAt(2026, 6, 14, 9, 10));

  await createOrder(todaySession.id, gTables[2].id, emp2.id, customers[1].id, [
    { product: p("Filter Kaapi"),    qty: 2 },
    { product: p("Idli Sambhar (3 pcs)"), qty: 2 },
  ], OrderStatus.PAID, dateAt(2026, 6, 14, 9, 30));

  await createOrder(todaySession.id, fTables[0].id, emp1.id, customers[3].id, [
    { product: p("Cappuccino"),      qty: 3 },
    { product: p("Veg Sandwich"),    qty: 3 },
    { product: p("Gulab Jamun (2 pcs)"), qty: 2 },
  ], OrderStatus.PAID, dateAt(2026, 6, 14, 10, 15));

  await createOrder(todaySession.id, gTables[4].id, emp3.id, null, [
    { product: p("Adrak Chai"),      qty: 4 },
    { product: p("Bread Pakora"),    qty: 2 },
    { product: p("Bhel Puri"),       qty: 2 },
  ], OrderStatus.PAID, dateAt(2026, 6, 14, 10, 45));

  await createOrder(todaySession.id, tTables[0].id, emp2.id, customers[5].id, [
    { product: p("Chicken Biryani"), qty: 2 },
    { product: p("Mango Lassi"),     qty: 2 },
    { product: p("Kulfi"),           qty: 2 },
  ], OrderStatus.PAID, dateAt(2026, 6, 14, 12, 0));

  await createOrder(todaySession.id, fTables[1].id, emp1.id, customers[8].id, [
    { product: p("Paneer Butter Masala"), qty: 2 },
    { product: p("Butter Naan"),         qty: 4 },
    { product: p("Jeera Rice"),          qty: 1 },
    { product: p("Nimbu Pani"),          qty: 2 },
  ], OrderStatus.PAID, dateAt(2026, 6, 14, 13, 0));

  // 3 active DRAFT orders (currently being served)
  await createOrder(todaySession.id, gTables[1].id, admin.id, customers[2].id, [
    { product: p("Masala Chai"),     qty: 2 },
    { product: p("Poha"),            qty: 2 },
  ], OrderStatus.DRAFT, dateAt(2026, 6, 14, 14, 30));

  await createOrder(todaySession.id, gTables[3].id, emp3.id, customers[7].id, [
    { product: p("Cold Coffee"),     qty: 2 },
    { product: p("Vada Pav"),        qty: 3 },
  ], OrderStatus.DRAFT, dateAt(2026, 6, 14, 14, 45));

  await createOrder(todaySession.id, fTables[2].id, emp2.id, null, [
    { product: p("Mutton Biryani"),  qty: 2 },
    { product: p("Rasgulla"),        qty: 2 },
  ], OrderStatus.DRAFT, dateAt(2026, 6, 14, 15, 0));

  console.log("[seed] ✅ Today's active session with 9 orders (6 paid + 3 draft) created");

  // ── Summary ───────────────────────────────────────────────────────────────────
  console.log("\n========================================");
  console.log("  ODOO CAFE — SEED COMPLETE");
  console.log("========================================");
  console.log(`  Historical data : 14 Mar → 13 Jun 2026`);
  console.log(`  Total orders    : ${totalOrders + 9} (${totalOrders} historical + 9 today)`);
  console.log(`  Products        : ${products.length}`);
  console.log(`  Customers       : ${customers.length}`);
  console.log("========================================");
  console.log("  ADMIN LOGIN CREDENTIALS");
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
