export default function Icon({ name, size = 20, color, className, style, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      style={{ color, flexShrink: 0, display: 'inline-block', verticalAlign: 'middle', ...style }}
      className={className}
      {...props}
    >
      <use href={`/icons.svg#${name}`} />
    </svg>
  )
}
