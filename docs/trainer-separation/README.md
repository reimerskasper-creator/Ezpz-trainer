# EZPZ Trainer — standalone app

This package contains the existing coaching app, unchanged. It is separate from fitness.html (the personal fitness app).

Create a new repository, for example EZPZ-Coach, and copy these four files to its root. Enable GitHub Pages from main / root. After its live URL is verified, update the Trainer link in fitness.html. Keep the old Trainer URL working until that succeeds.

Browser records are stored per origin, not repository path. Hosting under the same reimerskasper-creator.github.io origin preserves access to existing local records; another domain/browser needs export and restore. Export a Trainer backup before the move. No client data is included in this source package.

Do not rename localStorage keys during separation. The Trainer service worker should remain scoped to the new repository path. Do not remove the original root service worker until its effect on existing installations is handled.
