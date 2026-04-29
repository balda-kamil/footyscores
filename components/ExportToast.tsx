interface Props {
  count: number;
}

export function ExportToast({ count }: Props) {
  return (
    <div className="fixed bottom-6 right-6 z-[200] bg-surface border border-[rgba(0,232,122,0.3)] rounded-lg px-[18px] py-3 text-[13px] font-medium shadow-[0_8px_24px_rgba(0,0,0,0.4)] anim-slide-up">
      <span className="text-green font-bold">✓</span>
      &nbsp;JSON exported — {count} matches
    </div>
  );
}
