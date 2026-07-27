import { memo } from "react";

const VIEW_WIDTH = 1200;

const SKIN_TONES = ["#f4c9a8", "#dfab83", "#b97755", "#8d5338"];

const STAFF_STYLES = {
  doctor: {
    scrub: "#176b78",
    scrubDark: "#0f4d5a",
    coat: "#f8fdff",
    coatShade: "#dceff3",
    accent: "#0f9ca7",
    hair: "#263747",
  },
  nurse: {
    scrub: "#1a9db1",
    scrubDark: "#116879",
    coat: "#dff8fb",
    coatShade: "#b9e7ec",
    accent: "#ffffff",
    hair: "#4b2f32",
  },
  tech: {
    scrub: "#64748b",
    scrubDark: "#3f4f63",
    coat: "#e7f4f7",
    coatShade: "#c8e2e8",
    accent: "#f59e0b",
    hair: "#3b302c",
  },
};

const getBayLayout = (index, bedCount) => {
  const compact = bedCount > 5;
  const columns = compact ? 5 : 4;
  const width = 1140 / columns;
  const row = Math.floor(index / columns);
  const column = index % columns;

  return {
    compact,
    width,
    x: 30 + column * width,
    y: compact ? 158 + row * 192 : 260,
  };
};

const RoomShell = memo(function RoomShell() {
  return (
    <>
      <rect width="1200" height="600" fill="url(#er-wall)" />
      <path d="M0 78 H1200" stroke="#d8edf2" strokeWidth="3" />
      <path d="M0 81 H1200" stroke="#6bc5d3" strokeWidth="6" opacity=".75" />
      <rect y="440" width="1200" height="160" fill="url(#er-floor)" />
      <rect y="440" width="1200" height="160" fill="url(#er-floor-grid)" opacity=".7" />
      <path d="M0 440 H1200" stroke="#78b8c1" strokeWidth="4" />

      <g opacity=".6">
        <path d="M170 440 L110 600 M390 440 L335 600 M600 440 V600 M810 440 L865 600 M1030 440 L1090 600" stroke="#8dbdc4" strokeWidth="1.5" />
        <path d="M0 502 H1200 M0 552 H1200" stroke="#a2cbd0" strokeWidth="1.5" />
      </g>

      <g transform="translate(468 92)" opacity=".88">
        <rect width="264" height="106" rx="9" fill="#eaf8fa" stroke="#99ccd4" strokeWidth="3" />
        <rect x="12" y="11" width="112" height="84" rx="5" fill="url(#er-door-glass)" />
        <rect x="140" y="11" width="112" height="84" rx="5" fill="url(#er-door-glass)" />
        <path d="M132 2 V104" stroke="#70aeb8" strokeWidth="5" />
        <path d="M104 53 H119 M145 53 H160" stroke="#4c8190" strokeWidth="4" strokeLinecap="round" />
        <rect x="88" y="-18" width="88" height="24" rx="5" fill="#087d8d" />
        <text x="132" y="-2" textAnchor="middle" fill="#eaffff" fontSize="11" fontWeight="900" letterSpacing="2">RESUS</text>
      </g>

      <g transform="translate(760 94)" opacity=".75">
        <rect width="190" height="94" rx="8" fill="#eef8f9" stroke="#a7cfd5" strokeWidth="3" />
        {[0, 1, 2].map((column) => (
          <g key={column} transform={`translate(${10 + column * 58} 10)`}>
            <rect width="50" height="72" rx="4" fill="#f9feff" stroke="#bedce1" />
            <path d="M8 26 H42 M8 48 H42" stroke="#d6eaed" />
            <circle cx="39" cy="36" r="2.5" fill="#7aa9b1" />
          </g>
        ))}
      </g>

      <g transform="translate(258 102)" opacity=".72">
        <rect width="154" height="62" rx="8" fill="#f5fbfc" stroke="#b5d8de" strokeWidth="3" />
        <rect x="12" y="13" width="38" height="36" rx="4" fill="#d8f0f3" />
        <path d="M60 18 H140 M60 31 H127 M60 44 H135" stroke="#a5cbd1" strokeWidth="5" strokeLinecap="round" />
        <path d="M24 31 H38 M31 24 V38" stroke="#ec5c64" strokeWidth="4" strokeLinecap="round" />
      </g>

      {[105, 355, 605, 855, 1105].map((x, index) => (
        <g
          key={x}
          className="er-ceiling-light"
          style={{ animationDelay: `${-index * 0.52}s` }}
          transform={`translate(${x} 27)`}
        >
          <ellipse cx="0" cy="20" rx="91" ry="35" fill="#dffaff" opacity=".34" filter="url(#er-light-glow)" />
          <rect x="-83" width="166" height="24" rx="8" fill="#f8feff" stroke="#9adce6" strokeWidth="2" />
          <rect x="-67" y="7" width="134" height="10" rx="5" fill="#ffffff" />
        </g>
      ))}

      <g transform="translate(18 208)" opacity=".74">
        <rect width="9" height="185" rx="4" fill="#83b7bf" />
        <path d="M22 0 V185" stroke="#d2e8ec" strokeWidth="3" />
      </g>
      <g transform="translate(1173 208)" opacity=".74">
        <rect width="9" height="185" rx="4" fill="#83b7bf" />
        <path d="M-13 0 V185" stroke="#d2e8ec" strokeWidth="3" />
      </g>
    </>
  );
});

function PatientMonitor({ index, x, y, occupied, critical }) {
  const color = critical ? "#ff5c64" : occupied ? "#42e6ad" : "#7b99a5";
  const screenClass = critical ? "er-monitor-screen er-monitor-critical" : "er-monitor-screen";

  return (
    <g transform={`translate(${x} ${y})`} filter="url(#er-equipment-shadow)">
      <path d="M29 48 V65" stroke="#536c78" strokeWidth="4" />
      <path d="M17 65 H41" stroke="#536c78" strokeWidth="4" strokeLinecap="round" />
      <rect x="-1" y="-1" width="61" height="50" rx="7" fill="#d9e8ec" stroke="#5f8590" strokeWidth="2" />
      <rect className={screenClass} x="5" y="5" width="49" height="34" rx="4" fill="#102a36" />
      <clipPath id={`er-monitor-clip-${index}`}>
        <rect x="7" y="7" width="45" height="29" rx="2" />
      </clipPath>
      <g clipPath={`url(#er-monitor-clip-${index})`} opacity={occupied ? 1 : 0.42}>
        <path d="M7 14 H52 M7 24 H52 M17 7 V36 M32 7 V36 M47 7 V36" stroke="#31505a" strokeWidth=".6" opacity=".75" />
        <g className={occupied ? "er-wave-track" : ""}>
          <path
            d="M-40 27 H-31 L-27 23 L-23 31 L-19 13 L-14 32 L-9 27 H3 L7 23 L11 31 L15 13 L20 32 L25 27 H37 L41 23 L45 31 L49 13 L54 32 L59 27 H71 L75 23 L79 31 L83 13 L88 32 L93 27"
            fill="none"
            stroke={color}
            strokeWidth="1.8"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </g>
      </g>
      {occupied && (
        <>
          <text x="9" y="13" fill={critical ? "#ff8085" : "#7fffd3"} fontSize="5.5" fontWeight="800">ECG</text>
          <text x="38" y="14" fill={critical ? "#ff8085" : "#7fffd3"} fontSize="7" fontWeight="900">{critical ? "42" : "78"}</text>
          <circle cx="8" cy="44" r="2" fill="#26c7d8" />
          <circle cx="16" cy="44" r="2" fill="#f3b34c" />
          <path d="M45 43 H52" stroke="#7998a1" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
    </g>
  );
}

function IvStand({ x, y, active, treating }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 1 V101" stroke="#6d858f" strokeWidth="3" />
      <path d="M-10 1 H10 M0 1 Q-8 1-8 9 M0 1 Q8 1 8 9" fill="none" stroke="#6d858f" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M-15 101 H15 M0 101 L-11 108 M0 101 L11 108" stroke="#566e78" strokeWidth="3" strokeLinecap="round" />
      <circle cx="-12" cy="109" r="3" fill="#344b55" />
      <circle cx="12" cy="109" r="3" fill="#344b55" />
      {active && (
        <>
          <path d="M-15 11 Q-15 7-11 7 H-1 Q3 7 3 11 L2 36 Q2 40-2 40 H-10 Q-14 40-14 36Z" fill="#edfaff" stroke="#5baabd" strokeWidth="1.5" />
          <path className={treating ? "er-iv-fluid" : ""} d="M-13 26 H1 L0 36 Q0 38-3 38 H-9 Q-12 38-12 35Z" fill="#8bdded" opacity=".8" />
          <rect x="-10" y="15" width="8" height="6" rx="1.5" fill="#ffffff" opacity=".9" />
          <path d="M-6 40 V50 Q-6 56 1 56 V79 Q1 85 8 85" fill="none" stroke="#58b8c9" strokeWidth="1.5" />
          <rect x="-8.5" y="47" width="5" height="10" rx="2" fill="#eefbff" stroke="#69b8c6" />
          <circle className={treating ? "er-iv-drop" : ""} cx="-6" cy="51" r="1.3" fill="#1596b1" />
        </>
      )}
    </g>
  );
}

function PatientBed({ bayWidth, occupied, treating, critical, variant }) {
  const bedLeft = 18;
  const bedRight = bayWidth - 13;
  const bedWidth = bedRight - bedLeft;
  const skin = SKIN_TONES[(variant + 1) % SKIN_TONES.length];
  const blanket = variant % 2 === 0 ? "#76cfda" : "#88d8ce";

  return (
    <g>
      <ellipse cx={bayWidth / 2} cy="110" rx={bedWidth * 0.48} ry="10" fill="#315a67" opacity=".13" />
      <path d={`M${bedLeft + 8} 75 V103 M${bedRight - 8} 75 V103`} stroke="#59747f" strokeWidth="5" />
      <path d={`M${bedLeft + 7} 100 L${bedLeft - 1} 108 M${bedRight - 7} 100 L${bedRight + 1} 108`} stroke="#59747f" strokeWidth="3" />
      <g className={treating ? "er-bed-treatment" : ""}>
        <rect x={bedLeft} y="37" width={bedWidth} height="44" rx="10" fill="#95cbd2" stroke="#527f89" strokeWidth="2.5" />
        <rect x={bedLeft + 5} y="31" width={bedWidth - 10} height="20" rx="8" fill="#f8fdff" stroke="#7cb5be" strokeWidth="2" />
        <rect x={bedLeft + 10} y="34" width="42" height="14" rx="6" fill="#e6f5f7" />

        {occupied ? (
          <g className="er-patient-breathe">
            <ellipse cx={bedLeft + 43} cy="31" rx="15" ry="12" fill={skin} />
            <path
              d={`M${bedLeft + 28} 30 Q${bedLeft + 35} 14 ${bedLeft + 54} 21 Q${bedLeft + 60} 24 ${bedLeft + 57} 32 Q${bedLeft + 47} 24 ${bedLeft + 28} 30Z`}
              fill={variant % 3 === 0 ? "#394a55" : "#725346"}
            />
            <path d={`M${bedLeft + 34} 34 Q${bedLeft + 43} 40 ${bedLeft + 52} 34`} fill="none" stroke="#75b7c8" strokeWidth="1.4" />
            <path d={`M${bedLeft + 33} 31 H${bedLeft + 38} M${bedLeft + 48} 31 H${bedLeft + 53}`} stroke="#5f514c" strokeWidth="1.1" strokeLinecap="round" />
            <circle cx={bedLeft + 43} cy="34" r="1.2" fill="#75b7c8" />
            <path d={`M${bedLeft + 42} 35 C${bedLeft + 42} 43 ${bedLeft + 66} 45 ${bedLeft + 73} 51`} fill="none" stroke="#75b7c8" strokeWidth="1.2" />
            <path
              d={`M${bedLeft + 55} 41 Q${bedLeft + 82} 32 ${bedRight - 16} 46 L${bedRight - 7} 70 H${bedLeft + 55}Z`}
              fill={blanket}
              stroke="#55a9b6"
              strokeWidth="1.4"
            />
            <path d={`M${bedLeft + 67} 43 Q${(bedLeft + bedRight) / 2} 58 ${bedRight - 14} 48`} fill="none" stroke="#dff8f8" strokeWidth="2" opacity=".85" />
            <path d={`M${bedLeft + 60} 48 Q${bedLeft + 82} 55 ${bedLeft + 97} 62`} fill="none" stroke={skin} strokeWidth="5.5" strokeLinecap="round" />
            <rect x={bedLeft + 94} y="58" width="8" height="7" rx="2" fill={critical ? "#ff777d" : "#eff9fb"} stroke={critical ? "#cf3e47" : "#78aeb7"} />
          </g>
        ) : (
          <>
            <path d={`M${bedLeft + 55} 43 Q${bedLeft + 90} 36 ${bedRight - 7} 48 V69 H${bedLeft + 55}Z`} fill="#dff3f5" />
            <path d={`M${bedLeft + 67} 47 H${bedRight - 19}`} stroke="#f8ffff" strokeWidth="3" strokeLinecap="round" />
            <text x={bayWidth / 2 + 18} y="63" textAnchor="middle" fill="#6c9aa3" fontSize="8" fontWeight="900" letterSpacing="1.4">READY</text>
          </>
        )}

        <path d={`M${bedLeft - 5} 26 V65 M${bedLeft - 5} 29 H${bedLeft + 2} M${bedLeft - 5} 62 H${bedLeft + 4}`} stroke="#526f79" strokeWidth="3.5" strokeLinecap="round" />
        <path d={`M${bedRight + 5} 26 V65 M${bedRight - 4} 29 H${bedRight + 5} M${bedRight - 4} 62 H${bedRight + 5}`} stroke="#526f79" strokeWidth="3.5" strokeLinecap="round" />
        <path d={`M${bedLeft + 11} 48 V73 H${bedRight - 11} V48`} fill="none" stroke="#76a6af" strokeWidth="2.5" />
        <rect x={bedRight - 30} y="76" width="18" height="7" rx="2" fill="#f4fbfc" stroke="#769da5" />
        <circle cx={bedRight - 25} cy="79.5" r="1.4" fill="#3fc5d3" />
        <circle cx={bedRight - 19} cy="79.5" r="1.4" fill="#f3b34c" />
      </g>
      <g>
        <circle cx={bedLeft + 7} cy="108" r="7" fill="#334a54" />
        <circle cx={bedLeft + 7} cy="108" r="3" fill="#a9cbd0" />
        <circle cx={bedRight - 7} cy="108" r="7" fill="#334a54" />
        <circle cx={bedRight - 7} cy="108" r="3" fill="#a9cbd0" />
      </g>
    </g>
  );
}

const BedBay = memo(function BedBay({
  occupied,
  treating,
  critical,
  index,
  bedCount,
}) {
  const { x, y, width, compact } = getBayLayout(index, bedCount);
  const bayWidth = width - 14;

  return (
    <g transform={`translate(${x} ${y})`} className="er-bed-bay">
      <rect x="1" y="-71" width={bayWidth} height="187" rx="12" fill="#fafdfe" stroke="#a9d6dd" strokeWidth="2.5" filter="url(#er-bay-shadow)" />
      <path d={`M2 -58 Q2 -70 14 -70 H${bayWidth - 12} Q${bayWidth} -70 ${bayWidth} -58 V-44 H2Z`} fill={occupied ? "#d7f3f5" : "#edf7f8"} />
      <path d={`M12 -42 H${bayWidth - 12}`} stroke="#c4e2e6" />
      <text x="13" y="-52" fill="#176c79" fontSize={compact ? "9" : "10"} fontWeight="900" letterSpacing=".8">ER BAY {String(index + 1).padStart(2, "0")}</text>
      <g transform={`translate(${bayWidth - 24} -57)`}>
        <ellipse cx="0" cy="7" rx="10" ry="4" fill={critical ? "#ff5b63" : occupied ? "#39c58f" : "#a6bdc3"} opacity=".16" />
        <path d="M-7 4 Q-7-5 0-7 Q7-5 7 4Z" fill={critical ? "#ff5b63" : occupied ? "#39c58f" : "#afc4c9"} className={critical ? "er-bed-alarm" : ""} />
        <rect x="-9" y="4" width="18" height="3.5" rx="1.5" fill="#6c858e" />
      </g>

      <g transform="translate(52 -27)">
        <rect x="-17" y="-8" width="65" height="25" rx="5" fill="#d8edf0" stroke="#9bc8cf" />
        {[0, 1, 2].map((outlet) => (
          <g key={outlet} transform={`translate(${outlet * 20} 0)`}>
            <circle r="6" fill="#f8ffff" stroke={outlet === 0 ? "#66c693" : outlet === 1 ? "#e5bd56" : "#8ca7af"} strokeWidth="2" />
            <circle r="2" fill="#66818b" />
          </g>
        ))}
        <rect x="-12" y="10" width="51" height="3" rx="1.5" fill="#9bc8cf" />
      </g>

      <PatientMonitor index={index} x={bayWidth - 70} y={-35} occupied={occupied} critical={critical} />
      <IvStand x={19} y={-33} active={occupied} treating={treating} />
      <PatientBed bayWidth={bayWidth} occupied={occupied} treating={treating} critical={critical} variant={index} />

      {treating && (
        <g transform={`translate(${bayWidth * 0.47} 79)`}>
          <g className="er-procedure-tray">
            <ellipse cx="0" cy="14" rx="25" ry="5" fill="#315a67" opacity=".12" />
            <rect x="-27" y="-3" width="54" height="9" rx="3" fill="#d9eef1" stroke="#6d979f" />
            <path d="M-21 7 V23 M21 7 V23 M-25 23 H25" stroke="#647f88" strokeWidth="2.5" />
            <path d="M-17 0 H-5 M1 0 H13 M17 0 H22" stroke="#22a5b7" strokeWidth="2" strokeLinecap="round" />
          </g>
        </g>
      )}
    </g>
  );
});

const StaffFigure = memo(function StaffFigure({
  x,
  y,
  role,
  activity,
  delay = 0,
  scale = 1,
  variant = 0,
  direction = 1,
  arrivalFrom = 70,
}) {
  const style = STAFF_STYLES[role] ?? STAFF_STYLES.nurse;
  const skin = SKIN_TONES[variant % SKIN_TONES.length];
  const treating = activity === "treat";
  const running = activity === "run";
  const motionClass = treating
    ? "er-staff-treat"
    : running
      ? direction < 0 ? "er-staff-run er-staff-run-reverse" : "er-staff-run"
      : "er-staff-patrol";

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g
        className={treating ? "er-staff-arrive" : ""}
        style={treating ? { "--er-arrival-x": `${arrivalFrom}px` } : undefined}
      >
        <g className={`er-staff-figure ${motionClass}`} style={{ animationDelay: `${delay}s` }}>
          <ellipse cx="0" cy="42" rx="22" ry="6" fill="#244f5b" opacity=".17" />

          <g className={running ? "er-leg er-leg-left er-leg-fast" : "er-leg er-leg-left"}>
            <path d="M-9 10 Q-10 25-11 36" fill="none" stroke={style.scrubDark} strokeWidth="8" strokeLinecap="round" />
            <path d="M-11 36 L-16 41 H-6" fill="none" stroke="#263b46" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <g className={running ? "er-leg er-leg-right er-leg-fast" : "er-leg er-leg-right"}>
            <path d="M8 10 Q10 25 11 36" fill="none" stroke={style.scrubDark} strokeWidth="8" strokeLinecap="round" />
            <path d="M11 36 L16 41 H6" fill="none" stroke="#263b46" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          <path d="M-15-23 Q0-29 15-23 L18 12 Q9 17 0 13 Q-9 17-18 12Z" fill={style.scrub} stroke={style.scrubDark} strokeWidth="1.5" />
          <path d="M-9-22 L0-12 L9-22" fill="none" stroke="#c8f3f5" strokeWidth="2" />
          <path d="M0-12 V11" stroke={style.scrubDark} strokeWidth="1.2" opacity=".5" />
          <path d="M-12 2 H-4 V9 H-12Z M5 2 H13 V9 H5Z" fill="none" stroke="#c8f3f5" strokeWidth="1.1" opacity=".82" />

          {role === "doctor" && (
            <>
              <path d="M-15-22 L-19 11 Q-10 16-2 12 V-9Z" fill={style.coat} stroke={style.coatShade} strokeWidth="1.2" />
              <path d="M15-22 L19 11 Q10 16 2 12 V-9Z" fill={style.coat} stroke={style.coatShade} strokeWidth="1.2" />
              <path d="M-8-17 Q-14-8-8 1 M8-17 Q14-8 8 1" fill="none" stroke="#357b87" strokeWidth="1.8" />
              <circle cx="-8" cy="2" r="3" fill="none" stroke="#357b87" strokeWidth="1.5" />
            </>
          )}

          <g className={treating ? "er-arm er-arm-left er-arm-treat-left" : running ? "er-arm er-arm-left er-arm-fast" : "er-arm er-arm-left"}>
            <path
              d={treating ? "M-14-17 Q-23-8-18 3 L-7 8" : "M-14-17 Q-20-3-17 10"}
              fill="none"
              stroke={style.scrub}
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d={treating ? "M-8 8 L-2 10" : "M-17 10 L-15 17"}
              fill="none"
              stroke={treating ? "#d8fbff" : skin}
              strokeWidth="5.5"
              strokeLinecap="round"
            />
            <circle cx={treating ? -1 : -15} cy={treating ? 10 : 18} r="3.3" fill={treating ? "#d8fbff" : skin} />
          </g>
          <g className={treating ? "er-arm er-arm-right er-arm-treat-right" : running ? "er-arm er-arm-right er-arm-fast" : "er-arm er-arm-right"}>
            <path
              d={treating ? "M14-17 Q23-7 17 4 L7 9" : "M14-17 Q20-3 17 10"}
              fill="none"
              stroke={style.scrub}
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d={treating ? "M8 9 L2 11" : "M17 10 L15 17"}
              fill="none"
              stroke={treating ? "#d8fbff" : skin}
              strokeWidth="5.5"
              strokeLinecap="round"
            />
            <circle cx={treating ? 1 : 15} cy={treating ? 11 : 18} r="3.3" fill={treating ? "#d8fbff" : skin} />
          </g>

          <rect x="-11" y="-21" width="8" height="10" rx="2" fill="#f8ffff" stroke="#87bcc5" />
          <circle cx="-7" cy="-18" r="1.6" fill={style.accent} />
          <path d="M-9-14 H-5" stroke="#6b8c95" strokeWidth="1" />

          <path d="M-5-28 V-25 H5 V-28" fill={skin} />
          <circle cx="-11" cy="-39" r="3.5" fill={skin} />
          <circle cx="11" cy="-39" r="3.5" fill={skin} />
          <ellipse cx="0" cy="-40" rx="12" ry="14" fill={skin} />
          <path
            d={role === "nurse"
              ? "M-12-42 Q-10-56 2-55 Q13-52 12-40 Q4-47-12-42Z"
              : "M-12-43 Q-8-57 5-54 Q14-50 11-39 Q5-48-2-46 Q-7-42-12-43Z"}
            fill={style.hair}
          />
          {role === "nurse" && (
            <path d="M-10-50 Q0-57 10-50 L8-46 H-8Z" fill="#dff9fb" stroke="#8acbd4" strokeWidth="1" />
          )}
          <path d="M-8-40 H-3 M3-40 H8" stroke="#51433d" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M-8-35 Q0-31 8-35 V-28 Q0-24-8-28Z" fill="#dff8fb" stroke="#85c4ce" strokeWidth="1" />
          <path d="M-9-36 L-12-38 M9-36 L12-38" stroke="#76aeb7" strokeWidth="1" />

          {treating && role === "doctor" && (
            <g className="er-hand-tool">
              <path d="M-2 10 L6 16 M2 10 L8 14" stroke="#597780" strokeWidth="1.3" />
              <circle cx="8" cy="15" r="1.5" fill="none" stroke="#597780" />
            </g>
          )}
          {treating && role !== "doctor" && (
            <g className="er-hand-tool">
              <rect x="-3" y="9" width="11" height="2.5" rx="1" fill="#effcff" stroke="#5e8f99" strokeWidth=".7" />
              <path d="M8 10 H12" stroke="#5e8f99" strokeWidth=".8" />
            </g>
          )}
          {!treating && (
            <g transform="translate(15 -4) rotate(-7)">
              <rect x="-2" y="-8" width="11" height="15" rx="2" fill="#edf8fa" stroke="#577985" strokeWidth="1" />
              <path d="M0-4 H7 M0-1 H6 M0 2 H7" stroke="#65b8c5" strokeWidth="1" />
            </g>
          )}
        </g>
      </g>
    </g>
  );
});

function CrashCart({ active, crowded }) {
  const motionClass = active
    ? `er-crash-cart-motion ${crowded ? "er-crash-cart-crowded" : ""}`
    : "";
  const wheelClass = active ? "er-cart-wheel" : "";

  return (
    <g transform="translate(58 532)">
      <g className={motionClass}>
        <ellipse cx="50" cy="25" rx="53" ry="7" fill="#254f5a" opacity=".16" />
        <path d="M-7-27 V9" stroke="#5d7881" strokeWidth="4" strokeLinecap="round" />
        <path d="M-7-25 H7" stroke="#5d7881" strokeWidth="4" strokeLinecap="round" />
        <rect x="3" y="-45" width="54" height="34" rx="6" fill="#dbecef" stroke="#597984" strokeWidth="2.5" filter="url(#er-equipment-shadow)" />
        <rect x="9" y="-39" width="42" height="22" rx="3" fill="#102a36" />
        <clipPath id="er-cart-screen-clip">
          <rect x="10" y="-38" width="40" height="20" rx="2" />
        </clipPath>
        <g clipPath="url(#er-cart-screen-clip)">
          <g className={active ? "er-wave-track" : ""}>
            <path d="M-23-25 H-15 L-11-33 L-7-20 L-2-27 H8 L12-33 L16-20 L21-27 H31 L35-33 L39-20 L44-27 H55 L59-33 L63-20 L68-27 H78" fill="none" stroke="#42e6ad" strokeWidth="1.7" />
          </g>
        </g>
        <path d="M30-11 V-4" stroke="#5b7680" strokeWidth="3" />

        <rect x="5" y="-5" width="91" height="54" rx="7" fill="#f7fbfc" stroke="#5a7d87" strokeWidth="2.5" filter="url(#er-equipment-shadow)" />
        <rect x="5" y="-5" width="91" height="12" rx="5" fill="#ed626a" />
        <path d="M15 16 H85 M15 31 H85" stroke="#a9c4ca" strokeWidth="2" />
        <path d="M38 11 H62 M38 26 H62 M38 41 H62" stroke="#688993" strokeWidth="3" strokeLinecap="round" />
        <rect x="73" y="10" width="14" height="10" rx="2" fill="#d9edf0" />
        <path d="M77 15 H83 M80 12 V18" stroke="#e2525b" strokeWidth="2" />
        <path d="M9-9 H92" stroke="#557681" strokeWidth="4" strokeLinecap="round" />

        <g transform="translate(103 2)">
          <path d="M0-27 Q15-30 18-15 V36 H0Z" fill="#b9dbe0" stroke="#5f7e87" strokeWidth="2" />
          <rect x="5" y="-21" width="8" height="5" rx="1.5" fill="#f0c453" />
          <path d="M18-8 Q26-1 18 8" fill="none" stroke="#6b8d96" strokeWidth="2" />
        </g>

        {[18, 83].map((wheelX) => (
          <g key={wheelX} transform={`translate(${wheelX} 55)`}>
            <g className={wheelClass}>
              <circle r="9" fill="#2f454f" />
              <circle r="4" fill="#acc7cc" />
              <path d="M0-7 V7 M-7 0 H7 M-5-5 L5 5 M5-5 L-5 5" stroke="#6d8991" strokeWidth="1.2" />
            </g>
          </g>
        ))}
      </g>
    </g>
  );
}

function VentilatorStation({ active, critical }) {
  const waveColor = critical ? "#ff6970" : active ? "#4ee0c2" : "#698893";

  return (
    <g transform="translate(1050 487)" opacity=".96">
      <ellipse cx="51" cy="69" rx="55" ry="8" fill="#254f5a" opacity=".14" />
      <path d="M22 24 V61 M80 24 V61" stroke="#607c85" strokeWidth="4" />
      <rect x="1" y="-30" width="100" height="58" rx="8" fill="#edf7f8" stroke="#688b95" strokeWidth="2.5" filter="url(#er-equipment-shadow)" />
      <rect x="10" y="-21" width="65" height="34" rx="4" fill="#122d37" />
      <path d="M16-4 H26 L31-14 L38 5 L45-6 H68" fill="none" stroke={waveColor} strokeWidth="2.2" className={active ? "er-vent-wave" : ""} />
      <text x="79" y="-9" fill="#57727c" fontSize="6" fontWeight="800">VENT</text>
      <circle cx="85" cy="3" r="4" fill={active ? "#45cf9a" : "#9fb6bc"} />
      <rect x="16" y="20" width="70" height="31" rx="5" fill="#f9fcfd" stroke="#a6c7cd" />
      <path d="M26 29 H76 M26 37 H76 M26 45 H62" stroke="#b5d2d7" strokeWidth="3" strokeLinecap="round" />
      <path className={active ? "er-vent-bag" : ""} d="M95-10 Q114-4 102 13 Q91 5 95-10Z" fill="#a6e5da" stroke="#5ba99c" strokeWidth="1.5" />
      <path d="M101 13 Q112 27 92 42" fill="none" stroke="#6a9ca5" strokeWidth="2" />
      <path d="M18 51 V62 H85 V51" fill="none" stroke="#607c85" strokeWidth="3" />
      <circle cx="19" cy="66" r="6" fill="#344c55" />
      <circle cx="84" cy="66" r="6" fill="#344c55" />
    </g>
  );
}

function StatusBoards({ occupiedCount, totalBeds, incoming, treatingCount }) {
  const status = incoming
    ? "搬送受入準備中"
    : treatingCount > 0
      ? "処置進行中"
      : occupiedCount > 0
        ? "初療・観察中"
        : "通常運用";
  const tone = incoming ? "#f5a524" : treatingCount > 0 ? "#19a77c" : "#55b9c7";

  return (
    <>
      <g transform="translate(30 18)" filter="url(#er-panel-shadow)">
        <rect width="240" height="56" rx="10" fill="#0b7586" />
        <path d="M0 43 H240" stroke="#56cbd6" opacity=".55" />
        <text x="16" y="20" fill="#bff7fa" fontSize="9" fontWeight="900" letterSpacing="1.4">EMERGENCY DEPARTMENT</text>
        <text x="16" y="40" fill="#ffffff" fontSize="16" fontWeight="900">{occupiedCount} / {totalBeds} BEDS ACTIVE</text>
        <circle cx="218" cy="28" r="10" fill="#083f4a" opacity=".7" />
        <path d="M211 28 H225 M218 21 V35" stroke="#f8ffff" strokeWidth="3" strokeLinecap="round" />
      </g>

      <g transform="translate(950 17)" filter="url(#er-panel-shadow)">
        <rect width="220" height="58" rx="10" fill="#f9feff" stroke="#87cbd4" strokeWidth="2" />
        <rect x="11" y="11" width="36" height="36" rx="8" fill="#eaf7f8" />
        <path d="M20 29 H38 M29 20 V38" stroke="#ec5c64" strokeWidth="6" strokeLinecap="round" />
        <text x="58" y="23" fill="#116776" fontSize="12" fontWeight="900">救急処置室</text>
        <text x="58" y="42" fill="#607b84" fontSize="9.5" fontWeight="700">{status}</text>
        <g className={incoming ? "er-incoming-beacon" : ""}>
          <circle cx="198" cy="29" r="12" fill={tone} opacity=".16" />
          <circle cx="198" cy="29" r="6.5" fill={tone} />
        </g>
      </g>
    </>
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
  const compact = beds.length > 5;
  const bedStates = beds.map((bed) => {
    const isOccupied = Boolean(bed);
    const remain = isOccupied ? Math.max(0, bed.arrivedAt + bed.limit - t) : 0;
    return {
      occupied: isOccupied,
      treating: Boolean(bed?.action),
      critical: isOccupied && bed.limit > 0 && remain / bed.limit <= 0.25,
    };
  });

  const primaryStaff = beds.flatMap((bed, index) => {
    if (!bed) return [];
    const layout = getBayLayout(index, beds.length);
    const bayWidth = layout.width - 14;
    return [{
      key: `bed-${index}-primary`,
      x: layout.x + bayWidth * 0.76,
      y: layout.y + 100,
      role: index % 4 === 0 ? "doctor" : index % 3 === 0 ? "tech" : "nurse",
      activity: "treat",
      delay: -(index % 5) * 0.14,
      scale: compact ? 0.69 : 0.86,
      variant: index,
      arrivalFrom: index % 2 === 0 ? 86 : -86,
    }];
  });

  const treatmentStaff = beds.flatMap((bed, index) => {
    if (!bed?.action) return [];
    const layout = getBayLayout(index, beds.length);
    const bayWidth = layout.width - 14;
    return [{
      key: `bed-${index}-treatment`,
      x: layout.x + bayWidth * 0.48,
      y: layout.y + 106,
      role: index % 2 === 0 ? "doctor" : "nurse",
      activity: "treat",
      delay: -0.36 - (index % 3) * 0.1,
      scale: compact ? 0.64 : 0.8,
      variant: index + 2,
      arrivalFrom: index % 2 === 0 ? -92 : 92,
    }];
  });

  const runnerCount = occupied.length === 0
    ? incoming ? 2 : 0
    : Math.min(6, Math.ceil(occupied.length / 1.7) + (incoming ? 1 : 0));
  const crowded = occupied.length >= Math.ceil(beds.length / 2);
  const anyCritical = bedStates.some((state) => state.critical);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden bg-[#dff4f6] ${paused ? "er-scene-paused" : ""}`}
    >
      <style>{`
        @keyframes erLight {
          0%, 100% { opacity: .82; }
          50% { opacity: 1; }
        }
        @keyframes erWaveTrack {
          to { transform: translateX(-42px); }
        }
        @keyframes erCriticalScreen {
          0%, 38%, 100% { opacity: 1; filter: drop-shadow(0 0 0 rgba(255, 63, 73, 0)); }
          48%, 88% { opacity: .55; filter: drop-shadow(0 0 7px rgba(255, 63, 73, .95)); }
        }
        @keyframes erBedAlarm {
          0%, 42%, 100% { opacity: 1; filter: drop-shadow(0 0 1px #ff4a54); }
          52%, 91% { opacity: .32; filter: drop-shadow(0 0 10px #ff313d); }
        }
        @keyframes erIncomingBeacon {
          0%, 100% { opacity: 1; filter: drop-shadow(0 0 2px rgba(245, 165, 36, .5)); }
          50% { opacity: .45; filter: drop-shadow(0 0 12px rgba(245, 165, 36, 1)); }
        }
        @keyframes erPatientBreathe {
          0%, 100% { transform: translateY(0) scaleY(1); }
          50% { transform: translateY(-1px) scaleY(1.018); }
        }
        @keyframes erBedTreatment {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1.2px); }
        }
        @keyframes erIvFluid {
          0%, 100% { opacity: .72; }
          50% { opacity: 1; }
        }
        @keyframes erIvDrop {
          0% { transform: translateY(-3px); opacity: 0; }
          25% { opacity: 1; }
          100% { transform: translateY(4px); opacity: 0; }
        }
        @keyframes erStaffArrive {
          0% { transform: translate(var(--er-arrival-x), 65px); opacity: 0; }
          58% { opacity: 1; }
          82% { transform: translate(-3px, 0); }
          100% { transform: translate(0, 0); opacity: 1; }
        }
        @keyframes erStaffTreat {
          0%, 100% { transform: translateY(0) rotate(-.7deg); }
          50% { transform: translateY(-2px) rotate(1deg); }
        }
        @keyframes erTreatLeft {
          0%, 100% { transform: rotate(-4deg); }
          50% { transform: rotate(8deg); }
        }
        @keyframes erTreatRight {
          0%, 100% { transform: rotate(5deg); }
          50% { transform: rotate(-7deg); }
        }
        @keyframes erLegWalk {
          0%, 100% { transform: rotate(-8deg); }
          50% { transform: rotate(9deg); }
        }
        @keyframes erLegWalkReverse {
          0%, 100% { transform: rotate(9deg); }
          50% { transform: rotate(-8deg); }
        }
        @keyframes erArmWalk {
          0%, 100% { transform: rotate(8deg); }
          50% { transform: rotate(-9deg); }
        }
        @keyframes erArmWalkReverse {
          0%, 100% { transform: rotate(-9deg); }
          50% { transform: rotate(8deg); }
        }
        @keyframes erPatrol {
          0% { transform: translateX(-54px) scaleX(1); }
          44% { transform: translateX(54px) scaleX(1); }
          50% { transform: translateX(54px) scaleX(-1); }
          94% { transform: translateX(-54px) scaleX(-1); }
          100% { transform: translateX(-54px) scaleX(1); }
        }
        @keyframes erRunAcross {
          from { transform: translateX(-150px); }
          to { transform: translateX(1250px); }
        }
        @keyframes erRunAcrossReverse {
          from { transform: translateX(1250px) scaleX(-1); }
          to { transform: translateX(-150px) scaleX(-1); }
        }
        @keyframes erCrashCart {
          0% { transform: translateX(0) scaleX(1); }
          43% { transform: translateX(930px) scaleX(1); }
          49% { transform: translateX(930px) scaleX(-1); }
          92% { transform: translateX(0) scaleX(-1); }
          100% { transform: translateX(0) scaleX(1); }
        }
        @keyframes erWheel {
          to { transform: rotate(360deg); }
        }
        @keyframes erTray {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        @keyframes erVentBag {
          0%, 100% { transform: scale(.88); }
          50% { transform: scale(1.08); }
        }
        @keyframes erVentWave {
          0%, 100% { opacity: .65; }
          50% { opacity: 1; }
        }

        .er-ceiling-light { animation: erLight 4.2s ease-in-out infinite; }
        .er-wave-track {
          transform-box: fill-box;
          animation: erWaveTrack 1.15s linear infinite;
        }
        .er-monitor-screen,
        .er-bed-alarm,
        .er-incoming-beacon,
        .er-patient-breathe,
        .er-bed-treatment,
        .er-iv-fluid,
        .er-iv-drop,
        .er-staff-arrive,
        .er-staff-figure,
        .er-arm,
        .er-leg,
        .er-crash-cart-motion,
        .er-cart-wheel,
        .er-procedure-tray,
        .er-vent-bag {
          transform-box: fill-box;
        }
        .er-monitor-critical { animation: erCriticalScreen .76s linear infinite; }
        .er-bed-alarm { animation: erBedAlarm .76s linear infinite; }
        .er-incoming-beacon { animation: erIncomingBeacon .9s ease-in-out infinite; }
        .er-patient-breathe {
          transform-origin: center bottom;
          animation: erPatientBreathe 2.4s ease-in-out infinite;
        }
        .er-bed-treatment { animation: erBedTreatment .68s ease-in-out infinite; }
        .er-iv-fluid { animation: erIvFluid 1.3s ease-in-out infinite; }
        .er-iv-drop { animation: erIvDrop 1.15s linear infinite; }
        .er-staff-arrive { animation: erStaffArrive .92s cubic-bezier(.2,.75,.25,1) both; }
        .er-staff-treat {
          transform-origin: center bottom;
          animation: erStaffTreat .74s ease-in-out infinite;
        }
        .er-staff-patrol {
          transform-origin: center bottom;
          animation: erPatrol 10s ease-in-out infinite;
        }
        .er-staff-run {
          transform-origin: center bottom;
          animation: erRunAcross 8.5s linear infinite;
        }
        .er-staff-run-reverse { animation-name: erRunAcrossReverse; }
        .er-arm,
        .er-leg { transform-origin: center top; }
        .er-staff-patrol .er-leg-left,
        .er-staff-run .er-leg-left { animation: erLegWalk .76s ease-in-out infinite; }
        .er-staff-patrol .er-leg-right,
        .er-staff-run .er-leg-right { animation: erLegWalkReverse .76s ease-in-out infinite; }
        .er-staff-patrol .er-arm-left,
        .er-staff-run .er-arm-left { animation: erArmWalk .76s ease-in-out infinite; }
        .er-staff-patrol .er-arm-right,
        .er-staff-run .er-arm-right { animation: erArmWalkReverse .76s ease-in-out infinite; }
        .er-staff-run .er-leg-fast,
        .er-staff-run .er-arm-fast { animation-duration: .38s; }
        .er-arm-treat-left { animation: erTreatLeft .62s ease-in-out infinite; }
        .er-arm-treat-right { animation: erTreatRight .62s ease-in-out infinite; animation-delay: -.31s; }
        .er-hand-tool { transform-box: fill-box; transform-origin: center; }
        .er-crash-cart-motion {
          transform-origin: center bottom;
          animation: erCrashCart 13s ease-in-out infinite;
        }
        .er-crash-cart-crowded { animation-duration: 6.6s; }
        .er-cart-wheel {
          transform-origin: center;
          animation: erWheel 1.05s linear infinite;
        }
        .er-crash-cart-crowded .er-cart-wheel { animation-duration: .52s; }
        .er-procedure-tray { animation: erTray .72s ease-in-out infinite; }
        .er-vent-bag {
          transform-origin: center;
          animation: erVentBag 1.35s ease-in-out infinite;
        }
        .er-vent-wave { animation: erVentWave 1.15s ease-in-out infinite; }
        .er-scene-paused * { animation-play-state: paused !important; }

        @media (prefers-reduced-motion: reduce) {
          .er-ceiling-light,
          .er-wave-track,
          .er-monitor-critical,
          .er-bed-alarm,
          .er-incoming-beacon,
          .er-patient-breathe,
          .er-bed-treatment,
          .er-iv-fluid,
          .er-iv-drop,
          .er-staff-arrive,
          .er-staff-figure,
          .er-arm,
          .er-leg,
          .er-crash-cart-motion,
          .er-cart-wheel,
          .er-procedure-tray,
          .er-vent-bag,
          .er-vent-wave {
            animation: none !important;
          }
        }
      `}</style>
      <svg
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full"
        role="presentation"
      >
        <defs>
          <linearGradient id="er-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset=".7" stopColor="#e9f8fa" />
            <stop offset="1" stopColor="#d5edf1" />
          </linearGradient>
          <linearGradient id="er-floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d8eff0" />
            <stop offset="1" stopColor="#b9d9dc" />
          </linearGradient>
          <linearGradient id="er-door-glass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#c9ebef" />
            <stop offset=".45" stopColor="#f6ffff" />
            <stop offset="1" stopColor="#add8df" />
          </linearGradient>
          <pattern id="er-floor-grid" width="64" height="40" patternUnits="userSpaceOnUse">
            <path d="M0 40 H64 M64 0 V40" stroke="#80b6bd" strokeWidth="1" opacity=".45" />
          </pattern>
          <filter id="er-bay-shadow" x="-15%" y="-15%" width="130%" height="145%">
            <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#3b7884" floodOpacity=".16" />
          </filter>
          <filter id="er-equipment-shadow" x="-25%" y="-25%" width="150%" height="160%">
            <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#244f59" floodOpacity=".22" />
          </filter>
          <filter id="er-panel-shadow" x="-15%" y="-20%" width="130%" height="150%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#245762" floodOpacity=".22" />
          </filter>
          <filter id="er-light-glow" x="-30%" y="-100%" width="160%" height="300%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
        </defs>

        <RoomShell />
        <StatusBoards
          occupiedCount={occupied.length}
          totalBeds={beds.length}
          incoming={incoming}
          treatingCount={treating.length}
        />

        {bedStates.map((state, index) => (
          <BedBay key={index} {...state} index={index} bedCount={beds.length} />
        ))}

        {occupied.length === 0 && !incoming ? (
          <>
            <StaffFigure x={322} y={530} role="nurse" activity="idle" delay={-1.1} scale={0.95} variant={0} />
            <StaffFigure x={600} y={526} role="doctor" activity="idle" delay={-5.2} scale={1} variant={2} />
            <StaffFigure x={875} y={532} role="tech" activity="idle" delay={-7.7} scale={0.94} variant={1} />
          </>
        ) : (
          <>
            {[...primaryStaff, ...treatmentStaff].map(({ key, ...staff }) => (
              <StaffFigure key={key} {...staff} />
            ))}
            {Array.from({ length: runnerCount }, (_, index) => (
              <StaffFigure
                key={`runner-${index}`}
                x={0}
                y={526 + (index % 3) * 16}
                role={index % 3 === 0 ? "tech" : index % 2 ? "doctor" : "nurse"}
                activity="run"
                delay={-index * 1.34}
                scale={0.78 + (index % 2) * 0.06}
                variant={index + 1}
                direction={index % 2 === 0 ? 1 : -1}
              />
            ))}
          </>
        )}

        <CrashCart active={occupied.length > 0 || incoming} crowded={crowded} />
        <VentilatorStation active={occupied.length > 0} critical={anyCritical} />
      </svg>
      <div
        className={`absolute inset-0 transition-colors duration-700 ${
          danger
            ? "bg-[radial-gradient(circle_at_center,transparent_50%,rgba(244,63,94,0.20)_100%)]"
            : "bg-[linear-gradient(110deg,rgba(255,255,255,0.08),transparent_40%,rgba(255,255,255,0.12))]"
        }`}
      />
    </div>
  );
}
