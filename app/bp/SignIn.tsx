"use client";
import React, { useEffect, useState } from "react";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"email" | "code">("email");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("bp-font-scale");
    const scale = saved ? parseFloat(saved) : 1.5;
    document.documentElement.style.fontSize = `${scale * 16}px`;
    return () => { document.documentElement.style.fontSize = ""; };
  }, []);

  async function sendCode() {
    setErr(""); setInfo(""); setLoading(true);
    try {
      const r = await fetch("/api/auth/request-otp", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const d = await r.json();
      if (!r.ok) {
        if (d.error === "not_allowed") setErr("这个 Email 不在家人名单内。请让管理员加入。");
        else if (d.error === "cooldown") setErr("刚发送过，请等 30 秒再试。");
        else setErr("发送失败，请稍后再试。");
        return;
      }
      setStage("code");
      setInfo(`验证码已发送到 ${email}，请查看邮箱（包括垃圾邮件夹）。`);
    } catch {
      setErr("网络错误，请稍后再试。");
    } finally {
      setLoading(false);
    }
  }

  async function verify() {
    setErr(""); setLoading(true);
    try {
      const r = await fetch("/api/auth/verify-otp", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      if (!r.ok) { setErr("验证码不对或已过期，请重试。"); return; }
      window.location.href = "/bp";
    } catch {
      setErr("网络错误，请稍后再试。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-teal-50 grid place-items-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-teal-800">妈妈血压心率记录</h1>
        <p className="text-gray-500 text-sm mb-6">家庭共享 · 用邮箱验证码登录</p>

        {stage === "email" && (
          <>
            <label className="block text-sm mb-1 text-gray-600">你的 Email</label>
            <input
              className="w-full border rounded-lg px-3 py-2 mb-3"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendCode()}
            />
            {err && <p className="text-red-600 text-sm mb-3">{err}</p>}
            <button onClick={sendCode} disabled={loading || !email}
              className="w-full bg-teal-700 text-white rounded-lg py-2.5 font-medium disabled:opacity-50">
              {loading ? "发送中…" : "发送验证码"}
            </button>
          </>
        )}

        {stage === "code" && (
          <>
            {info && <p className="text-teal-700 text-sm mb-3">{info}</p>}
            <label className="block text-sm mb-1 text-gray-600">6 位验证码</label>
            <input
              className="w-full border rounded-lg px-3 py-2 mb-3 text-center text-2xl tracking-widest font-mono"
              placeholder="••••••"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && verify()}
            />
            {err && <p className="text-red-600 text-sm mb-3">{err}</p>}
            <button onClick={verify} disabled={loading || code.length !== 6}
              className="w-full bg-teal-700 text-white rounded-lg py-2.5 font-medium disabled:opacity-50">
              {loading ? "验证中…" : "登录"}
            </button>
            <button onClick={() => { setStage("email"); setCode(""); setErr(""); setInfo(""); }}
              className="w-full text-xs text-gray-400 underline mt-3">换一个 Email</button>
          </>
        )}

        <p className="text-xs text-gray-400 mt-4 leading-relaxed">
          只有在家人名单内的 Email 才能收到验证码。验证码会发到该邮箱，
          所以别人就算知道你的 email，没有你的邮箱也无法登录。
        </p>
      </div>
    </div>
  );
}
