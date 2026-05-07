// Tradeball — Sell page (publish a product)

const SellPage = ({ onPublished, published, onBack }) => {
  const [photos, setPhotos] = React.useState([0,1]);

  if (published) {
    return (
      <main style={{ maxWidth:560, margin:"60px auto", padding:"32px", textAlign:"center" }}>
        <img src="../../assets/illu-success.svg" width="160" height="160" alt=""/>
        <h1 style={{ fontSize:28, fontWeight:700, margin:"20px 0 8px" }}>Producto publicado</h1>
        <p style={{ color:"#5C5C66", marginBottom:24 }}>Tu producto ya está visible en el marketplace.</p>
        <Btn variant="red" shape="full" onClick={onBack}>Volver al inicio</Btn>
      </main>
    );
  }

  return (
    <main style={{ maxWidth:560, margin:"32px auto", padding:"24px 24px 80px" }}>
      <a onClick={onBack} style={{ display:"inline-flex", alignItems:"center", gap:8, color:"#0E0E10", cursor:"pointer", fontWeight:600, fontSize:14, marginBottom:20 }}>
        <Icon name="arrow-left" size={16}/> Volver
      </a>
      <h1 style={{ fontSize:28, fontWeight:700, margin:"0 0 24px" }}>Vender un producto</h1>

      <Card style={{ padding:24, display:"flex", flexDirection:"column", gap:20 }}>
        <div>
          <div style={{ fontSize:13, fontWeight:600, color:"#5C5C66", marginBottom:10 }}>Fotos (máx. 5)</div>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            {photos.map((id, i) => (
              <div key={i} style={{ position:"relative", width:96, height:96, borderRadius:14, background:"#fff", border: i===0 ? "2px solid #E53535" : "1px solid #E5E5EA", overflow:"hidden" }}>
                <ProductImage id={id}/>
                {i===0 && (
                  <span style={{ position:"absolute", left:6, top:6, background:"#E53535", color:"#fff", fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:999 }}>Principal</span>
                )}
              </div>
            ))}
            {photos.length < 5 && (
              <button onClick={() => setPhotos([...photos, photos.length+2])} style={{
                width:96, height:96, borderRadius:14, border:"2px dashed #B7B7BF", background:"#fff",
                display:"grid", placeItems:"center", cursor:"pointer", color:"#8A8A95",
              }}>
                <Icon name="plus" size={24}/>
              </button>
            )}
          </div>
        </div>

        <Field label="Nombre del producto">
          <Input placeholder="P. ej. Pikachu Holo 1ª edición"/>
        </Field>

        <Field label="Descripción (opcional)">
          <textarea placeholder="Estado, edición, detalles..." rows={4} style={{
            padding:"12px 14px", border:"1px solid #E5E5EA", borderRadius:12,
            background:"#fff", fontSize:15, fontFamily:"inherit", color:"#0E0E10",
            outline:"none", resize:"vertical",
          }}/>
        </Field>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <Field label="Precio">
            <Input suffix="€" placeholder="0,00"/>
          </Field>
          <Field label="Estado">
            <Select><option>Nuevo</option><option>Casi nuevo</option><option>Usado</option></Select>
          </Field>
        </div>

        <Field label="Categoría">
          <Select><option>Cartas</option><option>Figuras</option><option>Plushies</option><option>Accesorios</option></Select>
        </Field>

        <Btn variant="red" shape="full" onClick={onPublished}>Publicar producto</Btn>
      </Card>
    </main>
  );
};

window.SellPage = SellPage;
