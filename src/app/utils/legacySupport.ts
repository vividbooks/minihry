/**
 * Polyfilly a podpora pro starší iOS zařízení (iOS 9-11)
 */

// Polyfill pro sessionStorage (může chybět v privátním režimu Safari)
if (typeof window !== 'undefined') {
  try {
    const testKey = '__storage_test__';
    window.sessionStorage.setItem(testKey, 'test');
    window.sessionStorage.removeItem(testKey);
  } catch (e) {
    // sessionStorage není dostupný, vytvoříme náhražku
    const mockStorage: Record<string, string> = {};
    
    (window as any).sessionStorage = {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, value: string) => { mockStorage[key] = value; },
      removeItem: (key: string) => { delete mockStorage[key]; },
      clear: () => { Object.keys(mockStorage).forEach(key => delete mockStorage[key]); },
      get length() { return Object.keys(mockStorage).length; },
      key: (index: number) => Object.keys(mockStorage)[index] || null
    };
  }
}

// Polyfill pro URLSearchParams (chybí v iOS < 10)
if (typeof window !== 'undefined' && !window.URLSearchParams) {
  class URLSearchParamsPolyfill {
    private params: Map<string, string>;

    constructor(search?: string) {
      this.params = new Map();
      
      if (search) {
        const searchString = search.startsWith('?') ? search.slice(1) : search;
        searchString.split('&').forEach(param => {
          const [key, value] = param.split('=');
          if (key) {
            this.params.set(
              decodeURIComponent(key),
              value ? decodeURIComponent(value) : ''
            );
          }
        });
      }
    }

    get(key: string): string | null {
      return this.params.get(key) || null;
    }

    set(key: string, value: string): void {
      this.params.set(key, value);
    }

    delete(key: string): void {
      this.params.delete(key);
    }

    has(key: string): boolean {
      return this.params.has(key);
    }

    toString(): string {
      const pairs: string[] = [];
      this.params.forEach((value, key) => {
        pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      });
      return pairs.join('&');
    }
  }

  (window as any).URLSearchParams = URLSearchParamsPolyfill;
}

// Polyfill pro Object.fromEntries (chybí v iOS < 12.2)
if (!Object.fromEntries) {
  Object.fromEntries = function(entries: Iterable<[any, any]>): any {
    const obj: any = {};
    for (const [key, value] of entries) {
      obj[key] = value;
    }
    return obj;
  };
}

// Polyfill pro Array.prototype.includes (chybí v iOS < 9)
if (!Array.prototype.includes) {
  Array.prototype.includes = function<T>(searchElement: T, fromIndex?: number): boolean {
    const O = Object(this);
    const len = parseInt(String(O.length)) || 0;
    if (len === 0) return false;
    const n = parseInt(String(fromIndex)) || 0;
    let k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
    
    while (k < len) {
      if (O[k] === searchElement) return true;
      k++;
    }
    return false;
  };
}

// Polyfill pro String.prototype.includes (chybí v iOS < 9)
if (!String.prototype.includes) {
  String.prototype.includes = function(search: string, start?: number): boolean {
    if (typeof start !== 'number') {
      start = 0;
    }
    
    if (start + search.length > this.length) {
      return false;
    } else {
      return this.indexOf(search, start) !== -1;
    }
  };
}

// Polyfill pro Object.assign (chybí v iOS < 9)
if (!Object.assign) {
  Object.assign = function(target: any, ...sources: any[]): any {
    if (target == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }
    
    const to = Object(target);
    
    for (let index = 0; index < sources.length; index++) {
      const nextSource = sources[index];
      
      if (nextSource != null) {
        for (const nextKey in nextSource) {
          if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
    return to;
  };
}

// Polyfill pro Array.prototype.flat (chybí v iOS < 12)
if (!Array.prototype.flat) {
  Array.prototype.flat = function(depth: number = 1): any[] {
    const flatten = (arr: any[], d: number): any[] => {
      return d > 0
        ? arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatten(val, d - 1) : val), [])
        : arr.slice();
    };
    return flatten(this, depth);
  };
}

// Polyfill pro Array.prototype.flatMap (chybí v iOS < 12)
if (!Array.prototype.flatMap) {
  Array.prototype.flatMap = function<T, U>(
    callback: (value: T, index: number, array: T[]) => U | U[]
  ): U[] {
    return this.map(callback).flat(1) as U[];
  };
}

// Polyfill pro String.prototype.replaceAll (chybí v iOS < 13.4)
if (!String.prototype.replaceAll) {
  String.prototype.replaceAll = function(search: string, replace: string): string {
    return this.split(search).join(replace);
  };
}

// Polyfill pro Promise.allSettled (chybí v iOS < 13)
if (!Promise.allSettled) {
  Promise.allSettled = function<T>(promises: Array<Promise<T>>): Promise<Array<any>> {
    return Promise.all(
      promises.map(p =>
        p
          .then(value => ({ status: 'fulfilled', value }))
          .catch(reason => ({ status: 'rejected', reason }))
      )
    );
  };
}

// Detekce starého prohlížeče
export const isLegacyBrowser = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const ua = window.navigator.userAgent;
  
  // Detekce iOS < 13
  const iOSMatch = ua.match(/OS (\d+)_/);
  if (iOSMatch && parseInt(iOSMatch[1]) < 13) {
    console.log('Detekován iOS < 13:', iOSMatch[1]);
    return true;
  }
  
  // Detekce starého Safari
  const safariMatch = ua.match(/Version\/(\d+)/);
  if (safariMatch && parseInt(safariMatch[1]) < 13) {
    console.log('Detekován Safari < 13:', safariMatch[1]);
    return true;
  }
  
  // Detekce Internet Explorer
  if (ua.indexOf('MSIE') !== -1 || ua.indexOf('Trident/') !== -1) {
    console.log('Detekován Internet Explorer');
    return true;
  }
  
  // Detekce velmi starého Chrome (< 60)
  const chromeMatch = ua.match(/Chrome\/(\d+)/);
  if (chromeMatch && parseInt(chromeMatch[1]) < 60) {
    console.log('Detekován starý Chrome:', chromeMatch[1]);
    return true;
  }
  
  // Detekce starého Firefoxu (< 60)
  const firefoxMatch = ua.match(/Firefox\/(\d+)/);
  if (firefoxMatch && parseInt(firefoxMatch[1]) < 60) {
    console.log('Detekován starý Firefox:', firefoxMatch[1]);
    return true;
  }
  
  // Test podpory moderních funkcí
  const hasModernFeatures = 
    typeof Promise !== 'undefined' &&
    typeof URLSearchParams !== 'undefined' &&
    typeof Array.prototype.includes !== 'undefined' &&
    typeof Object.assign !== 'undefined';
  
  if (!hasModernFeatures) {
    console.log('Chybí moderní JavaScript funkce');
    return true;
  }
  
  return false;
};

// Fallback pro window.scrollTo s smooth behavior (nefunguje v iOS < 13)
export const smoothScrollTo = (x: number, y: number): void => {
  if (typeof window === 'undefined') return;
  
  try {
    window.scrollTo({
      top: y,
      left: x,
      behavior: 'smooth'
    });
  } catch (e) {
    // Fallback pro starší prohlížeče
    window.scrollTo(x, y);
  }
};

// Bezpečný JSON parse s fallbackem
export const safeJSONParse = <T = any>(str: string, fallback: T): T => {
  try {
    return JSON.parse(str);
  } catch (e) {
    console.warn('JSON parse failed, using fallback:', e);
    return fallback;
  }
};

// Bezpečný JSON stringify
export const safeJSONStringify = (obj: any, fallback: string = '{}'): string => {
  try {
    return JSON.stringify(obj);
  } catch (e) {
    console.warn('JSON stringify failed, using fallback:', e);
    return fallback;
  }
};

// Inicializace podpory pro starší prohlížeče
export const initLegacySupport = (): void => {
  if (isLegacyBrowser()) {
    console.log('Starší prohlížeč detekován - polyfilly aktivovány');
  }
};

// Export pro použití
export default {
  isLegacyBrowser,
  smoothScrollTo,
  safeJSONParse,
  safeJSONStringify,
  initLegacySupport
};
