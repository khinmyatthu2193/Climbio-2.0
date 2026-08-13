import type { ReactElement } from 'react';
import { createRoot } from 'react-dom/client';

export async function renderBrowserShapedPdf(element: ReactElement) {
  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;left:-10000px;top:0;width:794px;background:#fff;z-index:-1';
  document.body.appendChild(host);
  const root = createRoot(host);
  root.render(element);
  try {
    await Promise.all([
      document.fonts.load('400 16px "Noto Sans Myanmar"', 'မြန်မာ'),
      document.fonts.load('700 16px "Noto Sans Myanmar"', 'အစီရင်ခံစာ'),
    ]);
    await document.fonts.ready;
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    const target = host.firstElementChild as HTMLElement | null;
    if (!target) throw new Error('PDF report could not be rendered.');
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
    const canvas = await html2canvas(target, { scale: 2.5, backgroundColor: '#ffffff', logging: false, useCORS: true });
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imageHeight = canvas.height * pageWidth / canvas.width;
    const image = canvas.toDataURL('image/png');
    let remaining = imageHeight;
    let y = 0;
    pdf.addImage(image, 'PNG', 0, y, pageWidth, imageHeight, undefined, 'FAST');
    remaining -= pageHeight;
    while (remaining > 0) {
      y = remaining - imageHeight;
      pdf.addPage();
      pdf.addImage(image, 'PNG', 0, y, pageWidth, imageHeight, undefined, 'FAST');
      remaining -= pageHeight;
    }
    return pdf.output('blob');
  } finally {
    root.unmount();
    host.remove();
  }
}
