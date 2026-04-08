"use client";

import * as React from "react";
import { Download, FileText } from "lucide-react";

import { Button } from "@/components/Button";

type ToolExportActionsProps = {
  title: string;
  description: string;
  fileBaseName: string;
};

export function ToolExportActions({ title, description, fileBaseName }: ToolExportActionsProps) {
  const [xlsxLoading, setXlsxLoading] = React.useState(false);
  const [pdfLoading, setPdfLoading] = React.useState(false);

  async function handleExportXlsx() {
    try {
      setXlsxLoading(true);
      const XLSX = await import("xlsx");
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet([
        {
          titre: title,
          description,
          date_export: new Date().toISOString(),
        },
      ]);
      XLSX.utils.book_append_sheet(workbook, worksheet, "ASCALIS");
      XLSX.writeFile(workbook, `${fileBaseName}.xlsx`);
    } finally {
      setXlsxLoading(false);
    }
  }

  async function handleExportPdf() {
    try {
      setPdfLoading(true);
      const pdfMakeModule = await import("pdfmake/build/pdfmake");
      const pdfFontsModule = await import("pdfmake/build/vfs_fonts");
      const pdfMake = (pdfMakeModule.default ?? pdfMakeModule) as any;
      const pdfFonts = (pdfFontsModule.default ?? pdfFontsModule) as any;

      pdfMake.vfs = pdfFonts?.pdfMake?.vfs ?? pdfFonts?.vfs ?? pdfMake.vfs;
      pdfMake
        .createPdf({
          content: [
            { text: title, fontSize: 22, bold: true, margin: [0, 0, 0, 12] },
            { text: description, fontSize: 12, margin: [0, 0, 0, 12] },
            {
              text: `Export généré le ${new Date().toLocaleDateString("fr-FR")}`,
              fontSize: 10,
              color: "#475569",
            },
          ],
          defaultStyle: {
            font: "Helvetica",
          },
        })
        .download(`${fileBaseName}.pdf`);
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        type="button"
        variant="ghost-copper"
        onClick={handleExportXlsx}
        disabled={xlsxLoading}
        aria-busy={xlsxLoading}
        className="gap-2"
      >
        <Download className="size-4" aria-hidden="true" />
        {xlsxLoading ? "Préparation XLSX…" : "Exporter en XLSX"}
      </Button>
      <Button
        type="button"
        variant="ghost-copper"
        onClick={handleExportPdf}
        disabled={pdfLoading}
        aria-busy={pdfLoading}
        className="gap-2"
      >
        <FileText className="size-4" aria-hidden="true" />
        {pdfLoading ? "Préparation PDF…" : "Exporter en PDF"}
      </Button>
    </div>
  );
}
