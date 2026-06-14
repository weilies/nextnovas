"use client";
import { signIn } from "next-auth/react";

export default function SignIn() {
  return (
    <div className="min-h-screen bg-teal-50 grid place-items-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 text-center">
        <h1 className="text-2xl font-bold text-teal-800">妈妈血压心率记录</h1>
        <p className="text-gray-500 text-sm mb-6">家庭共享 · 需用 Google 登录</p>
        <button
          onClick={() => signIn("google", { callbackUrl: "/bp" })}
          className="w-full border border-gray-300 rounded-lg py-2.5 font-medium flex items-center justify-center gap-2 hover:bg-gray-50"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"/>
            <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"/>
          </svg>
          用 Google 登录
        </button>
        <p className="text-xs text-gray-400 mt-4 leading-relaxed">
          只有在家人名单内的 Google 帐号才能看到数据。Google 登录用来确认「你真的拥有这个邮箱」——
          所以别人就算知道你的 email，也无法冒充登录。
        </p>
      </div>
    </div>
  );
}
