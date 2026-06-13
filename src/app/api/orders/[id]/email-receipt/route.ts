import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getById } from "@/lib/db/orders";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const role = req.headers.get("x-user-role");
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const order = await getById(id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const email = body?.email?.trim();

  // If no email is provided in body, fall back to the order's customer's email
  const targetEmail = email || order.customer?.email;

  if (!targetEmail) {
    return NextResponse.json(
      { error: "No recipient email address specified or found on order." },
      { status: 400 }
    );
  }

  // 1. Check SMTP Env Configuration
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || smtpUser || "Odoo Cafe <no-reply@odoocafe.com>";

  if (!smtpUser || !smtpPass) {
    return NextResponse.json(
      {
        error: "SMTP credentials are not configured. Please define SMTP_USER and SMTP_PASS in your .env file.",
      },
      { status: 500 }
    );
  }

  // 2. Format receipt values
  const dateStr = new Date(order.updatedAt).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const formattedItems = order.orderLines.map((line) => {
    const unitPrice = Number(line.unitPrice);
    const lineTotal = Number(line.lineTotal);
    return {
      qty: line.qty,
      name: line.product.name,
      unitPrice: unitPrice.toFixed(2),
      lineTotal: lineTotal.toFixed(2),
    };
  });

  const subtotal = Number(order.subtotal).toFixed(2);
  const taxAmount = Number(order.taxAmount).toFixed(2);
  const discountAmount = Number(order.discountAmount).toFixed(2);
  const total = Number(order.total).toFixed(2);

  // Fallbacks for payment method details (if payment record hasn't fully updated, check order state)
  const method = body?.method || "PAID_ORDER";
  const changeDue = body?.changeDue != null ? Number(body.changeDue).toFixed(2) : null;
  const reference = body?.reference || null;

  // 3. Construct a beautiful, realistic thermal HTML receipt
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt for Order ${order.orderNumber}</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      background-color: #f6f6f6;
      font-family: 'Courier New', Courier, monospace;
      color: #000000;
    }
    .receipt-container {
      max-width: 420px;
      margin: 0 auto;
      background-color: #ffffff;
      padding: 25px 20px;
      border: 1px solid #e0e0e0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      border-radius: 4px;
      box-sizing: border-box;
    }
    .text-center {
      text-align: center;
    }
    .text-right {
      text-align: right;
    }
    .brand-name {
      font-size: 24px;
      font-weight: bold;
      letter-spacing: 2px;
      margin: 0 0 5px 0;
      color: #000000;
    }
    .brand-subtitle {
      font-size: 11px;
      color: #555555;
      margin: 0 0 4px 0;
      line-height: 1.4;
    }
    .separator {
      border-top: 1px dashed #000000;
      margin: 15px 0;
    }
    .double-separator {
      border-top: 1px double #000000;
      margin: 15px 0;
    }
    .meta-table, .items-table, .pricing-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    .meta-table td {
      padding: 2px 0;
    }
    .meta-label {
      color: #555555;
      width: 35%;
    }
    .meta-value {
      font-weight: bold;
      color: #000000;
    }
    .items-table th {
      border-bottom: 1px dashed #000000;
      padding-bottom: 6px;
      text-align: left;
      font-weight: bold;
    }
    .items-table td {
      padding: 6px 0;
      vertical-align: top;
    }
    .pricing-table td {
      padding: 3px 0;
    }
    .pricing-label {
      width: 60%;
      text-align: left;
    }
    .pricing-value {
      width: 40%;
      text-align: right;
      font-weight: bold;
    }
    .total-row td {
      font-size: 16px;
      font-weight: bold;
      padding: 8px 0;
    }
    .footer-msg {
      font-size: 11px;
      color: #555555;
      line-height: 1.5;
      margin-top: 15px;
    }
    .footer-tagline {
      font-size: 12px;
      font-weight: bold;
      margin-top: 5px;
      letter-spacing: 1px;
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="text-center">
      <h1 class="brand-name">ODOO CAFE</h1>
      <p class="brand-subtitle">123 Gourmet Street, Foodie City</p>
      <p class="brand-subtitle">GSTIN: 27AAAAA1111A1Z1</p>
      <p class="brand-subtitle">Phone: +91 98765 43210</p>
    </div>

    <div class="separator"></div>

    <table class="meta-table">
      <tr>
        <td class="meta-label">Bill No:</td>
        <td class="meta-value">${order.orderNumber}</td>
      </tr>
      <tr>
        <td class="meta-label">Date:</td>
        <td class="meta-value">${dateStr}</td>
      </tr>
      ${order.customer ? `
      <tr>
        <td class="meta-label">Customer:</td>
        <td class="meta-value">${order.customer.name}</td>
      </tr>
      ` : ""}
      ${order.table ? `
      <tr>
        <td class="meta-label">Table:</td>
        <td class="meta-value">Table #${order.table.number}</td>
      </tr>
      ` : ""}
      ${order.employee ? `
      <tr>
        <td class="meta-label">Cashier:</td>
        <td class="meta-value">${order.employee.name}</td>
      </tr>
      ` : ""}
    </table>

    <div class="separator"></div>

    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 10%;">Qty</th>
          <th style="width: 50%;">Item</th>
          <th style="width: 20%; text-align: right;">Price</th>
          <th style="width: 20%; text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${formattedItems.map(item => `
        <tr>
          <td>${item.qty}</td>
          <td>${item.name}</td>
          <td class="text-right">₹${item.unitPrice}</td>
          <td class="text-right">₹${item.lineTotal}</td>
        </tr>
        `).join("")}
      </tbody>
    </table>

    <div class="separator"></div>

    <table class="pricing-table">
      <tr>
        <td class="pricing-label">Subtotal:</td>
        <td class="pricing-value">₹${subtotal}</td>
      </tr>
      <tr>
        <td class="pricing-label">GST (5%):</td>
        <td class="pricing-value">₹${taxAmount}</td>
      </tr>
      ${Number(discountAmount) > 0 ? `
      <tr>
        <td class="pricing-label" style="color: #2e7d32;">Discount:</td>
        <td class="pricing-value" style="color: #2e7d32;">-₹${discountAmount}</td>
      </tr>
      ` : ""}
      <tr class="total-row">
        <td class="pricing-label" style="border-top: 1px dashed #000000; padding-top: 8px;">TOTAL:</td>
        <td class="pricing-value" style="border-top: 1px dashed #000000; padding-top: 8px;">₹${total}</td>
      </tr>
    </table>

    <div class="separator"></div>

    <table class="meta-table">
      <tr>
        <td class="meta-label">Payment Method:</td>
        <td class="meta-value">${method}</td>
      </tr>
      ${reference ? `
      <tr>
        <td class="meta-label">Txn Ref:</td>
        <td class="meta-value" style="font-family: monospace; font-size: 11px;">${reference}</td>
      </tr>
      ` : ""}
      ${changeDue !== null ? `
      <tr>
        <td class="meta-label">Change Due:</td>
        <td class="meta-value">₹${changeDue}</td>
      </tr>
      ` : ""}
    </table>

    <div class="double-separator"></div>

    <div class="text-center footer-msg">
      <p>Thank you for dining with us!</p>
      <p class="footer-tagline">VISIT AGAIN</p>
    </div>
  </div>
</body>
</html>
  `;

  // 4. Send Email using Nodemailer
  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for port 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: smtpFrom,
      to: targetEmail,
      subject: `Receipt for Order ${order.orderNumber} - Odoo Cafe`,
      text: `Thank you for dining with us! Your total is ₹${total}. Bill No: ${order.orderNumber}.`,
      html: htmlContent,
    });

    return NextResponse.json({ success: true, message: `Receipt sent successfully to ${targetEmail}` });
  } catch (err: any) {
    return NextResponse.json({ error: `Failed to send email: ${err.message}` }, { status: 500 });
  }
}
