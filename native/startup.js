(() => {
  const capacitor = window.Capacitor;
  if (!capacitor?.isNativePlatform?.() || !capacitor.isPluginAvailable?.('EzpzStartup')) return;

  document.addEventListener('DOMContentLoaded', async () => {
    try {
      // The saved Home photo is a CSS background, so DOM readiness alone cannot tell
      // us whether it has decoded. Other photos and tracker sync can finish afterward.
      const hero = document.querySelector('body[data-view="home"] .home-week-card');
      const background = hero && getComputedStyle(hero).backgroundImage;
      const source = background && background.match(/url\("([^"]+)"\)/)?.[1];
      if (source) {
        const photo = new Image();
        photo.src = source;
        await photo.decode();
      }
    } catch {
      // Home has its own fallback background for a missing or invalid photo.
    }
    await capacitor.registerPlugin('EzpzStartup').ready().catch(console.error);
  }, {once: true});
})();
