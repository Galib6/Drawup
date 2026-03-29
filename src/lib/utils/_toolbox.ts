import dayjs from 'dayjs';

export const Toolbox = {
  withCurrency: function (amount: number | string, symbol: string = '৳'): string {
    return symbol + '' + this.toSafeNumber(amount);
  },

  truncateNumber: (value: number, scale: number = 2) => {
    const factor = Math.pow(10, scale);
    return Math.floor(value * factor) / factor;
  },

  toLowerText: function (text: string): string {
    return text?.toLowerCase();
  },

  toCapitalizeText: function (text: string): string {
    return text
      ?.split(' ')
      ?.map((word) => word?.charAt(0)?.toUpperCase() + word?.slice(1)?.toLowerCase())
      ?.join(' ');
  },

  toUpperText: function (text: string): string {
    return text?.toUpperCase();
  },

  toBool: function (value: string | boolean): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value === 'true';
    return false;
  },

  isEmpty: function (value: any): boolean {
    return (
      value === null ||
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === 'object' && Object.keys(value).length === 0)
    );
  },

  isNotEmpty: function (value: any): boolean {
    return (
      value !== null &&
      value !== undefined &&
      value !== '' &&
      !(Array.isArray(value) && value.length === 0) &&
      !(typeof value === 'object' && Object.keys(value).length === 0)
    );
  },

  toSafeNumber: function (value: any): number {
    return this.isNotEmpty(value) ? Number(value) : 0;
  },

  isValidObject: function (value: any): boolean {
    return typeof value === 'object' && value !== null;
  },

  toSafeObject: function (value: any): any {
    return this.isNotEmpty(value) ? value : {};
  },

  toCleanObject: function (obj: { [key: string]: any }): any {
    if (this.isValidObject(obj)) {
      Object.keys(obj).forEach((key) => {
        if (this.isEmpty(obj[key])) delete obj[key];
      });
    }

    return this.toSafeObject(obj);
  },

  toCleanArray: function <T = any>(array: T[]): T[] {
    return array.filter((x) => this.isNotEmpty(x));
  },

  safeConcat(...parts: (string | undefined | null)[]): string {
    return parts.filter((part) => !!part && part.trim() !== '').join(' ');
  },

  computeArrayDiffs: function <T = any>(
    initialArr: T[] = [],
    currentArr: T[] = [],
    key: keyof T,
  ): (T & { isDeleted?: boolean })[] {
    const initialMap = new Map(initialArr.map((elem) => [elem[key], elem]));
    const currentMap = new Map(currentArr.map((elem) => [elem[key], elem]));

    const added = currentArr.filter((elem) => !initialMap.has(elem[key]));

    const updated = currentArr.filter((elem) => {
      const original = initialMap.get(elem[key]);
      return original && JSON.stringify(original) !== JSON.stringify(elem);
    });

    const deleted = initialArr
      .filter((elem) => !currentMap.has(elem[key]))
      .map((elem) => ({ ...elem, isDeleted: true })) as (T & { isDeleted?: boolean })[];

    return [...added, ...updated, ...deleted] as (T & { isDeleted?: boolean })[];
  },

  pickProps: function <T extends Record<string, any>, K extends keyof T>(
    items: T | T[],
    propsToKeep: K[],
  ): Pick<T, K> | Pick<T, K>[] {
    const pickProps = (item: T): Pick<T, K> => {
      const sanitized = {} as Pick<T, K>;

      propsToKeep.forEach((prop) => {
        if (prop in item) sanitized[prop] = item[prop];
      });

      return sanitized;
    };

    return Array.isArray(items) ? items.map(pickProps) : pickProps(items);
  },

  omitProps: function <T extends Record<string, any>, K extends keyof T>(
    items: T | T[],
    propsToRemove: K[],
  ): Omit<T, K> | Omit<T, K>[] {
    const removeProps = (item: T): Omit<T, K> => {
      const sanitized = { ...item } as T;

      propsToRemove.forEach((prop) => {
        delete sanitized[prop];
      });

      return sanitized as Omit<T, K>;
    };

    return Array.isArray(items) ? items.map(removeProps) : removeProps(items);
  },

  debounce: function (func: (...args: any[]) => void, delay: number = 500) {
    let timeoutId: NodeJS.Timeout | undefined;

    return function (this: any, ...args: any[]) {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  },

  generateKey: function (length: number, type?: 'lower' | 'upper' | 'numeric' | 'key'): string {
    let result = '';
    const characters =
      type === 'lower'
        ? 'abcdefghijklmnopqrstuvwxyz'
        : type === 'upper'
          ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
          : type === 'numeric'
            ? '0123456789'
            : type === 'key'
              ? 'abcdefghijklmnopqrstuvwxyz0123456789'
              : 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++)
      result += characters.charAt(Math.floor(Math.random() * charactersLength));

    return result;
  },

  toQueryString: function (params: any): string {
    if (this.isValidObject(params)) {
      return Object.keys(params)
        .map((key) => key + '=' + params[key])
        .join('&');
    }

    return '';
  },

  parseQueryParams: function <T = any>(url: string): T {
    const queryString = url.split('?')[1];
    if (!queryString) return {} as T;

    const query: Record<string, any> = {};
    const pairs = queryString.split('&');

    for (const pair of pairs) {
      const [key, value] = pair.split('=');

      if (!value) continue;
      if (!isNaN(Number(value))) query[key] = Number(value);
      else query[key] = value;
    }

    return query as T;
  },

  queryNormalizer: function (options: any): any {
    const pureOption = this.toCleanObject(options);

    if (pureOption?.query) return options.query;

    const queries: any = [];
    Object.entries(pureOption).forEach(([key, value]: any) => {
      const valueType = Array.isArray(value) ? 'array' : typeof value;

      if (valueType === 'array') {
        return value.map((option: any) => queries.push(`${key}=${option}`));
      } else if (valueType === 'object') {
        return queries.push(`${key}=${JSON.stringify(value)}`);
      } else {
        return queries.push(`${key}=${value}`);
      }
    });

    return queries.join('&');
  },

  appendPagination: function (path: string, page = 1, limit = 10): string {
    return `${path}?page=${page}&limit=${limit}`;
  },

  acceptFileTypes: function (file: any, acceptTypes: string[]): boolean {
    return Toolbox.isNotEmpty(
      acceptTypes.filter((acceptType) => file?.name?.toLowerCase()?.endsWith(acceptType)),
    );
  },

  exportCSV: function (
    fileName: string,
    data: object[],
    headers?: string[],
    isFieldNameCapitalize: boolean = false,
  ) {
    if (this.isEmpty(data)) return;

    const keys = headers || Object.keys(data[0]);
    const headerRow = isFieldNameCapitalize ? keys.map((key) => Toolbox.toPrettyText(key)) : keys;

    const csvRows = data.map((row) =>
      keys
        .map((key) => {
          const val = (row as Record<string, unknown>)[key];
          return `"${(val ?? '').toString().replace(/"/g, '""')}"`;
        })
        .join(','),
    );

    const csvContent = [headerRow.join(','), ...csvRows].join('\r\n');

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  },

  /**
   * creates a url-safe string from arbitrary text by removing disallowed
   * characters and normalizing whitespace. Useful when you need a segment that
   * can't contain spaces or symbols (but doesn't append random keys the way
   * generateSlug does).
   *
   * Example:
   *   Toolbox.sanitizeUrl('Hello World! @123'); // 'hello-world-123'
   */
  sanitizeUrl: function (input: string, separator: string = '-') {
    if (!input) return '';
    return (
      input
        .toString()
        .trim()
        // collapse whitespace into separator
        .replace(/\s+/g, separator)
        // strip characters that are not alphanumeric or separator
        .replace(new RegExp(`[^a-zA-Z0-9${separator}]+`, 'g'), '')
        // collapse repeated separators
        .replace(new RegExp(`${separator}+`, 'g'), separator)
        // drop leading/trailing separators
        .replace(new RegExp(`^${separator}+|${separator}+$`, 'g'), '')
        .toLowerCase()
    );
  },

  generateSlug: function (selector: string, separator: string = '-'): string {
    const bnToEnMap: Record<string, string> = {
      অ: 'o',
      আ: 'a',
      ই: 'i',
      ঈ: 'ee',
      উ: 'u',
      ঊ: 'oo',
      ঋ: 'ri',
      এ: 'e',
      ঐ: 'oi',
      ও: 'o',
      ঔ: 'ou',
      ক: 'k',
      খ: 'kh',
      গ: 'g',
      ঘ: 'gh',
      ঙ: 'ng',
      চ: 'ch',
      ছ: 'chh',
      জ: 'j',
      ঝ: 'jh',
      ঞ: 'n',
      ট: 't',
      ঠ: 'th',
      ড: 'd',
      ঢ: 'dh',
      ণ: 'n',
      ত: 't',
      থ: 'th',
      দ: 'd',
      ধ: 'dh',
      ন: 'n',
      প: 'p',
      ফ: 'ph',
      ব: 'b',
      ভ: 'bh',
      ম: 'm',
      য: 'y',
      র: 'r',
      ল: 'l',
      শ: 'sh',
      ষ: 'sh',
      স: 's',
      হ: 'h',
      ড়: 'r',
      ঢ়: 'rh',
      য়: 'y',
      '০': '0',
      '১': '1',
      '২': '2',
      '৩': '3',
      '৪': '4',
      '৫': '5',
      '৬': '6',
      '৭': '7',
      '৮': '8',
      '৯': '9',
      'া': 'a',
      'ি': 'i',
      'ী': 'ee',
      'ু': 'u',
      'ূ': 'oo',
      'ৃ': 'ri',
      'ে': 'e',
      'ৈ': 'oi',
      'ো': 'o',
      'ৌ': 'ou',
      'ং': 'ng',
      'ঃ': 'h',
      'ঁ': '',
    };

    if (!selector) return '';

    const type = /[\u0980-\u09FF]/.test(selector) ? 'bn' : 'en';
    const key = this.generateKey(8, 'key');
    let sanitizedSelector = selector;

    if (type === 'bn') {
      sanitizedSelector = sanitizedSelector
        .split('')
        .map((char) => bnToEnMap[char] || char)
        .join('')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    } else {
      sanitizedSelector = sanitizedSelector.replace(/[^a-zA-Z0-9\s-]+/g, '');
    }

    sanitizedSelector = sanitizedSelector
      .trim()
      .replace(/\s+/g, separator)
      .replace(/-+/g, separator)
      .replace(new RegExp(`^${separator}+|${separator}+$`, 'g'), '')
      .toLowerCase();

    return `${sanitizedSelector}${separator}${key}`;
  },

  toDeepProperty: function (data: { [key: string]: any } | any[], propertyPath: string): any {
    return propertyPath.split('.').reduce((acc, current) => {
      if (Array.isArray(acc)) {
        const idxMatch = current.match(/\[(\d+)\]/);

        if (idxMatch) {
          const idx = parseInt(idxMatch[1], 10);
          return acc[idx];
        } else {
          return acc.map((elem) => elem[current]);
        }
      } else {
        return acc && acc[current];
      }
    }, data);
  },

  groupByProperty: function (
    data: object[],
    propertyPath: string,
    propertyKeyword: string = '',
    searchPropertyPath: string = '',
    searchKeyword: string = '',
  ): object[] {
    type GroupAcc = Record<string, { name: string; values: object[] }>;
    return Object.values(
      data.reduce((acc: GroupAcc, current) => {
        const propertyKey = String(Toolbox.toDeepProperty(current, propertyPath));
        const searchPropertyKey =
          searchPropertyPath && String(Toolbox.toDeepProperty(current, searchPropertyPath)).toLowerCase();

        if (!acc[propertyKey]) acc[propertyKey] = { name: propertyKey, values: [] };

        const matchesProperty = !propertyKeyword || propertyKey === propertyKeyword;
        const matchesSearch =
          !searchPropertyPath || !searchKeyword || searchPropertyKey.includes(searchKeyword.toLowerCase());

        if (matchesProperty && matchesSearch) acc[propertyKey].values.push(current);

        return acc;
      }, {} as GroupAcc),
    );
  },

  numberToWord: function (value: number): string {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', 'Ten', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = [
      'Ten',
      'Eleven',
      'Twelve',
      'Thirteen',
      'Fourteen',
      'Fifteen',
      'Sixteen',
      'Seventeen',
      'Eighteen',
      'Nineteen',
    ];

    function convertBelowThousand(num: number): string {
      let result = '';

      if (num >= 100) {
        result += ones[Math.floor(num / 100)] + ' hundred';
        num %= 100;

        if (num !== 0) result += ' And ';
      }

      if (num >= 20) {
        result += tens[Math.floor(num / 10)];
        num %= 10;

        if (num !== 0) result += '-';
      }

      if (num > 0 && num < 10) result += ones[num];
      else if (num >= 10 && num < 20) result += teens[num - 10];

      return result;
    }

    if (value === 0) return 'zero';
    if (value < 1000) return convertBelowThousand(value);

    const billions = Math.floor(value / 1e9);
    const millions = Math.floor((value % 1e9) / 1e6);
    const thousands = Math.floor((value % 1e6) / 1e3);
    const remainder = value % 1e3;
    let result = '';

    if (billions > 0) result += convertBelowThousand(billions) + ' Billion ';
    if (millions > 0) result += convertBelowThousand(millions) + ' Million ';
    if (thousands > 0) result += convertBelowThousand(thousands) + ' Thousand ';
    if (remainder > 0) result += convertBelowThousand(remainder);

    return result.trim();
  },

  addQueryParam: function (url: string, paramName: string, paramValue: string): string {
    const urlParts = url.split('?');
    let purifiedUrl = urlParts[0];

    if (urlParts.length >= 2) {
      const queryString = urlParts[1];

      purifiedUrl += `?${queryString}&${paramName}=${paramValue}`;
    } else {
      purifiedUrl += `?${paramName}=${paramValue}`;
    }

    return purifiedUrl;
  },

  removeQueryParam: function (url: string, paramName: string): string {
    const urlParts = url.split('?');

    if (urlParts.length >= 2) {
      const queryString = urlParts[1];
      const params = queryString.split('&');

      const purifiedParams = params.filter((param) => {
        const [key] = param.split('=');

        return key !== paramName;
      });

      const purifiedQueryString = purifiedParams.length > 0 ? purifiedParams.join('&') : '';
      const purifiedUrl = urlParts[0] + (purifiedQueryString ? '?' + purifiedQueryString : '');

      return purifiedUrl;
    } else {
      return url;
    }
  },

  toRecursivelyTraverse: function (obj: any, pathsToRemove: string[] = []): any[] {
    const holdArr: any[] = [];

    function traverse(item: any) {
      if (Array.isArray(item)) {
        item.forEach((elem) => traverse(elem));
      } else if (typeof item === 'object' && item !== null) {
        for (const key in item) traverse(item[key]);
      } else {
        if (!pathsToRemove.includes(item)) holdArr.push(item);
      }
    }

    traverse(obj);
    return holdArr;
  },

  toNullifyTraverse: function <T = any>(obj: T): T {
    function traverse(item: any): any {
      if (item instanceof Date || dayjs.isDayjs(item)) {
        return item;
      } else if (Array.isArray(item)) {
        const cleanedItem = item.map(traverse).filter((val) => val !== null);
        return cleanedItem.length === 0 ? null : cleanedItem;
      } else if (typeof item === 'object' && item !== null) {
        const cleanedItem: Record<string, any> = {};

        for (const [key, val] of Object.entries(item)) {
          const cleanedVal = traverse(val);
          cleanedItem[key] = cleanedVal;
        }

        const isNullValues = Object.values(cleanedItem).every((val) => val === null);
        return isNullValues ? null : cleanedItem;
      } else if (item === '' || item === undefined) {
        return null;
      }

      return item;
    }

    return traverse(obj) as T;
  },

  isDynamicPath: function (paths: any[], pathname: string): boolean {
    return paths.some((path) => {
      if (typeof path === 'string') {
        return pathname.startsWith(path);
      } else if (typeof path === 'function') {
        const pattern = new RegExp(
          path
            .toString()
            .replace(/^\/\^/, '^')
            .replace(/\/\$/, '$')
            .replace(/\\\/\(\[\?\]\)/g, '.*'),
          'i',
        );

        return pattern.test(pathname);
      } else {
        return false;
      }
    });
  },

  printWindow: function (type: 'pdf' | 'html', content: string) {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    iframe.onload = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    };

    if (type === 'pdf') iframe.src = content;
    else iframe.srcdoc = content;
  },

  toPrettyText: function (text: string): string {
    return text
      ?.replace(/[_\-]/g, ' ')
      ?.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      ?.toLowerCase()
      ?.split(' ')
      ?.filter(Boolean)
      ?.map((word) => word?.charAt(0)?.toUpperCase() + word?.slice(1))
      ?.join(' ');
  },

  withFormData: function (data: { [key: string]: any }): FormData {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (value instanceof FileList) {
        for (let i = 0; i < value.length; i++) {
          formData.append(key, value[i]);
        }
      } else if (Array.isArray(value) || typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else if (value instanceof Date) {
        formData.append(key, value.toISOString());
      } else {
        formData.append(key, String(value));
      }
    });

    return formData;
  },

  openPopupWindow: function (url: string, options: { width?: number; height?: number } = {}): void {
    const { width = 800, height = 600 } = options;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    window.open(url, '_blank', `width=${width},height=${height},top=${top},left=${left}`);
  },

  downloadFile: function (fileName: string, content: string | Blob, mimeType = 'text/plain'): void {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    const link = document.createElement('a');

    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  },

  getTimeSince(date: string | number | Date | dayjs.Dayjs) {
    const now = dayjs();
    const created = dayjs(date);

    const diffInSeconds = now.diff(created, 'second');
    const diffInMinutes = now.diff(created, 'minute');
    const diffInHours = now.diff(created, 'hour');
    const diffInDays = now.diff(created, 'day');

    if (diffInSeconds < 60) {
      return `${diffInSeconds} second${diffInSeconds === 1 ? '' : 's'} ago`;
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    } else {
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    }
  },
};
