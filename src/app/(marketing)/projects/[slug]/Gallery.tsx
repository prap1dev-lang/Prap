"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function Gallery({ images, name }: { images: string[]; name: string }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const show = (i: number) => { setIndex(i); setOpen(true); };
  const close = useCallback(() => setOpen(false), []);
  const prev = useCallback(() => setIndex((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIndex((i) => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, prev, next]);

  if (images.length === 0) return null;

  const preview = images.slice(0, 6);
  const extra = images.length - preview.length;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
        {preview.map((g, i) => (
          <button
            key={i}
            type="button"
            onClick={() => show(i)}
            className="relative aspect-[4/3] rounded-xl overflow-hidden bg-ink-100 group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          >
            <Image
              src={g}
              alt={`${name} photo ${i + 1}`}
              fill
              sizes="(max-width: 640px) 50vw, 30vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* "+N more" overlay on the last tile */}
            {i === preview.length - 1 && extra > 0 && (
              <span className="absolute inset-0 bg-black/55 grid place-items-center text-white text-lg font-bold">
                +{extra} more
              </span>
            )}
          </button>
        ))}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={close}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
            aria-label="Close gallery"
          >
            <X className="h-7 w-7" />
          </button>

          <span className="absolute top-5 left-5 text-white/80 text-sm">{index + 1} / {images.length}</span>

          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-2 sm:left-6 text-white/80 hover:text-white p-2 bg-white/10 rounded-full"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-7 w-7" />
            </button>
          )}

          <div className="relative w-[92vw] h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[index]}
              alt={`${name} photo ${index + 1}`}
              fill
              sizes="92vw"
              className="object-contain"
              priority
            />
          </div>

          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-2 sm:right-6 text-white/80 hover:text-white p-2 bg-white/10 rounded-full"
              aria-label="Next photo"
            >
              <ChevronRight className="h-7 w-7" />
            </button>
          )}
        </div>
      )}
    </>
  );
}
