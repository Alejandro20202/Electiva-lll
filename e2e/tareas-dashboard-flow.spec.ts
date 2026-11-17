import { expect, test } from '@playwright/test';

test('persists task form changes and updates Dashboard signals and upcoming deliveries', async ({
  page,
}) => {
  await page.goto('/tareas');
  await page.getByRole('button', { name: 'Agregar tarea', exact: true }).click();
  await page.getByRole('button', { name: 'Crear tarea' }).click();
  await expect(page.locator('.field-error')).toContainText(
    'Escribe el título de la tarea.',
  );

  const dueDate = new Date();
  dueDate.setUTCDate(dueDate.getUTCDate() + 1);
  const dueDateValue = dueDate.toISOString().slice(0, 10);

  await page.getByLabel('Título de la tarea').fill('Flujo integración');
  await page.getByLabel('Fecha de entrega (opcional)').fill(dueDateValue);
  await page.locator('#task-priority').selectOption('alta');
  await page.getByRole('button', { name: 'Crear tarea' }).click();

  const taskCard = page.locator('.task-card').filter({
    hasText: 'Flujo integración',
  });
  await expect(taskCard).toBeVisible();
  await expect(taskCard).toContainText('Alta');
  await expect(taskCard).toContainText('Pendiente');

  const storedTask = await page.evaluate(() => {
    const stored = localStorage.getItem('edutrack-data');
    return stored ? JSON.parse(stored).tareas[0] : null;
  });
  expect(storedTask.titulo).toBe('Flujo integración');
  expect(storedTask.fechaEntrega).toBe(dueDateValue);

  await page.reload();
  await expect(
    page.locator('.task-card').filter({ hasText: 'Flujo integración' }),
  ).toBeVisible();

  const reloadedTask = page.locator('.task-card').filter({
    hasText: 'Flujo integración',
  });
  await reloadedTask
    .getByRole('button', { name: 'Marcar como completada' })
    .click();
  await expect(reloadedTask).toContainText('Completada');

  await page.getByRole('link', { name: 'Dashboard', exact: true }).click();
  await expect(page.locator('.stat-card--pending .stat-value')).toHaveText('0');
  await expect(page.locator('.stat-card--completed .stat-value')).toHaveText('1');
  await expect(page.locator('.stat-card--progress .stat-value')).toHaveText('100%');
  await expect(page.getByText('No tienes próximas entregas pendientes.')).toBeVisible();

  await page.getByRole('link', { name: 'Tareas', exact: true }).click();
  const completedCard = page.locator('.task-card').filter({
    hasText: 'Flujo integración',
  });
  await completedCard.getByRole('button', { name: 'Editar', exact: true }).click();
  await page.getByLabel('Título de la tarea').fill('Tarea actualizada');
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(
    page.locator('.task-card').filter({ hasText: 'Tarea actualizada' }),
  ).toBeVisible();

  await page
    .locator('.task-card')
    .filter({ hasText: 'Tarea actualizada' })
    .getByRole('button', { name: 'Marcar como pendiente' })
    .click();
  await page.getByRole('link', { name: 'Dashboard', exact: true }).click();
  await expect(page.locator('.stat-card--pending .stat-value')).toHaveText('1');
  await expect(page.locator('.deadline-list')).toContainText('Tarea actualizada');

  await page.getByRole('link', { name: 'Tareas', exact: true }).click();
  await page
    .locator('.task-card')
    .filter({ hasText: 'Tarea actualizada' })
    .getByRole('button', { name: 'Eliminar' })
    .click();
  await page
    .locator('.task-card')
    .filter({ hasText: 'Tarea actualizada' })
    .getByRole('button', { name: 'Confirmar eliminación' })
    .click();
  await expect(page.getByText('Aún no tienes tareas')).toBeVisible();
});
