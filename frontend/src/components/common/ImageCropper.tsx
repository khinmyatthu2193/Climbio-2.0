import { useEffect, useMemo, useState } from 'react';
import { Crop, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IconLabel } from '@/components/ui/IconLabel';

type Aspect = '1' | '4/3' | '16/9';

const aspects: Record<Aspect, number> = { '1': 1, '4/3': 4 / 3, '16/9': 16 / 9 };

interface ImageCropperProps {
  file: File;
  onCancel: () => void;
  onComplete: (file: File) => void;
}

export function ImageCropper({ file, onCancel, onComplete }: ImageCropperProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [aspect, setAspect] = useState<Aspect>('4/3');
  const [zoom, setZoom] = useState(1);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const crop = useMemo(() => {
    if (!imageSize.width || !imageSize.height) return null;
    const ratio = aspects[aspect];
    let width = imageSize.width;
    let height = width / ratio;
    if (height > imageSize.height) {
      height = imageSize.height;
      width = height * ratio;
    }
    width /= zoom;
    height /= zoom;
    return {
      width,
      height,
      left: (imageSize.width - width) * (x + 100) / 200,
      top: (imageSize.height - height) * (y + 100) / 200,
    };
  }, [aspect, imageSize, x, y, zoom]);

  const applyCrop = () => {
    if (!crop || !imageUrl) return;
    const source = new Image();
    source.onload = () => {
      const canvas = document.createElement('canvas');
      const outputWidth = Math.min(1600, Math.round(crop.width));
      canvas.width = outputWidth;
      canvas.height = Math.round(outputWidth / aspects[aspect]);
      const context = canvas.getContext('2d');
      if (!context) return;
      context.drawImage(source, crop.left, crop.top, crop.width, crop.height, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const name = file.name.replace(/\.[^.]+$/, '') || 'product-image';
        onComplete(new File([blob], `${name}.jpg`, { type: 'image/jpeg' }));
      }, 'image/jpeg', 0.9);
    };
    source.src = imageUrl;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/65 p-3 sm:grid sm:place-items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="crop-image-title">
      <section className="mx-auto w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:p-5 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4">
          <div><h2 id="crop-image-title" className="text-lg font-bold">Crop product image</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Choose a frame, then position and zoom the image.</p></div>
          <button className="grid size-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" type="button" onClick={onCancel} aria-label="Close crop editor"><X className="size-5" /></button>
        </div>
        <div className="mx-auto mt-5 max-w-full overflow-hidden rounded-xl bg-slate-950" style={{ aspectRatio: aspects[aspect], height: 'min(38dvh, 22rem)' }}>
          {imageUrl && <img src={imageUrl} alt="Crop preview" className="h-full w-full object-cover" style={{ objectPosition: `${50 + x / 2}% ${50 + y / 2}%`, transform: `scale(${zoom})` }} onLoad={(event) => setImageSize({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })} />}
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">Crop shape<select className="control mt-1.5" value={aspect} onChange={(event) => setAspect(event.target.value as Aspect)}><option value="1">Square (1:1)</option><option value="4/3">Standard (4:3)</option><option value="16/9">Wide (16:9)</option></select></label>
          <label className="text-sm font-medium">Zoom <span className="font-normal text-slate-500">{zoom.toFixed(1)}×</span><input className="mt-3 w-full accent-violet-600" type="range" min="1" max="3" step="0.1" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} /></label>
          <label className="text-sm font-medium">Horizontal position<input className="mt-3 w-full accent-violet-600" type="range" min="-100" max="100" value={x} onChange={(event) => setX(Number(event.target.value))} /></label>
          <label className="text-sm font-medium">Vertical position<input className="mt-3 w-full accent-violet-600" type="range" min="-100" max="100" value={y} onChange={(event) => setY(Number(event.target.value))} /></label>
        </div>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:mt-6 sm:flex-row sm:justify-end sm:gap-3"><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button type="button" onClick={applyCrop}><IconLabel icon={Crop}>Apply crop</IconLabel></Button></div>
      </section>
    </div>
  );
}
