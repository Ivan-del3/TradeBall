// Tradeball — Profile shell with sidebar nav

const PROFILE_NAV = [
  { id: "perfil",        label: "Mi perfil",      icon: "user" },
  { id: "ventas",        label: "Mis ventas",     icon: "box",     badge: 2 },
  { id: "compras",       label: "Mis compras",    icon: "bag" },
  { id: "chat",          label: "Chat",           icon: "chat",    badge: 3 },
  { id: "notif",         label: "Notificaciones", icon: "bell" },
  { id: "monedero",      label: "Monedero",       icon: "wallet" },
  { id: "valoraciones",  label: "Valoraciones",   icon: "star" },
];

const ProfileShell = ({ user, section, onSection, children }) => (
  <main style={{ maxWidth:1280, margin:"0 auto", padding:"24px 32px 80px", display:"grid", gridTemplateColumns:"256px 1fr", gap:32 }}>
    <aside style={{ display:"flex", flexDirection:"column", gap:14, position:"sticky", top:88, alignSelf:"flex-start" }}>
      <Card style={{ padding:20, display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", gap:10 }}>
        <Avatar initial={user.initial} size={64}/>
        <div>
          <div style={{ fontSize:16, fontWeight:700 }}>{user.name} {user.lastname}</div>
          <div style={{ fontSize:13, color:"#8A8A95" }}>{user.email}</div>
        </div>
      </Card>
      <Card style={{ padding:8 }}>
        <nav style={{ display:"flex", flexDirection:"column" }}>
          {PROFILE_NAV.map(item => {
            const active = item.id === section;
            return (
              <button key={item.id} onClick={() => onSection(item.id)} style={{
                display:"flex", alignItems:"center", gap:12, textAlign:"left", padding:"11px 14px",
                background: active?"#FDECEC":"transparent",
                color: active?"#E53535":"#0E0E10",
                border:0, borderRadius:12, cursor:"pointer", fontSize:14, fontWeight:600, fontFamily:"inherit",
                position:"relative",
              }}>
                {active && <span style={{ position:"absolute", left:0, top:8, bottom:8, width:3, background:"#E53535", borderRadius:3 }}/>}
                <Icon name={item.icon} size={20}/>
                <span style={{ flex:1 }}>{item.label}</span>
                {item.badge && <span style={{ background:"#E53535", color:"#fff", fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:999 }}>{item.badge}</span>}
              </button>
            );
          })}
        </nav>
      </Card>
    </aside>
    <section>{children}</section>
  </main>
);

// ----- Mi perfil -----
const SectionPerfil = ({ user }) => (
  <Card style={{ padding:32, maxWidth:640 }}>
    <h2 style={{ margin:"0 0 24px", fontSize:24, fontWeight:700 }}>Mi perfil</h2>
    <div style={{ display:"flex", justifyContent:"center", marginBottom:28 }}>
      <div style={{ position:"relative" }}>
        <Avatar initial={user.initial} size={96}/>
        <button style={{
          position:"absolute", right:-4, bottom:-4, width:32, height:32, borderRadius:"50%",
          background:"#0E0E10", color:"#fff", border:"3px solid #fff", cursor:"pointer",
          display:"grid", placeItems:"center",
        }}><Icon name="plus" size={16}/></button>
      </div>
    </div>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
      <Field label="Nombre"><Input defaultValue={user.name}/></Field>
      <Field label="Apellidos"><Input defaultValue={user.lastname}/></Field>
    </div>
    <Field label="Email">
      <Input value={user.email} disabled style={{ background:"#F1F1F3", color:"#5C5C66" }}/>
    </Field>
    <div style={{ marginTop:24 }}>
      <Btn variant="red" shape="full">Guardar cambios</Btn>
    </div>
  </Card>
);

// ----- Mis ventas -----
const SectionVentas = ({ onOpenRequest }) => {
  const ventas = [
    { id:1, name:"Pikachu Holo 1ª edición",   cat:"Cartas",   price:"120,00 €", status:"A la venta",  state:"green",  pending:true,  highlight:"yellow" },
    { id:2, name:"Funko Pop Daenerys",         cat:"Figuras",  price:"28,00 €",  status:"En curso",    state:"yellow", pending:false },
    { id:3, name:"Plushie Kirby",              cat:"Plushies", price:"22,00 €",  status:"Devolución",  state:"orange", pending:false, highlight:"orange" },
    { id:4, name:"Carpeta 9 bolsillos",        cat:"Accesorios",price:"9,99 €",  status:"Finalizado",  state:"gray",   pending:false },
  ];
  const stateMap = { green:"green", yellow:"yellow", orange:"orange", gray:"gray" };
  return (
    <Card style={{ padding:0, overflow:"hidden" }}>
      <div style={{ padding:"22px 24px", borderBottom:"1px solid #F1F1F3", display:"flex", alignItems:"center", gap:12 }}>
        <h2 style={{ margin:0, fontSize:22, fontWeight:700 }}>Mis ventas</h2>
        <span style={{ background:"#E53535", color:"#fff", fontSize:12, fontWeight:700, padding:"2px 9px", borderRadius:999 }}>2 pendientes</span>
      </div>
      <ul style={{ listStyle:"none", margin:0, padding:0 }}>
        {ventas.map(v => (
          <li key={v.id} onClick={() => v.pending && onOpenRequest({ kind:"purchase", item:v })} style={{
            display:"flex", alignItems:"center", gap:16, padding:"16px 24px", borderBottom:"1px solid #F1F1F3",
            background: v.highlight==="yellow"?"#FFF6DC": v.highlight==="orange"?"#FCEBDA":"transparent",
            cursor: v.pending?"pointer":"default",
          }}>
            <div style={{ width:56, height:56, borderRadius:12, background:"#fff", border:"1px solid #F1F1F3", overflow:"hidden", flex:"none" }}>
              <ProductImage id={v.id}/>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:600, fontSize:15 }}>{v.name}</div>
              <div style={{ fontSize:13, color:"#8A8A95" }}>{v.cat}</div>
            </div>
            <div style={{ fontWeight:700, fontSize:15, marginRight:14 }}>{v.price}</div>
            <Badge kind={stateMap[v.state]}>{v.status}</Badge>
          </li>
        ))}
      </ul>
    </Card>
  );
};

// ----- Mis compras -----
const SectionCompras = () => {
  const compras = [
    { id:1, name:"Charizard Base Set",      seller:"javi_m",   price:"340,00 €", date:"12 mar",  status:"Pendiente",       state:"yellow" },
    { id:2, name:"Nendoroid Hatsune Miku",  seller:"otaku.es", price:"62,90 €",  date:"08 mar",  status:"Enviado",         state:"blue", actions:true },
    { id:3, name:"Booster Magic reserva",   seller:"mtg_shop", price:"85,00 €",  date:"02 mar",  status:"Completado",      state:"green" },
    { id:4, name:"Plushie Sumikko",         seller:"kawaii_lr",price:"15,50 €",  date:"24 feb",  status:"Devolución solicitada", state:"orange" },
    { id:5, name:"Funko Daenerys",          seller:"figgs",    price:"28,00 €",  date:"15 feb",  status:"Cancelado",       state:"red" },
  ];
  const stateMap = { yellow:"yellow", blue:"blue", green:"green", orange:"orange", red:"red" };
  return (
    <Card style={{ padding:0, overflow:"hidden" }}>
      <h2 style={{ margin:0, padding:"22px 24px", fontSize:22, fontWeight:700, borderBottom:"1px solid #F1F1F3" }}>Mis compras</h2>
      <ul style={{ listStyle:"none", margin:0, padding:0 }}>
        {compras.map(c => (
          <li key={c.id} style={{
            display:"flex", alignItems:"center", gap:16, padding:"16px 24px", borderBottom:"1px solid #F1F1F3",
            background: c.state==="blue"?"#E5EFFE":"transparent",
          }}>
            <div style={{ width:56, height:56, borderRadius:12, background:"#fff", border:"1px solid #F1F1F3", overflow:"hidden", flex:"none" }}>
              <ProductImage id={c.id+2}/>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:600, fontSize:15 }}>{c.name}</div>
              <div style={{ fontSize:13, color:"#8A8A95" }}>de {c.seller} · {c.date}</div>
            </div>
            <div style={{ fontWeight:700, fontSize:15, marginRight:14 }}>{c.price}</div>
            {c.actions ? (
              <div style={{ display:"flex", gap:8 }}>
                <Btn variant="green" shape="pill">Recibido OK</Btn>
                <Btn variant="outline" shape="pill">No conforme</Btn>
              </div>
            ) : (
              <Badge kind={stateMap[c.state]}>{c.status}</Badge>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
};

Object.assign(window, { ProfileShell, PROFILE_NAV, SectionPerfil, SectionVentas, SectionCompras });
