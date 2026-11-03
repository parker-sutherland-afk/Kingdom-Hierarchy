export function getMinecraftAvatarSources(username, retryCount = 0) {
  const encodedUsername = encodeURIComponent(username);
  const cacheBuster = retryCount ? `?retry=${retryCount}` : '';

  return [
    {
      provider: 'Minotar',
      src: `https://minotar.net/helm/${encodedUsername}/64.png${cacheBuster}`,
    },
    {
      provider: 'Cravatar',
      src: `https://cravatar.eu/helmavatar/${encodedUsername}/64.png${cacheBuster}`,
    },
    {
      provider: 'MineSkin',
      src: `https://mineskin.eu/helm/${encodedUsername}/64.png${cacheBuster}`,
    },
    {
      provider: 'MC-Heads',
      src: `https://mc-heads.net/avatar/${encodedUsername}/64${cacheBuster}`,
    },
  ];
}
