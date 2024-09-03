// @ts-check
const { test, expect } = require('@playwright/test');
const { link } = require('fs');

const poortainer = process.env.POORTAINER_URL || 'http://127.0.0.1:8080';

const expectedTable = [
  ['bfcc763b', 'kanboard-kanboard-1', 'kanboard/kanboard:latest',                   'running', /Up/],
  ['4872800e', 'portainer',           'portainer/portainer-ce:2.21.0',              'running', /Up/],
  ['718dc860', 'brave_agnesi',        'nginx',                                      'running', /Up/],
  ['30d7a419', 'vibrant_noether',     'nginx',                                      'exited', /Exited/],
  ['df1b1457', 'loving_wilbur',       'nginx',                                      'exited', /Exited/]
]

test('Title exists', async ({ page }) => {
  await page.goto(poortainer);
  await expect(page).toHaveTitle("Poor man's portainer");
});

test('Table is not empty', async ({ page }) => {
  await page.goto(poortainer);
  await expect(page.locator('#containerTable').locator('tbody').locator('tr')).toHaveCount(5);
});

test('Table values are expected ones', async ({ page }) => {
  await page.goto(poortainer);

  for (let i = 0; i < expectedTable.length; i++) {
    for (let j = 0; j < expectedTable[i].length; j++) {
      await expect(page.locator('#containerTable').locator('tbody').locator('tr').nth(i).locator('td').nth(j)).toHaveText(expectedTable[i][j]);
    }
    const buttons = page.locator('#containerTable').locator('tbody').locator('tr').nth(i).locator('td').nth(5).locator('button');
    await expect(buttons).toHaveCount(4);
  }
});

test('Button are disabled depending the container state', async ({ page }) => {
  await page.goto(poortainer);
  
  const expectedButtonStates = [
    [true, false, false, false],
    [true, false, false, false],
    [true, false, false, false],
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

test('Detail View loads', async ({ page }) => {
  await page.goto(poortainer);

  const links = await page.locator('#containerTable').locator('tbody').locator('tr').locator('a');
  const rowCount = await page.locator('#containerTable').locator('tbody').locator('tr').count();
  console.log('rowCount: ' + rowCount);
  const expectedValues = [
    ['id', 'bfcc763b'],
    ['id', '4872800e'],
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

test('Start button starts a container', async ({ page }) => {
  await page.goto(poortainer);

  const startButton = page.getByRole('row', { name: 'df1b1457 loving_wilbur nginx' }).getByRole('button').first();
  const stopButton = page.getByRole('row', { name: 'df1b1457 loving_wilbur nginx' }).getByRole('button').nth(1);
  
  await expect(stopButton).toBeDisabled();
  await startButton.click(); 
  const action = page.locator('#containerTableHead').locator('tr').locator('td').nth(5);
  await expect(action).toHaveText('Starting... ⏳');
  // the view should auto reload and text gets back to normal  
  await expect(action).toHaveText('Actions (To be implemented)');
  await expect(stopButton).toBeEnabled();
  await expect(startButton).toBeDisabled();
});

test('Stop button stops a container', async ({ page }) => {
  await page.goto(poortainer);

  const startButton = page.getByRole('row', { name: 'df1b1457 loving_wilbur nginx' }).getByRole('button').first();
  const stopButton = page.getByRole('row', { name: 'df1b1457 loving_wilbur nginx' }).getByRole('button').nth(1);
  console.log('startButton: ' + startButton);
  await expect(startButton).toBeDisabled();
  await stopButton.click(); 
  const action = page.locator('#containerTableHead').locator('tr').locator('td').nth(5);
  await expect(action).toHaveText('Stopping ... ⏳');
  // the view should auto reload and text gets back to normal  
  await expect(action).toHaveText('Actions (To be implemented)');
  await expect(startButton).toBeEnabled();
  await expect(stopButton).toBeDisabled();
});

test('logs show logs in view', async ({ page }) => {
  await page.goto(poortainer);
  const logsArea = page.locator('#data');
  const logsButton = page.getByRole('row', { name: 'df1b1457 loving_wilbur nginx' }).getByRole('button').nth(2);

  await expect(logsArea).toBeEmpty();
  await expect(logsButton).toBeEnabled();
  await logsButton.click(); 
  console.log('get logs ... ');
  await expect(logsArea).not.toBeEmpty();
  await expect(logsArea).toHaveText(/start worker processes/);
  await page.getByRole('button', { name: 'Dashboard' }).click();
  await expect(logsArea).toBeEmpty();
  });