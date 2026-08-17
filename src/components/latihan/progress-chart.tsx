import type { RiwayatItem } from "@/lib/mock/riwayat";

function formatTgl(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

/**
 * Grafik garis progres nilai dari waktu ke waktu (inline SVG, tanpa
 * dependensi). Memakai sistem koordinat viewBox agar responsif; warna
 * mengikuti token tema lewat currentColor.
 */
export function ProgressChart({ items }: { items: RiwayatItem[] }) {
  const W = 640;
  const H = 240;
  const pad = { top: 16, right: 16, bottom: 28, left: 32 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;

  const n = items.length;
  const x = (i: number) =>
    pad.left + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const y = (v: number) => pad.top + innerH - (v / 100) * innerH;

  const linePath = items
    .map((it, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(it.nilai)}`)
    .join(" ");
  const areaPath =
    `M ${x(0)} ${pad.top + innerH} ` +
    items.map((it, i) => `L ${x(i)} ${y(it.nilai)}`).join(" ") +
    ` L ${x(n - 1)} ${pad.top + innerH} Z`;

  const gridValues = [0, 25, 50, 75, 100];
  const first = items[0]?.nilai ?? 0;
  const last = items[n - 1]?.nilai ?? 0;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full min-w-[420px] text-primary"
        role="img"
        aria-label={`Grafik progres nilai dari ${first} menjadi ${last} selama ${n} latihan terakhir.`}
      >
        {/* Garis bantu horizontal + label sumbu Y */}
        {gridValues.map((v) => (
          <g key={v}>
            <line
              x1={pad.left}
              x2={W - pad.right}
              y1={y(v)}
              y2={y(v)}
              stroke="currentColor"
              strokeOpacity={0.12}
              strokeWidth={1}
            />
            <text
              x={pad.left - 8}
              y={y(v)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-muted-foreground"
              fontSize={10}
            >
              {v}
            </text>
          </g>
        ))}

        {/* Area + garis */}
        <path d={areaPath} fill="currentColor" fillOpacity={0.1} />
        <path
          d={linePath}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Titik + label tanggal */}
        {items.map((it, i) => (
          <g key={it.id}>
            <circle
              cx={x(i)}
              cy={y(it.nilai)}
              r={4}
              fill="var(--background)"
              stroke="currentColor"
              strokeWidth={2}
            />
            <text
              x={x(i)}
              y={H - 8}
              textAnchor="middle"
              className="fill-muted-foreground"
              fontSize={10}
            >
              {formatTgl(it.tanggal)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
