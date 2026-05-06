# Tradeball — Web UI Kit

Click-thru recreation of the Tradeball marketplace web app. Open `index.html` to navigate.

## Screens
- **Home** — sticky header, pill search, sticky filter sidebar, 4-column product grid with hover-lift cards.
- **Product detail** — 50/50 split with thumbnail strip, condition badge, seller block, stacked CTAs (Comprar / Contactar / Guardar).
- **Sell** — narrow centered form, photo grid (Principal tag, dashed add slot), price+condition row, success state.
- **Favorites panel** — right-side overlay with empty illustration.
- **Profile shell** — fixed 256px sidebar (user card + nav), with sections:
  - Mi perfil — avatar uploader + name fields + read-only email
  - Mis ventas — list with row-highlight states and request popup
  - Mis compras — list with Enviado-state inline actions
  - Chat — split panel, red message bubbles, send button
  - Notificaciones, Monedero (action sheet + tx history), Valoraciones (rating badge + cards)
- **Modals** — login, register, logout (wave illustration), purchase request

## Files
| File | What it holds |
|---|---|
| `Primitives.jsx`     | `Icon`, `Avatar`, `Badge`, `Btn`, `Card`, `Field`, `Input`, `Select`, `Logo`, `ProductImage` |
| `Header.jsx`         | Sticky header, logged-in / logged-out states |
| `HomePage.jsx`       | Search, `FiltersPanel`, `ProductCard`, grid, `PRODUCTS` mock data |
| `ProductDetail.jsx`  | Detail view with status banners |
| `SellPage.jsx`       | Form + success state |
| `FavoritesPanel.jsx` | Slide-in overlay |
| `Profile.jsx`        | `ProfileShell`, `SectionPerfil`, `SectionVentas`, `SectionCompras` |
| `ProfileSections.jsx`| `SectionChat`, `SectionNotif`, `SectionMonedero`, `SectionValoraciones` |
| `Modals.jsx`         | Login / Register / Logout / Purchase request |
| `index.html`         | App shell stitching everything together |

## Notes
- Product imagery is geometric SVG placeholders (`ProductImage` in `Primitives.jsx`) — swap for real photos in production.
- All icons reference `../../assets/icons.svg` symbols.
