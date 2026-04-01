import PDFDocument from "pdfkit";
import VolunteerLog from "../models/VolunteerLog.js";
import User from "../models/User.js";
import Event from "../models/Event.js";

const getBadgeForHours = (hours) => {
  if (hours >= 100) return "Gold";
  if (hours >= 50) return "Silver";
  if (hours >= 10) return "Bronze";
  return "Starter";
};

export const getCertificate = async (req, res) => {
  const log = await VolunteerLog.findById(req.params.logId).populate({
    path: "event",
    populate: { path: "organization", select: "name organizationName" },
  });

  if (!log) {
    return res.status(404).json({ message: "Log not found" });
  }

  if (
    req.user.role !== "admin" &&
    log.user.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({ message: "Access denied" });
  }

  const user = await User.findById(log.user);
  const totalHours = await VolunteerLog.find({ user: log.user }).then((rows) =>
    rows.reduce((a, b) => a + (b.hours || 0), 0)
  );

  const badge = getBadgeForHours(totalHours);
  const eventTitle = log.event?.title || "Community Service";
  const orgName =
    log.event?.organization?.organizationName ||
    log.event?.organization?.name ||
    "Verified Organization";

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename=certificate-${log._id}.pdf`
  );

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  doc.pipe(res);

  doc.fontSize(22).text("Smart Community Platform", { align: "center" });
  doc.moveDown(1);
  doc.fontSize(18).text("Certificate of Volunteering", { align: "center" });
  doc.moveDown(2);

  doc
    .fontSize(12)
    .text(`This certifies that ${user?.name || "Volunteer"}`);
  doc.moveDown(0.5);
  doc.text(`Completed: ${log.hours} hours on ${eventTitle}`);
  doc.moveDown(0.5);
  doc.text(`Organization: ${orgName}`);
  doc.moveDown(0.5);
  doc.text(`Total hours served: ${totalHours}`);
  doc.moveDown(0.5);
  doc.text(`Badge earned: ${badge}`);
  doc.moveDown(2);

  doc.text(`Issued on: ${new Date().toLocaleDateString()}`);
  doc.moveDown(1);
  doc.text("Authorized Signature: __________________________");

  doc.end();
};
