import { expect, test, type Page } from '@playwright/test';

const panel = (page: Page) => page.locator('.workspace-panel:visible');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('API is reachable through the same frontend origin', async ({ request }) => {
  const response = await request.get('/api/health');
  expect(response.ok()).toBeTruthy();
  expect(await response.json()).toMatchObject({ status: 'ok', service: 'slkapp-api' });
  const missing = await request.get('/api/missing');
  expect(missing.status()).toBe(404);
  expect(await missing.json()).toHaveProperty('message');
});

test('reopening a menu and clicking + reuse its tab and preserve each page state', async ({
  page,
}) => {
  await expect(
    panel(page).getByRole('heading', { name: 'ขายสินค้า, บริการ', exact: true }),
  ).toBeVisible();
  await expect(panel(page).locator('[data-page="sale-and-service"]')).toHaveCount(1);
  await panel(page).getByLabel('จำนวน แถว 1', { exact: true }).fill('2');
  await panel(page)
    .locator('.invoice-table')
    .evaluate((node) => {
      node.scrollTop = 180;
    });

  await page.getByRole('button', { name: '2 ระบบขายและลูกหนี้', exact: true }).click();
  await page.getByRole('button', { name: '2.2 ใบเสนอราคา', exact: true }).click();
  await panel(page).getByLabel('บันทึกส่วนตัวของแท็บนี้').fill('quotation state');

  for (let repeat = 0; repeat < 2; repeat++) {
    await page.getByRole('button', { name: '2 ระบบขายและลูกหนี้', exact: true }).click();
    await page
      .getByRole('button', { name: '2.13 ขายสินค้า, บริการ พร้อมใช้งาน', exact: true })
      .click();
    await expect(page.getByRole('tab')).toHaveCount(2);
    await expect(
      page.getByRole('tab', { name: '2.13 ขายสินค้า, บริการ', exact: true }),
    ).toHaveCount(1);
    await expect(panel(page).getByLabel('จำนวน แถว 1', { exact: true })).toHaveValue('2');
    await expect(panel(page).getByLabel('มูลค่าสุทธิ', { exact: true })).toHaveText('41,730.00บาท');
    expect(
      await panel(page)
        .locator('.invoice-table')
        .evaluate((node) => node.scrollTop),
    ).toBe(180);

    await page.getByRole('button', { name: '2 ระบบขายและลูกหนี้', exact: true }).click();
    await page.getByRole('button', { name: '2.2 ใบเสนอราคา', exact: true }).click();
    await expect(page.getByRole('tab')).toHaveCount(2);
    await expect(panel(page).getByLabel('บันทึกส่วนตัวของแท็บนี้')).toHaveValue('quotation state');
  }

  await page.getByRole('button', { name: 'เปิดเมนูขายสินค้า, บริการ', exact: true }).dblclick();
  await expect(page.getByRole('tab')).toHaveCount(2);
  await expect(
    page.getByRole('tab', { name: '2.13 ขายสินค้า, บริการ', exact: true }),
  ).toHaveAttribute('aria-selected', 'true');
  await expect(panel(page).getByLabel('จำนวน แถว 1', { exact: true })).toHaveValue('2');
});

test('New confirms unsaved changes and starts a document in the existing menu tab', async ({
  page,
}) => {
  await panel(page).getByRole('button', { name: 'Save', exact: true }).click();
  await expect(panel(page).getByRole('status', { name: 'สถานะการบันทึก' })).toBeVisible();
  await panel(page).getByLabel('จำนวน แถว 1', { exact: true }).fill('2');
  await panel(page).getByRole('button', { name: 'New', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'เปิดเอกสารอื่น?', exact: true });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'ยกเลิก', exact: true }).click();
  await expect(panel(page).getByLabel('จำนวน แถว 1', { exact: true })).toHaveValue('2');
  await expect(page.getByRole('tab')).toHaveCount(1);

  await panel(page).getByRole('button', { name: 'New', exact: true }).click();
  await dialog.getByRole('button', { name: 'ทิ้งการแก้ไขและเปิดเอกสาร', exact: true }).click();
  await expect(page.getByRole('tab')).toHaveCount(1);
  await expect(panel(page).getByRole('textbox', { name: 'รหัสลูกค้า', exact: true })).toHaveValue(
    '',
  );
  await expect(panel(page).getByLabel('มูลค่าสุทธิ', { exact: true })).toHaveText('0.00บาท');
  const number = await panel(page)
    .getByRole('textbox', { name: 'เลขที่เอกสาร', exact: true })
    .inputValue();
  expect(number).toMatch(/^DRAFT-/);
  await page.getByRole('button', { name: 'เปิดเมนูขายสินค้า, บริการ', exact: true }).dblclick();
  await expect(page.getByRole('tab')).toHaveCount(1);
  await expect(panel(page).getByRole('textbox', { name: 'เลขที่เอกสาร', exact: true })).toHaveValue(
    number,
  );
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('slkapp.sales.v1') ?? '[]'),
  );
  expect(stored).toHaveLength(1);
  expect(stored[0].number).toBe('IV690248');
  expect(stored[0].lines[0].quantity).toBe(1);
});

test('customer and product lookup fill fields and totals update', async ({ page }) => {
  await panel(page).getByRole('button', { name: 'ค้นหาลูกค้า', exact: true }).click();
  const customer = page.getByRole('dialog', { name: 'ค้นหาลูกค้า', exact: true });
  await customer.getByLabel('ค้นหาในรายการ').fill('สยาม');
  await customer.getByRole('button', { name: 'เลือก 0105559012345', exact: true }).click();
  await expect(panel(page).getByLabel('ชื่อลูกค้า', { exact: true })).toHaveValue(
    'บริษัท สยาม อินดัสทรี จำกัด',
  );
  await panel(page).getByRole('button', { name: 'ค้นหาสินค้า แถว 2', exact: true }).click();
  const product = page.getByRole('dialog', { name: 'ค้นหาสินค้าและบริการ', exact: true });
  await product.getByLabel('ค้นหาในรายการ').fill('S000003');
  await product.getByRole('button', { name: 'เลือก S000003', exact: true }).click();
  await expect(panel(page).getByLabel('ชื่อสินค้า แถว 2', { exact: true })).toHaveValue(
    'ค่าบริการติดตั้ง',
  );
  await expect(panel(page).getByLabel('มูลค่าสุทธิ', { exact: true })).toHaveText('25,680.00บาท');
  await panel(page).getByRole('button', { name: 'ลบรายการ แถว 2', exact: true }).click();
  await expect(panel(page).getByLabel('มูลค่าสุทธิ', { exact: true })).toHaveText('20,330.00บาท');
});

test('exclusive, inclusive and exempt taxes calculate correctly', async ({ page }) => {
  await expect(panel(page).getByLabel('ภาษีมูลค่าเพิ่ม', { exact: true })).toHaveText('1,330.00');
  await panel(page).getByLabel('ประเภทภาษี', { exact: true }).selectOption('inclusive');
  await expect(panel(page).getByLabel('มูลค่าสินค้าก่อนภาษี', { exact: true })).toHaveText(
    '17,757.01',
  );
  await expect(panel(page).getByLabel('ภาษีมูลค่าเพิ่ม', { exact: true })).toHaveText('1,242.99');
  await expect(panel(page).getByLabel('มูลค่าสุทธิ', { exact: true })).toHaveText('19,000.00บาท');
  await panel(page).getByLabel('ประเภทภาษี', { exact: true }).selectOption('exempt');
  await expect(panel(page).getByLabel('ภาษีมูลค่าเพิ่ม', { exact: true })).toHaveText('0.00');
  await panel(page).getByLabel('ค่าขนส่ง', { exact: true }).fill('100');
  await expect(panel(page).getByLabel('มูลค่าสุทธิ', { exact: true })).toHaveText('19,100.00บาท');
});

test('Save keeps changes and notes after a reload', async ({ page }) => {
  await panel(page).getByLabel('จำนวน แถว 1', { exact: true }).fill('2');
  await panel(page).getByRole('button', { name: 'Detail', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'รายละเอียดเพิ่มเติม', exact: true });
  await dialog.getByLabel('หมายเหตุเอกสาร').fill('จัดส่งวันจันทร์');
  await dialog.getByRole('button', { name: 'ปิด', exact: true }).click();
  await panel(page).getByRole('button', { name: 'Save', exact: true }).click();
  await expect(panel(page).getByRole('status', { name: 'สถานะการบันทึก' })).toContainText(
    'บันทึกเอกสารใน browser แล้ว',
  );
  await page.reload();
  await expect(panel(page).getByLabel('จำนวน แถว 1', { exact: true })).toHaveValue('2');
  await expect(panel(page).getByLabel('มูลค่าสุทธิ', { exact: true })).toHaveText('41,730.00บาท');
  await panel(page).getByRole('button', { name: 'Detail', exact: true }).click();
  await expect(
    page
      .getByRole('dialog', { name: 'รายละเอียดเพิ่มเติม', exact: true })
      .getByLabel('หมายเหตุเอกสาร'),
  ).toHaveValue('จัดส่งวันจันทร์');
});

test('validation and unsaved tab confirmation protect incomplete documents', async ({ page }) => {
  await panel(page).getByRole('button', { name: 'New', exact: true }).click();
  await panel(page).getByRole('button', { name: 'Save', exact: true }).click();
  await expect(panel(page).getByRole('alert')).toContainText('กรุณาเลือกลูกค้า');
  await panel(page).getByLabel('เลขที่ใบกำกับภาษี', { exact: true }).fill('unsaved');
  await page.getByRole('button', { name: 'ปิดแท็บ 1', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'ปิดแท็บที่ยังไม่ได้บันทึก?', exact: true });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'กลับไปทำงาน', exact: true }).click();
  await expect(panel(page).getByLabel('เลขที่ใบกำกับภาษี', { exact: true })).toHaveValue('unsaved');
  await page.getByRole('button', { name: 'ปิดแท็บ 1', exact: true }).click();
  await dialog.getByRole('button', { name: 'ปิดและทิ้งการแก้ไข', exact: true }).click();
  await expect(page.getByRole('tab')).toHaveCount(0);
  await page.getByRole('button', { name: 'เปิดเมนูขายสินค้า, บริการ', exact: true }).click();
  await expect(page.getByRole('tab')).toHaveCount(1);
  await expect(panel(page).getByRole('textbox', { name: 'เลขที่เอกสาร', exact: true })).toHaveValue(
    'IV690248',
  );
});

test('deleting a modified document removes storage and closes its tab', async ({ page }) => {
  await panel(page).getByRole('button', { name: 'Save', exact: true }).click();
  await expect(panel(page).getByRole('status', { name: 'สถานะการบันทึก' })).toBeVisible();
  await panel(page).getByLabel('จำนวน แถว 1', { exact: true }).fill('3');
  await panel(page).getByRole('button', { name: 'Delete', exact: true }).click();
  await page
    .getByRole('dialog', { name: 'ลบเอกสารนี้?', exact: true })
    .getByRole('button', { name: 'ยืนยันลบเอกสาร', exact: true })
    .click();
  await expect(page.getByRole('tab')).toHaveCount(0);
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('slkapp.sales.v1') ?? 'null')),
  ).toEqual([]);
  await page.reload();
  await expect(panel(page).getByRole('textbox', { name: 'เลขที่เอกสาร', exact: true })).toHaveValue(
    /^DRAFT-/,
  );
});

test('table takes remaining desktop height with its own scrolling', async ({ page }) => {
  const before = await panel(page).locator('.form-table').boundingBox();
  await page.setViewportSize({ width: 1440, height: 1200 });
  const after = await panel(page).locator('.form-table').boundingBox();
  expect(after!.height - before!.height).toBeCloseTo(200, 0);
  const dimensions = await panel(page)
    .locator('.invoice-table')
    .evaluate((node) => ({ client: node.clientHeight, scroll: node.scrollHeight }));
  expect(dimensions.scroll).toBeGreaterThan(dimensions.client);
  await expect(panel(page).getByLabel('มูลค่าสุทธิ', { exact: true })).toBeInViewport();
});

test('mobile layout has no page-level horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    body: document.documentElement.scrollWidth,
  }));
  expect(dimensions.body).toBeLessThanOrEqual(dimensions.viewport);
  const table = await panel(page)
    .locator('.invoice-table')
    .evaluate((node) => ({ client: node.clientWidth, scroll: node.scrollWidth }));
  expect(table.scroll).toBeGreaterThan(table.client);
  await panel(page).getByLabel('มูลค่าสุทธิ', { exact: true }).scrollIntoViewIfNeeded();
  await expect(panel(page).getByLabel('มูลค่าสุทธิ', { exact: true })).toBeVisible();
});
