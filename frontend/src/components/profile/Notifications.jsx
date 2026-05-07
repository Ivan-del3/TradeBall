import { Empty } from './shared'
import Icon from '../Icon'

export default function Notifications() {
  return (
    <div className="tb-card">
      <h2 className="tb-card-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon name="bell" size={22} />
        Notificaciones
      </h2>
      <Empty text="Las notificaciones se implementarán próximamente" />
    </div>
  )
}
