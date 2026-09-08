# Přehled nastavení všech her

Každá hra má **univerzální nastavení pozadí** plus vlastní specifická nastavení. Všechna nastavení jsou konfigurovatelná přes administrační panel.

---

## 🎨 Univerzální nastavení (pro všechny hry)

### **Barva pozadí**
- **Typ:** Select (dropdown)
- **Výchozí:** `#FFF0E3` (Béžová)
- **Možnosti:**
  - `#9D94FF` - Fialová
  - `#FFE8ED` - Růžová  
  - `#E8CDD6` - Světle růžová
  - `#E7F9EE` - Světle zelená
  - `#FAF3D4` - Žlutá
  - `#FFF0E3` - Béžová (výchozí)

---

## 1. 🔢 **Poznej čísla** (Number Recognition)

Hra na poznávání čísel různými způsoby s pěti typy aktivit.

### **Základní nastavení**
- **Minimální číslo** (number): `1` (rozsah 0-5)
  - Nejmenší číslo, které se může objevit
- **Maximální číslo** (number): `9` (rozsah 5-20)
  - Největší číslo, které se může objevit
- **Počet kol** (number): `10` (rozsah 5-20)
  - Celkový počet herních kol
- **Časový limit** (number): `30s` (rozsah 15-60s)
  - Čas na dokončení jedného kola
- **Počet životů** (number): `3` (rozsah 1-5)
  - Počet chyb před koncem hry

### **Typy zadání** (multiselect)
**Výchozí:** `['written', 'dots', 'objects', 'sound', 'blink']`
- `written` - Napsané číslo
- `dots` - Tečky (domino)
- `objects` - Objekty (emoji)
- `sound` - Zvukové pípnutí
- `blink` - Blikání diody

### **Typy úkolů** (multiselect)
**Výchozí:** `['tap', 'select', 'dots', 'click']`
- `tap` - Vyťukávání mezerníkem
- `select` - Výběr čísla
- `dots` - Označování teček
- `click` - Naklikávání objektů

---

## 2. 📊 **Číselné řady** (Number Sequence)

Doplňování chybějících čísel v číselných sekvencích.

### **Typy řad** (multiselect)
**Výchozí:** `['ascending', 'descending', 'even', 'odd']`
- `ascending` - Vzestupné řady (1,2,3...)
- `descending` - Sestupné řady (10,9,8...)
- `even` - Sudá čísla (2,4,6...)
- `odd` - Lichá čísla (1,3,5...)
- `multiples3` - Násobky 3 (0,3,6...)
- `multiples4` - Násobky 4 (0,4,8...)
- `multiples5` - Násobky 5 (0,5,10...)

### **Rozsahy**
- **Délka sekvence** (range): `[6, 10]` (rozsah 4-15)
  - Rozsah délky číselných řad
- **Počet chybějících čísel** (range): `[3, 6]` (rozsah 2-8)
  - Kolik čísel bude chybět v sekvenci
- **Rozsah čísel** (range): `[0, 25]` (rozsah -10 až 50)
  - Nejmenší a největší možné číslo

---

## 3. 🔶 **Vzorové sekvence** (Pattern Sequence)

Rozpoznávání a doplňování geometrických vzorů.

### **Obtížnost** (select)
**Výchozí:** `easy`
- `easy` - Lehká (1 řádek, jednoduché vzory)
- `medium` - Střední (2 řádky, vztahy mezi řádky)
- `hard` - Těžká (2 řádky, složité vzory)

### **Typy vzorů** (multiselect)
**Výchozí:** `['AB', 'AAB', 'ABC']`
- `AB` - AB (střídavý vzor)
- `AAB` - AAB (dvojitý první)
- `AAAB` - AAAB (trojitý první)
- `AABB` - AABB (dvojice)
- `ABC` - ABC (trojitý vzor)
- `ABCD` - ABCD (čtyřitý vzor)

### **Vlastní vzory** (string)
**Výchozí:** `''` (prázdné)
- Vlastní vzory oddělené čárkou (např. AB, ABC, AAAB)

### **Geometrické tvary** (multiselect)
**Výchozí:** `['circle', 'square', 'triangle']`
- `circle` - ● Kruh
- `square` - ■ Čtverec
- `triangle` - ▲ Trojúhelník

### **Barevné skupiny** (multiselect)
**Výchozí:** `['reds', 'blues', 'greens', 'oranges']`
- `reds` - 🔴 Červené odstíny
- `oranges` - 🟠 Oranžové odstíny
- `yellows` - 🟡 Žluté odstíny
- `greens` - 🟢 Zelené odstíny
- `blues` - 🔵 Modré odstíny
- `purples` - 🟣 Fialové odstíny

### **Rozsahy vzorů**
- **Délka vzoru** (range): `[12, 16]` (rozsah 8-20)
  - Počet prvků ve vzoru
- **Chybějící prvky** (range): `[4, 8]` (rozsah 2-10)
  - Kolik prvků bude chybět

---

## 4. 🔢 **Matematická křížovka** (Math Crossword)

Hledání párů sousedních čísel s daným rozdílem nebo součtem.

### **Typ operace** (select)
**Výchozí:** `subtraction`
- `subtraction` - Odčítání (výchozí)
- `addition` - Sčítání

### **Úroveň obtížnosti** (select)
**Výchozí:** `1`
- `1` - 1★ - Začátečník (3x3, čísla 1-9)
- `2` - 2★★ - Pokročilý (4x4, čísla 0-8)
- `3` - 3★★★ - Expert (5x5, čísla 0-15)

### **Rozměry mřížky**
- **Počet řádků** (number): `3` (rozsah 3-6)
  - Výška herní mřížky
- **Počet sloupců** (number): `3` (rozsah 3-6)
  - Šířka herní mřížky

### **Rozsahy čísel**
- **Minimální hodnota** (number): `1` (rozsah 0-10)
  - Nejmenší číslo v mřížce
- **Maximální hodnota** (number): `9` (rozsah 5-20)
  - Největší číslo v mřížce

### **Cílové rozdíly**
- **Minimální rozdíl** (number): `1` (rozsah 1-5)
  - Nejmenší možný cílový rozdíl
- **Maximální rozdíl** (number): `4` (rozsah 2-15)
  - Největší možný cílový rozdíl
- **Počet párů k nalezení** (number): `3` (rozsah 2-8)
  - Kolik párů musí hráč najít pro výhru

---

## 5. 🤖 **Navigace robota** (Robot Navigation)

Programování robota pomocí šipek k dosažení cíle na mřížce.

### **Úroveň obtížnosti** (select)
**Výchozí:** `1`
- `1` - 1★ - Začátečník (5x5, bez stěn)
- `2` - 2★★ - Pokročilý (6x6, jedna stěna)
- `3` - 3★★★ - Expert (7x7, protínající se stěny)

### **Mřížka a omezení**
- **Velikost mřížky** (number): `5` (rozsah 4-8)
  - Velikost herní mřížky (průsečíky)
- **Limit příkazů** (number): `8` (rozsah 5-20)
  - Maximální počet příkazů (0 = bez limitu)
- **Minimální vzdálenost** (number): `3` (rozsah 2-6)
  - Minimální vzdálenost mezi robotem a cílem

### **Pokročilé nastavení**
- **Povolit stěny** (boolean): `false`
  - Zda se mají generovat stěny jako překážky

---

## 6. ⚖️ **Rozřaď čísla** (Number Comparison)

Porovnávání padajících objektů s referenčním číslem ve třech sloupcích.

### **Úroveň objektů** (select)
**Výchozí:** `1`
- `1` - 1★ - Kostky s tečkami (1-6)
- `2` - 2★★ - Čísla v blocích (1-10)
- `3` - 3★★★ - Matematické příklady (a+b ≤ 10)

### **Herní nastavení**
- **Referenční číslo** (number): `5` (rozsah 1-10)
  - Číslo pro porovnání (zobrazené nahoře)
- **Počet objektů** (number): `10` (rozsah 5-20)
  - Celkový počet padajících objektů v jedné hře
- **Počet životů** (number): `3` (rozsah 1-5)
  - Počet chyb před koncem hry

### **Herní mechaniky**
- **Rychlost pádu** (number): `0.1` (rozsah 0.05-0.3, krok 0.01)
  - Rychlost pádu objektů (jednotky/frame)
- **Zpoždění spawnu** (number): `2500ms` (rozsah 1000-5000ms, krok 100)
  - Čas mezi spawnem nových objektů
- **Výška herního pole** (number): `12` (rozsah 8-20)
  - Výška herního pole (počet jednotek)

### **Rozsahy objektů**
- **Rozsah kostek** (range): `[1, 6]` (rozsah 1-6)
  - Rozsah hodnot pro kostky (úroveň 1)
- **Rozsah čísel** (range): `[1, 10]` (rozsah 1-15)
  - Rozsah čísel v blocích (úroveň 2)
- **Maximální součet** (number): `10` (rozsah 5-20)
  - Maximální součet pro příklady (úroveň 3)

### **Matematické operace** (multiselect)
**Výchozí:** `['+']`
- `+` - Sčítání (+)
- `-` - Odčítání (-)

### **UI nastavení**
- **Ovládání klávesnicí** (boolean): `true`
  - Povolit ovládání šipkami na klávesnici
- **Automatické výsledky** (boolean): `true`
  - Automaticky zobrazit výsledky po skončení hry
- **Doba odpočítávání** (number): `3s` (rozsah 1-5s)
  - Délka odpočítávání na začátku hry

---

## 7. 💕 **MathTinder** (Math Practice)

Tinder-like matematická hra - swipuj kartičky podle správnosti výsledků (sčítání do 10).

### **Herní mechaniky**
- **Časový limit na kartičku** (number): `10s` (rozsah 5-30s)
  - Kolik sekund má hráč na rozhodnutí u každé kartičky
- **Celkový počet kartiček** (number): `15` (rozsah 10-25)
  - Kolik kartiček bude v celé hře

### **Ovládání**
- **Povolit swipe gesta** (boolean): `true`
  - Povolit ovládání tažením kartičky vlevo/vpravo
- **Povolit klávesové zkratky** (boolean): `true`
  - Povolit ovládání šipkami nebo klávesami N/A

### **UX nastavení**
- **Auto-restart po výsledcích** (number): `5s` (rozsah 0-15s)
  - Automatické spuštění nové hry po zobrazení výsledků (0 = vypnuto)

### **Herní koncept**
- 📱 Kartičky ve stylu Tinder s matematickými příklady
- ❤️ Like (vpravo) = výsledek je správný
- ❌ Dislike (vlevo) = výsledek je špatný
- 🎯 50:50 poměr správných a špatných příkladů
- ⭐ Hodnocení hvězdičkami podle úspěšnosti

---

## 📋 Typy nastavení

### **Kontrolní prvky**
- **number** - Číselný input s min/max/step
- **select** - Dropdown s přednastavenými možnostmi
- **boolean** - Checkbox pro zapnutí/vypnutí
- **range** - Rozsah dvou čísel [min, max]
- **multiselect** - Výběr více možností ze seznamu
- **string** - Textový input

### **Jak používat nastavení**

1. **V administraci** - klikni na "Nastavit hru" vedle konkrétní hry
2. **Změň parametry** podle potřeby (výchozí hodnoty jsou optimální)
3. **Vygeneruj odkaz** - vytvoří se URL s nastavenou konfigurací
4. **Sdílej odkaz** - kdokoli s odkazem spustí hru s tvými nastaveními

### **Příklad URL s nastavením**
```
https://tvoje-domena.com/?game=numberComparison&config=%7B%22level%22%3A2%2C%22referenceNumber%22%3A7%2C%22totalObjects%22%3A15%7D
```

---

**💡 Tip:** Všechna nastavení mají rozumné výchozí hodnoty, které jsou vyvážené pro různé věkové skupiny. Experimentuj s parametry podle potřeb konkrétních dětí nebo učebního plánu!