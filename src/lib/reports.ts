import { jsPDF } from "jspdf";

function parseLocalDate(dateStr: string, isEnd: boolean) {
  if (dateStr.includes("T")) {
    const d = new Date(dateStr);
    if (isEnd) {
      return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
    } else {
      return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
    }
  }

  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    if (isEnd) {
      return new Date(y, m, d, 23, 59, 59, 999);
    } else {
      return new Date(y, m, d, 0, 0, 0, 0);
    }
  }

  const fallback = new Date(dateStr);
  if (isEnd) {
    return new Date(fallback.getFullYear(), fallback.getMonth(), fallback.getDate(), 23, 59, 59, 999);
  } else {
    return new Date(fallback.getFullYear(), fallback.getMonth(), fallback.getDate(), 0, 0, 0, 0);
  }
}

export function getPeriodRange(
  period: "today" | "week" | "month" | "custom",
  fromStr?: string | null,
  toStr?: string | null
) {
  const now = new Date();
  let from: Date;
  let to: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  if (period === "today") {
    from = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  } else if (period === "week") {
    from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0);
  } else if (period === "month") {
    from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0, 0);
  } else if (period === "custom") {
    if (!fromStr || !toStr) {
      throw new Error("Custom period requires from and to date strings");
    }
    from = parseLocalDate(fromStr, false);
    to = parseLocalDate(toStr, true);
  } else {
    throw new Error("Invalid period");
  }

  return { from, to };
}

export function getPreviousPeriodRange(
  period: "today" | "week" | "month" | "custom",
  currentRange: { from: Date; to: Date }
) {
  const durationMs = currentRange.to.getTime() - currentRange.from.getTime();
  const prevFrom = new Date(currentRange.from.getTime() - durationMs - 1);
  const prevTo = new Date(currentRange.from.getTime() - 1);

  const from = new Date(prevFrom.getFullYear(), prevFrom.getMonth(), prevFrom.getDate(), 0, 0, 0, 0);
  const to = new Date(prevTo.getFullYear(), prevTo.getMonth(), prevTo.getDate(), 23, 59, 59, 999);

  return { from, to };
}

export function generateExcelXML(data: {
  kpis: any;
  salesTrend: any[];
  topCategories: any[];
  topProducts: any[];
  topOrders: any[];
}) {
  let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
  <Styles>
    <Style ss:ID="Header">
      <Font ss:Bold="1"/>
      <Interior ss:Color="#EAEAEA" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="Bold">
      <Font ss:Bold="1"/>
    </Style>
  </Styles>
`;

  // Worksheet 1: KPI
  xml += `  <Worksheet ss:Name="KPI">
    <Table>
      <Row ss:StyleID="Header">
        <Cell><Data ss:Type="String">Metric</Data></Cell>
        <Cell><Data ss:Type="String">Value</Data></Cell>
        <Cell><Data ss:Type="String">Change %</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">Total Orders</Data></Cell>
        <Cell><Data ss:Type="Number">${data.kpis.totalOrders}</Data></Cell>
        <Cell><Data ss:Type="Number">${data.kpis.totalOrdersChange}</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">Revenue (Rs.)</Data></Cell>
        <Cell><Data ss:Type="Number">${data.kpis.revenue}</Data></Cell>
        <Cell><Data ss:Type="Number">${data.kpis.revenueChange}</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">Average Order (Rs.)</Data></Cell>
        <Cell><Data ss:Type="Number">${data.kpis.avgOrder}</Data></Cell>
        <Cell><Data ss:Type="Number">${data.kpis.avgOrderChange}</Data></Cell>
      </Row>
    </Table>
  </Worksheet>
`;

  // Worksheet 2: Sales Trend
  xml += `  <Worksheet ss:Name="Sales">
    <Table>
      <Row ss:StyleID="Header">
        <Cell><Data ss:Type="String">Time / Date</Data></Cell>
        <Cell><Data ss:Type="String">Revenue (Rs.)</Data></Cell>
      </Row>
`;
  for (const row of data.salesTrend) {
    xml += `      <Row>
        <Cell><Data ss:Type="String">${row.time}</Data></Cell>
        <Cell><Data ss:Type="Number">${row.revenue}</Data></Cell>
      </Row>
`;
  }
  xml += `    </Table>
  </Worksheet>
`;

  // Worksheet 3: Categories
  xml += `  <Worksheet ss:Name="Categories">
    <Table>
      <Row ss:StyleID="Header">
        <Cell><Data ss:Type="String">Category</Data></Cell>
        <Cell><Data ss:Type="String">Revenue (Rs.)</Data></Cell>
        <Cell><Data ss:Type="String">Percentage %</Data></Cell>
      </Row>
`;
  for (const row of data.topCategories) {
    xml += `      <Row>
        <Cell><Data ss:Type="String">${row.name}</Data></Cell>
        <Cell><Data ss:Type="Number">${row.revenue}</Data></Cell>
        <Cell><Data ss:Type="Number">${row.percent}</Data></Cell>
      </Row>
`;
  }
  xml += `    </Table>
  </Worksheet>
`;

  // Worksheet 4: Products
  xml += `  <Worksheet ss:Name="Products">
    <Table>
      <Row ss:StyleID="Header">
        <Cell><Data ss:Type="String">Product</Data></Cell>
        <Cell><Data ss:Type="String">Quantity Sold</Data></Cell>
        <Cell><Data ss:Type="String">Revenue (Rs.)</Data></Cell>
      </Row>
`;
  for (const row of data.topProducts) {
    xml += `      <Row>
        <Cell><Data ss:Type="String">${row.name}</Data></Cell>
        <Cell><Data ss:Type="Number">${row.qty}</Data></Cell>
        <Cell><Data ss:Type="Number">${row.revenue}</Data></Cell>
      </Row>
`;
  }
  xml += `    </Table>
  </Worksheet>
`;

  // Worksheet 5: Top Orders
  xml += `  <Worksheet ss:Name="Orders">
    <Table>
      <Row ss:StyleID="Header">
        <Cell><Data ss:Type="String">Order Number</Data></Cell>
        <Cell><Data ss:Type="String">Session ID</Data></Cell>
        <Cell><Data ss:Type="String">Date</Data></Cell>
        <Cell><Data ss:Type="String">Customer</Data></Cell>
        <Cell><Data ss:Type="String">Employee</Data></Cell>
        <Cell><Data ss:Type="String">Total (Rs.)</Data></Cell>
      </Row>
`;
  for (const row of data.topOrders) {
    const formattedDate = new Date(row.date).toISOString().replace("T", " ").substring(0, 19);
    xml += `      <Row>
        <Cell><Data ss:Type="String">${row.orderNumber}</Data></Cell>
        <Cell><Data ss:Type="String">${row.sessionId}</Data></Cell>
        <Cell><Data ss:Type="String">${formattedDate}</Data></Cell>
        <Cell><Data ss:Type="String">${row.customer || "Walk-in"}</Data></Cell>
        <Cell><Data ss:Type="String">${row.employee}</Data></Cell>
        <Cell><Data ss:Type="Number">${row.total}</Data></Cell>
      </Row>
`;
  }
  xml += `    </Table>
  </Worksheet>
</Workbook>`;

  return xml;
}

export function generatePDF(data: {
  kpis: any;
  salesTrend: any[];
  topCategories: any[];
  topProducts: any[];
  topOrders: any[];
}) {
  const doc = new jsPDF();

  // Draw Title
  doc.setFontSize(20);
  doc.text("Odoo Cafe - Reports & Analytics", 14, 20);
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

  // Draw KPI Section
  doc.setFontSize(14);
  doc.text("Key Performance Indicators (KPIs)", 14, 40);

  doc.setFontSize(10);
  doc.text(`Total Orders: ${data.kpis.totalOrders} (${data.kpis.totalOrdersChange}% vs prev period)`, 14, 48);
  doc.text(`Total Revenue: Rs. ${data.kpis.revenue} (${data.kpis.revenueChange}% vs prev period)`, 14, 54);
  doc.text(`Average Order Value: Rs. ${data.kpis.avgOrder} (${data.kpis.avgOrderChange}% vs prev period)`, 14, 60);

  // Draw Top Categories Section
  doc.setFontSize(14);
  doc.text("Top Categories by Revenue", 14, 75);
  doc.setFontSize(10);
  let y = 83;
  doc.text("Category", 14, y);
  doc.text("Revenue", 100, y);
  doc.text("Percentage", 150, y);
  doc.line(14, y + 2, 196, y + 2);
  y += 8;

  for (const cat of data.topCategories.slice(0, 5)) {
    doc.text(cat.name, 14, y);
    doc.text(`Rs. ${cat.revenue}`, 100, y);
    doc.text(`${cat.percent}%`, 150, y);
    y += 6;
  }

  // Draw Top Products Section
  y += 10;
  doc.setFontSize(14);
  doc.text("Top Products by Quantity", 14, y);
  doc.setFontSize(10);
  y += 8;
  doc.text("Product", 14, y);
  doc.text("Qty Sold", 100, y);
  doc.text("Revenue", 150, y);
  doc.line(14, y + 2, 196, y + 2);
  y += 8;

  for (const prod of data.topProducts.slice(0, 5)) {
    doc.text(prod.name, 14, y);
    doc.text(String(prod.qty), 100, y);
    doc.text(`Rs. ${prod.revenue}`, 150, y);
    y += 6;
  }

  // Draw Top Orders Section
  if (y > 230) {
    doc.addPage();
    y = 20;
  } else {
    y += 10;
  }
  doc.setFontSize(14);
  doc.text("Top Orders by Value (Limit 10)", 14, y);
  doc.setFontSize(10);
  y += 8;
  doc.text("Order No.", 14, y);
  doc.text("Employee", 60, y);
  doc.text("Customer", 110, y);
  doc.text("Total", 160, y);
  doc.line(14, y + 2, 196, y + 2);
  y += 8;

  for (const order of data.topOrders) {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(order.orderNumber, 14, y);
    doc.text(order.employee, 60, y);
    doc.text(order.customer || "Walk-in", 110, y);
    doc.text(`Rs. ${order.total}`, 160, y);
    y += 6;
  }

  return Buffer.from(doc.output("arraybuffer"));
}
