import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

interface SectionScore {
  title: string
  score: number
}

export function generatePDF(
  state: string,
  lga: string,
  sectionScores: Record<string, number>,
  analysis: string,
): jsPDF {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  // Add title
  doc.setFontSize(20)
  doc.setTextColor(0, 51, 102)
  doc.text(`Security Analysis Report`, 105, 20, { align: "center" })

  // Add subtitle
  doc.setFontSize(16)
  doc.setTextColor(0, 0, 0)
  doc.text(`${lga} Local Government, ${state} State`, 105, 30, { align: "center" })

  // Add date
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  const date = new Date().toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  doc.text(`Generated on: ${date}`, 105, 38, { align: "center" })

  // Add horizontal line
  doc.setDrawColor(200, 200, 200)
  doc.line(20, 42, 190, 42)

  // Section scores
  doc.setFontSize(14)
  doc.setTextColor(0, 0, 0)
  doc.text("Section Scores", 20, 50)

  // Convert section scores to array for the table
  const scoresData = Object.entries(sectionScores).map(([title, score]) => [title, `${score}/10`])

  // Add scores table
  autoTable(doc, {
    startY: 55,
    head: [["Section", "Score (0-10)"]],
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

  // Add analysis title
  const tableEndY = (doc as any).lastAutoTable.finalY + 10
  doc.setFontSize(14)
  doc.text("Detailed Analysis", 20, tableEndY)

  // Process and add analysis text
  const analysisLines = analysis.split("\n")
  let currentY = tableEndY + 8
  let currentPage = 1

  analysisLines.forEach((line) => {
    // Check if we need a new page
    if (currentY > 270) {
      doc.addPage()
      currentPage++
      currentY = 20 // Reset Y position for new page
    }

    // Format headings
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
      // Bullet points
      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)
      doc.text("•", 20, currentY)
      doc.text(line.replace("- ", ""), 25, currentY)
      currentY += 5
    } else if (line.trim() === "") {
      // Empty line
      currentY += 3
    } else {
      // Regular text
      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)

      // Handle long lines by splitting them
      const textLines = doc.splitTextToSize(line, 170)
      textLines.forEach((textLine: string) => {
        doc.text(textLine, 20, currentY)
        currentY += 5
      })
    }
  })

  // Add page numbers
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: "center" })
  }

  return doc
}
