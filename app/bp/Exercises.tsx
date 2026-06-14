"use client";
import React from "react";

const C = "#0f766e"; // figure
const G = "#9aa3af"; // furniture
const A = "#ea580c"; // arrow / motion

function L(x1: number, y1: number, x2: number, y2: number, s = C, w = 3.5) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={s} strokeWidth={w} strokeLinecap="round" />;
}
function Head(cx: number, cy: number, r = 7) {
  return <circle cx={cx} cy={cy} r={r} fill="none" stroke={C} strokeWidth={3.5} />;
}
function Arrow(x1: number, y1: number, x2: number, y2: number) {
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const a = 6;
  return (
    <>
      {L(x1, y1, x2, y2, A, 3)}
      {L(x2, y2, x2 - a * Math.cos(ang - 0.5), y2 - a * Math.sin(ang - 0.5), A, 3)}
      {L(x2, y2, x2 - a * Math.cos(ang + 0.5), y2 - a * Math.sin(ang + 0.5), A, 3)}
    </>
  );
}

const Svg = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 120 110" className="w-24 h-24 shrink-0">{children}</svg>
);

const Ex1 = () => (
  <Svg>
    {/* chair */}
    {L(14, 40, 14, 92, G, 3)}{L(14, 62, 34, 62, G, 3)}{L(34, 62, 34, 92, G, 3)}
    {/* sitting */}
    {Head(24, 30)}{L(24, 37, 24, 44)}{L(24, 44, 24, 62)}{L(24, 62, 38, 62)}{L(38, 62, 38, 90)}{L(38, 90, 46, 90)}
    {L(24, 47, 34, 55)}
    {/* arrow */}
    {Arrow(54, 52, 70, 44)}
    {/* standing */}
    {Head(90, 22)}{L(90, 29, 90, 36)}{L(90, 36, 90, 60)}{L(90, 60, 90, 90)}{L(90, 90, 98, 90)}
    {L(90, 40, 90, 58)}
  </Svg>
);

const Ex2 = () => (
  <Svg>
    {/* chair/rail support */}
    {L(86, 20, 86, 92, G, 3)}{L(72, 30, 86, 30, G, 3)}
    {/* figure on tiptoe */}
    {Head(40, 22)}{L(40, 29, 40, 36)}{L(40, 36, 40, 64)}{L(40, 64, 40, 86)}{L(40, 86, 50, 92)}
    {L(40, 40, 72, 32)}
    {Arrow(28, 88, 28, 64)}
  </Svg>
);

const Ex3 = () => (
  <Svg>
    {/* wall */}
    {L(20, 14, 20, 96, G, 4)}
    {/* partial squat against wall */}
    {Head(30, 24)}{L(30, 31, 30, 38)}{L(30, 38, 30, 58)}{L(30, 58, 56, 58)}{L(56, 58, 56, 90)}{L(56, 90, 64, 90)}
    {L(30, 42, 44, 50)}
  </Svg>
);

const Ex4 = () => (
  <Svg>
    {L(14, 40, 14, 92, G, 3)}{L(14, 62, 34, 62, G, 3)}{L(34, 62, 34, 92, G, 3)}
    {Head(24, 30)}{L(24, 37, 24, 44)}{L(24, 44, 24, 62)}
    {/* support leg down */}
    {L(24, 62, 36, 62)}{L(36, 62, 36, 90)}{L(36, 90, 44, 90)}
    {/* extended leg */}
    {L(24, 62, 50, 63, A)}{L(50, 63, 78, 64, A)}
    {Arrow(58, 76, 76, 70)}
  </Svg>
);

const Ex5 = () => (
  <Svg>
    {L(88, 18, 88, 92, G, 3)}{L(74, 30, 88, 30, G, 3)}
    {/* standing leg */}
    {Head(38, 22)}{L(38, 29, 38, 36)}{L(38, 36, 38, 60)}{L(38, 60, 38, 90)}{L(38, 90, 46, 90)}
    {/* lifted knee */}
    {L(38, 60, 54, 64, A)}{L(54, 64, 52, 42, A)}{L(52, 42, 60, 40, A)}
    {/* arm to rail */}
    {L(38, 40, 74, 32)}
    {Arrow(60, 58, 60, 44)}
  </Svg>
);

const Ex6 = () => (
  <Svg>
    {Head(52, 22)}{L(52, 29, 52, 36)}{L(52, 36, 52, 62)}
    {L(52, 62, 40, 78)}{L(40, 78, 34, 94)}
    {L(52, 62, 66, 78)}{L(66, 78, 74, 94)}
    {L(52, 42, 62, 52)}
    {Arrow(84, 56, 102, 56)}
  </Svg>
);

const items = [
  { svg: <Ex1 />, name: "1. 坐站训练　★最重要", how: "坐稳椅子，双手抱胸（站不起来时可先撑膝盖借力），慢慢站起、再慢慢坐下。练蹲下和起身的肌肉。", tgt: "5–10 下 × 2–3 组" },
  { svg: <Ex2 />, name: "2. 提踵踮脚", how: "扶着椅背或台面，踮起脚尖停 2 秒，再慢慢放下脚跟。练小腿，对上楼梯有帮助。", tgt: "10 下 × 2 组" },
  { svg: <Ex3 />, name: "3. 靠墙半蹲", how: "背靠墙，双脚离墙一步，慢慢下滑成微蹲，停几秒后起身。膝盖不要超过脚尖。", tgt: "停 5–10 秒 × 5 次" },
  { svg: <Ex4 />, name: "4. 坐姿伸腿", how: "坐稳椅子，把一条腿向前伸直、停 2 秒，再放下。两腿轮流。练大腿前侧。", tgt: "每腿 10 下 × 2 组" },
  { svg: <Ex5 />, name: "5. 扶栏踏步", how: "扶着栏杆或台面，原地抬高膝盖踏步，像慢慢走路。练平衡与上楼梯协调。", tgt: "1–2 分钟" },
  { svg: <Ex6 />, name: "6. 散步", how: "在平地走一走，累了就休息。天气好可顺便晒太阳补维生素 D。", tgt: "10–20 分钟" },
];

export default function Exercises() {
  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-teal-50 border border-teal-200 p-3 text-sm text-gray-700">
        <b>安全第一：</b>每个动作旁边都要有椅子或扶手可抓稳；动作要慢、不要憋气；量力而为。
        因为腹部有肿块，<b>避免压迫或拉扯腹部的动作</b>；加大强度前先问医生。
      </div>
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 bg-white">
          <div className="rounded-lg bg-gray-50 p-1">{it.svg}</div>
          <div className="min-w-0">
            <div className="font-semibold text-gray-800">{it.name}</div>
            <div className="text-sm text-gray-600 mt-0.5">{it.how}</div>
            <div className="text-sm text-teal-700 mt-1">目标：{it.tgt}</div>
          </div>
        </div>
      ))}
      <p className="text-xs text-gray-400">
        弹力带也可坐着练：把带子套脚掌，慢慢蹬腿/勾脚/下踩。仍然不要用斜板或倒立动作。
      </p>
    </div>
  );
}
