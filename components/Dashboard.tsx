"use client";

import React, { useMemo, useState, useEffect, type CSSProperties } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Treemap,
} from "recharts";
import { FIELDS, ITEMS, PROGRAMS, GRAND_TOTAL, SCHEME_NOTE, MAPPING_NOTE, type ContractLink } from "@/data/strategic-fields";

/* ============================== palette ============================== */

const C = {
  paper: "#F1F3F2",
  card: "#FFFFFF",
  ink: "#12171C",
  muted: "#79838C",
  faint: "#A6AEB4",
  rule: "#D8DEDC",
  seal: "#A32B2B", // 契約学科 = 朱
  sealRow: "#FDF7F6",
  /** 横棒グラフの棒。順位は縦位置と数値で読めるので、濃淡は付けない */
  bar: "#1F4E72",
  /** ツリーマップのみ。面積が近いセルを見分けるために濃淡を使う */
  ramp: ["#0F2E4A", "#1F4E72", "#356E96", "#5891B4", "#8AB4CC", "#BDD5E1"],
} as const;

const rampAt = (i: number, n: number) =>
  C.ramp[Math.min(C.ramp.length - 1, Math.floor((i / Math.max(1, n - 1)) * C.ramp.length))];

const num: CSSProperties = {
  fontVariantNumeric: "tabular-nums",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
};
const sans: CSSProperties = {
  fontFamily: '"Hiragino Sans", "Yu Gothic", "Noto Sans JP", system-ui, sans-serif',
};

/* ============================== derived ============================== */

const P = Object.fromEntries(PROGRAMS.map((p) => [p.id, p]));
const shortName = (u: string) => u.replace(/大学$/, "大");

const UNIQUE_COUNT = ITEMS.filter((i) => !i.isRestated).length;

const sum = (xs: typeof ITEMS) => Math.round(xs.reduce((s, i) => s + (i.amount ?? 0), 0) * 10) / 10;

/** 一覧で大学の印が付く製品・技術。見出しの母数はこれに揃える。 */
const TAGGED = ITEMS.filter((i) => i.contracts.length > 0);
const TAGGED_SUM = sum(TAGGED);
/** 17分野の製品・技術に紐づけられた契約学科。 */
const LINKED_PROGRAMS = PROGRAMS.filter((p) => p.attach === "item");
/** 出口となる製品・技術を公表資料から特定できず、どの分野にも紐づけない契約学科。 */
const UNASSIGNED = PROGRAMS.filter((p) => p.attach === "unassigned");

/** 再掲を二重計上した場合の合計。注釈で「この数字は使わない」と示すためだけに持つ。 */
const GROSS_TOTAL = Math.round(FIELDS.reduce((s, f) => s + f.total, 0) * 10) / 10;

/** 再掲行の金額がどの分野に計上されているかを、同名品目の本体側から引く。 */
function restatedHome(name: string): string {
  const home = ITEMS.find((i) => i.name === name && !i.isRestated);
  return home ? FIELDS.find((f) => f.id === home.fieldId)?.shortName ?? "" : "";
}

/**
 * その分野の製品・技術に紐づく契約学科。
 * 東京大学は出口となる製品・技術を公表資料から特定できないため、どの分野にも含めない
 * （推測で分野に置くと、グラフ上では断定と区別がつかなくなる）。
 */
function fieldContracts(fieldId: string): string[] {
  return [
    ...new Set(
      ITEMS.filter((i) => i.fieldId === fieldId).flatMap((i) => i.contracts.map((c) => c.programId))
    ),
  ];
}

type Datum = {
  id: string;
  name: string;
  fullName: string;
  parentName?: string;
  value: number;
  rank?: number | null;
  contracts: ContractLink[];
};

/* ============================== atoms ============================== */

/** 根拠は一覧を圧迫するので列にはせず、印のホバーに逃がす。data とxlsxには残す。 */
function Seal({ pid, basis }: { pid: string; basis?: string }) {
  const p = P[pid];
  if (!p) return null;
  return (
    <span
      title={[`${p.university} × ${p.partner}`, basis].filter(Boolean).join("\n")}
      style={{
        ...sans,
        display: "inline-block",
        padding: "1px 5px",
        marginRight: 3,
        fontSize: 10,
        lineHeight: "15px",
        color: "#fff",
        background: C.seal,
        border: `1px solid ${C.seal}`,
        borderRadius: 2,
        whiteSpace: "nowrap",
      }}
    >
      {shortName(p.university)}
    </span>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        marginLeft: 5,
        fontSize: 10,
        color: C.muted,
        border: `1px solid ${C.rule}`,
        padding: "0 4px",
        borderRadius: 2,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

/** ラベル付きの2択。何を切り替えているかをラベルで明示する。 */
function Control<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { v: T; l: string }[];
}) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
      <span style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap" }}>{label}</span>
      <div
        role="group"
        aria-label={label}
        style={{
          display: "inline-flex",
          border: `1px solid ${C.rule}`,
          borderRadius: 3,
          overflow: "hidden",
          background: C.card,
        }}
      >
        {options.map((o) => (
          <button
            key={o.v}
            type="button"
            aria-pressed={value === o.v}
            onClick={() => onChange(o.v)}
            style={{
              ...sans,
              padding: "5px 11px",
              fontSize: 12,
              border: "none",
              cursor: "pointer",
              background: value === o.v ? C.ink : "transparent",
              color: value === o.v ? "#fff" : C.muted,
              fontWeight: value === o.v ? 600 : 400,
            }}
          >
            {o.l}
          </button>
        ))}
      </div>
    </div>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: 14, fontWeight: 700, borderBottom: `1px solid ${C.ink}`, paddingBottom: 6, margin: "0 0 10px" }}>
      {children}
    </h2>
  );
}

function Row({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "84px 1fr",
        gap: 10,
        padding: "4px 0",
        borderTop: `1px solid ${C.rule}`,
        ...(last ? {} : {}),
      }}
    >
      <span style={{ color: C.muted, fontSize: 11 }}>{label}</span>
      <span>{children}</span>
    </div>
  );
}

function Note({ title, children, last }: { title: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "88px 1fr",
        gap: 12,
        padding: "7px 0",
        borderBottom: last ? "none" : `1px solid ${C.rule}`,
      }}
    >
      <div style={{ color: C.muted, fontSize: 11 }}>{title}</div>
      <div>{children}</div>
    </div>
  );
}

/* ============================== charts ============================== */

function ChartTip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d: Datum = payload[0].payload;
  if (!d?.value) return null;
  return (
    <div style={{ ...sans, background: C.card, border: `1px solid ${C.ink}`, padding: "8px 10px", maxWidth: 300, fontSize: 12 }}>
      <div style={{ fontWeight: 700, color: C.ink }}>{d.fullName ?? d.name}</div>
      {d.parentName && <div style={{ color: C.muted, fontSize: 11 }}>{d.parentName}</div>}
      <div style={{ ...num, fontSize: 18, marginTop: 4 }}>
        {d.value.toFixed(1)} <span style={{ fontSize: 11 }}>兆円</span>
      </div>
      <div style={{ color: C.muted, fontSize: 11 }}>
        {d.rank ? `${d.rank}位 / ` : ""}
        {UNIQUE_COUNT}品目の単純合計に占める割合 {((d.value / GRAND_TOTAL) * 100).toFixed(1)}%
      </div>
      {d.contracts?.length > 0 && (
        <div style={{ marginTop: 6, paddingTop: 6, borderTop: `1px solid ${C.rule}` }}>
          {d.contracts.map((c) => (
            <div key={c.programId} style={{ fontSize: 11, color: C.seal }}>
              ● {P[c.programId]?.university} × {P[c.programId]?.partner}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Bars({ data }: { data: Datum[] }) {
  return (
    <div style={{ height: Math.max(240, data.length * 21 + 48) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 56, bottom: 18, left: 4 }} barCategoryGap={2}>
          <CartesianGrid horizontal={false} stroke={C.rule} />
          <XAxis
            type="number"
            tick={{ fontSize: 10, fill: C.muted }}
            stroke={C.rule}
            label={{ value: "兆円", position: "insideBottomRight", offset: -10, fontSize: 10, fill: C.faint }}
          />
          <YAxis type="category" dataKey="name" width={190} tick={{ fontSize: 10.5, fill: C.ink }} stroke={C.rule} interval={0} />
          <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(18,23,28,0.04)" }} />
          <Bar
            dataKey="value"
            isAnimationActive={false}
            label={{ position: "right", fontSize: 10, fill: C.muted, formatter: (v: number) => v.toFixed(1) }}
          >
            {data.map((d) => (
              <Cell key={d.id} fill={d.contracts.length ? C.seal : C.bar} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function TreeCell(props: any) {
  const { x, y, width, height, name, value, contracts, index, total, depth } = props;
  // Recharts は葉だけでなくルートノード（depth 0）にも content を渡す。
  // ルートは name を持たず value には合計が入るため、depth で弾く。データは1階層なので葉は depth 1。
  if (depth !== 1 || typeof name !== "string" || typeof value !== "number") return null;
  const hasContract = (contracts as ContractLink[] | undefined)?.length;
  const show = width > 46 && height > 26;
  const max = Math.floor(width / 11);
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{ fill: hasContract ? C.seal : rampAt(index, total), stroke: C.paper, strokeWidth: 2 }}
      />
      {show && (
        <>
          <text x={x + 6} y={y + 15} fill="#fff" fontSize={Math.min(11, width / 6)} style={sans}>
            {name.length > max ? `${name.slice(0, max)}…` : name}
          </text>
          <text x={x + 6} y={y + 29} fill="rgba(255,255,255,.8)" fontSize={10} style={num}>
            {value.toFixed(1)}
          </text>
        </>
      )}
    </g>
  );
}

function Tree({ data }: { data: Datum[] }) {
  return (
    <div style={{ height: 460 }}>
      <ResponsiveContainer width="100%" height="100%">
        <Treemap data={data} dataKey="value" stroke={C.paper} isAnimationActive={false} content={<TreeCell total={data.length} />}>
          <Tooltip content={<ChartTip />} />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}

/** Recharts の ResponsiveContainer はサーバー側で幅0になるため、マウント後に描画する。 */
function ChartFrame({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <div style={{ background: C.card, border: `1px solid ${C.rule}`, padding: "14px 12px" }}>
      {mounted ? children : <div style={{ height: 460 }} />}
    </div>
  );
}

/* ============================== app ============================== */

type Unit = "field" | "item";
type Chart = "bar" | "tree";
type Sort = "field" | "amount";

export default function Dashboard() {
  const [unit, setUnit] = useState<Unit>("field");
  const [chart, setChart] = useState<Chart>("bar");
  const [onlyContract, setOnlyContract] = useState(false);
  const [q, setQ] = useState("");
  const [fieldFilter, setFieldFilter] = useState("all");
  const [sort, setSort] = useState<Sort>("field");

  const chartData: Datum[] = useMemo(() => {
    if (unit === "field") {
      return FIELDS.map((f) => ({
        id: f.id,
        name: f.shortName,
        fullName: f.name,
        value: f.totalNet,
        contracts: fieldContracts(f.id).map((pid) => ({ programId: pid, basis: "" })),
      }))
        .filter((d) => (onlyContract ? d.contracts.length > 0 : true))
        .sort((a, b) => b.value - a.value)
        .map((d, i) => ({ ...d, rank: i + 1 }));
    }
    return ITEMS.filter((i) => i.isCounted)
      .filter((i) => !i.isRestated)
      .filter((i) => (onlyContract ? i.contracts.length > 0 : true))
      .map((i) => ({
        id: i.id,
        name: i.name.length > 26 ? `${i.name.slice(0, 26)}…` : i.name,
        fullName: i.name,
        parentName: FIELDS.find((f) => f.id === i.fieldId)?.name,
        value: i.amount as number,
        rank: i.rank,
        contracts: i.contracts,
      }))
      .sort((a, b) => b.value - a.value);
  }, [unit, onlyContract]);

  const tableRows = useMemo(() => {
    const kw = q.trim();
    // onlyContract はグラフ専用。一覧に連動させると初見で件数が減っている理由が分からないため。
    const rows = ITEMS.filter((i) => (fieldFilter === "all" ? true : i.fieldId === fieldFilter))
      .filter(
        (i) => !kw || i.name.includes(kw) || (FIELDS.find((f) => f.id === i.fieldId)?.name.includes(kw) ?? false)
      );
    return sort === "amount" ? [...rows].sort((a, b) => (b.amount ?? -1) - (a.amount ?? -1)) : rows;
  }, [q, fieldFilter, sort]);

  const selectedField = fieldFilter === "all" ? null : FIELDS.find((f) => f.id === fieldFilter)!;
  const fieldTotal = selectedField ? selectedField.totalNet : 0;

  return (
    <main style={{ ...sans, background: C.paper, color: C.ink, padding: "22px 20px 48px", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* ── hero ── */}
        <header style={{ borderBottom: `2px solid ${C.ink}`, paddingBottom: 14, marginBottom: 18 }}>
          <div style={{ fontSize: 11, letterSpacing: ".14em", color: C.muted }}>17の戦略分野 × 契約学科</div>
          <h1 style={{ fontSize: 25, fontWeight: 800, margin: "6px 0 8px", letterSpacing: "-.01em", lineHeight: 1.45 }}>
            投資対象{UNIQUE_COUNT}製品・技術のうち、契約学科が関連するのは
            <span style={{ ...num, color: C.seal }}> {TAGGED.length} </span>製品・技術／
            <span style={{ ...num, color: C.seal }}>{TAGGED_SUM.toFixed(1)}</span> 兆円の領域
          </h1>
          <p style={{ fontSize: 11.5, color: C.muted, margin: "0 0 6px", lineHeight: 1.85 }}>
            {MAPPING_NOTE.split("。")[0]}。
            {TAGGED_SUM.toFixed(1)}兆円は、契約学科が関連する<strong>領域全体の官民投資見込み額</strong>であって、大学に配分される額ではない。
            17分野の製品・技術に紐づくのは契約学科5件中{LINKED_PROGRAMS.length}件で、東京大学は人材育成の方法論そのものが対象のため、いずれの分野にも紐づけていない。
          </p>
          <p style={{ fontSize: 11, color: C.faint, margin: "0 0 12px", lineHeight: 1.8 }}>
            政府が公表している官民投資額は「2040年度までの累計で370兆円超（重複排除後）」。
            グラフの{GRAND_TOTAL}兆円は{UNIQUE_COUNT}製品・技術を単純合計した値で、政府公表値ではない。
          </p>
          <div style={{ display: "flex", gap: 26, flexWrap: "wrap", alignItems: "flex-end" }}>
            {[
              ["17", "分野"],
              [`${UNIQUE_COUNT}`, "投資対象の製品・技術"],
              [`${PROGRAMS.length}`, "契約学科"],
              [`${LINKED_PROGRAMS.length}`, "うち17分野に紐づく契約学科"],
              ["370兆円超", "政府公表の官民投資額"],
            ].map(([v, l]) => (
              <div key={l}>
                <div style={{ ...num, fontSize: 22, lineHeight: 1 }}>{v}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{l}</div>
              </div>
            ))}
          </div>
        </header>

        {/* ── controls ── */}
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
          <Control
            label="投資額"
            value={unit}
            onChange={setUnit}
            options={[
              { v: "field", l: "分野単位" },
              { v: "item", l: "製品・技術単位" },
            ]}
          />
          <Control
            label="グラフ形式"
            value={chart}
            onChange={setChart}
            options={[
              { v: "bar", l: "横棒" },
              { v: "tree", l: "ツリーマップ" },
            ]}
          />
          <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: C.ink, cursor: "pointer" }}>
            <input type="checkbox" checked={onlyContract} onChange={(e) => setOnlyContract(e.target.checked)} />
            契約学科と関連する分野／製品・技術
          </label>
        </div>

        {/* ── chart ── */}
        <ChartFrame>{chart === "bar" ? <Bars data={chartData} /> : <Tree data={chartData} />}</ChartFrame>
        <div style={{ fontSize: 11, color: C.muted, margin: "8px 0 0", lineHeight: 1.85 }}>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 3 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 10, height: 10, background: C.seal, display: "inline-block" }} />
              契約学科あり
            </span>
            {chart === "tree" && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 10, height: 10, background: C.ramp[1], display: "inline-block" }} />
                <span style={{ width: 10, height: 10, background: C.ramp[4], display: "inline-block", marginLeft: -3 }} />
                濃いほど投資額が大きい
              </span>
            )}
          </div>
          {unit === "field"
            ? "17分野を投資額の大きい順に並べたもの。"
            : `${UNIQUE_COUNT}品目のうち、金額が確定している60品目を投資額の大きい順に並べたもの。`}{" "}
          再掲2品目（バイオ医薬品・再生医療等製品等、グリーン鉄）は本体側の分野にのみ計上しているため、17分野を足し上げると {GRAND_TOTAL} 兆円に一致する。
          <span style={{ color: C.seal }}>
            {" "}到達年度は品目ごとに2030〜2040年度と異なるため、期間の揃っていない数字を並べている点に注意。
          </span>
        </div>

        {/* ── table ── */}
        <section style={{ marginTop: 26 }}>
          <H2>一覧</H2>
          <div style={{ display: "flex", gap: 10, marginBottom: 8, flexWrap: "wrap", alignItems: "center" }}>
            <Control
              label="並び順"
              value={sort}
              onChange={setSort}
              options={[
                { v: "field", l: "分野順" },
                { v: "amount", l: "投資額順" },
              ]}
            />
            <select
              value={fieldFilter}
              onChange={(e) => setFieldFilter(e.target.value)}
              aria-label="分野で絞り込む"
              style={{ ...sans, padding: "6px 9px", fontSize: 12, border: `1px solid ${C.rule}`, borderRadius: 3, background: C.card }}
            >
              <option value="all">すべての分野</option>
              {FIELDS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="分野・製品・技術を絞り込む"
              aria-label="絞り込み"
              style={{ ...sans, flex: "1 1 190px", padding: "6px 9px", fontSize: 12, border: `1px solid ${C.rule}`, borderRadius: 3, background: C.card }}
            />
          </div>

          {/* 分野計は、分野で絞ったときだけ表の上に1回出す。行ごとに繰り返すと読めないため列にはしない。 */}
          {selectedField && (
            <div
              style={{
                background: C.card,
                border: `1px solid ${C.rule}`,
                borderBottom: "none",
                padding: "8px 10px",
                fontSize: 12,
                display: "flex",
                gap: 16,
                flexWrap: "wrap",
                alignItems: "baseline",
              }}
            >
              <strong>{selectedField.name}</strong>
              <span style={{ color: C.muted }}>
                分野計 <span style={{ ...num, color: C.ink, fontSize: 14 }}>{fieldTotal.toFixed(1)}</span> 兆円
                {selectedField.total !== selectedField.totalNet && (
                  <span style={{ fontSize: 11 }}>（再掲を含めると {selectedField.total.toFixed(1)}）</span>
                )}
              </span>
              <span style={{ color: C.muted }}>17分野中 {selectedField.rankNet} 位</span>
              <span style={{ color: C.muted }}>全体の {((fieldTotal / GRAND_TOTAL) * 100).toFixed(1)}%</span>
              {selectedField.periodMixed && (
                <span style={{ color: C.seal, fontSize: 11 }}>
                  対象年度が混在（{selectedField.periods.join("・")}）。分野計の期間定義は一様でない
                </span>
              )}
            </div>
          )}

          <div style={{ background: C.card, border: `1px solid ${C.rule}`, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: C.ink, color: "#fff" }}>
                  {([
                    ["分野", "left"],
                    ["主な製品・技術", "left"],
                    ["投資額（兆円）", "right"],
                    ["順位", "right"],
                    ["対象期間", "left"],
                    ["契約学科", "left"],
                  ] as const).map(([h, align]) => (
                    <th key={h} scope="col" style={{ padding: "7px 9px", textAlign: align, fontWeight: 600, whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((it) => {
                  const f = FIELDS.find((x) => x.id === it.fieldId)!;
                  return (
                    <tr key={it.id} style={{ borderTop: `1px solid ${C.rule}`, background: it.contracts.length ? C.sealRow : "transparent" }}>
                      <td style={{ padding: "5px 9px", color: C.muted, whiteSpace: "nowrap" }}>{f.shortName}</td>
                      <td style={{ padding: "5px 9px", color: it.isRestated ? C.faint : C.ink }}>
                        {it.name}
                        {it.isRestated && <Tag>再掲 → {restatedHome(it.name)}に計上</Tag>}
                        {!it.isCounted && <Tag>金額未確定</Tag>}
                      </td>
                      <td
                        style={{
                          ...num,
                          padding: "5px 9px",
                          textAlign: "right",
                          whiteSpace: "nowrap",
                          color: it.isRestated ? C.faint : C.ink,
                        }}
                      >
                        {it.amount === null ? "—" : it.amount.toFixed(1)}
                      </td>
                      <td style={{ ...num, padding: "5px 9px", textAlign: "right", color: C.muted }}>{it.rank ?? "—"}</td>
                      <td style={{ padding: "5px 9px", color: C.muted, whiteSpace: "nowrap" }}>{it.period}</td>
                      <td style={{ padding: "5px 9px", whiteSpace: "nowrap" }}>
                        {it.contracts.map((c) => (
                          <Seal key={c.programId} pid={c.programId} basis={c.basis} />
                        ))}
                      </td>
                    </tr>
                  );
                })}
                {tableRows.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: "22px 9px", textAlign: "center", color: C.muted }}>
                      条件に合う製品・技術はありません。絞り込みを変えてください。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 7, fontSize: 11, color: C.muted, alignItems: "center" }}>
            <span>
              <span style={{ ...num, color: C.ink }}>{tableRows.length}</span> 件を表示
            </span>
            <span style={{ color: C.faint }}>
              {UNIQUE_COUNT}品目＋再掲{ITEMS.length - UNIQUE_COUNT}品目。灰色の行＝再掲で、金額は本体側の分野に計上済み。合計・順位には算入していない
            </span>
            <span style={{ color: C.seal }}>
              契約学科と分野・製品・技術の対応づけは、現時点の公開情報からの推定
            </span>
          </div>
        </section>

        {/* ── contracts ── */}
        <section style={{ marginTop: 28 }}>
          <H2>契約学科 5件</H2>
          <p style={{ fontSize: 11, color: C.muted, margin: "0 0 10px", lineHeight: 1.8 }}>
            契約学科制度は、{SCHEME_NOTE.description}
            2026年7月7日、NEDOの2事業で5件が採択された。
            <a href={SCHEME_NOTE.source} target="_blank" rel="noreferrer" style={{ color: C.seal, marginLeft: 4 }}>
              制度資料（経済産業省）↗
            </a>
          </p>
          <div style={{ display: "grid", gap: 10 }}>
            {PROGRAMS.map((p) => (
              <article key={p.id} style={{ background: C.card, border: `1px solid ${C.rule}` }}>
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    flexWrap: "wrap",
                    alignItems: "baseline",
                    padding: "9px 12px",
                    borderBottom: `1px solid ${C.rule}`,
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{p.university}</span>
                  <span style={{ fontSize: 12, color: C.muted }}>× {p.partner}</span>
                </div>
                <div style={{ padding: "10px 12px", fontSize: 12, lineHeight: 1.8 }}>
                  <p style={{ margin: "0 0 8px", fontWeight: 600 }}>{p.summary}</p>
                  <Row label="プログラム名">{p.program}</Row>
                  <Row label="開設／定員">
                    {p.opensAt}
                    {p.capacity !== "未公表" && ` ／ ${p.capacity}`}
                  </Row>
                  <Row label="研究">{p.research}</Row>
                  <Row label="教育">{p.education}</Row>
                  {p.goal !== "未公表" && <Row label="目標">{p.goal}</Row>}
                  {p.career !== "未公表" && <Row label="キャリアパス">{p.career}</Row>}
                  <Row label="採択事業">
                    {p.nedo}
                    {p.type !== "—" && `（${p.type}）`}
                    {p.period !== "—" && `／事業期間 ${p.period}`}
                  </Row>
                  <Row label="出典">
                    {p.sources.map((x) => (
                      <span key={x.url} style={{ display: "block", marginBottom: 2 }}>
                        <a href={x.url} target="_blank" rel="noreferrer" style={{ color: C.seal }}>
                          {x.label} ↗
                        </a>
                        {x.note && <span style={{ color: C.muted, fontSize: 11 }}>　※{x.note}</span>}
                      </span>
                    ))}
                    {p.attach === "unassigned" && (
                      <span style={{ color: C.seal, fontSize: 11 }}>
                        出口となる製品・技術を公表資料から特定できないため、17分野のいずれにも紐づけていない
                      </span>
                    )}
                  </Row>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── notes ── */}
        <section style={{ marginTop: 30 }}>
          <H2>このデータについて</H2>
          <div style={{ background: C.card, border: `1px solid ${C.rule}`, padding: "13px 15px", fontSize: 11.5, lineHeight: 1.95 }}>
            <Note title="再掲2品目">
              バイオ医薬品・再生医療等製品等（20.8兆円）とグリーン鉄（4.2兆円）は、原典で2つの分野に同一項目として掲載されている
              （原典は両分野に相互参照で載せるのみで、どちらが本体かを定めていない）。
              本データは野村證券の整理に合わせ、<strong>バイオ医薬品・再生医療等製品等は合成生物学・バイオ</strong>、
              <strong>グリーン鉄は資源・エネルギー安全保障・GX</strong>を本体として計上した。
              これにより分野合計は野村證券の公表値と一致する（創薬・先端医療 43.3／合成生物学・バイオ 33.6／資源・エネルギー安全保障・GX 28.8／マテリアル 12.7）。
              再掲側は一覧に灰色で残し、金額は表示するが合計・順位・グラフには算入していない。
              単純に2回足すと {GROSS_TOTAL} 兆円になるが、この数字は使わない。
            </Note>
            <Note title="総額">
              政府の公表値は「2040年度までの累計で370兆円超（「主要な製品・技術等」間での重複を排除したもの）」。
              グラフで用いている {GRAND_TOTAL} 兆円は{UNIQUE_COUNT}品目の単純合計にすぎず、政府公表値ではない。
              資料はこの2つの数字の突合を示していないため、差の25.3兆円は説明できない。
              原典は「超」を付けた理由として、投資額が2040年度まで記載されていない品目についてはその部分が加算されていないことを挙げている。
              野村證券も分野合計は参考値と明記し、単純合計値を記載していない。
            </Note>
            <Note title="対象期間">
              到達年度は品目ごとに異なる。金額が確定している60品目 {GRAND_TOTAL} 兆円の内訳は、
              2040年度まで 315.9兆円（79.9%）、2035年度まで 42.1兆円（10.7%）、2033年度まで 33.7兆円（8.5%）、
              2030年度まで 2.6兆円、2034年度まで 1.0兆円。
              <strong>約2割（79.4兆円）は2040年度までの累計になっていない。</strong>
              コンテンツはすべて2033年度まで、デジタル・サイバーセキュリティは6品目中4品目が2035年度までの数字であり、
              グラフはこの期間の異なる数字を並べている。分野内で年度が混在する分野もあるため、分野計の期間定義も一様ではない。
            </Note>
            <Note title="金額未確定">
              艦艇（防衛調達を含む投資が約3,400億円＝2026年度予算。加えて戦略三文書の改定に伴う投資額が今後見込まれる）と
              LNG運搬船（今後精査）は金額の基準が異なるため、合計・順位から除外している。
              防災技術には、第1次国土強靱化実施中期計画に基づく2030年度までの官民合わせて概ね20兆円強程度の内数が別途想定されている。
            </Note>
            <Note title="順位">
              {UNIQUE_COUNT}品目のうち金額が確定している60品目を投資額の大きい順に並べた競争順位（同額は同順位、次はその数だけ順位を飛ばす）。
              再掲は母集団から除外し、本体側と同順位とした。全60品目で野村證券の記事表の順位と一致することを確認している。
            </Note>
            <Note title="契約学科">
              {MAPPING_NOTE}
              一覧で印が付くのは {TAGGED.length}製品・技術（{TAGGED_SUM.toFixed(1)}兆円）で、
              いずれも出口領域や連携先の事業領域を含む解釈が入っている。品目ごとの根拠は、一覧の印にカーソルを合わせると表示される。
              <br />
              契約学科5件のうち{LINKED_PROGRAMS.length}件が17分野の製品・技術に紐づく。東京大学は人材育成の方法論そのものが対象で、
              公表資料から出口となる製品・技術を特定できないため、<strong>いずれの分野にも紐づけていない</strong>
              （グラフにも一覧にも印を置いていない）。推測で分野に配置すると、グラフ上で断定として読まれるため。
            </Note>
            <Note title="出典・参照" last>
              <ul style={{ margin: "2px 0 0", paddingLeft: 17 }}>
                <li>
                  内閣府{" "}
                  <a
                    href="https://www5.cao.go.jp/keizai-shimon/kaigi/minutes/2026/0624_shiryo01.pdf"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: C.seal }}
                  >
                    「戦略17分野の「主要な製品・技術等」における官民投資額」
                  </a>
                  （経済財政諮問会議・日本成長戦略会議 合同会議 2026年6月24日 資料1）／62品目の投資額・対象年度・注記はすべてこの資料による
                </li>
                <li>
                  野村證券 ウェルスタイル{" "}
                  <a href="https://www.nomura.co.jp/wealthstyle/article/0779/" target="_blank" rel="noreferrer" style={{ color: C.seal }}>
                    「高市政権・戦略17分野の投資額順位一覧 投資額が大きい品目から分かる成長戦略」（2026年6月29日）
                  </a>
                  ／再掲の整理と順位の照合に使用
                </li>
                <li>
                  内閣府 AI戦略本部{" "}
                  <a
                    href="https://www8.cao.go.jp/cstp/ai/ai_hq/5kai/shiryo2_1.pdf"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: C.seal }}
                  >
                    「バーティカルＡＩ領域別戦略 中間とりまとめ（概要）」（第5回 資料2-1）
                  </a>
                  ／製品・技術への割り当てを判断する際の定義として参照。同資料はバーティカルAIを
                  「領域特化型基盤モデルの開発・実装」「データエコシステムの構築」と定義しており、
                  これに照らして新潟大学とバーティカルAIの対応づけは取り消した
                </li>
                <li>
                  NEDO{" "}
                  <a href="https://www.nedo.go.jp/news/press/AA5_101950.html" target="_blank" rel="noreferrer" style={{ color: C.seal }}>
                    「産学連携の新たな形である「契約学科」設立を含めた取り組みが始動します」（2026年7月7日）
                  </a>
                  ／契約学科5件。個別のプログラム情報は各大学・企業のリリース（上のカードの「出典」）を参照
                </li>
              </ul>
            </Note>
          </div>
          <p style={{ fontSize: 11, color: C.faint, marginTop: 8, lineHeight: 1.8 }}>
            分野への割り当てと契約学科の対応づけには、公表資料をもとにした独自の整理を含む。投資判断に用いる情報ではない。
          </p>
        </section>
      </div>
    </main>
  );
}
