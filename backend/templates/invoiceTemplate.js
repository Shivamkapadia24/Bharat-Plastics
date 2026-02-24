// backend/templates/invoiceTemplate.js

function formatMoney(n) {
  return `₹${Number(n || 0).toFixed(2)}`;
}

function formatDate(d) {
  try {
    return new Date(d).toLocaleString();
  } catch {
    return "";
  }
}

exports.invoiceTemplate = ({ doc, type = "offline" }) => {
  // type: "offline" or "online"
  const items = doc.items || [];

  const total = doc.totalAmount || items.reduce((s, i) => s + (i.sellingPrice || i.price || 0) * (i.quantity || 0), 0);

  // ✅ Dummy Shop Details (you will edit these later)
  const SHOP = {
    name: "BHARAT PLASTICS",
    address: "Kila Road, Fawara Chawk, Burhanpur, Madhya Pradesh (450331)",
    phone: "9806104445/8817010500",
    gst: "GSTIN: 00XXXXX0000X0Z0",
    logoUrl: "http://127.0.0.1:5001/assets/logo.png" // ✅ CHANGE this if needed
  };

  const billNo = doc.billNumber || doc._id?.toString()?.slice(-8) || "N/A";

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>Invoice</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
      .page { padding: 24px; }
      .header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  border-bottom: 2px solid #111;
  padding-bottom: 12px;
}
  .brand {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
  .logo-box {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}
      .logo {
  max-width: 80px;
  max-height: 80px;
  object-fit: contain;
}
      .shop h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0.5px;
}
      .shop p {
  margin: 2px 0;
  color: #444;
  font-size: 12px;
}

      .invoice-title {
  text-align: right;
}

.invoice-title h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 900;
}
  .invoice-title p {
  margin: 3px 0;
  font-size: 12px;
  color: #555;
}
      .meta { margin-top: 18px; display:flex; justify-content:space-between; gap:16px; }
      .box { border: 1px solid #ddd; padding: 10px; border-radius: 10px; flex:1; }
      .box h3 { margin:0 0 8px; font-size:14px; color:#111; }
      .box p { margin:4px 0; font-size: 13px; color:#444; }
      table { width: 100%; border-collapse: collapse; margin-top: 18px; }
      th, td { border: 1px solid #ddd; padding: 10px; font-size: 13px; }
      th { background: #f3f3f3; text-align:left; }
      .right { text-align:right; }
      .total-box { margin-top: 16px; display:flex; justify-content:flex-end; }
      .total { width: 300px; border: 2px solid #111; border-radius: 12px; padding: 12px; }
      .total-row { display:flex; justify-content:space-between; margin: 6px 0; }
      .footer { margin-top: 18px; border-top: 1px dashed #999; padding-top: 10px; font-size: 12px; color: #555; }
      .terms li { margin-bottom: 5px; }
    </style>
  </head>

  <body>
    <div class="page">
<div class="header">
  <div class="brand">
    <div class="logo-box">
      <img class="logo" src="${SHOP.logoUrl}" />
    </div>

    <div class="shop">
      <h2>${SHOP.name}</h2>
      <p>${SHOP.address}</p>
      <p>Phone: ${SHOP.phone}</p>
      <p>${SHOP.gst}</p>
    </div>
  </div>

  <div class="invoice-title">
    <h1>${type === "online" ? "TAX INVOICE" : "BILL / INVOICE"}</h1>
    <p>${type.toUpperCase()}</p>
  </div>
</div>

      <div class="meta">
        <div class="box">
          <h3>Customer</h3>
          <p><strong>Name:</strong> ${doc.customerName || doc.user?.name || "Walk-in customer"}</p>
          <p><strong>Phone:</strong> ${doc.customerPhone || doc.user?.phone || "-"}</p>
        </div>

        <div class="box">
          <h3>Invoice Details</h3>
          <p><strong>Bill No:</strong> ${billNo}</p>
          <p><strong>Date:</strong> ${formatDate(doc.createdAt)}</p>
          <p><strong>Payment:</strong> ${doc.paymentMode || (type === "online" ? "Online" : "Cash")}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Item</th>
            <th class="right">Qty</th>
            <th class="right">Rate</th>
            <th class="right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((it, idx) => {
            const qty = Number(it.quantity || 0);
            const rate = Number(it.sellingPrice || it.price || 0);
            const amount = qty * rate;

            return `
              <tr>
                <td>${idx + 1}</td>
                <td>${it.name || "-"}</td>
                <td class="right">${qty}</td>
                <td class="right">${formatMoney(rate)}</td>
                <td class="right">${formatMoney(amount)}</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>

      <div class="total-box">
        <div class="total">
          <div class="total-row">
            <div><strong>Total</strong></div>
            <div><strong>${formatMoney(total)}</strong></div>
          </div>
        </div>
      </div>

      <div class="footer">
        <h3 style="margin:0 0 8px;">Terms & Conditions</h3>
        <ul class="terms">
          <li>Goods once sold will not be taken back.</li>
          <li>Subject to jurisdiction of your city.</li>
          <li>Thank you for shopping with us 🙏</li>
        </ul>
      </div>
    </div>
  </body>
  </html>
  `;
};