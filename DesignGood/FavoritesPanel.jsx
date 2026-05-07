// Tradeball — Favorites slide-in panel

const FavoritesPanel = ({ open, onClose, items = [] }) => {
  return (
    <React.Fragment>
      {open && <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(14,14,16,.4)", zIndex:80, animation:"fadeIn 120ms ease-out" }}/>}
      <aside style={{
        position:"fixed", top:0, right:0, height:"100vh", width:400, maxWidth:"100vw",
        background:"#fff", boxShadow:"0 8px 24px rgba(14,14,16,.10), 0 24px 60px rgba(14,14,16,.18)",
        transform: open?"translateX(0)":"translateX(100%)", transition:"transform 240ms cubic-bezier(.2,.7,.2,1)",
        zIndex:90, display:"flex", flexDirection:"column",
      }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 22px", borderBottom:"1px solid #F1F1F3" }}>
          <h2 style={{ fontSize:20, fontWeight:700, margin:0 }}>Mis favoritos</h2>
          <button onClick={onClose} style={{ background:"transparent", border:0, cursor:"pointer", color:"#0E0E10", padding:6, borderRadius:8 }}>
            <Icon name="close" size={20}/>
          </button>
        </div>
        <div style={{ flex:1, overflow:"auto", padding:18 }}>
          {items.length === 0 ? (
            <div style={{ marginTop:48, display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
              <img src="../../assets/illu-empty-heart.svg" width="160" height="160" alt=""/>
              <p style={{ color:"#8A8A95", fontSize:14, margin:0 }}>No tienes favoritos todavía</p>
            </div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              {items.map(p => <ProductCard key={p.id} p={p}/>)}
            </div>
          )}
        </div>
      </aside>
    </React.Fragment>
  );
};

window.FavoritesPanel = FavoritesPanel;
