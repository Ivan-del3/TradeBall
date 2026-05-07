// Tradeball — Profile sub-sections: Chat, Notif, Monedero, Valoraciones

const CONVERSATIONS = [
  { id:1, user:"javi_m",  product:"Pikachu Holo 1ª edición", price:"120,00 €", last:"¿Aceptas oferta de 100€?", unread:2, pid:0 },
  { id:2, user:"otaku.es",product:"Nendoroid Miku",          price:"62,90 €",  last:"Enviado hoy con seguimiento", unread:0, pid:4 },
  { id:3, user:"kawaii_lr",product:"Plushie Sumikko",        price:"15,50 €",  last:"¡Llegó perfecto, gracias!", unread:1, pid:2 },
];

const SectionChat = () => {
  const [active, setActive] = React.useState(1);
  const conv = CONVERSATIONS.find(c => c.id === active);
  return (
    <Card style={{ padding:0, overflow:"hidden", height:600, display:"flex" }}>
      {/* Conversation list */}
      <div style={{ width:272, borderRight:"1px solid #F1F1F3", display:"flex", flexDirection:"column" }}>
        <div style={{ padding:"18px 18px 12px", fontSize:18, fontWeight:700 }}>Chat</div>
        <ul style={{ listStyle:"none", margin:0, padding:0, flex:1, overflow:"auto" }}>
          {CONVERSATIONS.map(c => (
            <li key={c.id} onClick={() => setActive(c.id)} style={{
              display:"flex", alignItems:"center", gap:10, padding:"12px 14px", cursor:"pointer",
              background: c.id===active?"#FDECEC":"transparent",
              borderBottom:"1px solid #F1F1F3",
            }}>
              <div style={{ width:44, height:44, borderRadius:10, background:"#fff", border:"1px solid #F1F1F3", overflow:"hidden", flex:"none" }}>
                <ProductImage id={c.pid}/>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
                  <span style={{ fontWeight:700, fontSize:14 }}>{c.user}</span>
                  {c.unread>0 && <span style={{ background:"#E53535", color:"#fff", fontSize:10, fontWeight:700, padding:"1px 7px", borderRadius:999 }}>{c.unread}</span>}
                </div>
                <div style={{ fontSize:12, color:"#5C5C66", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{c.product}</div>
                <div style={{ fontSize:12, color:"#8A8A95", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{c.last}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {/* Chat window */}
      <div style={{ flex:1, display:"flex", flexDirection:"column" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 18px", borderBottom:"1px solid #F1F1F3" }}>
          <div style={{ width:40, height:40, borderRadius:10, background:"#fff", border:"1px solid #F1F1F3", overflow:"hidden", flex:"none" }}>
            <ProductImage id={conv.pid}/>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontWeight:700, fontSize:14 }}>{conv.product} · {conv.price}</div>
            <div style={{ fontSize:12, color:"#8A8A95" }}>con {conv.user}</div>
          </div>
        </div>
        <div style={{ flex:1, padding:"18px 18px", overflow:"auto", display:"flex", flexDirection:"column", gap:14, background:"#F9F9F9" }}>
          <Bubble who="them" name={conv.user} time="10:42">Hola, ¿está disponible todavía?</Bubble>
          <Bubble who="me"   name="Tú" time="10:43">¡Sí! Aún disponible.</Bubble>
          <Bubble who="them" name={conv.user} time="10:45">{conv.last}</Bubble>
        </div>
        <div style={{ display:"flex", gap:10, padding:14, borderTop:"1px solid #F1F1F3" }}>
          <textarea placeholder="Escribe un mensaje..." rows={1} style={{
            flex:1, resize:"none", padding:"12px 14px", border:"1px solid #E5E5EA", borderRadius:14,
            fontFamily:"inherit", fontSize:14, outline:"none",
          }}/>
          <Btn variant="red" shape="icon"><Icon name="send" size={18} color="#fff"/></Btn>
        </div>
      </div>
    </Card>
  );
};

const Bubble = ({ who, name, time, children }) => {
  const me = who === "me";
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems: me?"flex-end":"flex-start", gap:4, maxWidth:"80%", alignSelf: me?"flex-end":"flex-start" }}>
      <div style={{ fontSize:11, color:"#8A8A95" }}>{name} · {time}</div>
      <div style={{
        background: me?"#E53535":"#fff", color: me?"#fff":"#0E0E10",
        padding:"10px 14px", borderRadius:14,
        border: me?"none":"1px solid #F1F1F3",
        fontSize:14, lineHeight:1.4,
      }}>{children}</div>
    </div>
  );
};

const SectionNotif = () => {
  const items = [
    { id:1, text:"javi_m te ha enviado un mensaje sobre Pikachu Holo", time:"hace 5 min" },
    { id:2, text:"Tu producto Funko Pop Daenerys ha sido vendido",     time:"hace 2 h" },
    { id:3, text:"Has recibido una valoración de 5 estrellas",         time:"ayer" },
    { id:4, text:"Charizard Base Set ha sido enviado",                 time:"hace 2 días" },
  ];
  return (
    <Card style={{ padding:0, overflow:"hidden" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"22px 24px", borderBottom:"1px solid #F1F1F3" }}>
        <Icon name="bell" size={22}/>
        <h2 style={{ margin:0, fontSize:22, fontWeight:700 }}>Notificaciones</h2>
      </div>
      <ul style={{ listStyle:"none", margin:0, padding:0 }}>
        {items.map(n => (
          <li key={n.id} style={{ padding:"16px 24px", borderBottom:"1px solid #F1F1F3", display:"flex", justifyContent:"space-between", alignItems:"center", gap:16 }}>
            <span style={{ fontSize:14 }}>{n.text}</span>
            <span style={{ fontSize:12, color:"#8A8A95", whiteSpace:"nowrap" }}>{n.time}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
};

const SectionMonedero = () => {
  const [action, setAction] = React.useState(null); // "in" | "out"
  const txs = [
    { id:1, label:"Cobro de pedido", date:"12 mar", amount:"+120,00 €", income:true },
    { id:2, label:"Pago de pedido",  date:"08 mar", amount:"−62,90 €",  income:false },
    { id:3, label:"Ingreso",         date:"01 mar", amount:"+50,00 €",  income:true },
    { id:4, label:"Retirada",        date:"24 feb", amount:"−100,00 €", income:false },
    { id:5, label:"Cobro de pedido", date:"15 feb", amount:"+85,00 €",  income:true },
  ];
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <Card style={{ padding:28 }}>
        <div style={{ fontSize:13, color:"#8A8A95", fontWeight:600 }}>Saldo disponible</div>
        <div style={{ fontSize:48, fontWeight:800, letterSpacing:-1, marginTop:6 }}>247,50 €</div>
        <div style={{ display:"flex", gap:12, marginTop:18 }}>
          <Btn variant="red" onClick={() => setAction("in")}>Ingresar dinero</Btn>
          <Btn variant="outline-gray" onClick={() => setAction("out")}>Retirar dinero</Btn>
        </div>
        {action && (
          <div style={{ marginTop:18, padding:18, background:"#F9F9F9", borderRadius:14, display:"flex", gap:10, alignItems:"flex-end" }}>
            <Field label={action==="in"?"Cantidad a ingresar":"Cantidad a retirar"}>
              <Input suffix="€" placeholder="0,00"/>
            </Field>
            <Btn variant={action==="in"?"red":"outline-gray"}>Confirmar</Btn>
            <Btn variant="ghost" onClick={() => setAction(null)}>Cancelar</Btn>
          </div>
        )}
      </Card>
      <Card style={{ padding:0, overflow:"hidden" }}>
        <h3 style={{ margin:0, padding:"20px 24px", fontSize:18, fontWeight:700, borderBottom:"1px solid #F1F1F3" }}>Movimientos</h3>
        <ul style={{ listStyle:"none", margin:0, padding:0 }}>
          {txs.map(t => (
            <li key={t.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 24px", borderBottom:"1px solid #F1F1F3" }}>
              <div>
                <div style={{ fontWeight:600, fontSize:14 }}>{t.label}</div>
                <div style={{ fontSize:12, color:"#8A8A95" }}>{t.date}</div>
              </div>
              <div style={{ fontFamily:"JetBrains Mono, monospace", fontWeight:700, color: t.income?"#1FA968":"#E53535" }}>{t.amount}</div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};

const Stars = ({ count = 5, value = 5 }) => (
  <span style={{ display:"inline-flex", gap:2 }}>
    {Array.from({ length: count }).map((_, i) => (
      <Icon key={i} name={i < value ? "star-filled" : "star"} size={16} color="#E53535"/>
    ))}
  </span>
);

const SectionValoraciones = () => {
  const reviews = [
    { id:1, name:"javi_m",   initial:"J", rating:5, text:"Vendedor genial, todo perfecto y envío rápido.",      date:"12 mar" },
    { id:2, name:"otaku.es", initial:"O", rating:5, text:"Producto en excelente estado, tal cual la descripción.", date:"03 mar" },
    { id:3, name:"mtg_shop", initial:"M", rating:4, text:"Buen trato, recomendable.",                            date:"24 feb" },
  ];
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <Card style={{ padding:24, display:"flex", alignItems:"center", gap:18 }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#FDECEC", padding:"10px 14px", borderRadius:999 }}>
          <Icon name="star-filled" size={18} color="#E53535"/>
          <span style={{ fontWeight:800, fontSize:18 }}>4,9</span>
        </div>
        <div>
          <div style={{ fontWeight:700 }}>Valoración media</div>
          <div style={{ fontSize:13, color:"#8A8A95" }}>Sobre 128 valoraciones</div>
        </div>
      </Card>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {reviews.map(r => (
          <Card key={r.id} style={{ padding:20 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
              <Avatar initial={r.initial} size={36}/>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:14 }}>{r.name}</div>
                <Stars value={r.rating}/>
              </div>
              <span style={{ fontSize:12, color:"#8A8A95" }}>{r.date}</span>
            </div>
            <p style={{ margin:0, fontSize:14, lineHeight:1.5 }}>{r.text}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

Object.assign(window, { SectionChat, SectionNotif, SectionMonedero, SectionValoraciones, Bubble, Stars });
