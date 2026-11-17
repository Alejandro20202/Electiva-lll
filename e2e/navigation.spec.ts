import { expect, test } from '@playwright/test';

test('redirects the root and navigates to every section with an active link', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/dashboard$/);

  const sections = [
    { name: 'Materias', path: '/materias' },
    { name: 'Tareas', path: '/tareas' },
    { name: 'Calendario', path: '/calendario' },
    { name: 'Estadísticas', path: '/estadisticas' },
    { name: 'Dashboard', path: '/dashboard' },
  ];
  const navigation = page.getByRole('navigation', {
    name: 'Secciones de EduTrack',
  });

  for (const section of sections) {
    const link = navigation.getByRole('link', { name: section.name, exact: true });
    await link.click();
    await expect(page).toHaveURL(new RegExp(`${section.path}$`));
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(section.name);
    await expect(link).toHaveAttribute('aria-current', 'page');
  }
});

test('redirects an unknown address to the Dashboard', async ({ page }) => {
  await page.goto('/seccion-que-no-existe');

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dashboard');
});
