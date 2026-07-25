const PALETTE = [
  '#FF6B35', // brand orange
  '#F04D1A', // brand dark
  '#6c5ce7', // purple
  '#00b894', // teal
  '#0984e3', // blue
  '#e17055', // salmon
  '#fdcb6e', // yellow (text will be dark)
  '#a29bfe', // lavender
];

export function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getAvatarColor(name = '') {
  if (!name) return PALETTE[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}
