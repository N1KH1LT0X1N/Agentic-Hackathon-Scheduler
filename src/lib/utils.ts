export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 60);
}

export function formatCurrency(value: number | null | undefined, currency = 'USD') {
  if (value == null) return 'N/A';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch (error) {
    return `${currency} ${value}`;
  }
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return 'TBD';
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function differenceInHours(target: Date) {
  const now = new Date();
  return (target.getTime() - now.getTime()) / (1000 * 60 * 60);
}

export function isFuture(date: Date | null | undefined) {
  if (!date) return false;
  return date.getTime() > Date.now();
}
