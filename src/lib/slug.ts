import { nanoid } from 'nanoid';

export function generateBaseSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD") // normalize unicode (e.g., á -> a + ')
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ""); // trim hyphens
}

export function generateRandomSuffix(length: number = 4): string {
  return nanoid(length);
}

export function generateSlug(name: string): string {
  const base = generateBaseSlug(name);
  const suffix = generateRandomSuffix();
  return `${base}-${suffix}`;
}
