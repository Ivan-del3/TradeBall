// Tradeball UI Kit — shared primitives
// Load AFTER React + Babel. Exposes components on window.

const Icon = ({ name, size = 20, color, style, ...rest }) => (
  <svg width={size} height={size} style={{ color, ...style }} aria-hidden="true" {...rest}>
    <use href={`../../assets/icons.svg#${name}`} />
  </svg>
);

const Avatar = ({ initial, size = 36, photoColor = "#E53535" }) => (
  <span
    style={{
      width: size, height: size, borderRadius: "50%",
      background: photoColor, color: "#fff",
      display: "inline-grid", placeItems: "center",
      fontWeight: 700, fontSize: size * 0.42, flex: "none",
    }}
  >{initial}</span>
);

const Badge = ({ kind = "gray", children }) => {
  const map = {
    green:  { bg: "#E4F5EC", fg: "#1FA968" },
    blue:   { bg: "#E5EFFE", fg: "#2D7FF9" },
    yellow: { bg: "#FFF6DC", fg: "#A77A00" },
    orange: { bg: "#FCEBDA", fg: "#B85F0E" },
    gray:   { bg: "#EFEFF1", fg: "#5C5C66" },
    red:    { bg: "#FDECEC", fg: "#E53535" },
  };
  const c = map[kind] || map.gray;
  return (
    <span style={{
      background: c.bg, color: c.fg, fontSize: 12, fontWeight: 600,
      padding: "3px 10px", borderRadius: 999, whiteSpace: "nowrap",
    }}>{children}</span>
  );
};

const Btn = ({ variant = "red", shape = "pill", icon, children, onClick, style, type = "button", full }) => {
  const base = {
    border: 0, cursor: "pointer", fontWeight: 600, fontSize: 14,
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    gap: 8, transition: "background 120ms cubic-bezier(.2,.7,.2,1)",
    fontFamily: "inherit",
  };
  const shapes = {
    pill: { padding: "9px 16px", borderRadius: 999 },
    full: { padding: "14px 18px", borderRadius: 12, width: "100%", fontSize: 15 },
    icon: { width: 40, height: 40, borderRadius: 999, padding: 0 },
  };
  const variants = {
    red:    { background: "#E53535", color: "#fff" },
    black:  { background: "#0E0E10", color: "#fff" },
    gray:   { background: "#F1F1F3", color: "#0E0E10" },
    outline:{ background: "#fff", color: "#E53535", boxShadow: "inset 0 0 0 1.5px #E53535" },
    "outline-orange":{ background: "#fff", color: "#E97A1F", boxShadow: "inset 0 0 0 1.5px #E97A1F" },
    "outline-gray":{ background: "#fff", color: "#0E0E10", boxShadow: "inset 0 0 0 1.5px #E5E5EA" },
    green:  { background: "#1FA968", color: "#fff" },
    orange: { background: "#E97A1F", color: "#fff" },
    ghost:  { background: "transparent", color: "#0E0E10" },
  };
  return (
    <button type={type} onClick={onClick} style={{ ...base, ...shapes[shape], ...variants[variant], ...(full?{width:"100%"}:{}), ...style }}>
      {icon && <Icon name={icon} size={16} />}
      {children}
    </button>
  );
};

const Card = ({ children, style, hover, onClick }) => (
  <div onClick={onClick} style={{
    background: "#fff", borderRadius: 20,
    boxShadow: "0 1px 2px rgba(14,14,16,.04), 0 4px 16px rgba(14,14,16,.04)",
    transition: "box-shadow 240ms cubic-bezier(.2,.7,.2,1), transform 240ms cubic-bezier(.2,.7,.2,1)",
    cursor: onClick ? "pointer" : "default",
    ...style,
  }}>{children}</div>
);

const Field = ({ label, children, hint }) => (
  <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    {label && <span style={{ fontSize: 13, fontWeight: 500, color: "#5C5C66" }}>{label}</span>}
    {children}
    {hint && <span style={{ fontSize: 12, color: "#8A8A95" }}>{hint}</span>}
  </label>
);

const Input = ({ suffix, style, ...props }) => (
  suffix ? (
    <span style={{ position: "relative", display: "block" }}>
      <input {...props} style={{
        width: "100%", boxSizing: "border-box",
        padding: "12px 36px 12px 14px", border: "1px solid #E5E5EA",
        borderRadius: 12, background: "#fff", fontSize: 15, fontFamily: "inherit",
        color: "#0E0E10", outline: "none", ...style,
      }}/>
      <span style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", color:"#8A8A95", fontWeight: 600 }}>{suffix}</span>
    </span>
  ) : (
    <input {...props} style={{
      padding: "12px 14px", border: "1px solid #E5E5EA",
      borderRadius: 12, background: "#fff", fontSize: 15, fontFamily: "inherit",
      color: "#0E0E10", outline: "none", ...style,
    }}/>
  )
);

const Select = ({ children, style, ...props }) => (
  <span style={{ position: "relative", display: "block" }}>
    <select {...props} style={{
      width: "100%", boxSizing: "border-box", appearance: "none",
      padding: "12px 36px 12px 14px", border: "1px solid #E5E5EA",
      borderRadius: 12, background: "#fff", fontSize: 15, fontFamily: "inherit",
      color: "#0E0E10", outline: "none", ...style,
    }}>{children}</select>
    <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", color:"#8A8A95" }}>
      <Icon name="chevron-down" size={16}/>
    </span>
  </span>
);

const Logo = ({ size = 32, withWordmark = true }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
    <img src="../../assets/logo.svg" width={size} height={size} alt="Tradeball" style={{ flex: "none" }} />
    {withWordmark && (
      <span style={{ fontWeight: 800, fontSize: size * 0.7, color: "#E53535", letterSpacing: -0.5 }}>Tradeball</span>
    )}
  </span>
);

// Generic placeholder product image — geometric, brand-aligned, deterministic by id
const ProductImage = ({ id = 0, size = "100%" }) => {
  const variants = [
    <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="#E53535"/><rect x="8" y="46" width="84" height="8" fill="#0E0E10"/><circle cx="50" cy="50" r="10" fill="#fff" stroke="#0E0E10" strokeWidth="3"/></svg>,
    <svg viewBox="0 0 100 100"><rect x="22" y="14" width="56" height="72" rx="6" fill="#FAD5D5" stroke="#0E0E10" strokeWidth="2"/><circle cx="50" cy="42" r="14" fill="#E53535"/><rect x="32" y="62" width="36" height="4" fill="#0E0E10"/><rect x="32" y="70" width="24" height="4" fill="#8A8A95"/></svg>,
    <svg viewBox="0 0 100 100"><circle cx="50" cy="58" r="30" fill="#F1F1F3" stroke="#0E0E10" strokeWidth="2"/><circle cx="42" cy="54" r="3" fill="#0E0E10"/><circle cx="58" cy="54" r="3" fill="#0E0E10"/><path d="M42 66q8 6 16 0" fill="none" stroke="#0E0E10" strokeWidth="2" strokeLinecap="round"/><path d="M30 36q-6-12 6-16M70 36q6-12-6-16" fill="none" stroke="#E53535" strokeWidth="3" strokeLinecap="round"/></svg>,
    <svg viewBox="0 0 100 100"><rect x="14" y="22" width="72" height="56" rx="4" fill="#fff" stroke="#0E0E10" strokeWidth="2"/><rect x="14" y="22" width="72" height="14" fill="#E53535"/><rect x="22" y="44" width="56" height="6" fill="#0E0E10"/><rect x="22" y="56" width="36" height="6" fill="#8A8A95"/></svg>,
    <svg viewBox="0 0 100 100"><polygon points="50,12 88,32 88,68 50,88 12,68 12,32" fill="#FDECEC" stroke="#0E0E10" strokeWidth="2"/><polygon points="50,30 70,42 70,58 50,70 30,58 30,42" fill="#E53535"/></svg>,
    <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="36" fill="#0E0E10"/><circle cx="50" cy="50" r="22" fill="#E53535"/><circle cx="50" cy="50" r="6" fill="#fff"/></svg>,
    <svg viewBox="0 0 100 100"><rect x="20" y="20" width="60" height="60" rx="10" fill="#F1F1F3"/><circle cx="40" cy="42" r="6" fill="#0E0E10"/><circle cx="60" cy="42" r="6" fill="#0E0E10"/><path d="M36 64q14 10 28 0" fill="none" stroke="#E53535" strokeWidth="3" strokeLinecap="round"/></svg>,
    <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="34" fill="#E53535"/><path d="M50 24v52M24 50h52" stroke="#fff" strokeWidth="6" strokeLinecap="round"/></svg>,
  ];
  return (
    <div style={{ width: size, height: size, display: "grid", placeItems: "center", padding: 14, boxSizing: "border-box" }}>
      <div style={{ width: "100%", height: "100%" }}>
        {variants[id % variants.length]}
      </div>
    </div>
  );
};

Object.assign(window, { Icon, Avatar, Badge, Btn, Card, Field, Input, Select, Logo, ProductImage });
