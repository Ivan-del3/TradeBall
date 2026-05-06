// Tradeball — Home page (search + filters + product grid)

const PRODUCTS = [
  { id: 0, name: "Pikachu Holo · 1ª edición japonesa",      price: "120,00 €", cat: "Cartas",   condition: "Nuevo" },
  { id: 1, name: "Funko Pop edición limitada Daenerys",     price: "28,00 €",  cat: "Figuras",  condition: "Casi nuevo" },
  { id: 2, name: "Peluche kawaii rosa Sumikko Gurashi",     price: "15,50 €",  cat: "Plushies", condition: "Usado" },
  { id: 3, name: "Caja de cartas Magic - reserva booster",  price: "85,00 €",  cat: "Cartas",   condition: "Nuevo" },
  { id: 4, name: "Figura Nendoroid Hatsune Miku",           price: "62,90 €",  cat: "Figuras",  condition: "Casi nuevo" },
  { id: 5, name: "Plushie Kirby grande edición aniversario",price: "22,00 €",  cat: "Plushies", condition: "Casi nuevo" },
  { id: 6, name: "Carpeta clasificadora 9 bolsillos",       price: "9,99 €",   cat: "Accesorios",condition: "Nuevo" },
  { id: 7, name: "Charizard ed. Base Set 4/102",            price: "340,00 €", cat: "Cartas",   condition: "Usado" },
];

const conditionBadge = c => ({ "Nuevo":"green", "Casi nuevo":"blue", "Usado":"gray" })[c] || "gray";

const ProductCard = ({ p, onClick }) => {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background:"#fff", borderRadius:20,
        boxShadow: hover ? "0 2px 6px rgba(14,14,16,.06), 0 12px 28px rgba(14,14,16,.08)"
                         : "0 1px 2px rgba(14,14,16,.04), 0 4px 16px rgba(14,14,16,.04)",
        transition:"box-shadow 240ms cubic-bezier(.2,.7,.2,1)",
        cursor:"pointer", overflow:"hidden",
      }}>
      <div style={{ aspectRatio:"1/1", background:"#fff", borderBottom:"1px solid #F1F1F3", overflow:"hidden" }}>
        <div style={{ width:"100%", height:"100%", transform: hover?"scale(1.04)":"scale(1)", transition:"transform 240ms cubic-bezier(.2,.7,.2,1)" }}>
          <ProductImage id={p.id}/>
        </div>
      </div>
      <div style={{ padding:"14px 16px 16px" }}>
        <div style={{ fontSize:11, fontWeight:600, letterSpacing:".08em", textTransform:"uppercase", color:"#8A8A95", marginBottom:6 }}>{p.cat}</div>
        <div style={{ fontSize:15, fontWeight:600, lineHeight:1.35, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden", marginBottom:10, minHeight: 40 }}>{p.name}</div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:20, fontWeight:800 }}>{p.price}</span>
          <Badge kind={conditionBadge(p.condition)}>{p.condition}</Badge>
        </div>
      </div>
    </div>
  );
};

const FiltersPanel = ({ activeCount }) => {
  const [open, setOpen] = React.useState(true);
  return (
    <aside style={{ background:"#fff", borderRadius:20, padding:20, boxShadow:"0 1px 2px rgba(14,14,16,.04), 0 4px 16px rgba(14,14,16,.04)", alignSelf:"flex-start", position:"sticky", top: 88 }}>
      <button onClick={()=>setOpen(!open)} style={{ display:"flex", alignItems:"center", gap:10, width:"100%", border:0, background:"transparent", padding:0, cursor:"pointer", fontFamily:"inherit" }}>
        <Icon name="filter" size={18}/>
        <span style={{ fontSize:16, fontWeight:700 }}>Filtros</span>
        {activeCount > 0 && (
          <span style={{ background:"#E53535", color:"#fff", fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:999 }}>{activeCount}</span>
        )}
        <span style={{ marginLeft:"auto", color:"#8A8A95", transform: open?"rotate(180deg)":"none", transition:"transform 180ms" }}>
          <Icon name="chevron-down" size={16}/>
        </span>
      </button>
      {open && (
        <div style={{ display:"flex", flexDirection:"column", gap:18, marginTop:18 }}>
          <Field label="Categoría">
            <Select defaultValue=""><option value="">Todas las categorías</option><option>Cartas</option><option>Figuras</option><option>Plushies</option><option>Accesorios</option></Select>
          </Field>
          <Field label="Estado">
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {["Nuevo","Casi nuevo","Usado"].map(c => (
                <label key={c} style={{ display:"flex", alignItems:"center", gap:10, fontSize:14, cursor:"pointer" }}>
                  <input type="checkbox" defaultChecked={c==="Nuevo"} style={{ accentColor:"#E53535", width:16, height:16 }}/>
                  {c}
                </label>
              ))}
            </div>
          </Field>
          <Field label="Precio (€)">
            <div style={{ display:"flex", gap:8 }}>
              <Input placeholder="Min" style={{ width:"100%" }}/>
              <Input placeholder="Max" style={{ width:"100%" }}/>
            </div>
          </Field>
          <a style={{ color:"#E53535", fontSize:14, fontWeight:600, cursor:"pointer", marginTop:-4 }}>Limpiar todo</a>
        </div>
      )}
    </aside>
  );
};

const HomePage = ({ onOpenProduct }) => (
  <main style={{ maxWidth:1280, margin:"0 auto", padding:"32px 32px 80px", boxSizing:"border-box" }}>
    {/* Search */}
    <div style={{ display:"flex", alignItems:"center", gap:12, background:"#fff", borderRadius:999, padding:"14px 22px", boxShadow:"0 1px 2px rgba(14,14,16,.04), 0 4px 16px rgba(14,14,16,.04)", marginBottom:32 }}>
      <Icon name="search" size={20} color="#8A8A95"/>
      <input placeholder="Buscar productos..." style={{ flex:1, border:0, background:"transparent", outline:"none", fontSize:16, fontFamily:"inherit" }}/>
    </div>

    <div style={{ display:"grid", gridTemplateColumns:"240px 1fr", gap:32 }}>
      <FiltersPanel activeCount={1}/>
      <div>
        <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:18 }}>
          <h2 style={{ fontSize:22, fontWeight:700, margin:0 }}>{PRODUCTS.length} productos</h2>
          <Select defaultValue="recent" style={{ width:200 }}>
            <option value="recent">Más recientes</option>
            <option>Precio: menor a mayor</option>
            <option>Precio: mayor a menor</option>
          </Select>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:18 }}>
          {PRODUCTS.map(p => <ProductCard key={p.id} p={p} onClick={() => onOpenProduct(p)}/>)}
        </div>
      </div>
    </div>
  </main>
);

Object.assign(window, { HomePage, ProductCard, PRODUCTS, conditionBadge });
