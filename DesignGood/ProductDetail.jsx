// Tradeball — Product detail page

const ProductDetail = ({ product, onBack, onContact }) => {
  const [thumb, setThumb] = React.useState(0);
  const [saved, setSaved] = React.useState(false);
  const status = product.status; // "reservado" | "pending" | undefined

  return (
    <main style={{ maxWidth: 1180, margin: "0 auto", padding: "24px 32px 80px" }}>
      <a onClick={onBack} style={{ display:"inline-flex", alignItems:"center", gap:8, color:"#0E0E10", cursor:"pointer", fontWeight:600, fontSize:14, marginBottom:20 }}>
        <Icon name="arrow-left" size={16}/> Volver
      </a>

      {status === "reservado" && (
        <div style={{ background:"#FFF6DC", color:"#8A6500", padding:"12px 18px", borderRadius:14, fontWeight:600, fontSize:14, marginBottom:20 }}>Producto reservado para otro comprador</div>
      )}
      {status === "pending" && (
        <div style={{ background:"#FFF6DC", color:"#8A6500", padding:"12px 18px", borderRadius:14, fontWeight:600, fontSize:14, marginBottom:20 }}>Solicitud pendiente de confirmación</div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:40 }}>
        {/* LEFT: image */}
        <div>
          <Card style={{ aspectRatio:"1/1", overflow:"hidden", display:"grid", placeItems:"center" }}>
            <ProductImage id={product.id + thumb}/>
          </Card>
          <div style={{ display:"flex", gap:10, marginTop:14 }}>
            {[0,1,2,3].map(i => (
              <button key={i} onClick={() => setThumb(i)} style={{
                width:80, height:80, padding:0, border: i===thumb ? "2px solid #E53535" : "1px solid #E5E5EA",
                background:"#fff", borderRadius:14, cursor:"pointer", overflow:"hidden",
              }}>
                <ProductImage id={product.id + i}/>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: details */}
        <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
          <span style={{ fontSize:11, fontWeight:600, letterSpacing:".08em", textTransform:"uppercase", color:"#8A8A95" }}>{product.cat}</span>
          <h1 style={{ fontSize:32, fontWeight:700, lineHeight:1.15, margin:0, letterSpacing:-0.3 }}>{product.name}</h1>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <span style={{ fontSize:36, fontWeight:800 }}>{product.price}</span>
            <Badge kind={conditionBadge(product.condition)}>{product.condition}</Badge>
          </div>

          <div style={{ borderTop:"1px solid #F1F1F3", paddingTop:18 }}>
            <h3 style={{ fontSize:15, fontWeight:700, margin:"0 0 8px" }}>Descripción</h3>
            <p style={{ fontSize:14, lineHeight:1.6, color:"#2A2A2E", margin:0 }}>
              Pieza de coleccionista en excelente estado. Conservada en funda protectora desde su apertura.
              Procede de colección personal libre de humo. Envío certificado con seguimiento.
            </p>
          </div>

          <Card style={{ padding:14, display:"flex", alignItems:"center", gap:12 }}>
            <Avatar initial="J" size={40}/>
            <div>
              <div style={{ fontWeight:700, fontSize:15 }}>Javi M.</div>
              <div style={{ fontSize:12, color:"#8A8A95" }}>Vendedor · 4,9 ★ · 128 ventas</div>
            </div>
          </Card>

          <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:8 }}>
            <Btn variant="black" shape="full">Comprar</Btn>
            <Btn variant="red" shape="full" onClick={onContact}>Contactar con el vendedor</Btn>
            <button onClick={() => setSaved(!saved)} style={{
              padding:"14px 18px", borderRadius:12, background:"#fff", color: saved?"#E53535":"#0E0E10",
              boxShadow: saved? "inset 0 0 0 1.5px #E53535":"inset 0 0 0 1.5px #E5E5EA",
              border:0, fontWeight:600, fontSize:15, cursor:"pointer", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:10, fontFamily:"inherit",
            }}>
              <Icon name={saved?"heart-filled":"heart"} size={18} color={saved?"#E53535":"#0E0E10"}/>
              {saved ? "Guardado en favoritos" : "Guardar en favoritos"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

window.ProductDetail = ProductDetail;
