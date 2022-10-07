import { expect, test } from '@playwright/test';
import { HomePage } from '../page-objects/HomePage';
import { Navbuttons } from '../page-objects/components/Navbuttons';
import { Notifications } from '../page-objects/Notifications';
import { InputFields } from '../page-objects/InputFields';
//import { helpers } from '../page-objects/Helpers/helpers';

test.describe('DAO Creation', () => {
  let homePage: HomePage;
  let navButtons: Navbuttons;
  let notifications: Notifications;
  let inputFields: InputFields;

  // test.beforeEach(async ({ page }) => {
  //   homePage = new HomePage(page);
  //   navButtons = new Navbuttons(page);
  //   notifications = new Notifications(page);
  //   inputFields = new InputFields(page);
  //   homePage.visit();
  //   await page.waitForTimeout(500);
  //   notifications.closeButton('Close Audit Message');
  //   await page.waitForTimeout(500);
  //   //await page.waitForLoadState();
  //   navButtons.clickOnButton('Connect to Wallet on Header');
  //   await page.waitForLoadState();
  //   await page.locator('button[role="menuitem"]:has-text("Connect")').click();
  //   await page.waitForTimeout(1000);
  //   navButtons.clickOnButton('Select Local Wallet - Web3');
  //   await page.waitForTimeout(4000);
  //   page.waitForSelector('#connected');
  //   notifications.assertConnected();
  //   await page.waitForLoadState('networkidle');
  // });

  test('Create 1:1 Gnosis Parent DAO', async ({ page }) => {
    homePage = new HomePage(page);
    navButtons = new Navbuttons(page);
    notifications = new Notifications(page);
    inputFields = new InputFields(page);
    homePage.visit();
    //await page.waitForLoadState('load');
    await page.waitForTimeout(1000);
    // notifications.closeButton('Close Audit Message');
    // //await page.waitForLoadState('domcontentloaded');
    // await page.waitForTimeout(1000);
    
    navButtons.clickOnButton('Connect to Wallet on Header');
    //await page.waitForTimeout(1000);
    await page.waitForLoadState('load');
    await page.click('[data-testid="menu:connect"]');
    //await page.waitForTimeout(1500);
    await page.waitForLoadState('domcontentloaded');
    navButtons.clickOnButton('Select Local Wallet - Web3');
    await page.waitForTimeout(4000);
    page.waitForSelector('#connected');
    notifications.assertConnected();
    await page.waitForLoadState('networkidle');
    navButtons.clickOnButton('Create a Fractal - Button');

    /* Check URL to make sure navigation is correct. */
    await expect(page).toHaveURL('http://localhost:3000/#/daos/new');

    inputFields.fillField('Insert Fractal Name');
    navButtons.clickOnButton('Next Button');

    /* Select Gnosis Safe */
    await page.locator('text=Gnosis Safe').click();

    navButtons.clickOnButton('Next Button');
    inputFields.fillField('Insert Local Node Wallet');
    navButtons.clickOnButton('Deploy Button');
    await page.waitForLoadState();
    await expect(page).not.toHaveURL('http://localhost:3000/#/daos/new');

    const parentDAO = page.locator('text=Playwright Parent | Home');
    await expect(parentDAO).toContainText('Playwright Parent | Home');
  });
});
