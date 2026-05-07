// Tradeball — Header (sticky)

const Header = ({ loggedIn, onNav, onAuth, onLogout, onSell, onFavorites, user }) => (
  <header style={{
    position: "sticky", top: 0, zIndex: 50,
    background: "#fff", borderBottom: "1px solid #F1F1F3",
    height: 64, display: "flex", alignItems: "center",
    padding: "0 32px",
  }}>
    <a onClick={() => onNav("home")} style={{ cursor: "pointer", display: "flex" }}>
      <Logo size={30} />
    </a>
    <div style={{ flex: 1 }}/>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Btn variant="red" icon="plus" onClick={onSell}>Vender</Btn>
      {loggedIn ? (
        <React.Fragment>
          <Btn variant="gray" icon="heart" onClick={onFavorites}>Favoritos</Btn>
          <button onClick={() => onNav("profile")} style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#F1F1F3", border: 0, padding: "5px 14px 5px 5px",
            borderRadius: 999, cursor: "pointer", fontWeight: 600, fontSize: 14, fontFamily: "inherit",
          }}>
            <Avatar initial={user.initial} size={28}/>
            {user.name}
          </button>
          <a onClick={onLogout} style={{ cursor:"pointer", fontWeight: 600, fontSize: 14, color:"#0E0E10" }}>Salir</a>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <a onClick={() => onAuth("login")} style={{ cursor:"pointer", fontWeight: 600, fontSize: 14, color:"#0E0E10" }}>Iniciar sesión</a>
          <Btn variant="black" onClick={() => onAuth("register")}>Registrarse</Btn>
        </React.Fragment>
      )}
    </div>
  </header>
);

window.Header = Header;
