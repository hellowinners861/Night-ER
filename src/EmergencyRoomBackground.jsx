const getBayLayout = (index, bedCount) => {
  const columns = bedCount > 5 ? 5 : Math.max(4, bedCount);
  const rows = bedCount > 5 ? 2 : 1;
  const width = 1080 / columns;
  const row = Math.floor(index / columns);
  const column = index % columns;
  return {
    x: 60 + column * width,
    y: rows === 1 ? 245 : 145 + row * 265,
    width,
  };
};

function StaffFigure({ x, y, role, activity, delay = 0, scale = 1 }) {
  const doctor = role === "doctor";
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g
        className={`er-staff ${
          activity === "idle"
            ? "er-staff-idle"
            : activity === "run"
              ? "er-staff-run"
              : "er-staff-treat"
        }`}
        style={{ animationDelay: `${delay}s` }}
      >
        <ellipse cx="0" cy="39" rx="19" ry="5" fill="#0f4c5c" opacity=".13" />
        <circle cx="0" cy="-19" r="10" fill="#f1c7a5" />
        <path
          d={doctor ? "M-10-22 Q0-34 10-22 L8-14 Q0-18-8-14Z" : "M-10-23 Q0-34 10-23 L10-17 H-10Z"}
          fill={doctor ? "#334155" : "#6d28d9"}
        />
        <path d="M-13-7 Q0-12 13-7 L16 22 H-16Z" fill={doctor ? "#f8fafc" : "#38bdf8"} />
        <path d="M-7-6 V19 M7-6 V19" stroke={doctor ? "#cbd5e1" : "#e0f2fe"} strokeWidth="2" />
        {doctor ? (
          <>
            <path d="M-5-4 Q-11 3-7 10 M5-4 Q11 3 7 10" fill="none" stroke="#0f766e" strokeWidth="2" />
            <circle cx="-7" cy="11" r="3" fill="none" stroke="#0f766e" strokeWidth="2" />
          </>
        ) : (
          <path d="M-6 1 H6 M0-5 V7" stroke="#fff" strokeWidth="2.5" />
        )}
        <path d="M-10 21 L-12 39 M10 21 L12 39" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
        <path d="M-13 39 H-5 M7 39 H15" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
        <path
          className="er-staff-arm"
          d={activity === "treat" ? "M-12 1 L-25 10 L-17 17" : "M-12 1 L-20 18"}
          fill="none"
          stroke="#f1c7a5"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          className="er-staff-arm er-staff-arm-right"
          d={activity === "treat" ? "M12 1 L24 8 L17 14" : "M12 1 L20 18"}
          fill="none"
          stroke="#f1c7a5"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </g>
    </g>
  );
}

function BedBay({ bed, index, t, bedCount }) {
  const { x, y, width } = getBayLayout(index, bedCount);
  const bayWidth = width - 12;
  const occupied = Boolean(bed);
  const treating = Boolean(bed?.action);
  const remain = occupied ? Math.max(0, bed.arrivedAt + bed.limit - t) : 0;
  const red = occupied && remain / bed.limit <= 0.25;
  const monitorColor = red ? "#ef4444" : occupied ? "#10b981" : "#94a3b8";

  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="-86" width={bayWidth} height="218" rx="12" fill="#ffffff" stroke="#bae6fd" strokeWidth="3" />
      <rect x="0" y="-86" width={bayWidth} height="28" rx="10" fill={occupied ? "#dff7ff" : "#eef7fa"} />
      <text x="13" y="-67" fill="#0f5f78" fontSize="12" fontWeight="800">ER BAY {index + 1}</text>
      <circle
        className={red ? "er-alarm-light" : ""}
        cx={bayWidth - 18}
        cy="-72"
        r="6"
        fill={red ? "#ef4444" : occupied ? "#22c55e" : "#cbd5e1"}
      />

      <rect x={bayWidth - 68} y="-47" width="52" height="41" rx="5" fill="#18324a" />
      <path
        className={occupied ? "er-monitor-wave" : ""}
        d={`M${bayWidth - 62},-26 H${bayWidth - 52} l4,-9 l5,18 l5,-9 H${bayWidth - 21}`}
        fill="none"
        stroke={monitorColor}
        strokeWidth="2"
      />
      <path d={`M${bayWidth - 42},-6 V14 M${bayWidth - 52},14 H${bayWidth - 30}`} stroke="#64748b" strokeWidth="3" />

      <rect x="21" y="45" width={bayWidth - 63} height="48" rx="9" fill="#c9e8f0" stroke="#78b5c5" strokeWidth="3" />
      <rect x="15" y="35" width={bayWidth - 51} height="18" rx="7" fill="#e0f4f8" stroke="#78b5c5" strokeWidth="2" />
      <path d={`M28,94 V117 M${bayWidth - 50},94 V117`} stroke="#64748b" strokeWidth="5" />
      <circle cx="28" cy="121" r="6" fill="#475569" />
      <circle cx={bayWidth - 50} cy="121" r="6" fill="#475569" />
      <path d={`M9,31 H${bayWidth - 4}`} stroke="#64748b" strokeWidth="5" strokeLinecap="round" />

      {occupied ? (
        <g className={treating ? "er-patient-treatment" : ""}>
          <ellipse cx="61" cy="42" rx="17" ry="13" fill="#f1c7a5" />
          <path d="M45 39 Q61 22 77 39" fill="#475569" />
          <path d={`M76,46 Q${bayWidth - 72},48 ${bayWidth - 49},75 H65Z`} fill="#7dd3fc" />
          <path d={`M73,50 Q${bayWidth - 81},62 ${bayWidth - 55},73`} fill="none" stroke="#e0f2fe" strokeWidth="3" />
        </g>
      ) : (
        <g opacity=".55">
          <rect x="47" y="55" width={bayWidth - 103} height="23" rx="8" fill="#f8fafc" />
          <text x={bayWidth / 2} y="72" textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="700">READY</text>
        </g>
      )}

      {occupied && (
        <g>
          <path d="M18-28 V28" stroke="#64748b" strokeWidth="4" />
          <path d="M9-28 H27" stroke="#64748b" strokeWidth="4" />
          <rect className={treating ? "er-iv-drip" : ""} x="10" y="-22" width="16" height="25" rx="4" fill="#dbeafe" stroke="#38bdf8" />
          <path d="M18 3 V33" stroke="#38bdf8" strokeWidth="2" />
        </g>
      )}
    </g>
  );
}

function EquipmentCart({ active, crowded }) {
  return (
    <g transform="translate(110 690)">
      <g className={active ? `er-equipment-cart ${crowded ? "er-equipment-cart-fast" : ""}` : ""}>
      <rect x="0" y="-36" width="82" height="43" rx="7" fill="#f8fafc" stroke="#0284c7" strokeWidth="3" />
      <rect x="11" y="-27" width="25" height="18" rx="3" fill="#16324b" />
      <path className="er-monitor-wave" d="M14-18 H19 l3,-6 l4,12 l4,-6 h4" fill="none" stroke="#34d399" strokeWidth="2" />
      <rect x="46" y="-26" width="24" height="7" rx="2" fill="#f59e0b" />
      <rect x="46" y="-14" width="24" height="7" rx="2" fill="#38bdf8" />
      <path d="M7 8 V18 M75 8 V18" stroke="#475569" strokeWidth="4" />
      <circle className="er-cart-wheel" cx="7" cy="21" r="6" fill="#334155" />
      <circle className="er-cart-wheel" cx="75" cy="21" r="6" fill="#334155" />
      </g>
    </g>
  );
}

export default function EmergencyRoomBackground({
  beds,
  t,
  incoming,
  paused,
  danger,
}) {
  const occupied = beds.filter(Boolean);
  const treating = occupied.filter((bed) => bed.action);
  const staffAtBeds = beds.flatMap((bed, index) => {
    if (!bed) return [];
    const layout = getBayLayout(index, beds.length);
    const baseX = layout.x + layout.width * 0.67;
    const baseY = layout.y + 75;
    const team = [{
      x: baseX,
      y: baseY,
      role: index % 3 === 0 ? "doctor" : "nurse",
      activity: "treat",
      delay: -(index % 4) * 0.19,
      scale: beds.length > 5 ? 0.78 : 0.92,
    }];
    if (bed.action) {
      team.push({
        x: baseX - 38,
        y: baseY + 6,
        role: index % 2 === 0 ? "nurse" : "doctor",
        activity: "treat",
        delay: -0.35,
        scale: beds.length > 5 ? 0.72 : 0.86,
      });
    }
    return team;
  }).slice(0, 14);
  const intensity = Math.min(3, Math.ceil(occupied.length / 2) + (incoming ? 1 : 0));

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden bg-sky-50 ${paused ? "er-scene-paused" : ""}`}
    >
      <style>{`
        @keyframes erLight { 0%,100% { opacity: .78; } 50% { opacity: 1; } }
        @keyframes erWave { to { stroke-dashoffset: -48; } }
        @keyframes erTreat { 0%,100% { transform: translateY(0) rotate(-1deg); } 50% { transform: translateY(-3px) rotate(2deg); } }
        @keyframes erArm { 0%,100% { transform: rotate(-4deg); } 50% { transform: rotate(8deg); } }
        @keyframes erIdle { 0% { transform: translateX(-22px); } 45% { transform: translateX(32px); } 55% { transform: translateX(32px) scaleX(-1); } 100% { transform: translateX(-22px) scaleX(-1); } }
        @keyframes erRun { 0% { transform: translateX(-80px); } 48% { transform: translateX(470px); } 52% { transform: translateX(470px) scaleX(-1); } 100% { transform: translateX(-80px) scaleX(-1); } }
        @keyframes erCart { 0% { transform: translateX(0); } 48% { transform: translateX(880px); } 52% { transform: translateX(880px); } 100% { transform: translateX(0); } }
        @keyframes erWheel { to { transform: rotate(360deg); } }
        @keyframes erAlarm { 0%,42%,100% { opacity: 1; filter: drop-shadow(0 0 0 #ef4444); } 50%,92% { opacity: .25; filter: drop-shadow(0 0 8px #ef4444); } }
        @keyframes erDrip { 0%,100% { fill: #dbeafe; } 50% { fill: #7dd3fc; } }
        @keyframes erPatient { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-1.5px); } }
        .er-ceiling-light { animation: erLight 3.8s ease-in-out infinite; }
        .er-monitor-wave { stroke-dasharray: 8 4; animation: erWave 1.2s linear infinite; }
        .er-staff { transform-box: fill-box; transform-origin: center bottom; }
        .er-staff-treat { animation: erTreat .72s ease-in-out infinite; }
        .er-staff-idle { animation: erIdle 8s ease-in-out infinite; }
        .er-staff-run { animation: erRun 8s linear infinite; }
        .er-staff-arm { transform-box: fill-box; transform-origin: top center; animation: erArm .62s ease-in-out infinite; }
        .er-staff-arm-right { animation-delay: -.31s; }
        .er-equipment-cart { animation: erCart 14s ease-in-out infinite; }
        .er-equipment-cart-fast { animation-duration: 7s; }
        .er-cart-wheel { transform-box: fill-box; transform-origin: center; animation: erWheel 1s linear infinite; }
        .er-alarm-light { animation: erAlarm .75s linear infinite; }
        .er-iv-drip { animation: erDrip 1.2s ease-in-out infinite; }
        .er-patient-treatment { animation: erPatient .7s ease-in-out infinite; }
        .er-scene-paused * { animation-play-state: paused !important; }
        @media (prefers-reduced-motion: reduce) {
          .er-ceiling-light,.er-monitor-wave,.er-staff,.er-staff-arm,.er-equipment-cart,.er-cart-wheel,.er-alarm-light,.er-iv-drip,.er-patient-treatment { animation: none !important; }
        }
      `}</style>
      <svg
        viewBox="0 0 1200 760"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
      >
        <defs>
          <linearGradient id="er-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#dff5fb" />
          </linearGradient>
          <linearGradient id="er-floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d9f2f3" />
            <stop offset="1" stopColor="#b7dcdf" />
          </linearGradient>
          <pattern id="er-floor-grid" width="74" height="42" patternUnits="userSpaceOnUse">
            <path d="M0 42 H74 M74 0 V42" stroke="#86b9bd" strokeWidth="1" opacity=".42" />
          </pattern>
        </defs>

        <rect width="1200" height="525" fill="url(#er-wall)" />
        <rect y="525" width="1200" height="235" fill="url(#er-floor)" />
        <rect y="525" width="1200" height="235" fill="url(#er-floor-grid)" />
        <rect y="104" width="1200" height="8" fill="#38bdf8" opacity=".55" />
        <rect y="0" width="1200" height="86" fill="#f8fdff" />

        {[90, 330, 570, 810, 1050].map((x, index) => (
          <g key={x} className="er-ceiling-light" style={{ animationDelay: `${-index * 0.45}s` }}>
            <rect x={x - 82} y="23" width="164" height="24" rx="9" fill="#d9faff" stroke="#7dd3fc" />
            <path d={`M${x - 68} 35 H${x + 68}`} stroke="#ffffff" strokeWidth="7" strokeLinecap="round" />
          </g>
        ))}

        <g transform="translate(28 123)">
          <rect width="214" height="61" rx="10" fill="#0e7490" opacity=".94" />
          <text x="18" y="25" fill="#cffafe" fontSize="12" fontWeight="800">EMERGENCY DEPARTMENT</text>
          <text x="18" y="47" fill="#fff" fontSize="17" fontWeight="900">
            {occupied.length} / {beds.length} BEDS ACTIVE
          </text>
        </g>

        <g transform="translate(994 119)">
          <rect width="176" height="72" rx="10" fill="#ffffff" stroke="#7dd3fc" strokeWidth="3" />
          <path d="M20 18 H48 M34 4 V32" stroke="#ef4444" strokeWidth="7" />
          <text x="61" y="22" fill="#075985" fontSize="13" fontWeight="900">救急処置室</text>
          <text x="61" y="44" fill="#64748b" fontSize="11">{incoming ? "搬送受入準備中" : treating.length > 0 ? "処置進行中" : "通常運用"}</text>
          <circle cx="151" cy="55" r="8" fill={incoming ? "#f59e0b" : "#22c55e"} className={incoming ? "er-alarm-light" : ""} />
        </g>

        {beds.map((bed, index) => (
          <BedBay key={index} bed={bed} index={index} t={t} bedCount={beds.length} />
        ))}

        {occupied.length === 0 ? (
          <>
            <StaffFigure x={355} y={650} role="nurse" activity="idle" delay={-1.2} scale={1.05} />
            <StaffFigure x={610} y={647} role="doctor" activity="idle" delay={-4.1} scale={1.08} />
            <StaffFigure x={850} y={652} role="nurse" activity="idle" delay={-6.4} scale={1.03} />
          </>
        ) : (
          <>
            {staffAtBeds.map((staff, index) => <StaffFigure key={index} {...staff} />)}
            {Array.from({ length: intensity }, (_, index) => (
              <StaffFigure
                key={`runner-${index}`}
                x={95 + index * 105}
                y={655 + (index % 2) * 22}
                role={index % 2 ? "doctor" : "nurse"}
                activity="run"
                delay={-index * 1.8}
                scale={0.92}
              />
            ))}
          </>
        )}

        <EquipmentCart active={occupied.length > 0 || incoming} crowded={occupied.length >= Math.ceil(beds.length / 2)} />

        <g transform="translate(1010 628)">
          <rect width="140" height="84" rx="8" fill="#f8fafc" stroke="#94a3b8" strokeWidth="3" />
          <rect x="15" y="13" width="110" height="34" rx="4" fill="#16324b" />
          <path className="er-monitor-wave" d="M22 31 H40 l6,-13 l8,27 l8,-14 h52" fill="none" stroke="#34d399" strokeWidth="3" />
          <rect x="16" y="58" width="47" height="9" rx="3" fill="#38bdf8" />
          <rect x="73" y="58" width="50" height="9" rx="3" fill="#f59e0b" />
        </g>
      </svg>
      <div className={`absolute inset-0 transition-colors duration-700 ${danger ? "bg-rose-200/20" : "bg-white/5"}`} />
    </div>
  );
}
