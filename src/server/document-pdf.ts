type PdfSection = {
  title: string;
  rows: Array<[string, string]>;
};

type PdfDocument = {
  title: string;
  subtitle: string;
  badge?: string;
  sections: PdfSection[];
  notes: string[];
};

function ascii(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7e]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapePdf(value: string) {
  return ascii(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function object(id: number, body: string) {
  return `${id} 0 obj\n${body}\nendobj\n`;
}

function line(content: string, x: number, y: number, size = 10, font = "F1") {
  return `BT /${font} ${size} Tf ${x} ${y} Td (${escapePdf(content)}) Tj ET\n`;
}

function rule(y: number) {
  return `0.16 0.18 0.22 RG 48 ${y} m 547 ${y} l S\n`;
}

function wrap(value: string, maxLength = 88) {
  const words = ascii(value).split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines.length ? lines : ["-"];
}

function renderPages(document: PdfDocument) {
  const pages: string[] = [];
  let content = "";
  let y = 792;

  function newPage() {
    if (content) {
      pages.push(content);
    }
    content = "0.02 0.02 0.025 rg 0 0 595 842 re f\n";
    content += "0.07 0.75 0.52 rg 48 810 92 4 re f\n";
    content += line("CONTRATPRO", 48, 792, 9, "F2");
    content += line(document.title, 48, 766, 21, "F2");
    content += line(document.subtitle, 48, 744, 10, "F1");
    if (document.badge) {
      content += "0.06 0.09 0.10 rg 442 770 105 24 re f\n";
      content += line(document.badge, 457, 778, 9, "F2");
    }
    content += rule(724);
    y = 696;
  }

  function ensure(height: number) {
    if (y - height < 70) {
      newPage();
    }
  }

  newPage();

  for (const section of document.sections) {
    ensure(52 + section.rows.length * 20);
    content += "0.07 0.08 0.10 rg 48 " + (y - 8) + " 499 28 re f\n";
    content += line(section.title, 60, y, 12, "F2");
    y -= 34;

    for (const [label, value] of section.rows) {
      const valueLines = wrap(value, 52);
      ensure(18 * valueLines.length + 12);
      content += line(label.toUpperCase(), 60, y, 7, "F2");
      content += line(valueLines[0], 230, y, 10, "F1");
      y -= 16;
      for (const extra of valueLines.slice(1)) {
        content += line(extra, 230, y, 10, "F1");
        y -= 16;
      }
      content += "0.12 0.13 0.15 RG 60 " + (y + 6) + " m 535 " + (y + 6) + " l S\n";
      y -= 6;
    }

    y -= 12;
  }

  ensure(42 + document.notes.length * 24);
  content += line("Mentions legales", 48, y, 12, "F2");
  y -= 22;
  for (const note of document.notes) {
    for (const noteLine of wrap(note, 96)) {
      content += line(noteLine, 48, y, 8, "F1");
      y -= 12;
    }
    y -= 4;
  }

  pages.push(content);
  return pages;
}

export function createPdf(document: PdfDocument) {
  const pageStreams = renderPages(document);
  const objects: string[] = [];
  const catalogId = 1;
  const pagesId = 2;
  const fontId = 3;
  const boldFontId = 4;
  let nextId = 5;
  const pageIds: number[] = [];

  objects.push(object(catalogId, `<< /Type /Catalog /Pages ${pagesId} 0 R >>`));
  objects.push(object(fontId, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"));
  objects.push(object(boldFontId, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"));

  for (const stream of pageStreams) {
    const pageId = nextId++;
    const streamId = nextId++;
    pageIds.push(pageId);
    objects.push(
      object(
        pageId,
        `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontId} 0 R /F2 ${boldFontId} 0 R >> >> /Contents ${streamId} 0 R >>`,
      ),
    );
    objects.push(
      object(streamId, `<< /Length ${Buffer.byteLength(stream, "binary")} >>\nstream\n${stream}endstream`),
    );
  }

  objects.splice(
    1,
    0,
    object(
      pagesId,
      `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`,
    ),
  );

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (const item of objects) {
    offsets.push(Buffer.byteLength(pdf, "binary"));
    pdf += item;
  }
  const xrefOffset = Buffer.byteLength(pdf, "binary");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "binary");
}
