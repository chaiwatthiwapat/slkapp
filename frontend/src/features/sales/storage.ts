import { createDocument, type SalesDocument } from './model';

const key = 'slkapp.sales.v1';
function isDocument(value: unknown): value is SalesDocument {
  if (!value || typeof value !== 'object') return false;
  const template = createDocument();
  const candidate = value as Record<string, unknown>;
  return (
    Object.entries(template).every(([field, defaultValue]) => {
      const actual = candidate[field];
      if (field === 'lines')
        return (
          Array.isArray(actual) &&
          actual.every(
            (line) =>
              line &&
              typeof line === 'object' &&
              ['id', 'code', 'name', 'warehouse', 'location', 'unit'].every(
                (k) => typeof line[k] === 'string',
              ) &&
              ['quantity', 'price', 'discount'].every(
                (k) => typeof line[k] === 'number' && Number.isFinite(line[k]),
              ),
          )
        );
      return (
        typeof actual === typeof defaultValue &&
        (typeof actual !== 'number' || Number.isFinite(actual))
      );
    }) && ['exclusive', 'inclusive', 'exempt'].includes(String(candidate.taxType))
  );
}
export function readDocuments(): SalesDocument[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(key) ?? 'null');
    return Array.isArray(raw) ? raw.filter(isDocument) : [createDocument(true)];
  } catch {
    return [createDocument(true)];
  }
}
export function saveDocument(document: SalesDocument): void {
  const existing = readDocuments();
  const other = existing.filter((item) => item.id !== document.id);
  if (other.some((item) => item.number === document.number))
    throw new Error('เลขที่เอกสารนี้มีอยู่แล้ว กรุณาใช้เลขที่อื่น');
  localStorage.setItem(key, JSON.stringify([...other, document]));
}
export function deleteDocument(id: string): void {
  localStorage.setItem(key, JSON.stringify(readDocuments().filter((item) => item.id !== id)));
}
