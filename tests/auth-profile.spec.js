import { expect, test } from '@playwright/test';

const localDbKey = 'resonance_local_base44';

async function resetLocalAuth(page) {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.evaluate((key) => {
    window.localStorage.removeItem(key);
    window.sessionStorage.clear();
  }, localDbKey);
}

test('failed email login stays on login and shows an error', async ({ page }) => {
  await resetLocalAuth(page);

  await page.getByLabel('Email').fill('missing@example.com');
  await page.getByLabel('Password').fill('wrong-password');
  await page.getByRole('button', { name: 'Log in' }).click();

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText('Invalid email or password')).toBeVisible();
});

test('new user can register, reach profile, and create profile entities', async ({ page }) => {
  await resetLocalAuth(page);
  const email = `new-user-${Date.now()}@example.com`;

  await page.goto('/register', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill('correct horse battery staple');
  await page.getByLabel('Confirm Password').fill('correct horse battery staple');
  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByText('YOUR PROFILE')).toBeVisible();

  await page.getByPlaceholder('Brooklyn, NY or 40.6782,-73.9442').fill('Brooklyn, NY');
  await page.getByPlaceholder('tech, philosophy, music...').fill('music, books');
  await page.getByRole('button', { name: /CREATE PROFILE/ }).click();
  await expect(page.getByText('PROFILE SAVED')).toBeVisible();

  const stored = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key)), localDbKey);
  expect(stored.currentUser.email).toBe(email);
  expect(stored.entities.UserProfile).toHaveLength(1);
  expect(stored.entities.PrivateProfile).toHaveLength(1);
  expect(stored.entities.UserProfile[0].user_id).toBe(stored.currentUser.id);
});

test('user can log out and create a profile for a new account', async ({ page }) => {
  await resetLocalAuth(page);
  const firstEmail = `first-user-${Date.now()}@example.com`;
  const secondEmail = `second-user-${Date.now()}@example.com`;

  await page.goto('/register', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Email').fill(firstEmail);
  await page.getByLabel('Password', { exact: true }).fill('correct horse battery staple');
  await page.getByLabel('Confirm Password').fill('correct horse battery staple');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/profile$/);

  await page.getByRole('button', { name: /LOG OUT/ }).click();
  await expect(page).toHaveURL(/\/login$/);

  await page.goto('/register', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Email').fill(secondEmail);
  await page.getByLabel('Password', { exact: true }).fill('correct horse battery staple');
  await page.getByLabel('Confirm Password').fill('correct horse battery staple');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/profile$/);

  await page.getByPlaceholder('Brooklyn, NY or 40.6782,-73.9442').fill('Queens, NY');
  await page.getByPlaceholder('tech, philosophy, music...').fill('film, cooking');
  await page.getByRole('button', { name: /CREATE PROFILE/ }).click();
  await expect(page.getByText('PROFILE SAVED')).toBeVisible();

  const stored = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key)), localDbKey);
  expect(stored.currentUser.email).toBe(secondEmail);
  expect(stored.entities.UserProfile).toHaveLength(1);
  expect(stored.entities.PrivateProfile).toHaveLength(1);
  expect(stored.entities.UserProfile[0].user_id).toBe(stored.currentUser.id);
});
