function parseCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1")}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export const cookies = {
  setData(key: string, value: string, expires: Date): void {
    if (typeof document === "undefined") return;
    document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  },

  getData(key: string): string | null {
    return parseCookie(key);
  },

  removeData(key: string): void {
    if (typeof document === "undefined") return;
    document.cookie = `${encodeURIComponent(key)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  },

  /** Clears app auth cookie(s). Extend here if you store more session keys. */
  clear(keys: string[]): void {
    keys.forEach((k) => this.removeData(k));
  },
};
