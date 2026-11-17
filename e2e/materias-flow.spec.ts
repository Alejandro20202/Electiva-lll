import { expect, test } from '@playwright/test';

test('validates, creates, edits, lists, and deletes a subject and its tasks', async ({
  page,
}) => {
  await page.goto('/materias');
  await page.getByRole('button', { name: 'Agregar materia', exact: true }).click();
  await page.getByRole('button', { name: 'Crear materia' }).click();
  await expect(page.locator('#subject-name-error')).toContainText(
    'Escribe el nombre de la materia.',
  );

  await page.getByLabel('Nombre de la materia').fill('Integración E2E');
  await page.getByLabel('Profesor').fill('Docente de pruebas');
  await page.locator('.color-option').filter({ hasText: 'Violeta' }).click();
  await page.getByRole('button', { name: 'Crear materia' }).click();

  const subjectCard = page.locator('.subject-card').filter({
    hasText: 'Integración E2E',
  });
  await expect(subjectCard).toBeVisible();
  await expect(subjectCard).toHaveClass(/subject-card--violeta/);

  const storedAfterCreate = await page.evaluate(() => {
    const stored = localStorage.getItem('edutrack-data');
    return stored ? JSON.parse(stored) : null;
  });
  expect(storedAfterCreate.materias).toHaveLength(1);
  expect(storedAfterCreate.materias[0].color).toBe('violeta');

  await subjectCard.getByRole('button', { name: 'Editar Integración E2E' }).click();
  await page.getByLabel('Nombre de la materia').fill('Integración actualizada');
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(
    page.locator('.subject-card').filter({ hasText: 'Integración actualizada' }),
  ).toBeVisible();

  await page.getByRole('link', { name: 'Tareas', exact: true }).click();
  await page.getByRole('button', { name: 'Agregar tarea', exact: true }).click();
  await page.getByLabel('Título de la tarea').fill('Tarea asociada');
  await page.getByLabel('Materia (opcional)').selectOption({
    label: 'Integración actualizada',
  });
  await page.getByRole('button', { name: 'Crear tarea' }).click();
  await expect(page.locator('.task-card')).toContainText('Tarea asociada');

  await page.getByRole('link', { name: 'Materias', exact: true }).click();
  const updatedCard = page.locator('.subject-card').filter({
    hasText: 'Integración actualizada',
  });
  await expect(updatedCard.locator('.task-count')).toContainText('1 tarea asociada');
  await updatedCard.getByRole('button', { name: 'Eliminar Integración actualizada' }).click();
  await expect(updatedCard.locator('.delete-confirmation')).toContainText(
    'También se eliminarán sus 1 tarea asociada.',
  );
  await updatedCard
    .getByRole('button', { name: 'Confirmar eliminación' })
    .click();
  await expect(page.getByText('Aún no tienes materias')).toBeVisible();

  const storedAfterDelete = await page.evaluate(() => {
    const stored = localStorage.getItem('edutrack-data');
    return stored ? JSON.parse(stored) : null;
  });
  expect(storedAfterDelete.materias).toHaveLength(0);
  expect(storedAfterDelete.tareas).toHaveLength(0);

  await page.getByRole('link', { name: 'Tareas', exact: true }).click();
  await expect(page.getByText('Aún no tienes tareas')).toBeVisible();
});
