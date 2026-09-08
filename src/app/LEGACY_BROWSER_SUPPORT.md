# Podpora starších prohlížečů a iOS zařízení

## Přehled

Aplikace byla vylepšena o podporu starších iOS zařízení (včetně starších iPadů) a prohlížečů.

## Co bylo implementováno

### 1. JavaScript Polyfilly (`/utils/legacySupport.ts`)

Přidány polyfilly pro tyto chybějící funkce:

- **URLSearchParams** - Pro manipulaci s URL parametry (iOS < 10)
- **sessionStorage** - Fallback pro privátní režim Safari
- **Array.prototype.includes** - Kontrola přítomnosti v poli (iOS < 9)
- **String.prototype.includes** - Kontrola podřetězce (iOS < 9)
- **Object.assign** - Kopírování vlastností objektu (iOS < 9)
- **Object.fromEntries** - Převod pole na objekt (iOS < 12.2)
- **Array.prototype.flat** - Sloučení vnořených polí (iOS < 12)
- **Array.prototype.flatMap** - Map a flat v jednom (iOS < 12)
- **String.prototype.replaceAll** - Nahrazení všech výskytů (iOS < 13.4)
- **Promise.allSettled** - Čekání na všechny promises (iOS < 13)

### 2. CSS Kompatibilita (`/styles/globals.css`)

- **Barvy**: Převedeny z oklch() na hex/rgb barvy pro lepší podporu
- **Animace**: Přidány -webkit- prefixy pro všechny animace
- **Transform a Filter**: Vendor prefixy pro starší Safari
- **Flexbox fallbacky**: Podpora pro případy, kdy Grid není podporován

### 3. Detekce starých prohlížečů

Funkce `isLegacyBrowser()` detekuje:
- iOS < 13
- Safari < 13
- Internet Explorer (všechny verze)
- Chrome < 60
- Firefox < 60
- Chybějící moderní JavaScript funkce

### 4. Varovná komponenta (`/components/LegacyBrowserWarning.tsx`)

- Zobrazuje žluté informační okno uživatelům starších prohlížečů
- Zobrazuje se pouze jednou během session
- Lze zavřít tlačítkem

## Podporované verze

### ✅ Plně podporováno
- iOS 13 a novější
- Safari 13 a novější
- Chrome 80 a novější
- Firefox 75 a novější
- Edge (Chromium) všechny verze

### ⚠️ Částečná podpora (s polyfilly)
- iOS 9-12
- Safari 9-12
- Chrome 60-79
- Firefox 60-74

### ❌ Nepodporováno
- Internet Explorer (může fungovat, ale není testováno)
- iOS < 9 (nedoporučeno)

## Testování

Pro testování na starších zařízeních:

1. **iPad s iOS 10-12**: Měl by fungovat s varovným hlášením
2. **Safari v privátním režimu**: Storage fallbacky fungují
3. **Chrome DevTools**: Použijte User-Agent switching pro simulaci

## Známá omezení

1. **Backdrop blur**: Odstraněn, protože není podporován v iOS < 9
2. **CSS Grid**: Flexbox fallback pro velmi staré prohlížeče
3. **Některé animace**: Mohou mít sníženou plynulost na starším hardware
4. **Video**: Může být omezená podpora některých formátů

## Řešení problémů

### Aplikace se stále nenačítá na starém iPadu

1. **Zkontrolujte konzoli**: Otevřete Safari Developer Tools
2. **Aktualizujte iOS**: Pokud možno na nejnovější verzi pro vaše zařízení
3. **Vymažte cache**: Settings → Safari → Clear History and Website Data
4. **Zkuste jiný prohlížeč**: Chrome nebo Firefox na iOS může fungovat lépe

### Některé funkce nefungují

- Ujistěte se, že JavaScript je povolen
- Zkontrolujte, zda není blokován obsah třetích stran
- Některé pokročilé funkce prostě nemusí být dostupné na starém hardware

## Další vylepšení (budoucí)

- [ ] Service Worker pro offline podporu (iOS 11.3+)
- [ ] IndexedDB fallback pro localStorage
- [ ] Detekce low-power módu
- [ ] Redukovaná grafika pro starší zařízení
- [ ] WebP obrázky s JPEG fallbackem

## Kontakt

Pokud najdete problém se starším zařízením, které není uvedeno výše, prosím nahlaste ho s informacemi:
- Typ zařízení (např. iPad 2)
- Verze iOS (Settings → General → About)
- Popis problému
- Screenshot konzole (pokud možno)
