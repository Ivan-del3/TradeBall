// Tradeball — Modals: Auth (login / register), Logout, Purchase request

const Backdrop = ({ children, onClose }) => (
  <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(14,14,16,.6)", display:"grid", placeItems:"center", zIndex:100, padding:20 }}>
    <div onClick={e => e.stopPropagation()}>{children}</div>
  </div>
);

const ModalCard = ({ children, w = 480, h }) => (
  <div style={{
    width:w, maxWidth:"95vw", minHeight:h,
    background:"#fff", borderRadius:24, padding:40, boxSizing:"border-box",
    boxShadow:"0 8px 24px rgba(14,14,16,.10), 0 24px 60px rgba(14,14,16,.18)",
    display:"flex", flexDirection:"column", gap:18,
  }}>{children}</div>
);

const LoginModal = ({ onClose, onSwitch, onSuccess }) => {
  const [done, setDone] = React.useState(false);
  if (done) return (
    <Backdrop onClose={onClose}>
      <ModalCard w={480} h={480}>
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", gap:14 }}>
          <img src="../../assets/illu-success.svg" width="160" height="160" alt=""/>
          <h2 style={{ fontSize:24, fontWeight:700, margin:0 }}>¡Bienvenida de vuelta!</h2>
          <p style={{ color:"#5C5C66", margin:0 }}>Has iniciado sesión correctamente.</p>
        </div>
        <Btn variant="black" shape="full" onClick={onSuccess}>Continuar</Btn>
      </ModalCard>
    </Backdrop>
  );
  return (
    <Backdrop onClose={onClose}>
      <ModalCard w={480} h={480}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <h2 style={{ margin:0, fontSize:24, fontWeight:700 }}>Iniciar sesión</h2>
          <button onClick={onClose} style={{ background:"transparent", border:0, cursor:"pointer" }}><Icon name="close" size={20}/></button>
        </div>
        <Field label="Email"><Input type="email" placeholder="tu@email.com"/></Field>
        <Field label="Contraseña"><Input type="password" placeholder="••••••••"/></Field>
        <div style={{ flex:1 }}/>
        <Btn variant="black" shape="full" onClick={() => setDone(true)}>Entrar</Btn>
        <div style={{ textAlign:"center", fontSize:14, color:"#5C5C66" }}>
          ¿Aún no tienes cuenta? <a onClick={onSwitch} style={{ color:"#E53535", fontWeight:600, cursor:"pointer" }}>Regístrate</a>
        </div>
      </ModalCard>
    </Backdrop>
  );
};

const RegisterModal = ({ onClose, onSwitch, onSuccess }) => (
  <Backdrop onClose={onClose}>
    <ModalCard w={480}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <h2 style={{ margin:0, fontSize:24, fontWeight:700 }}>Crear cuenta</h2>
        <button onClick={onClose} style={{ background:"transparent", border:0, cursor:"pointer" }}><Icon name="close" size={20}/></button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <Field label="Nombre"><Input placeholder="Marina"/></Field>
        <Field label="Apellidos"><Input placeholder="Ruiz"/></Field>
      </div>
      <Field label="Email"><Input type="email" placeholder="tu@email.com"/></Field>
      <Field label="Contraseña"><Input type="password" placeholder="••••••••"/></Field>
      <Field label="Confirmar contraseña"><Input type="password" placeholder="••••••••"/></Field>
      <Btn variant="red" shape="full" onClick={onSuccess}>Registrarse</Btn>
      <div style={{ textAlign:"center", fontSize:14, color:"#5C5C66" }}>
        ¿Ya tienes cuenta? <a onClick={onSwitch} style={{ color:"#E53535", fontWeight:600, cursor:"pointer" }}>Inicia sesión</a>
      </div>
    </ModalCard>
  </Backdrop>
);

const LogoutModal = ({ user, onClose, onConfirm }) => (
  <Backdrop onClose={onClose}>
    <ModalCard w={480} h={480}>
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", gap:14 }}>
        <img src="../../assets/illu-wave.svg" width="160" height="160" alt=""/>
        <h2 style={{ fontSize:22, fontWeight:700, margin:0 }}>¿Hasta pronto, {user.name}?</h2>
        <p style={{ color:"#5C5C66", margin:0 }}>Cerrarás sesión en Tradeball.</p>
      </div>
      <div style={{ display:"flex", gap:12 }}>
        <Btn variant="outline-gray" onClick={onClose} style={{ flex:1 }}>Cancelar</Btn>
        <Btn variant="black" onClick={onConfirm} style={{ flex:1 }}>Cerrar sesión</Btn>
      </div>
    </ModalCard>
  </Backdrop>
);

const PurchaseRequestModal = ({ item, onClose }) => (
  <Backdrop onClose={onClose}>
    <ModalCard w={480}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <h2 style={{ margin:0, fontSize:22, fontWeight:700 }}>Solicitud de compra</h2>
        <button onClick={onClose} style={{ background:"transparent", border:0, cursor:"pointer" }}><Icon name="close" size={20}/></button>
      </div>
      <div style={{ display:"flex", gap:14, alignItems:"center", padding:14, background:"#F9F9F9", borderRadius:14 }}>
        <div style={{ width:64, height:64, borderRadius:12, background:"#fff", overflow:"hidden", flex:"none" }}>
          <ProductImage id={item.id}/>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700 }}>{item.name}</div>
          <div style={{ fontWeight:800, fontSize:18 }}>{item.price}</div>
        </div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:12, padding:"4px 4px" }}>
        <Avatar initial="L" size={40}/>
        <div>
          <div style={{ fontWeight:700, fontSize:14 }}>Lucía F.</div>
          <div style={{ fontSize:13, color:"#8A8A95" }}>lucia.f@email.com</div>
        </div>
      </div>
      <div style={{ display:"flex", gap:12 }}>
        <Btn variant="outline" onClick={onClose} style={{ flex:1 }}>Rechazar</Btn>
        <Btn variant="red" onClick={onClose} style={{ flex:1 }}>Confirmar venta</Btn>
      </div>
    </ModalCard>
  </Backdrop>
);

Object.assign(window, { LoginModal, RegisterModal, LogoutModal, PurchaseRequestModal });
