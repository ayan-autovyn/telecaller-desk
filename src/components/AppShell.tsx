import { Link } from "@tanstack/react-router";
import { CalendarCheck, LayoutGrid, PhoneCall, PhoneOff, Phone, CalendarPlus, Clock, XCircle, CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { agent, dealer, leads } from "@/lib/data";
import { useReport, useStore } from "@/lib/store";
import { callingProgress } from "@/lib/calling-progress";
import { ArrowRight, Target } from "lucide-react";
import { cn } from "@/lib/utils";

export function LangToggle() {
  const { lang, setLang } = useI18n();
  return (
    <div className="flex shrink-0 rounded-full bg-primary-foreground/15 p-1 text-sm font-semibold">
      {(["en", "hi"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={cn(
            "rounded-full px-3 py-1 transition",
            lang === l ? "bg-card text-primary shadow" : "text-primary-foreground/85 hover:text-primary-foreground",
          )}
        >
          {l === "en" ? "English" : "हिंदी"}
        </button>
      ))}
    </div>
  );
}

const nav = [
  { to: "/", icon: LayoutGrid, key: "dashboard" },
  { to: "/smr-followup", icon: PhoneCall, key: "followup" },
  { to: "/smr-appointments", icon: CalendarCheck, key: "appointments" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="sticky top-0 hidden h-screen w-20 shrink-0 flex-col items-center gap-3 border-r bg-card py-5 md:flex">
        <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-primary text-xs font-black text-primary-foreground">TVS</div>
        {nav.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            title={t(n.key)}
            activeOptions={{ exact: true }}
            className="grid h-11 w-11 place-items-center rounded-xl text-muted-foreground transition hover:bg-secondary hover:text-primary data-[status=active]:bg-primary data-[status=active]:text-primary-foreground"
          >
            <n.icon className="h-5 w-5" />
          </Link>
        ))}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-header text-primary-foreground">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 md:px-8">
            <div className="min-w-0">
              <p className="truncate text-lg font-extrabold">{t("appName")}</p>
              <p className="truncate text-xs opacity-80">
                {dealer.code} · {dealer.name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <LangToggle />
              <div className="hidden items-center gap-2 rounded-full bg-primary-foreground/15 py-1 pl-1 pr-4 sm:flex">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-card text-xs font-bold text-primary">JS</span>
                <span className="text-sm font-semibold">{agent}</span>
              </div>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-4 pb-2 md:hidden">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} activeOptions={{ exact: true }} className="whitespace-nowrap rounded-full px-3 py-1 text-sm opacity-80 data-[status=active]:bg-card data-[status=active]:text-primary data-[status=active]:opacity-100">
                {t(n.key)}
              </Link>
            ))}
          </nav>
        </header>
        <main className="mx-auto w-full max-w-[1400px] flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

export function ActivityStrip() {
  const { t } = useI18n();
  const a = useReport().activity;
  const { appts, leadOutcome, apptCalled } = useStore();
  const progress = callingProgress(leads, appts, leadOutcome, apptCalled);
  const items = [
    { k: "attempts", v: progress.done, icon: Phone, c: "text-primary border-l-primary" },
    { k: "connected", v: a.connected, icon: CheckCircle2, c: "text-success border-l-success" },
    { k: "nonConnect", v: a.nonConnect, icon: PhoneOff, c: "text-warning border-l-warning" },
    { k: "apptBooked", v: a.apptBooked, icon: CalendarPlus, c: "text-destructive border-l-destructive" },
    { k: "callLater", v: a.callLater, icon: Clock, c: "text-info border-l-info" },
    { k: "notInterested", v: a.notInterested, icon: XCircle, c: "text-slate border-l-slate" },
  ] as const;
  return (
    <section className="rounded-2xl border bg-card p-4 shadow-card">
      <h2 className="mb-3 text-sm font-bold">{t("todayActivity")}</h2>
      <div className="mb-4 grid gap-4 border-b pb-4 sm:grid-cols-2">
        <div>
          <div className="flex items-center gap-2 font-bold"><Target className="h-5 w-5 text-primary" />{t("dailyTarget")}</div>
          <div className="mt-3 flex items-end justify-between gap-3">
            <p><span className="text-3xl font-extrabold text-primary">{progress.done}</span><span className="ml-1 text-lg text-muted-foreground">/ {progress.target}</span></p>
            <span className="text-xl font-bold text-primary">{progress.percent}%</span>
          </div>
          <div role="progressbar" aria-label={t("dailyTarget")} aria-valuenow={progress.done} aria-valuemin={0} aria-valuemax={progress.target} className="mt-2 h-3 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary transition-all" style={{ width: `${progress.percent}%` }} />
          </div>
          <p className="mt-2 text-sm font-semibold">{progress.remaining > 0 ? `${progress.remaining} ${t("remainingCalls")}` : t("targetClosed")}</p>
        </div>
        {progress.next ? <div className="border-l-4 border-primary bg-secondary p-4">
          <p className="text-xs font-bold uppercase text-primary">{t("focusNow")}</p>
          <h3 className="mt-1 text-base font-extrabold">{t(progress.next.label)}</h3>
          <p className="mt-2 text-sm font-semibold">{progress.next.remaining} {t("callsToMake")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("afterGroup")}: {progress.remaining - progress.next.remaining} {t("remainingCalls")}</p>
          <Link to={progress.next.to} search={{ tab: progress.next.bucket }} className="mt-3 inline-flex items-center gap-2 font-bold text-primary">{t("startCalling")}<ArrowRight className="h-4 w-4" /></Link>
        </div> : <div className="flex items-center gap-3 bg-success/10 p-4 font-bold text-success"><CheckCircle2 className="h-6 w-6" />{t("targetClosed")}</div>}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((i) => (
          <div key={i.k} className={cn("rounded-xl border border-l-4 bg-background p-3", i.c)}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{t(i.k)}</span>
              <i.icon className="h-4 w-4" />
            </div>
            <p className="mt-1 text-2xl font-extrabold">{i.v}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
