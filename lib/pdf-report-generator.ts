import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import type { SurveyResult } from "@/lib/models"
import type { OverallComparison } from "@/lib/comparison-utils"
import { getLSArColor, getLSArRating, type NeighboringLGAData } from "@/lib/results-utils"

interface PDFReportData {
  selectedState: string
  selectedLga: string
  sectionScores: Record<string, number>
  overallLSAr: number
  comparison: OverallComparison | null
  previousSurvey: SurveyResult | null
  neighboringLGAs: NeighboringLGAData[]
  neighboringAdvisory: string
  analysis: string
}

export async function generatePDFReport(data: PDFReportData) {
  const {
    selectedState,
    selectedLga,
    sectionScores,
    overallLSAr,
    comparison,
    previousSurvey,
    neighboringLGAs,
    neighboringAdvisory,
    analysis,
  } = data

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  // Header
  doc.setFontSize(20)
  doc.setTextColor(0, 51, 102)
  doc.text(`Security Analysis Report`, 105, 20, { align: "center" })

  doc.setFontSize(16)
  doc.setTextColor(0, 0, 0)
  doc.text(`${selectedLga} Local Government, ${selectedState} State`, 105, 30, { align: "center" })

  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  const date = new Date().toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  doc.text(`Generated on: ${date}`, 105, 38, { align: "center" })

  doc.setDrawColor(200, 200, 200)
  doc.line(20, 42, 190, 42)

  let currentY = 50

  // Section Scores
  doc.setFontSize(14)
  doc.setTextColor(0, 0, 0)
  doc.text("Section Scores", 20, currentY)
  currentY += 5

  const scoresData = Object.entries(sectionScores).map(([title, score]) => [title, `${score}%`])

  autoTable(doc, {
    startY: currentY,
    head: [["Section", "Score (%)"]],
    body: scoresData,
    headStyles: {
      fillColor: [0, 51, 102],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240],
    },
  })

  currentY = (doc as any).lastAutoTable.finalY + 10

  // Overall LSAr Rating
  doc.setFontSize(14)
  doc.setTextColor(0, 51, 102)
  doc.text("Overall LSAr Rating", 20, currentY)
  currentY += 8

  const lsarRating = getLSArRating(overallLSAr)

  doc.setFontSize(12)
  doc.text(`Score: ${overallLSAr}% - ${lsarRating}`, 20, currentY)
  currentY += 10

  // Survey Comparison
  if (comparison && previousSurvey) {
    if (currentY > 250) {
      doc.addPage()
      currentY = 20
    }

    doc.setFontSize(14)
    doc.setTextColor(0, 51, 102)
    doc.text("Survey Comparison", 20, currentY)
    currentY += 5

    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    const previousDate = new Date(previousSurvey.date).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    doc.text(`Comparison with survey conducted on: ${previousDate}`, 20, currentY)
    currentY += 8

    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text("Overall Performance", 20, currentY)
    currentY += 6

    const overallComparisonData = [
      ["Previous LSAr Score", `${comparison.previousLSAr.toFixed(1)}%`],
      ["Current LSAr Score", `${comparison.currentLSAr.toFixed(1)}%`],
      [
        "Change",
        `${comparison.change > 0 ? "+" : ""}${comparison.change.toFixed(1)}% (${comparison.status.toUpperCase()})`,
      ],
    ]

    autoTable(doc, {
      startY: currentY,
      body: overallComparisonData,
      theme: "plain",
      styles: {
        fontSize: 10,
        cellPadding: 2,
      },
    })

    currentY = (doc as any).lastAutoTable.finalY + 5

    doc.setFontSize(10)
    const remarkLines = doc.splitTextToSize(comparison.remark, 170)
    remarkLines.forEach((line: string) => {
      if (currentY > 270) {
        doc.addPage()
        currentY = 20
      }
      doc.text(line, 20, currentY)
      currentY += 5
    })

    currentY += 5

    if (currentY > 250) {
      doc.addPage()
      currentY = 20
    }

    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text("Section-by-Section Analysis", 20, currentY)
    currentY += 5

    const sectionComparisonData = comparison.sectionComparisons.map((section) => [
      section.sectionName,
      `${section.previousScore.toFixed(1)}%`,
      `${section.currentScore.toFixed(1)}%`,
      `${section.change > 0 ? "+" : ""}${section.change.toFixed(1)}%`,
      section.status.toUpperCase(),
    ])

    autoTable(doc, {
      startY: currentY,
      head: [["Section", "Previous", "Current", "Change", "Status"]],
      body: sectionComparisonData,
      headStyles: {
        fillColor: [0, 51, 102],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 9,
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
    })

    currentY = (doc as any).lastAutoTable.finalY + 8

    doc.setFontSize(11)
    doc.text("Detailed Section Remarks", 20, currentY)
    currentY += 6

    comparison.sectionComparisons.forEach((section) => {
      if (currentY > 260) {
        doc.addPage()
        currentY = 20
      }

      doc.setFontSize(10)
      doc.setFont(undefined, "bold")
      doc.text(section.sectionName, 20, currentY)
      currentY += 5

      doc.setFont(undefined, "normal")
      doc.setFontSize(9)
      const sectionRemarkLines = doc.splitTextToSize(section.remark, 170)
      sectionRemarkLines.forEach((line: string) => {
        if (currentY > 270) {
          doc.addPage()
          currentY = 20
        }
        doc.text(line, 20, currentY)
        currentY += 4
      })

      currentY += 3
    })

    currentY += 5
  }

  // Neighboring LGAs
  if (neighboringLGAs.length > 0) {
    if (currentY > 250) {
      doc.addPage()
      currentY = 20
    }

    doc.setFontSize(14)
    doc.text("Neighboring LGAs Comparison", 20, currentY)
    currentY += 5

    const neighborData = neighboringLGAs.map((neighbor) => [
      neighbor.lga,
      neighbor.score > 0 ? `${neighbor.score}%` : "No data",
      neighbor.score > 0 ? getLSArRating(neighbor.score) : "N/A",
    ])

    autoTable(doc, {
      startY: currentY,
      head: [["LGA", "Score (%)", "Rating"]],
      body: neighborData,
      headStyles: {
        fillColor: [0, 51, 102],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
    })

    currentY = (doc as any).lastAutoTable.finalY + 10

    if (neighboringAdvisory && neighboringLGAs.filter((lga) => lga.score > 0).length > 0) {
      if (currentY > 250) {
        doc.addPage()
        currentY = 20
      }

      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      doc.setFont(undefined, "bold")
      doc.text("Regional Security Advisory", 20, currentY)
      currentY += 6

      doc.setFont(undefined, "normal")
      doc.setFontSize(10)
      doc.setTextColor(60, 60, 60)
      
      const advisoryLines = doc.splitTextToSize(neighboringAdvisory, 170)
      advisoryLines.forEach((line: string) => {
        if (currentY > 270) {
          doc.addPage()
          currentY = 20
        }
        doc.text(line, 20, currentY)
        currentY += 5
      })

      currentY += 5
    }
  }

  // Detailed Analysis
  if (currentY > 250) {
    doc.addPage()
    currentY = 20
  }

  doc.setFontSize(14)
  doc.text("Detailed Analysis", 20, currentY)
  currentY += 8

  const analysisLines = analysis.split("\n")

  analysisLines.forEach((line) => {
    if (currentY > 270) {
      doc.addPage()
      currentY = 20
    }

    if (line.startsWith("# ")) {
      doc.setFontSize(16)
      doc.setTextColor(0, 51, 102)
      doc.text(line.replace("# ", ""), 20, currentY)
      currentY += 8
    } else if (line.startsWith("## ")) {
      doc.setFontSize(14)
      doc.setTextColor(0, 51, 102)
      doc.text(line.replace("## ", ""), 20, currentY)
      currentY += 7
    } else if (line.startsWith("### ")) {
      doc.setFontSize(12)
      doc.setTextColor(0, 51, 102)
      doc.text(line.replace("### ", ""), 20, currentY)
      currentY += 6
    } else if (line.startsWith("- ")) {
      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)
      doc.text("•", 20, currentY)
      doc.text(line.replace("- ", ""), 25, currentY)
      currentY += 5
    } else if (line.trim() === "") {
      currentY += 3
    } else {
      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)

      const textLines = doc.splitTextToSize(line, 170)
      textLines.forEach((textLine: string) => {
        if (currentY > 270) {
          doc.addPage()
          currentY = 20
        }
        doc.text(textLine, 20, currentY)
        currentY += 5
      })
    }
  })

  // Page numbers
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: "center" })
  }

  doc.save(`${selectedLga}_Security_Analysis.pdf`)
}
