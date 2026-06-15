"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from "recharts";
import Exercises from "./Exercises";

type Member = { email: string; name: string; isAdmin?: boolean };
type Reading = { id: number; date: string; time: string; sys: number; dia: number; pulse: number; by: string; note?: string };
type Reminder = { id: number; time: string; label: string; enabled: boolean };

const norm = (e: string) => e.trim().toLowerCase();
const todayStr = () => new Date().toISOString().slice(0, 10);
const nowTime = () => new Date().toTimeString().slice(0, 5);

async function doLogout() {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.href = "/bp";
}

async function dbGet(col: string) {
  const r = await fetch(`/api/db?col=${col}`);
  return r.json();
}
async function dbPut(col: string, data: any) {
  await fetch(`/api/db?col=${col}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });
}

function classify(r: { sys: number; dia: number; pulse: number }) {
  const out: { level: "warn" | "alert"; msg: string }[] = [];
  if (r.pulse > 100) out.push({ level: "alert", msg: `心率偏高（${r.pulse}）。先静坐休息 5 分钟再量一次；若持续 >100，或伴胸闷/胸痛/头晕/喘不过气 → 尽快就医。` });
  else if (r.pulse < 60) out.push({ level: "warn", msg: `心率偏低（${r.pulse}）。若伴头晕/无力请就医（她在吃减慢心率的药）。` });
  if (r.sys >= 140 || r.dia >= 90) out.push({ level: "warn", msg: `血压偏高（${r.sys}/${r.dia}）。留意并记录；若 ≥180/110 或头痛/胸闷 → 就医。` });
  else if (r.sys < 90 || r.dia < 60) out.push({ level: "warn", msg: `血压偏低（${r.sys}/${r.dia}）。起身慢一点、注意补水，若头晕请小心。` });
  return out;
}

const TABS = [
  ["add", "记录"], ["history", "历史"], ["chart", "图表"],
  ["report", "报表"], ["exercise", "运动"], ["reminder", "提醒"], ["settings", "设置"],
] as const;

export default function BpApp({ email, name }: { email: string; name: string; image?: string }) {
  const [status, setStatus] = useState<"loading" | "member" | "setup" | "denied">("loading");
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState<string>("add");
  const [family, setFamily] = useState<Member[]>([]);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [toast, setToast] = useState("");
  const me: Member = { email: norm(email), name, isAdmin };

  useEffect(() => { (async () => {
    const f = await dbGet("family");
    if (f.setup) { setStatus("setup"); return; }
    if (f.member) { setIsAdmin(!!f.isAdmin); await loadAll(); setStatus("member"); }
    else setStatus("denied");
  })(); /* eslint-disable-next-line */ }, []);

  async function loadAll() {
    const [rd, rm, f] = await Promise.all([dbGet("readings"), dbGet("reminders"), dbGet("family")]);
    setReadings((rd.data as Reading[]) || []);
    let rems = (rm.data as Reminder[]) || [];
    if (rems.length === 0) {
      rems = [
        { id: 1, time: "08:00", label: "量血压 / 吃药", enabled: true },
        { id: 2, time: "20:00", label: "量血压 / 吃药", enabled: true },
        { id: 3, time: "10:00", label: "做脚部运动", enabled: true },
      ];
      await dbPut("reminders", rems);
    }
    setReminders(rems);
    setFamily((f.list as Member[]) || []);
    setIsAdmin(!!f.isAdmin);
  }

  async function doSetup() {
    await dbPut("family", [{ email: norm(email), name, isAdmin: true }]);
    await dbPut("readings", [
      { id: 1, date: "2026-06-14", time: "08:00", sys: 112, dia: 73, pulse: 106, by: "家人", note: "" },
      { id: 2, date: "2026-06-14", time: "08:05", sys: 123, dia: 80, pulse: 105, by: "家人", note: "" },
      { id: 3, date: "2026-06-14", time: "08:10", sys: 99, dia: 58, pulse: 108, by: "家人", note: "" },
    ]);
    setIsAdmin(true); await loadAll(); setStatus("member");
  }

  // reminders fire when app open
  const firedRef = useRef<string>("");
  useEffect(() => {
    if (status !== "member") return;
    const iv = setInterval(() => {
      const hm = nowTime(); const stamp = todayStr() + " " + hm;
      if (firedRef.current === stamp) return;
      const due = reminders.find((r) => r.enabled && r.time === hm);
      if (due) {
        firedRef.current = stamp;
        const msg = `提醒：${due.label}`;
        if ("Notification" in window && Notification.permission === "granted") new Notification("妈妈健康提醒", { body: msg });
        setToast(msg); setTimeout(() => setToast(""), 8000);
      }
    }, 20000);
    return () => clearInterval(iv);
  }, [status, reminders]);

  if (status === "loading")
    return <div className="min-h-screen grid place-items-center text-teal-700 bg-teal-50">…</div>;

  if (status === "setup")
    return (
      <Centered>
        <h1 className="text-xl font-bold text-teal-800">首次设置</h1>
        <p className="text-sm text-gray-500 mt-1 mb-4">你是第一个登录的人（{email}），将成为管理员，可邀请其他家人。</p>
        <button onClick={doSetup} className="w-full bg-teal-700 text-white rounded-lg py-2.5 font-medium">创建并成为管理员</button>
        <SignOutLink />
      </Centered>
    );

  if (status === "denied")
    return (
      <Centered>
        <h1 className="text-xl font-bold text-teal-800">未获授权</h1>
        <p className="text-sm text-gray-600 mt-2 mb-4">你的帐号 <b>{email}</b> 还不在家人名单内。请让管理员到「设置」把你加入后再登录。</p>
        <SignOutLink />
      </Centered>
    );

  return (
    <div className="min-h-screen bg-teal-50">
      {toast && (
        <div className="fixed top-3 inset-x-0 z-50 flex justify-center px-4">
          <div className="bg-orange-600 text-white rounded-xl px-4 py-3 shadow-lg text-sm max-w-md">{toast}</div>
        </div>
      )}
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-teal-800">妈妈血压心率记录</h1>
            <p className="text-xs text-gray-500">{name}{isAdmin ? " · 管理员" : ""}</p>
          </div>
          <button onClick={doLogout} className="text-xs text-gray-500 underline">登出</button>
        </div>

        <div className="flex gap-1 mt-4 bg-white rounded-xl p-1 shadow-sm overflow-x-auto">
          {TABS.map(([k, label]) => (
            <button key={k} onClick={() => setView(k)}
              className={`flex-1 whitespace-nowrap py-2 px-2 text-sm rounded-lg font-medium ${view === k ? "bg-teal-700 text-white" : "text-gray-600"}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {view === "add" && <AddView name={name} readings={readings} setReadings={setReadings} />}
          {view === "history" && <HistoryView readings={readings} setReadings={setReadings} />}
          {view === "chart" && <ChartView readings={readings} />}
          {view === "report" && <ReportView readings={readings} />}
          {view === "exercise" && <Exercises />}
          {view === "reminder" && <ReminderView reminders={reminders} setReminders={setReminders} />}
          {view === "settings" && <SettingsView me={me} family={family} setFamily={setFamily} />}
        </div>

        <p className="text-xs text-gray-400 mt-4 text-center leading-relaxed">
          此工具仅供记录参考，不能代替医生诊断。若有胸痛/严重胸闷/喘不过气/快晕倒 → 直接就医。
        </p>
      </div>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-teal-50 grid place-items-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 text-center">{children}</div>
    </div>
  );
}
function SignOutLink() {
  return <button onClick={doLogout} className="text-xs text-gray-400 underline mt-4">用其他帐号登录</button>;
}
function Card({ children }: { children: React.ReactNode }) { return <div className="bg-white rounded-2xl shadow-sm p-5">{children}</div>; }
function H({ children }: { children: React.ReactNode }) { return <h2 className="font-semibold text-teal-800 mb-3">{children}</h2>; }

function AddView({ name, readings, setReadings }: any) {
  const [d, setD] = useState(todayStr());
  const [tm, setTm] = useState(nowTime());
  const [sys, setSys] = useState(""); const [dia, setDia] = useState(""); const [pulse, setPulse] = useState("");
  const [note, setNote] = useState(""); const [flash, setFlash] = useState(false);
  const preview = sys && dia && pulse ? classify({ sys: +sys, dia: +dia, pulse: +pulse }) : [];
  async function save() {
    if (!sys || !dia || !pulse) return;
    const r: Reading = { id: Date.now(), date: d, time: tm, sys: +sys, dia: +dia, pulse: +pulse, by: name, note: note.trim() };
    const next = [...readings, r];
    setReadings(next); await dbPut("readings", next);
    setSys(""); setDia(""); setPulse(""); setNote(""); setTm(nowTime());
    setFlash(true); setTimeout(() => setFlash(false), 1500);
  }
  return (
    <Card>
      <H>新增一次测量</H>
      <div className="grid grid-cols-2 gap-3">
        <Field label="日期"><input type="date" className="inp" value={d} onChange={(e) => setD(e.target.value)} /></Field>
        <Field label="时间"><input type="time" className="inp" value={tm} onChange={(e) => setTm(e.target.value)} /></Field>
        <Field label="高压 SYS"><input type="number" className="inp" value={sys} onChange={(e) => setSys(e.target.value)} placeholder="mmHg" /></Field>
        <Field label="低压 DIA"><input type="number" className="inp" value={dia} onChange={(e) => setDia(e.target.value)} placeholder="mmHg" /></Field>
        <Field label="心率 PULSE"><input type="number" className="inp" value={pulse} onChange={(e) => setPulse(e.target.value)} placeholder="/min" /></Field>
        <Field label="备注（可选）"><input className="inp" value={note} onChange={(e) => setNote(e.target.value)} /></Field>
      </div>
      {preview.map((p, i) => (
        <div key={i} className={`mt-3 rounded-lg p-3 text-sm ${p.level === "alert" ? "bg-red-50 text-red-700 border border-red-200" : "bg-orange-50 text-orange-700 border border-orange-200"}`}>⚠️ {p.msg}</div>
      ))}
      <p className="text-xs text-gray-400 mt-3">参考范围：高压 90–129 · 低压 60–79 · 心率 60–100 /min</p>
      <button onClick={save} className="w-full mt-4 bg-teal-700 text-white rounded-lg py-2.5 font-medium hover:bg-teal-800">{flash ? "已保存 ✓" : "保存记录"}</button>
      <style>{`.inp{width:100%;border:1px solid #d1d5db;border-radius:.5rem;padding:.5rem .75rem}`}</style>
    </Card>
  );
}

function HistoryView({ readings, setReadings }: any) {
  const sorted = [...readings].sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  async function del(id: number) {
    if (!confirm("确定删除这笔记录？")) return;
    const next = readings.filter((r: Reading) => r.id !== id);
    setReadings(next); await dbPut("readings", next);
  }
  return (
    <Card>
      <H>历史记录</H>
      {sorted.length === 0 ? <p className="text-gray-400 text-sm">还没有记录。</p> : (
        <div className="space-y-2">
          {sorted.map((r: Reading) => {
            const hi = r.pulse > 100, lo = r.pulse < 60;
            const bpFlag = r.sys >= 140 || r.dia >= 90 || r.sys < 90 || r.dia < 60;
            return (
              <div key={r.id} className="border rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-400">{r.date} {r.time} · {r.by}</div>
                  <div className="flex gap-3 mt-1 items-baseline">
                    <span className={bpFlag ? "text-orange-600 font-semibold" : "text-gray-800"}>{r.sys}/{r.dia} <span className="text-xs text-gray-400">mmHg</span></span>
                    <span className={hi ? "text-red-600 font-bold" : lo ? "text-orange-600 font-semibold" : "text-gray-800"}>♥ {r.pulse}{hi ? " (偏高)" : lo ? " (偏低)" : ""}</span>
                  </div>
                  {r.note && <div className="text-xs text-gray-500 mt-1">{r.note}</div>}
                </div>
                <button onClick={() => del(r.id)} className="text-xs text-gray-400 hover:text-red-500">✕</button>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function ChartView({ readings }: any) {
  const data = [...readings].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .map((r: Reading) => ({ label: `${r.date.slice(5)} ${r.time}`, SYS: r.sys, DIA: r.dia, 心率: r.pulse }));
  return (
    <Card>
      <H>趋势图</H>
      {data.length < 1 ? <p className="text-gray-400 text-sm">至少需要 1 笔记录。</p> : (
        <>
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[40, 160]} />
                <Tooltip /><Legend />
                <ReferenceLine y={100} stroke="#dc2626" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="SYS" stroke="#0f766e" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="DIA" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="心率" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-400 mt-1">— — 红色虚线 = 心率 100 参考线</p>
        </>
      )}
    </Card>
  );
}

function ReportView({ readings }: any) {
  const [copied, setCopied] = useState(false);
  const n = readings.length;
  const sorted = [...readings].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const avg = (k: keyof Reading) => n ? Math.round(readings.reduce((s: number, r: Reading) => s + (r[k] as number), 0) / n) : 0;
  const pulses = readings.map((r: Reading) => r.pulse);
  const high = pulses.filter((p: number) => p > 100).length;
  const range = n ? `${sorted[0].date} → ${sorted[n - 1].date}` : "-";
  const text = n === 0 ? "" :
    `妈妈血压心率记录摘要\n日期范围: ${range}\n记录次数: ${n}\n血压平均: ${avg("sys")}/${avg("dia")} mmHg\n心率平均: ${avg("pulse")} /min (范围 ${Math.min(...pulses)}–${Math.max(...pulses)})\n心率>100次数: ${high} / ${n}\n\n明细:\n` +
    sorted.map((r: Reading) => `${r.date} ${r.time}  ${r.sys}/${r.dia}  ${r.pulse}${r.pulse > 100 ? " *" : ""}  ${r.by}${r.note ? "  " + r.note : ""}`).join("\n");
  return (
    <Card>
      <H>给医生的报表</H>
      {n === 0 ? <p className="text-gray-400 text-sm">还没有记录。</p> : (
        <>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Stat label="日期范围" value={range} />
            <Stat label="记录次数" value={n} />
            <Stat label="血压平均" value={`${avg("sys")}/${avg("dia")}`} />
            <Stat label="心率平均" value={`${avg("pulse")} /min`} />
            <Stat label="心率范围" value={`${Math.min(...pulses)}–${Math.max(...pulses)}`} />
            <Stat label="心率>100次数" value={`${high} / ${n}`} warn={high > 0} />
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => { navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              className="flex-1 bg-teal-700 text-white rounded-lg py-2.5 font-medium">{copied ? "已复制 ✓" : "复制摘要（发给医生）"}</button>
            <button onClick={() => window.print()} className="flex-1 border border-teal-700 text-teal-700 rounded-lg py-2.5 font-medium">打印 / 存PDF</button>
          </div>
          <pre className="mt-4 text-xs bg-gray-50 rounded-lg p-3 whitespace-pre-wrap text-gray-600 overflow-x-auto">{text}</pre>
        </>
      )}
    </Card>
  );
}

function ReminderView({ reminders, setReminders }: any) {
  const [time, setTime] = useState("08:00"); const [label, setLabel] = useState("量血压 / 吃药");
  const canNotify = typeof window !== "undefined" && "Notification" in window;
  const [perm, setPerm] = useState(canNotify ? Notification.permission : "denied");
  async function save(next: Reminder[]) { setReminders(next); await dbPut("reminders", next); }
  return (
    <Card>
      <H>提醒（App 开着时到点提醒）</H>
      {canNotify && perm !== "granted" && (
        <button onClick={async () => setPerm(await Notification.requestPermission())}
          className="w-full mb-3 border border-teal-700 text-teal-700 rounded-lg py-2 text-sm font-medium">开启浏览器通知</button>
      )}
      <div className="space-y-2">
        {reminders.map((r: Reminder) => (
          <div key={r.id} className="flex items-center justify-between border rounded-lg px-3 py-2 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={r.enabled} onChange={() => save(reminders.map((x: Reminder) => x.id === r.id ? { ...x, enabled: !x.enabled } : x))} />
              <span className="font-mono">{r.time}</span><span>{r.label}</span>
            </label>
            <button onClick={() => save(reminders.filter((x: Reminder) => x.id !== r.id))} className="text-xs text-gray-400 hover:text-red-500">删除</button>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-3">
        <input type="time" className="border rounded-lg px-2 py-2 text-sm" value={time} onChange={(e) => setTime(e.target.value)} />
        <input className="border rounded-lg px-2 py-2 text-sm flex-1" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="提醒内容" />
        <button onClick={() => save([...reminders, { id: Date.now(), time, label, enabled: true }])} className="bg-teal-700 text-white rounded-lg px-4 text-sm font-medium">加入</button>
      </div>
      <p className="text-xs text-gray-400 mt-3 leading-relaxed">注意：网页只能在「App 开着」时到点提醒。要 App 关着也收到（像闹钟），最可靠的是手机自带闹钟。</p>
    </Card>
  );
}

function SettingsView({ me, family, setFamily }: any) {
  const [newEmail, setNewEmail] = useState("");
  async function add() {
    const e = norm(newEmail); if (!e || family.some((m: Member) => m.email === e)) { setNewEmail(""); return; }
    const next = [...family, { email: e, name: e.split("@")[0], isAdmin: false }];
    setFamily(next); await dbPut("family", next); setNewEmail("");
  }
  async function remove(e: string) {
    const next = family.filter((m: Member) => m.email !== e);
    setFamily(next); await dbPut("family", next);
  }
  return (
    <Card>
      <H>设置 · 家人名单</H>
      <div className="space-y-2">
        {family.map((m: Member) => (
          <div key={m.email} className="flex items-center justify-between border rounded-lg px-3 py-2 text-sm">
            <span>{m.email}{m.isAdmin && <span className="text-teal-700 text-xs"> · 管理员</span>}{m.email === me.email && <span className="text-gray-400 text-xs"> (你)</span>}</span>
            {me.isAdmin && !m.isAdmin && <button onClick={() => remove(m.email)} className="text-xs text-gray-400 hover:text-red-500">移除</button>}
          </div>
        ))}
      </div>
      {me.isAdmin ? (
        <div className="flex gap-2 mt-3">
          <input className="border rounded-lg px-3 py-2 text-sm flex-1" placeholder="加入家人 Gmail" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          <button onClick={add} className="bg-teal-700 text-white rounded-lg px-4 text-sm font-medium">加入</button>
        </div>
      ) : <p className="text-xs text-gray-400 mt-3">只有管理员能修改名单。</p>}
      <p className="text-xs text-gray-400 mt-4 leading-relaxed">加入的家人需用<b>该 Gmail</b> Google 登录才能进。身份由 Google 验证，名单决定能否看到数据。</p>
    </Card>
  );
}

function Field({ label, children }: any) {
  return <label className="block text-sm"><span className="text-gray-500 text-xs">{label}</span><div className="mt-1">{children}</div></label>;
}
function Stat({ label, value, warn }: any) {
  return (
    <div className={`rounded-lg p-3 ${warn ? "bg-orange-50" : "bg-gray-50"}`}>
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`font-semibold ${warn ? "text-orange-600" : "text-gray-800"}`}>{value}</div>
    </div>
  );
}
