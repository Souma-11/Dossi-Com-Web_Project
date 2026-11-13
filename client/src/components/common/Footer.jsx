export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#CBD5E1] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-[#334155]">
        <div className="flex items-center gap-2.5 text-center sm:text-left">
          <img
            src="/dossicom-icone-512_2.png"
            alt="Dossi'Com"
            height="24"
            className="h-[24px] w-[24px] object-contain shrink-0"
          />
          <span>
            <strong className="text-[#0B2A5B] font-bold">Dossi&apos;Com</strong> — Vos dossiers
            santé, entre de bonnes mains.
          </span>
        </div>

        <div className="font-semibold text-[#0B2A5B]">
          Urgence vitale : appelez le{' '}
          <span className="font-bold text-[#C8102E] underline">190</span>
        </div>
      </div>
    </footer>
  );
}