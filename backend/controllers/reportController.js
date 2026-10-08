const mongoose = require("mongoose");
const Tracker = require("../models/Tracker");
const Goal = require("../models/Goal");
const PDFDocument = require("pdfkit-table");


const getUserId = (req) => {
  return req.user?.id || req.user?._id || req.user?.googleId;
};


const getDateFilter = (period) => {
  const now = new Date();
  let startDate = null;
  let endDate = null;

  const p = period ? period.toLowerCase().trim() : "this_month";

  if (p === "this_month" || p === "this month") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  } else if (p === "last_month" || p === "last month") {
    startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  } else if (p === "last_3_months" || p === "last 3 months") {
    startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  } else if (p === "this_year" || p === "this year") {
    startDate = new Date(now.getFullYear(), 0, 1);
    endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
  }

  return { startDate, endDate };
};

// ==========================================
// 1. GET REPORT SUMMARY DATA FOR DASHBOARD
// ==========================================
exports.getReportSummary = async (req, res) => {
  try {
    const currentUserId = getUserId(req);
    const period = req.query.period || "this_month";

    if (!currentUserId) {
      return res.status(401).json({ success: false, message: "Unauthorized: User ID missing" });
    }

    const userQuery = [
      { userId: currentUserId },
      { userId: String(currentUserId) },
    ];
    if (mongoose.Types.ObjectId.isValid(currentUserId)) {
      userQuery.push({ userId: new mongoose.Types.ObjectId(currentUserId) });
    }

    const { startDate, endDate } = getDateFilter(period);
    let matchCriteria = { $or: userQuery };

    if (startDate) {
      const dateCondition = { $gte: startDate };
      if (endDate) dateCondition.$lte = endDate;

      matchCriteria = {
        $and: [
          { $or: userQuery },
          {
            $or: [
              { activityDate: dateCondition },
              { createdAt: dateCondition },
            ],
          },
        ],
      };
    }

    const activities = await Tracker.find(matchCriteria)
      .sort({ activityDate: -1, createdAt: -1 })
      .lean();

    let totalCO2Reduced = 0;
    let totalEmissions = 0;
    let savingCount = 0;
    let emissionCount = 0;

    activities.forEach((act) => {
      const saved = Number(act.carbonSaved || 0);
      const output = Number(act.carbonOutput || act.co2 || 0);
      const mode = act.activityMode || (saved > 0 ? "saving" : "emission");

      if (mode === "saving") {
        totalCO2Reduced += saved > 0 ? saved : output;
        savingCount++;
      } else {
        totalEmissions += output;
        emissionCount++;
      }
    });

    const uniqueDays = new Set(
      activities
        .map((a) => (a.activityDate || a.createdAt ? new Date(a.activityDate || a.createdAt).toISOString().split("T")[0] : null))
        .filter(Boolean)
    );
    const activeDaysCount = uniqueDays.size || 1;
    const avgDailyImpact = totalCO2Reduced / activeDaysCount;

    // Category Breakdown Calculation
    const categoryMap = {};
    activities.forEach((act) => {
      const saved = Number(act.carbonSaved || 0);
      const output = Number(act.carbonOutput || act.co2 || 0);
      const cat = act.category || "Other";
      const val = saved > 0 ? saved : output;
      if (val > 0) categoryMap[cat] = (categoryMap[cat] || 0) + val;
    });

    const totalCatVal = Object.values(categoryMap).reduce((a, b) => a + b, 0);
    const impactBreakdown = Object.entries(categoryMap).map(([name, val]) => ({
      name,
      value: totalCatVal > 0 ? Number(((val / totalCatVal) * 100).toFixed(1)) : 0,
    }));

    // Timeline Data
    const timelineMap = {};
    activities.forEach((act) => {
      const saved = Number(act.carbonSaved || 0);
      const output = Number(act.carbonOutput || act.co2 || 0);
      const d = new Date(act.activityDate || act.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      timelineMap[d] = (timelineMap[d] || 0) + (saved > 0 ? saved : output);
    });

    const timelineData = Object.entries(timelineMap).map(([date, value]) => ({
      date,
      value: Number(value.toFixed(2)),
    }));

    // Top Saving Activities
    const topActivities = activities
      .filter((a) => (a.activityMode || (a.carbonSaved > 0 ? "saving" : "emission")) === "saving")
      .slice(0, 5)
      .map((a) => ({
        activityName: a.subType || a.activityType || a.category || "Activity",
        co2SavedKg: Number((a.carbonSaved || a.co2 || 0).toFixed(2)),
        date: a.activityDate || a.createdAt,
        category: a.category || "Other",
      }));

    const netFootprint = Math.max(0, totalEmissions - totalCO2Reduced);

    // DYNAMIC RATIO FORMULA (Same as Dashboard.jsx)
    const totalActivity = totalCO2Reduced + totalEmissions;
    const ecoScore = totalActivity > 0 ? Math.round((totalCO2Reduced / totalActivity) * 100) : 50;

    return res.status(200).json({
      success: true,
      data: {
        totalCO2Reduced: Number(totalCO2Reduced.toFixed(2)),
        totalEmissions: Number(totalEmissions.toFixed(2)),
        netFootprint: Number(netFootprint.toFixed(2)),
        totalActivities: activities.length,
        activeDays: activeDaysCount,
        savingCount,
        emissionCount,
        avgDailyImpact: Number(avgDailyImpact.toFixed(2)),
        ecoScore,
        impactBreakdown,
        topActivities,
        monthlyComparison: [
          { month: "Previous", value: Number((totalCO2Reduced * 0.85).toFixed(1)) },
          { month: "Current", value: Number(totalCO2Reduced.toFixed(1)), current: true },
        ],
        timelineData,
      },
    });
  } catch (error) {
    console.error("Report Summary Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 2. EXPORT MULTI-PAGE PROFESSIONAL PDF REPORT
// ==========================================
exports.exportReportPDF = async (req, res) => {
  try {
    const currentUserId = getUserId(req);
    const period = req.query.period || "this_month";
    const userName = req.user?.name || "EcoTrack User";

    const userQuery = [
      { userId: currentUserId },
      { userId: String(currentUserId) },
    ];
    if (mongoose.Types.ObjectId.isValid(currentUserId)) {
      userQuery.push({ userId: new mongoose.Types.ObjectId(currentUserId) });
    }

    const { startDate, endDate } = getDateFilter(period);
    let matchCriteria = { $or: userQuery };
    if (startDate) {
      const dateCondition = { $gte: startDate };
      if (endDate) dateCondition.$lte = endDate;
      matchCriteria = {
        $and: [
          { $or: userQuery },
          { $or: [{ activityDate: dateCondition }, { createdAt: dateCondition }] },
        ],
      };
    }

    const activities = await Tracker.find(matchCriteria).sort({ activityDate: -1 }).lean();
    
    let goals = [];
    try {
      goals = await Goal.find({ $or: userQuery }).lean();
    } catch (e) {
      console.log("Goals model optional fetch:", e.message);
    }

    let totalSaved = 0;
    let totalEmitted = 0;
    let savingCount = 0;
    let emissionCount = 0;
    const categoryMap = {};

    activities.forEach((act) => {
      const saved = Number(act.carbonSaved || 0);
      const output = Number(act.carbonOutput || act.co2 || 0);
      const cat = act.category || "Other";

      if (saved > 0) {
        totalSaved += saved;
        savingCount++;
        categoryMap[cat] = (categoryMap[cat] || 0) + saved;
      } else {
        totalEmitted += output;
        emissionCount++;
      }
    });

    const netFootprint = Math.max(0, totalEmitted - totalSaved);

    
    const totalActivity = totalSaved + totalEmitted;
    const ecoScore = totalActivity > 0 ? Math.round((totalSaved / totalActivity) * 100) : 50;

    const uniqueDays = new Set(
      activities.map((a) => (a.activityDate || a.createdAt ? new Date(a.activityDate || a.createdAt).toISOString().split("T")[0] : null)).filter(Boolean)
    ).size || 1;

    const doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=EcoTrack_Impact_Report_${period}.pdf`
    );

    doc.pipe(res);

    // ---------------- PAGE 1 ----------------
    doc.fillColor("#1f6b6b").fontSize(26).text("EcoTrack", { bold: true });
    doc.fillColor("#2d3748").fontSize(14).text("Environmental Impact Report");
    doc.fontSize(9).fillColor("#718096").text(`User: ${userName}  |  Period: ${period.replace("_", " ").toUpperCase()}  |  Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown(1);
    doc.strokeColor("#2f7d4f").lineWidth(2).moveTo(40, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1.5);

    doc.fillColor("#1f6b6b").fontSize(13).text("1. OVERALL SUMMARY", { bold: true });
    doc.moveDown(0.5);

    const summaryTable = {
      headers: ["Metric", "Value"],
      rows: [
        ["Total CO2 Saved", `${totalSaved.toFixed(2)} kg`],
        ["Total CO2 Emitted", `${totalEmitted.toFixed(2)} kg`],
        ["Net Carbon Footprint", `${netFootprint.toFixed(2)} kg`],
        ["Eco Score", `${ecoScore} / 100`],
      ],
    };
    await doc.table(summaryTable, { prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10), prepareRow: () => doc.font("Helvetica").fontSize(10) });

    doc.moveDown(1.5);

    doc.fillColor("#1f6b6b").fontSize(13).text("2. ACTIVITY SUMMARY", { bold: true });
    doc.moveDown(0.5);

    const activityTable = {
      headers: ["Activity Metric", "Count / Value"],
      rows: [
        ["Total Activities Logged", `${activities.length}`],
        ["Active Days", `${uniqueDays} days`],
        ["Average Daily Impact", `${(totalSaved / uniqueDays).toFixed(2)} kg/day`],
        ["Saving Actions", `${savingCount}`],
        ["Emission Actions", `${emissionCount}`],
      ],
    };
    await doc.table(activityTable, { prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10), prepareRow: () => doc.font("Helvetica").fontSize(10) });

    // ---------------- PAGE 2 ----------------
    doc.addPage();

    doc.fillColor("#1f6b6b").fontSize(13).text("3. IMPACT BREAKDOWN BY CATEGORY", { bold: true });
    doc.moveDown(0.5);

    const totalCatVal = Object.values(categoryMap).reduce((a, b) => a + b, 0) || 1;
    const breakdownRows = Object.entries(categoryMap).map(([cat, val]) => [
      cat,
      `${val.toFixed(2)} kg`,
      `${((val / totalCatVal) * 100).toFixed(1)}%`,
    ]);

    const catTable = {
      headers: ["Category", "CO2 Saved", "Percentage"],
      rows: breakdownRows.length > 0 ? breakdownRows : [["No Category Data", "0 kg", "0%"]],
    };
    await doc.table(catTable, { prepareHeader: () => doc.font("Helvetica-Bold").fontSize(9), prepareRow: () => doc.font("Helvetica").fontSize(9) });

    doc.moveDown(1.5);

    doc.fillColor("#1f6b6b").fontSize(13).text("4. TOP CO2 SAVING ACTIVITIES", { bold: true });
    doc.moveDown(0.5);

    const topSavings = activities.filter((a) => (a.carbonSaved || 0) > 0).slice(0, 5);
    const topActTable = {
      headers: ["#", "Activity Name", "Category", "CO2 Saved", "Date"],
      rows: topSavings.map((act, index) => [
        `${index + 1}`,
        act.subType || act.activityType || "Eco Action",
        act.category || "General",
        `${(act.carbonSaved || 0).toFixed(2)} kg`,
        new Date(act.activityDate || act.createdAt).toLocaleDateString(),
      ]),
    };
    if (topSavings.length > 0) {
      await doc.table(topActTable, { prepareHeader: () => doc.font("Helvetica-Bold").fontSize(9), prepareRow: () => doc.font("Helvetica").fontSize(9) });
    } else {
      doc.fontSize(10).fillColor("#718096").text("No saving activities recorded for this period.");
    }

    doc.moveDown(1.5);

    doc.fillColor("#1f6b6b").fontSize(13).text("5. GOAL PROGRESS", { bold: true });
    doc.moveDown(0.5);

    if (goals.length > 0) {
      const goalRows = goals.slice(0, 4).map((g) => {
        const target = g.targetKg || g.target || 50;
        const current = g.currentKg || g.current || 20;
        const prog = Math.min(100, Math.round((current / target) * 100));
        return [g.title || g.name || "Eco Goal", `${target} kg`, `${current} kg`, `${prog}%`];
      });
      await doc.table(
        { headers: ["Goal Name", "Target", "Current Usage", "Progress"], rows: goalRows },
        { prepareHeader: () => doc.font("Helvetica-Bold").fontSize(9), prepareRow: () => doc.font("Helvetica").fontSize(9) }
      );
    } else {
      doc.fontSize(10).fillColor("#718096").text("No active goals logged.");
    }

    // ---------------- PAGE 3 ----------------
    doc.addPage();

    doc.fillColor("#1f6b6b").fontSize(13).text("6. ACHIEVEMENTS & ECO HIGHLIGHTS", { bold: true });
    doc.moveDown(0.5);

    doc.fontSize(10).fillColor("#2d3748")
      .text(`✔ Prevented a total of ${totalSaved.toFixed(1)} kg of CO2 from entering the atmosphere.`)
      .moveDown(0.3)
      .text(`✔ Recorded ${savingCount} eco-friendly sustainability logs.`)
      .moveDown(0.3)
      .text(`✔ Stayed active for ${uniqueDays} distinct days during this tracking window.`)
      .moveDown(0.3)
      .text(`✔ Reached an overall Eco Score of ${ecoScore}/100.`);

    doc.moveDown(2);

    doc.fillColor("#1f6b6b").fontSize(13).text("7. PERSONALIZED RECOMMENDATIONS", { bold: true });
    doc.moveDown(0.5);

    doc.fontSize(10).fillColor("#2d3748")
      .text("• Transport: Switch trips under 5km to bicycles or walking to significantly slash personal travel emissions.")
      .moveDown(0.4)
      .text("• Energy Efficiency: Turn off unused standby devices and switch to LED bulbs across active workspaces.")
      .moveDown(0.4)
      .text("• Sustainable Food: Consuming plant-based options twice a week reduces household food footprint by 30%.")
      .moveDown(0.4)
      .text("• Waste Reduction: Segregate recyclables to avoid landfill methane emission generation.");

    doc.moveDown(3);
    doc.strokeColor("#e2e8f0").lineWidth(1).moveTo(40, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);
    doc.fillColor("#a2a7ae").fontSize(9).text("Generated automatically by EcoTrack System — Driving Personal Sustainability", { align: "center" });

    doc.end();
  } catch (error) {
    console.error("PDF Export Controller Error:", error);
    res.status(500).json({ success: false, message: "PDF Generation Failed" });
  }
};