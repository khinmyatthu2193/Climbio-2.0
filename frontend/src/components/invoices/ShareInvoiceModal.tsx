import { useEffect, useMemo, useState, type RefObject } from 'react';
import { Download, FileText, Image, Link2, MessageCircle, Send, Share2, Smartphone, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Invoice } from '@/types/invoice';
import { cn } from '@/utils/cn';

type ExportFormat = 'png' | 'pdf';
type Destination = 'messenger' | 'telegram' | 'viber' | 'copy' | 'device';

const destinations = [
  { id: 'messenger', label: 'Messenger', icon: MessageCircle, color: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10' },
  { id: 'telegram', label: 'Telegram', icon: Send, color: 'text-sky-600 bg-sky-50 dark:bg-sky-500/10' },
  { id: 'viber', label: 'Viber', icon: Smartphone, color: 'text-violet-600 bg-violet-50 dark:bg-violet-500/10' },
  { id: 'copy', label: 'Copy link', icon: Link2, color: 'text-slate-600 bg-slate-100 dark:bg-slate-700' },
  { id: 'device', label: 'Save to device', icon: Download, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' },
] as const;

function preferenceKey(invoice: Invoice) {
  return `climbio:invoice-share:${invoice.customerPhone || invoice.customerName.trim().toLowerCase()}`;
}

function download(file: File) {
  const url = URL.createObjectURL(file);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = file.name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function createExport(element: HTMLElement, invoiceNumber: string, format: ExportFormat): Promise<File> {
  const { default: html2canvas } = await import('html2canvas');
  const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false, onclone: (document) => document.documentElement.classList.remove('dark') });
  if (format === 'png') {
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error('Image export failed')), 'image/png'));
    return new File([blob], `${invoiceNumber}.png`, { type: 'image/png' });
  }
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imageHeight = canvas.height * pageWidth / canvas.width;
  let remaining = imageHeight;
  let y = 0;
  const imageData = canvas.toDataURL('image/png');
  pdf.addImage(imageData, 'PNG', 0, y, pageWidth, imageHeight);
  remaining -= pageHeight;
  while (remaining > 0) {
    y = remaining - imageHeight;
    pdf.addPage();
    pdf.addImage(imageData, 'PNG', 0, y, pageWidth, imageHeight);
    remaining -= pageHeight;
  }
  return new File([pdf.output('blob')], `${invoiceNumber}.pdf`, { type: 'application/pdf' });
}

export function ShareInvoiceModal({ open, onClose, invoice, invoiceRef }: { open: boolean; onClose: () => void; invoice: Invoice; invoiceRef: RefObject<HTMLElement> }) {
  const [format, setFormat] = useState<ExportFormat>('png');
  const [working, setWorking] = useState<Destination | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [lastUsed, setLastUsed] = useState<Destination | null>(null);
  const invoiceUrl = `${window.location.origin}/invoice/${invoice.id}`;
  const shareText = `Invoice ${invoice.invoiceNumber} for ${invoice.customerName}`;
  const suggested = useMemo(() => destinations.find((item) => item.id === lastUsed), [lastUsed]);

  useEffect(() => {
    if (!open) return;
    const stored = window.localStorage.getItem(preferenceKey(invoice)) as Destination | null;
    if (destinations.some((item) => item.id === stored)) setLastUsed(stored);
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape' && !working) onClose(); };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [invoice, onClose, open, working]);

  if (!open) return null;

  const share = async (destination: Destination) => {
    if (!invoiceRef.current) return setError('Invoice preview is not available.');
    setWorking(destination);
    setError('');
    setCopied(false);
    try {
      const file = await createExport(invoiceRef.current, invoice.invoiceNumber, format);
      window.localStorage.setItem(preferenceKey(invoice), destination);
      setLastUsed(destination);
      if (destination === 'device') {
        download(file);
      } else if (destination === 'copy') {
        await navigator.clipboard.writeText(invoiceUrl);
        setCopied(true);
      } else {
        const shareData = { title: invoice.invoiceNumber, text: shareText, url: invoiceUrl, files: [file] };
        if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
          await navigator.share(shareData);
        } else {
          const encodedText = encodeURIComponent(`${shareText}\n${invoiceUrl}`);
          const target = destination === 'telegram'
            ? `https://t.me/share/url?url=${encodeURIComponent(invoiceUrl)}&text=${encodeURIComponent(shareText)}`
            : destination === 'viber' ? `viber://forward?text=${encodedText}` : `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(invoiceUrl)}`;
          download(file);
          window.open(target, '_blank', 'noopener,noreferrer');
        }
      }
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === 'AbortError') return;
      setError(cause instanceof Error ? cause.message : 'Invoice could not be shared.');
    } finally {
      setWorking(null);
    }
  };

  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget && !working) onClose(); }}><section className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="share-invoice-title"><header className="flex items-start justify-between gap-4"><div><h2 id="share-invoice-title" className="text-xl font-black text-slate-950 dark:text-white">Share invoice</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Export {invoice.invoiceNumber} and send it your way.</p></div><button type="button" onClick={onClose} disabled={!!working} className="grid size-9 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800" aria-label="Close share dialog"><X size={18} /></button></header>
    {suggested && <button type="button" onClick={() => share(suggested.id)} disabled={!!working} className="mt-5 flex w-full items-center gap-3 rounded-2xl border border-violet-200 bg-violet-50 p-3 text-left transition hover:border-violet-400 dark:border-violet-500/20 dark:bg-violet-500/10"><span className="rounded-xl bg-white p-2 text-violet-600 shadow-sm dark:bg-slate-800 dark:text-violet-300"><Sparkles size={17} /></span><span className="flex-1"><span className="block text-xs font-bold uppercase tracking-wide text-violet-600 dark:text-violet-300">Suggested for this customer</span><span className="mt-0.5 block text-sm font-semibold text-slate-800 dark:text-slate-200">Share with {suggested.label} again</span></span></button>}
    <fieldset className="mt-6"><legend className="text-sm font-bold text-slate-800 dark:text-slate-200">Choose format</legend><div className="mt-2 grid grid-cols-2 gap-3">{([{ id: 'png', label: 'Image (PNG)', icon: Image }, { id: 'pdf', label: 'PDF document', icon: FileText }] as const).map((item) => <label key={item.id} className={cn('flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition', format === item.id ? 'border-violet-500 bg-violet-50 ring-1 ring-violet-500 dark:bg-violet-500/10' : 'border-slate-200 hover:border-violet-300 dark:border-slate-700')}><input className="sr-only" type="radio" name="share-format" checked={format === item.id} onChange={() => setFormat(item.id)} /><item.icon size={19} className={format === item.id ? 'text-violet-600 dark:text-violet-300' : 'text-slate-400'} /><span className="text-sm font-bold">{item.label}</span></label>)}</div></fieldset>
    <div className="mt-6"><p className="text-sm font-bold text-slate-800 dark:text-slate-200">Share or save</p><div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">{destinations.map((item) => <button key={item.id} type="button" onClick={() => share(item.id)} disabled={!!working} className="flex min-h-28 flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 p-3 text-center transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md disabled:translate-y-0 disabled:opacity-50 dark:border-slate-700 dark:hover:border-violet-500"><span className={cn('grid size-11 place-items-center rounded-2xl', item.color)}><item.icon size={22} /></span><span className="text-xs font-bold text-slate-700 dark:text-slate-200">{working === item.id ? 'Preparing…' : item.label}</span></button>)}</div></div>
    {copied && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">Invoice link copied to clipboard.</p>}{error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-300">{error}</p>}<div className="mt-5 flex items-start gap-2 text-xs leading-5 text-slate-400"><Share2 size={14} className="mt-0.5 shrink-0" /><p>On supported devices, your native share sheet opens with the generated file attached. Browser fallbacks download the file and open the selected app with the invoice link.</p></div><div className="mt-6 flex justify-end"><Button type="button" variant="outline" disabled={!!working} onClick={onClose}>Done</Button></div></section></div>;
}
