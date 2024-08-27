// @ts-check
const { test, expect } = require('@playwright/test');
const { link } = require('fs');

const poortainer = 'http://127.0.0.1:8000';

test('has title', async ({ page }) => {
  await page.goto(poortainer);
  await expect(page).toHaveTitle("Poor man's portainer");
});


test('container table is not empty', async ({ page }) => {
  await page.goto(poortainer);
  await expect(page.locator('#containerTable').locator('tbody').locator('tr')).toHaveCount(4);
});

test('has correct text in table fields', async ({ page }) => {
  await page.goto(poortainer);

  
  const expectedTexts = [
    ['03ebdb25', 'xenodochial_cannon', 'mcr.microsoft.com/playwright:v1.43.0-jammy', 'running', /Up/],
    ['718dc860', 'brave_agnesi',       'nginx',                                      'exited', /Exited \(\d+\) \d+ hours ago/],
    ['30d7a419', 'vibrant_noether',    'nginx',                                      'exited', /Exited \(\d+\) \d+ hours ago/],
    ['df1b1457', 'loving_wilbur',      'nginx',                                      'exited', /Exited \(\d+\) \d+ hours ago/]
  ];

  for (let i = 0; i < expectedTexts.length; i++) {
    for (let j = 0; j < expectedTexts[i].length; j++) {
      await expect(page.locator('#containerTable').locator('tbody').locator('tr').nth(i).locator('td').nth(j)).toHaveText(expectedTexts[i][j]);
    }
    const buttons = page.locator('#containerTable').locator('tbody').locator('tr').nth(i).locator('td').nth(5).locator('button');
    await expect(buttons).toHaveCount(4);
  }
});

test('check button states', async ({ page }) => {
  await page.goto(poortainer);
  
  const expectedButtonStates = [
    [true, false, false, false],
    [false, true, false, false],
    [false, true, false, false],
    [false, true, false, false]
  ];

  for (let i = 0; i < expectedButtonStates.length; i++) {
    const buttons = page.locator('#containerTable').locator('tbody').locator('tr').nth(i).locator('td').nth(5).locator('button');
    for (let j = 0; j < expectedButtonStates[i].length; j++) {
      if (expectedButtonStates[i][j]) {
        await expect(buttons.nth(j)).toBeDisabled();
      } else {
        await expect(buttons.nth(j)).toBeEnabled();
      }
    }
  }
});

test('clicking on link updates table', async ({ page }) => {
  await page.goto(poortainer);

  const links = await page.locator('#containerTable').locator('tbody').locator('tr').locator('a');
  const rowCount = await page.locator('#containerTable').locator('tbody').locator('tr').count();
  console.log('rowCount: ' + rowCount);
  const expectedValues = [
    ['id', '03ebdb25'],
    ['id', '718dc860'],
    ['id', '30d7a419'],
    ['id', 'df1b1457']
  ];
  for (let i = 0; i < rowCount; i++) {
    await links.nth(i).click();
    for (let j = 0; j < expectedValues[i].length; j++) {
      await expect(page.locator('#containerTable').locator('tbody').locator('tr').nth(0).locator('td').nth(j)).toHaveText(expectedValues[i][j]);
    }
    await page.getByRole('button', {name: 'Dashboard'}).click();
  }
});
