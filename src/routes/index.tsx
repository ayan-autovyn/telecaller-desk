import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarCheck, ListOrdered, PhoneCall } from "lucide-react";
import { ActivityStrip, AppShell } from "@/components/AppShell";
import { useI18n, type Key } from "@/lib/i18n";
import { agent, appts, leads } from "@/lib/data";
import { pct, useReport } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Telecaller Dashboard — Daily Calls & Appointments" },
      { name: "description", content: "Daily work dashboard for CCE telecallers: service reminder calls and appointment confirmations in English and Hindi." },
      { property: "og:title", content: "Telecaller Dashboard — Daily Calls & Appointments" },
      { property: "og:description", content: "See today's calling targets and jump straight to your calling lists." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

type Tile = { label: Key; hint?: Key; value: number; total?: number; tone: string; to: "/smr-followup" | "/smr-appointments"; tab: string; link?: boolean };

function StatTile({ tile }: { tile: Tile }) {
  const { t } = useI18n();
  const p = tile.total !== undefined ? pct(tile.value, tile.total) : undefined;
  const body = (
    <>
      <span className="text-sm font-bold text-muted-foreground">{t(tile.label)}</span>
      {tile.hint && <span className="text-[11px] text-muted-foreground">({t(tile.hint)})</span>}
      <div className="mt-2 flex items-end justify-between gap-2">
        <span className={cn("text-3xl font-extrabold", tile.tone)}>{tile.value}</span>
        {p !== undefined && <span className={cn("text-lg font-bold", tile.tone)}>{p}%</span>}
      </div>
      {p !== undefined && (
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <div className={cn("h-full rounded-full bg-current", tile.tone)} style={{ width: `${p}%` }} />
        </div>
      )}
      {tile.link && (
        <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary opacity-70 group-hover:opacity-100">
          {t("open")} <ArrowRight className="h-3 w-3" />
        </span>
      )}
    </>
  );
  if (!tile.link) return <div className="flex flex-col rounded-xl border bg-background p-4">{body}</div>;
  return (
    <Link
      to={tile.to}
      search={{ tab: tile.tab } as never}
      className="group flex flex-col rounded-xl border bg-background p-4 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-card"
    >
      {body}
    </Link>
  );
}

function Section({ icon: Icon, title, desc, tiles, cta, ctaTo, ctaTab, left }: {
  icon: typeof PhoneCall; title: Key; desc: Key; tiles: Tile[]; cta: Key; ctaTo: Tile["to"]; ctaTab: string; left: number;
}) {
  const { t } = useI18n();
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-card">
      <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary"><Icon className="h-5 w-5" /></span>
          <div className="min-w-0">
            <h2 className="text-lg font-extrabold">{t(title)}</h2>
            <p className="text-sm text-muted-foreground">{t(desc)}</p>
          </div>
        </div>
        <Link
          to={ctaTo}
          search={{ tab: ctaTab } as never}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-card transition hover:bg-primary-deep"
        >
          <PhoneCall className="h-4 w-4" />
          <span className="hidden sm:inline">{t(cta)}</span>
          <span className="rounded-full bg-primary-foreground/20 px-2 text-xs">{left} {t("left")}</span>
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-5">
        {tiles.map((x) => <StatTile key={x.label} tile={x} />)}
      </div>
    </section>
  );
}

type FlowStep = { n: number; label: Key; to: Tile["to"]; tab: string; count: number };

function FlowGuide({ steps }: { steps: FlowStep[] }) {
  const { t } = useI18n();
  return (
    <section className="rounded-2xl border-2 border-primary/30 bg-card p-5 shadow-card">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground"><ListOrdered className="h-5 w-5" /></span>
        <div>
          <h2 className="text-lg font-extrabold">{t("flowTitle")}</h2>
          <p className="text-sm text-muted-foreground">{t("flowDesc")}</p>
        </div>
      </div>
      <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {steps.map((s) => (
          <li key={s.n}>
            <Link
              to={s.to}
              search={{ tab: s.tab } as never}
              className={cn(
                "group flex h-full items-center gap-3 rounded-xl border p-3 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-card",
                s.n === 1 ? "border-primary bg-secondary" : "bg-background",
              )}
            >
              <span className={cn(
                "grid h-9 w-9 shrink-0 place-items-center rounded-full text-base font-extrabold",
                s.n === 1 ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
              )}>
                {s.n}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold leading-snug">{t(s.label)}</span>
                {s.n === 1 && <span className="text-[11px] font-bold text-primary">▶ {t("startHere")}</span>}
              </span>
              <span className="flex shrink-0 flex-col items-center">
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">{s.count}</span>
                <ArrowRight className="mt-1 h-3.5 w-3.5 text-primary opacity-60 group-hover:opacity-100" />
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Dashboard() {
  const { t } = useI18n();
  const r = useReport();
  const s = r.service, a = r.appt;
  const reported = a.reportedWith + a.reportedWithout;

  const serviceTiles: Tile[] = [
    { label: "callsDue", hint: "callsDueHint", value: s.due, tone: "text-primary", to: "/smr-followup", tab: "total", link: true },
    { label: "callsDone", value: s.callsDone, total: s.due, tone: "text-info", to: "/smr-followup", tab: "total" },
    { label: "connected", value: s.connected, total: s.callsDone, tone: "text-success", to: "/smr-followup", tab: "followup" },
    { label: "apptCreated", value: s.apptCreated, total: s.connected, tone: "text-warning", to: "/smr-appointments", tab: "total" },
  ];
  const apptTiles: Tile[] = [
    { label: "totalAppt", hint: "totalApptHint", value: a.total, tone: "text-primary", to: "/smr-appointments", tab: "total", link: true },
    { label: "callsDone", value: a.callsDone, total: a.total, tone: "text-info", to: "/smr-appointments", tab: "total" },
    { label: "confirmed", value: a.confirmed, total: a.total, tone: "text-success", to: "/smr-appointments", tab: "today" },
    { label: "cancelled", value: a.cancelled, total: a.total, tone: "text-destructive", to: "/smr-appointments", tab: "lost" },
    { label: "reported", value: reported, total: appts.length, tone: "text-warning", to: "/smr-appointments", tab: "reported" },
  ];


  const flowSteps: FlowStep[] = [
    { n: 1, label: "step1", to: "/smr-appointments", tab: "today", count: appts.filter((x) => x.bucket === "today").length },
    { n: 2, label: "step2", to: "/smr-appointments", tab: "tomorrow", count: appts.filter((x) => x.bucket === "tomorrow").length },
    { n: 3, label: "step3", to: "/smr-appointments", tab: "pending", count: appts.filter((x) => x.bucket === "pending").length },
    { n: 4, label: "step4", to: "/smr-followup", tab: "today", count: leads.filter((l) => l.bucket === "today").length },
    { n: 5, label: "step5", to: "/smr-followup", tab: "followup", count: leads.filter((l) => l.bucket === "followup").length },
    { n: 6, label: "step6", to: "/smr-followup", tab: "pending", count: leads.filter((l) => l.bucket === "pending").length },
  ];

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold md:text-3xl">{t("greeting")}, {agent.split(" ")[0]} 👋</h1>
        <p className="mt-1 text-muted-foreground">{t("todayWork")}</p>
      </div>
      <div className="space-y-6">
        <ActivityStrip />
        <FlowGuide steps={flowSteps} />
        <Section icon={PhoneCall} title="serviceCallsTitle" desc="serviceCallsDesc" tiles={serviceTiles} cta="startCalling" ctaTo="/smr-followup" ctaTab="today" left={Math.max(s.due - s.callsDone, 0)} />
        <Section icon={CalendarCheck} title="apptTitle" desc="apptDesc" tiles={apptTiles} cta="startCalling" ctaTo="/smr-appointments" ctaTab="today" left={Math.max(a.total - a.callsDone, 0)} />
        <p className="text-xs text-muted-foreground">
          {t("withCce")}: {a.reportedWith} · {t("withoutCce")}: {a.reportedWithout}
        </p>
      </div>
    </AppShell>
  );
}
