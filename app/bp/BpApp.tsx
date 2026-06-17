"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from "recharts";
import Exercises from "./Exercises";

type Member = { email: string; name: string; isAdmin?: boolean };
type Reading = { id: number; date: string; time: string; sys: number; dia: number; pulse: number; by: string; note?: string };
type Glucose = { id: number; date: string; time: string; value: number; context: "fasting" | "before" | "after" | "bed" | "other"; by: string; note?: string };
type FoodLog = { id: number; date: string; time: string; text: string; by: string };
type ClinicalReport = { id: number; date: string; title: string; hba1c?: number | null; url: string; contentType?: string; note?: string; by: string };
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

const GLUCOSE_CONTEXT: Record<Glucose["context"], string> = {
  fasting: "空腹", before: "餐前", after: "餐后", bed: "睡前", other: "其他",
};

// Reference (mmol/L), based on her lab report interpretation guide.
function classifyGlucose(value: number, context: Glucose["context"]) {
  const out: { level: "warn" | "alert"; msg: string }[] = [];
  if (context === "fasting" || context === "before") {
    if (value >= 11.1) out.push({ level: "alert", msg: `血糖很高（${value} mmol/L）。请按医生指示处理，必要时就医。` });
    else if (value >= 7.8) out.push({ level: "warn", msg: `血糖偏高（${value} mmol/L），高于空腹/餐前目标。` });
    else if (value < 4.0) out.push({ level: "alert", msg: `血糖偏低（${value} mmol/L）。若有冒冷汗/手抖/心慌，请立即补充糖分（如糖水、果汁）并留意。` });
  } else if (context === "after") {
    if (value >= 11.1) out.push({ level: "warn", msg: `餐后血糖偏高（${value} mmol/L）。` });
    else if (value < 4.0) out.push({ level: "alert", msg: `血糖偏低（${value} mmol/L）。请留意低血糖症状。` });
  } else {
    if (value >= 11.1) out.push({ level: "warn", msg: `血糖偏高（${value} mmol/L）。` });
    else if (value < 4.0) out.push({ level: "alert", msg: `血糖偏低（${value} mmol/L）。请留意低血糖症状。` });
  }
  return out;
}

const TABS = [
  ["add", "血压"], ["glucose", "血糖/饮食"], ["reports", "报告"], ["history", "历史"], ["chart", "图表"],
  ["report", "报表"], ["exercise", "运动"], ["reminder", "提醒"], ["settings", "设置"],
] as const;

export default function BpApp({ email, name }: { email: string; name: string; image?: string }) {
  const [status, setStatus] = useState<"loading" | "member" | "setup" | "denied">("loading");
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState<string>("add");
  const [family, setFamily] = useState<Member[]>([]);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [glucose, setGlucose] = useState<Glucose[]>([]);
  const [food, setFood] = useState<FoodLog[]>([]);
  const [reports, setReports] = useState<ClinicalReport[]>([]);
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
    const [rd, gl, fd, rp, rm, f] = await Promise.all([
      dbGet("readings"), dbGet("glucose"), dbGet("food"), dbGet("reports"), dbGet("reminders"), dbGet("family"),
    ]);
    setReadings((rd.data as Reading[]) || []);
    setGlucose((gl.data as Glucose[]) || []);
    setFood((fd.data as FoodLog[]) || []);
    setReports((rp.data as ClinicalReport[]) || []);
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
          {view === "glucose" && <GlucoseFoodView name={name} glucose={glucose} setGlucose={setGlucose} food={food} setFood={setFood} />}
          {view === "reports" && <ReportsView name={name} reports={reports} setReports={setReports} />}
          {view === "history" && <HistoryView readings={readings} setReadings={setReadings} />}
          {view === "chart" && <ChartView readings={readings} glucose={glucose} />}
          {view === "report" && <ReportView readings={readings} glucose={glucose} food={food} />}
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

function GlucoseFoodView({ name, glucose, setGlucose, food, setFood }: any) {
  // glucose form
  const [gd, setGd] = useState(todayStr());
  const [gtm, setGtm] = useState(nowTime());
  const [gval, setGval] = useState("");
  const [gctx, setGctx] = useState<Glucose["context"]>("fasting");
  const [gnote, setGnote] = useState("");
  const [gflash, setGflash] = useState(false);
  const gPreview = gval ? classifyGlucose(+gval, gctx) : [];

  async function saveGlucose() {
    if (!gval) return;
    const r: Glucose = { id: Date.now(), date: gd, time: gtm, value: +gval, context: gctx, by: name, note: gnote.trim() };
    const next = [...glucose, r];
    setGlucose(next); await dbPut("glucose", next);
    setGval(""); setGnote(""); setGtm(nowTime());
    setGflash(true); setTimeout(() => setGflash(false), 1500);
  }

  // food form
  const [fd, setFd] = useState(todayStr());
  const [ftm, setFtm] = useState(nowTime());
  const [ftext, setFtext] = useState("");
  const [fflash, setFflash] = useState(false);

  async function saveFood() {
    if (!ftext.trim()) return;
    const r: FoodLog = { id: Date.now(), date: fd, time: ftm, text: ftext.trim(), by: name };
    const next = [...food, r];
    setFood(next); await dbPut("food", next);
    setFtext(""); setFtm(nowTime());
    setFflash(true); setTimeout(() => setFflash(false), 1500);
  }

  async function delGlucose(id: number) {
    if (!confirm("确定删除这笔血糖记录？")) return;
    const next = glucose.filter((g: Glucose) => g.id !== id);
    setGlucose(next); await dbPut("glucose", next);
  }
  async function delFood(id: number) {
    if (!confirm("确定删除这笔饮食记录？")) return;
    const next = food.filter((f: FoodLog) => f.id !== id);
    setFood(next); await dbPut("food", next);
  }

  const recentGlucose = [...glucose].sort((a: Glucose, b: Glucose) => (b.date + b.time).localeCompare(a.date + a.time)).slice(0, 8);
  const recentFood = [...food].sort((a: FoodLog, b: FoodLog) => (b.date + b.time).localeCompare(a.date + a.time)).slice(0, 8);

  return (
    <div className="space-y-4">
      <Card>
        <H>新增血糖</H>
        <div className="grid grid-cols-2 gap-3">
          <Field label="日期"><input type="date" className="inp" value={gd} onChange={(e) => setGd(e.target.value)} /></Field>
          <Field label="时间"><input type="time" className="inp" value={gtm} onChange={(e) => setGtm(e.target.value)} /></Field>
          <Field label="血糖值 (mmol/L)"><input type="number" step="0.1" className="inp" value={gval} onChange={(e) => setGval(e.target.value)} placeholder="例如 7.2" /></Field>
          <Field label="测量时机">
            <select className="inp" value={gctx} onChange={(e) => setGctx(e.target.value as Glucose["context"])}>
              {Object.entries(GLUCOSE_CONTEXT).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Field>
          <div className="col-span-2">
            <Field label="备注（可选）"><input className="inp" value={gnote} onChange={(e) => setGnote(e.target.value)} /></Field>
          </div>
        </div>
        {gPreview.map((p, i) => (
          <div key={i} className={`mt-3 rounded-lg p-3 text-sm ${p.level === "alert" ? "bg-red-50 text-red-700 border border-red-200" : "bg-orange-50 text-orange-700 border border-orange-200"}`}>⚠️ {p.msg}</div>
        ))}
        <p className="text-xs text-gray-400 mt-3">
          参考：空腹/餐前 3.9–7.7 正常，7.8–11.0 偏高，≥11.1 糖尿病范围；&lt;4.0 偏低需留意低血糖。
        </p>
        <button onClick={saveGlucose} className="w-full mt-4 bg-teal-700 text-white rounded-lg py-2.5 font-medium hover:bg-teal-800">
          {gflash ? "已保存 ✓" : "保存血糖"}
        </button>
      </Card>

      <Card>
        <H>新增饮食记录</H>
        <div className="grid grid-cols-2 gap-3">
          <Field label="日期"><input type="date" className="inp" value={fd} onChange={(e) => setFd(e.target.value)} /></Field>
          <Field label="时间"><input type="time" className="inp" value={ftm} onChange={(e) => setFtm(e.target.value)} /></Field>
          <div className="col-span-2">
            <Field label="吃了什么"><input className="inp" value={ftext} onChange={(e) => setFtext(e.target.value)} placeholder="例如：白粥 + 一个鸡蛋" /></Field>
          </div>
        </div>
        <button onClick={saveFood} className="w-full mt-4 bg-teal-700 text-white rounded-lg py-2.5 font-medium hover:bg-teal-800">
          {fflash ? "已保存 ✓" : "保存饮食"}
        </button>
        <style>{`.inp{width:100%;border:1px solid #d1d5db;border-radius:.5rem;padding:.5rem .75rem}`}</style>
      </Card>

      <Card>
        <H>最近血糖</H>
        {recentGlucose.length === 0 ? <p className="text-gray-400 text-sm">还没有记录。</p> : (
          <div className="space-y-2">
            {recentGlucose.map((g: Glucose) => {
              const flags = classifyGlucose(g.value, g.context);
              const bad = flags.some((f) => f.level === "alert");
              const warn = flags.some((f) => f.level === "warn");
              return (
                <div key={g.id} className="border rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-400">{g.date} {g.time} · {GLUCOSE_CONTEXT[g.context]} · {g.by}</div>
                    <div className={`mt-1 ${bad ? "text-red-600 font-bold" : warn ? "text-orange-600 font-semibold" : "text-gray-800"}`}>
                      {g.value} <span className="text-xs text-gray-400">mmol/L</span>
                    </div>
                    {g.note && <div className="text-xs text-gray-500 mt-1">{g.note}</div>}
                  </div>
                  <button onClick={() => delGlucose(g.id)} className="text-xs text-gray-400 hover:text-red-500">✕</button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card>
        <H>最近饮食</H>
        {recentFood.length === 0 ? <p className="text-gray-400 text-sm">还没有记录。</p> : (
          <div className="space-y-2">
            {recentFood.map((f: FoodLog) => (
              <div key={f.id} className="border rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-400">{f.date} {f.time} · {f.by}</div>
                  <div className="mt-1 text-gray-800">{f.text}</div>
                </div>
                <button onClick={() => delFood(f.id)} className="text-xs text-gray-400 hover:text-red-500">✕</button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function ReportsView({ name, reports, setReports }: any) {
  const [date, setDate] = useState(todayStr());
  const [title, setTitle] = useState("");
  const [hba1c, setHba1c] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = React.useRef<HTMLInputElement>(null);

  async function save() {
    setErr("");
    if (!file) { setErr("请先选择报告文件（PDF 或照片）。"); return; }
    if (!title.trim()) { setErr("请填写报告名称，例如「6月化验报告」。"); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const up = await fetch("/api/upload", { method: "POST", body: fd });
      if (!up.ok) {
        const d = await up.json().catch(() => ({}));
        if (d.error === "too_large") setErr("文件太大（上限约 4MB），请压缩或拍清楚一点。");
        else setErr(`上传失败：${d.detail || d.error || "未知错误"}`);
        return;
      }
      const blob = await up.json();
      const rec: ClinicalReport = {
        id: Date.now(), date, title: title.trim(),
        hba1c: hba1c ? +hba1c : null,
        url: blob.url, contentType: blob.contentType, note: note.trim(), by: name,
      };
      const next = [...reports, rec];
      setReports(next); await dbPut("reports", next);
      setTitle(""); setHba1c(""); setNote(""); setFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch {
      setErr("网络错误，请重试。");
    } finally {
      setUploading(false);
    }
  }

  async function del(id: number) {
    if (!confirm("确定删除这份报告记录？（已上传的文件链接也会从列表移除）")) return;
    const next = reports.filter((r: ClinicalReport) => r.id !== id);
    setReports(next); await dbPut("reports", next);
  }

  const sorted = [...reports].sort((a: ClinicalReport, b: ClinicalReport) => b.date.localeCompare(a.date));
  const hbaPoints = [...reports]
    .filter((r: ClinicalReport) => typeof r.hba1c === "number" && r.hba1c)
    .sort((a: ClinicalReport, b: ClinicalReport) => a.date.localeCompare(b.date))
    .map((r: ClinicalReport) => ({ label: r.date, HbA1c: r.hba1c }));

  return (
    <div className="space-y-4">
      <Card>
        <H>上传化验报告</H>
        <div className="grid grid-cols-2 gap-3">
          <Field label="报告日期"><input type="date" className="inp" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
          <Field label="HbA1c % (可选)"><input type="number" step="0.1" className="inp" value={hba1c} onChange={(e) => setHba1c(e.target.value)} placeholder="例如 9.9" /></Field>
          <div className="col-span-2">
            <Field label="报告名称"><input className="inp" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例如：6月 Innoquest 化验报告" /></Field>
          </div>
          <div className="col-span-2">
            <Field label="备注（可选）"><input className="inp" value={note} onChange={(e) => setNote(e.target.value)} placeholder="例如：肝功能偏高，待复查" /></Field>
          </div>
          <div className="col-span-2">
            <Field label="报告文件（PDF 或拍照）">
              <input ref={fileRef} type="file" accept="application/pdf,image/*"
                className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-50 file:px-3 file:py-2 file:text-teal-700"
                onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </Field>
          </div>
        </div>
        {err && <div className="mt-3 rounded-lg p-3 text-sm bg-red-50 text-red-700 border border-red-200">{err}</div>}
        <button onClick={save} disabled={uploading}
          className="w-full mt-4 bg-teal-700 text-white rounded-lg py-2.5 font-medium hover:bg-teal-800 disabled:opacity-50">
          {uploading ? "上传中…" : "上传并保存"}
        </button>
        <p className="text-xs text-gray-400 mt-3">文件上限约 4MB。HbA1c 填了之后会自动画进下面的趋势图。</p>
        <style>{`.inp{width:100%;border:1px solid #d1d5db;border-radius:.5rem;padding:.5rem .75rem}`}</style>
      </Card>

      {hbaPoints.length >= 1 && (
        <Card>
          <H>HbA1c 趋势（目标 ~7–8%）</H>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <LineChart data={hbaPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[5, 12]} />
                <Tooltip />
                <ReferenceLine y={7} stroke="#15803d" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="HbA1c" stroke="#9333ea" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-400 mt-1">— — 绿线 = 目标 7%。越往下越好。</p>
        </Card>
      )}

      <Card>
        <H>已上传的报告</H>
        {sorted.length === 0 ? <p className="text-gray-400 text-sm">还没有上传报告。</p> : (
          <div className="space-y-2">
            {sorted.map((r: ClinicalReport) => (
              <div key={r.id} className="border rounded-lg p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-gray-400">{r.date} · {r.by}</div>
                  <div className="text-gray-800 font-medium truncate">{r.title}</div>
                  {typeof r.hba1c === "number" && r.hba1c ? <div className="text-sm text-purple-700">HbA1c {r.hba1c}%</div> : null}
                  {r.note && <div className="text-xs text-gray-500 mt-0.5">{r.note}</div>}
                  <a href={`/api/report-file?u=${encodeURIComponent(r.url)}`} target="_blank" rel="noreferrer" className="text-sm text-teal-700 underline">查看 / 下载文件</a>
                </div>
                <button onClick={() => del(r.id)} className="text-xs text-gray-400 hover:text-red-500 shrink-0">✕</button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
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

function ChartView({ readings, glucose }: any) {
  // Merge BP readings and glucose readings into one timeline by date+time.
  const bpPoints = [...readings].map((r: Reading) => ({ key: r.date + " " + r.time, label: `${r.date.slice(5)} ${r.time}`, SYS: r.sys, DIA: r.dia, 心率: r.pulse }));
  const glPoints = [...(glucose || [])].map((g: Glucose) => ({ key: g.date + " " + g.time, label: `${g.date.slice(5)} ${g.time}`, 血糖: g.value }));
  const byKey = new Map<string, any>();
  for (const p of bpPoints) byKey.set(p.key, { ...(byKey.get(p.key) || {}), ...p });
  for (const p of glPoints) byKey.set(p.key, { ...(byKey.get(p.key) || {}), ...p });
  const data = [...byKey.values()].sort((a, b) => a.key.localeCompare(b.key));
  const hasGlucose = glPoints.length > 0;

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
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} domain={[40, 160]} />
                {hasGlucose && <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} domain={[0, 16]} />}
                <Tooltip /><Legend />
                <ReferenceLine yAxisId="left" y={100} stroke="#dc2626" strokeDasharray="4 4" />
                <Line yAxisId="left" type="monotone" dataKey="SYS" stroke="#0f766e" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                <Line yAxisId="left" type="monotone" dataKey="DIA" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                <Line yAxisId="left" type="monotone" dataKey="心率" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                {hasGlucose && <Line yAxisId="right" type="monotone" dataKey="血糖" stroke="#9333ea" strokeWidth={2} dot={{ r: 3 }} connectNulls />}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-400 mt-1">— — 红色虚线 = 心率 100 参考线{hasGlucose && "；紫色 = 血糖 (mmol/L，右侧刻度)"}</p>
        </>
      )}
    </Card>
  );
}

function ReportView({ readings, glucose, food }: any) {
  const [copied, setCopied] = useState(false);
  const n = readings.length;
  const sorted = [...readings].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const avg = (k: keyof Reading) => n ? Math.round(readings.reduce((s: number, r: Reading) => s + (r[k] as number), 0) / n) : 0;
  const pulses = readings.map((r: Reading) => r.pulse);
  const high = pulses.filter((p: number) => p > 100).length;
  const range = n ? `${sorted[0].date} → ${sorted[n - 1].date}` : "-";

  const gSorted = [...(glucose || [])].sort((a: Glucose, b: Glucose) => (a.date + a.time).localeCompare(b.date + b.time));
  const gn = gSorted.length;
  const gAvg = gn ? (gSorted.reduce((s: number, g: Glucose) => s + g.value, 0) / gn).toFixed(1) : "-";
  const gHigh = gSorted.filter((g: Glucose) => g.value >= 11.1).length;
  const gLow = gSorted.filter((g: Glucose) => g.value < 4.0).length;

  const fSorted = [...(food || [])].sort((a: FoodLog, b: FoodLog) => (a.date + a.time).localeCompare(b.date + b.time));

  let text = n === 0 ? "" :
    `妈妈血压心率记录摘要\n日期范围: ${range}\n记录次数: ${n}\n血压平均: ${avg("sys")}/${avg("dia")} mmHg\n心率平均: ${avg("pulse")} /min (范围 ${Math.min(...pulses)}–${Math.max(...pulses)})\n心率>100次数: ${high} / ${n}\n\n明细:\n` +
    sorted.map((r: Reading) => `${r.date} ${r.time}  ${r.sys}/${r.dia}  ${r.pulse}${r.pulse > 100 ? " *" : ""}  ${r.by}${r.note ? "  " + r.note : ""}`).join("\n");

  if (gn > 0) {
    text += `\n\n血糖记录摘要\n记录次数: ${gn}\n平均血糖: ${gAvg} mmol/L\n≥11.1 (偏高) 次数: ${gHigh} / ${gn}\n<4.0 (偏低) 次数: ${gLow} / ${gn}\n\n明细:\n` +
      gSorted.map((g: Glucose) => `${g.date} ${g.time}  ${g.value} mmol/L (${GLUCOSE_CONTEXT[g.context]})${g.value >= 11.1 || g.value < 4.0 ? " *" : ""}  ${g.by}${g.note ? "  " + g.note : ""}`).join("\n");
  }
  if (fSorted.length > 0) {
    text += `\n\n饮食记录\n` + fSorted.map((f: FoodLog) => `${f.date} ${f.time}  ${f.text}  (${f.by})`).join("\n");
  }

  return (
    <Card>
      <H>给医生的报表</H>
      {n === 0 && gn === 0 ? <p className="text-gray-400 text-sm">还没有记录。</p> : (
        <>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {n > 0 && <>
              <Stat label="日期范围" value={range} />
              <Stat label="记录次数" value={n} />
              <Stat label="血压平均" value={`${avg("sys")}/${avg("dia")}`} />
              <Stat label="心率平均" value={`${avg("pulse")} /min`} />
              <Stat label="心率范围" value={`${Math.min(...pulses)}–${Math.max(...pulses)}`} />
              <Stat label="心率>100次数" value={`${high} / ${n}`} warn={high > 0} />
            </>}
            {gn > 0 && <>
              <Stat label="血糖记录次数" value={gn} />
              <Stat label="血糖平均" value={`${gAvg} mmol/L`} />
              <Stat label="血糖偏高(≥11.1)" value={`${gHigh} / ${gn}`} warn={gHigh > 0} />
              <Stat label="血糖偏低(<4.0)" value={`${gLow} / ${gn}`} warn={gLow > 0} />
            </>}
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
          <input className="border rounded-lg px-3 py-2 text-sm flex-1" placeholder="加入家人 Email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          <button onClick={add} className="bg-teal-700 text-white rounded-lg px-4 text-sm font-medium">加入</button>
        </div>
      ) : <p className="text-xs text-gray-400 mt-3">只有管理员能修改名单。</p>}
      <p className="text-xs text-gray-400 mt-4 leading-relaxed">加入的家人用<b>该 Email</b> 登录时会收到验证码，输入验证码即可进入。名单决定能否看到数据。</p>
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
