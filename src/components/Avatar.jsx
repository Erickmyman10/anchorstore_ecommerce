import { getInitials, getAvatarColor } from '../utils/avatar';

/**
 * Usage:  <Avatar name="John Doe" size={40} />
 *
 * size    — pixel diameter (default 40)
 * name    — full name string; drives initials + deterministic color
 * className — optional extra Tailwind / CSS classes
 */
export default function Avatar({ name = '', size = 40, className = '' }) {
  const bg = getAvatarColor(name);
  const initials = getInitials(name);

  // Keep text readable: yellow (#fdcb6e) gets dark text, everything else white
  const color = bg === '#fdcb6e' ? '#1a1a1a' : '#ffffff';
  const fontSize = Math.max(10, Math.round(size * 0.38));

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bg,
        color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize,
        flexShrink: 0,
        userSelect: 'none',
      }}
      aria-label={name || 'User avatar'}
    >
      {initials}
    </div>
  );
}
