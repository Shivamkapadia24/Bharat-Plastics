const puppeteer = require("puppeteer");

const Order = require("../models/Order");  // ✅ check your actual model name
const OfflineSale = require("../models/OfflineSale"); // ✅ check your actual model name

const { invoiceTemplate } = require("../templates/invoiceTemplate");

exports.downloadInvoicePDF = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ sale can be offline or online
    const offline = await OfflineSale.findById(id);
    const online = await Order.findById(id);

    let doc = null;
    let type = "";

    if (offline) {
      doc = offline;
      type = "offline";
    } else if (online) {
      doc = online;
      type = "online";
    } else {
      return res.status(404).json({ message: "Sale/Order not found" });
    }

    const html = invoiceTemplate({ doc, type });

const browser = await puppeteer.launch({
  headless: true,
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  args: ["--no-sandbox", "--disable-setuid-sandbox"]
});

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" }
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${type}-invoice-${id}.pdf`);
    res.send(pdfBuffer);

  } catch (err) {
    console.error("Invoice pdf error:", err);
    res.status(500).json({ message: "Failed to generate invoice PDF" });
  }
};