import { expect, test, type Page } from '@playwright/test';

const sale = '2.13 ขายสินค้า, บริการ';
const quote = '2.2 ใบเสนอราคา';
const order = '2.3 ใบสั่งขาย';
const customer = '2.1 ข้อมูลลูกค้า';
const tab = (page: Page, name: string) => page.getByRole('tab', { name, exact: true });
const panel = (page: Page) => page.locator('.workspace-panel:visible');
async function open(page: Page, name: string) {
  await page.getByRole('button', { name: '2. ระบบขายและลูกหนี้', exact: true }).click();
  await page.getByRole('button', { name, exact: true }).click();
}
async function action(page: Page, name: string, command: string) {
  await tab(page, name).click({ button: 'right' });
  await page.getByRole('menuitem', { name: command, exact: true }).click();
}
async function welcome(page: Page) {
  await expect(page.getByRole('tablist')).toHaveCount(0);
  await expect(page.getByRole('tab')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'ยินดีต้อนรับ', exact: true })).toBeVisible();
  await expect(page.getByText('Company: Demo', { exact: true })).toBeVisible();
  await expect(page.getByText('User: Demo', { exact: true })).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('Close targets the right-clicked inactive tab and preserves the active page', async ({
  page,
}) => {
  await open(page, quote);
  await open(page, order);
  await panel(page).getByLabel('บันทึกส่วนตัวของแท็บนี้').fill('order state');
  await expect(page.getByRole('tablist').getByRole('button')).toHaveCount(0);
  await tab(page, quote).click({ button: 'right' });
  await expect(tab(page, order)).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('menuitem', { name: 'Close', exact: true }).click();
  await expect(page.getByRole('tab')).toHaveText([sale, order]);
  await expect(tab(page, order)).toHaveAttribute('aria-selected', 'true');
  await expect(panel(page).getByLabel('บันทึกส่วนตัวของแท็บนี้')).toHaveValue('order state');
});

test('Close to Left preserves its target and right neighbors', async ({ page }) => {
  await open(page, quote);
  await open(page, order);
  await open(page, customer);
  await tab(page, sale).click();
  await action(page, order, 'Close to Left');
  await expect(page.getByRole('tab')).toHaveText([order, customer]);
  await expect(tab(page, order)).toHaveAttribute('aria-selected', 'true');
});

test('Close to Right preserves its target and left neighbors', async ({ page }) => {
  await open(page, quote);
  await open(page, order);
  await open(page, customer);
  await action(page, quote, 'Close to Right');
  await expect(page.getByRole('tab')).toHaveText([sale, quote]);
  await expect(tab(page, quote)).toHaveAttribute('aria-selected', 'true');
});

test('boundary actions are disabled and an empty workspace hides the bar and shows Demo', async ({
  page,
}) => {
  await tab(page, sale).click({ button: 'right' });
  await expect(page.getByRole('menuitem')).toHaveText([
    'Close',
    'Close to Left',
    'Close to Right',
    'Close All',
  ]);
  await expect(page.getByRole('menuitem', { name: 'Close to Left', exact: true })).toBeDisabled();
  await expect(page.getByRole('menuitem', { name: 'Close to Right', exact: true })).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('menu')).toHaveCount(0);
  await expect(tab(page, sale)).toBeFocused();
  await action(page, sale, 'Close');
  await welcome(page);
  await open(page, quote);
  await expect(page.getByRole('tablist')).toBeVisible();
  await expect(page.getByRole('tab')).toHaveText([quote]);
  await open(page, sale);
  await open(page, order);
  await action(page, quote, 'Close All');
  await welcome(page);
});

test('Close All cancels the whole batch until unsaved changes are confirmed', async ({ page }) => {
  await panel(page).getByLabel('จำนวน แถว 1', { exact: true }).fill('2');
  await open(page, quote);
  await panel(page).getByLabel('บันทึกส่วนตัวของแท็บนี้').fill('quote state');
  await open(page, order);
  await action(page, quote, 'Close All');
  const dialog = page.getByRole('dialog', { name: 'ปิดแท็บที่ยังไม่ได้บันทึก?', exact: true });
  await expect(dialog).toBeVisible();
  await expect(page.locator('[role="tab"]')).toHaveCount(3);
  await expect(dialog).toContainText('ปิด 3 แท็บ');
  await dialog.getByRole('button', { name: 'กลับไปทำงาน', exact: true }).click();
  await expect(page.getByRole('tab')).toHaveCount(3);
  await expect(tab(page, order)).toHaveAttribute('aria-selected', 'true');
  await tab(page, sale).click();
  await expect(panel(page).getByLabel('จำนวน แถว 1', { exact: true })).toHaveValue('2');
  await tab(page, quote).click();
  await expect(panel(page).getByLabel('บันทึกส่วนตัวของแท็บนี้')).toHaveValue('quote state');
  await action(page, quote, 'Close All');
  await dialog.getByRole('button', { name: 'ปิดและทิ้งการแก้ไข', exact: true }).click();
  await welcome(page);
});

test('directional closing keeps the dirty target without discarding or prompting', async ({
  page,
}) => {
  await panel(page).getByLabel('จำนวน แถว 1', { exact: true }).fill('2');
  await open(page, quote);
  await open(page, order);
  await action(page, sale, 'Close to Right');
  await expect(page.getByRole('tab')).toHaveText([sale]);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(panel(page).getByLabel('จำนวน แถว 1', { exact: true })).toHaveValue('2');
});

test('context menu supports keyboard, outside dismissal and narrow viewports', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, quote);
  await open(page, order);
  await open(page, customer);
  await tab(page, customer).click({ button: 'right' });
  const menu = page.getByRole('menu');
  await expect(menu).toBeVisible();
  const bounds = await menu.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(8);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(382);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(836);
  await expect(page.getByRole('menuitem', { name: 'Close', exact: true })).toHaveCSS(
    'cursor',
    'default',
  );
  await page.keyboard.press('Escape');
  await expect(tab(page, customer)).toBeFocused();
  await tab(page, customer).press('Shift+F10');
  await expect(menu).toBeVisible();
  await page.keyboard.press('End');
  await expect(page.getByRole('menuitem', { name: 'Close All', exact: true })).toBeFocused();
  await expect(tab(page, customer)).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitem', { name: 'Close to Left', exact: true })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitem', { name: 'Close All', exact: true })).toBeFocused();
  await page.getByRole('heading', { name: 'ข้อมูลลูกค้า', exact: true }).click();
  await expect(menu).toHaveCount(0);
  await expect(page.getByRole('tab')).toHaveCount(4);
});
