// src/pages/Profile/ProfileAvatar.tsx

interface Props {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'h-10 w-10 text-sm',
  md: 'h-16 w-16 text-xl',
  lg: 'h-20 w-20 text-2xl',
};

/**
 * Renders a coloured circle with the user's initials.
 * Drop-in replacement if you later add real avatar uploads.
 */
const ProfileAvatar = ({ name, size = 'lg' }: Props) => {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');

  return (
    <div
      className={`${sizeMap[size]} flex shrink-0 items-center justify-center rounded-full bg-blue-100 border-2 border-blue-600 text-blue-900 font-bold select-none`}
      aria-label={`Avatar for ${name}`}
    >
      {initials}
    </div>
  );
};

export default ProfileAvatar;