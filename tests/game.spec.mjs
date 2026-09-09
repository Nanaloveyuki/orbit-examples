import { test, expect } from '@playwright/test';

for (const viewport of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
  test(`voxel scene and controls ${viewport.width}`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    await expect(page.locator('body > canvas')).toBeVisible();
    await expect(page.locator('#loading')).toBeHidden({ timeout: 100000 });
    await expect(page.locator('#error')).toBeHidden();
    await expect(page.locator('.slot')).toHaveCount(12);
    await page.getByRole('button', { name: 'Stone', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Stone', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await page.getByLabel('Fly', { exact: true }).check();
    expect(await page.evaluate(() => window.__moonbit_input.fly)).toBe(true);
    const before = await page.locator('body > canvas').screenshot();
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(600);
    await page.keyboard.up('KeyW');
    const after = await page.locator('body > canvas').screenshot();
    expect(before.equals(after)).toBe(false);
    const pixels = await page.evaluate(async () => {
      const source = document.querySelector('body > canvas');
      return new Promise(resolve => requestAnimationFrame(() => {
        const copy = document.createElement('canvas');
        copy.width = 80; copy.height = 60;
        const ctx = copy.getContext('2d');
        ctx.drawImage(source, 0, 0, 80, 60);
        const { data } = ctx.getImageData(0, 0, 80, 60);
        const colors = new Set();
        let opaque = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] > 0) opaque++;
          colors.add(`${data[i] >> 4},${data[i + 1] >> 4},${data[i + 2] >> 4}`);
        }
        resolve({ colors: colors.size, opaque });
      }));
    });
    expect(pixels.colors).toBeGreaterThan(8);
    expect(pixels.opaque).toBe(4800);
    await page.getByRole('button', { name: 'Command console' }).click();
    await page.getByLabel('Command', { exact: true }).fill('tp 12oops 4');
    await page.getByRole('button', { name: 'Run command' }).click();
    expect(await page.getByLabel('Command', { exact: true }).evaluate(input => input.validity.valid)).toBe(false);
    await expect(page.getByLabel('Command', { exact: true })).toHaveValue('tp 12oops 4');
    await page.getByLabel('Command', { exact: true }).fill('look 45 -15');
    await page.getByRole('button', { name: 'Run command' }).click();
    await expect(page.getByLabel('Command', { exact: true })).toHaveValue('');
    await page.getByRole('button', { name: 'Command console' }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath('scene.png') });
    expect(errors).toEqual([]);
  });
}
