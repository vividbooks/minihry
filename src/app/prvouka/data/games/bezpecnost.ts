import type { PrvoukaChoiceOption, PrvoukaGame, PrvoukaPicture, PrvoukaQuestion, PrvoukaSignId } from '../types';
import { createRandom, pickMany } from '../random';

const ill = (id: string, emoji: string, alt: string): PrvoukaPicture => ({ kind: 'ill', id, emoji, alt });
const photo = (key: string, alt: string): PrvoukaPicture => ({ kind: 'photo', src: `/prvouka/foto/${key}.jpg`, alt });

interface Sign {
  id: PrvoukaSignId;
  meaning: string;
  hint: string;
  grade: 1 | 2;
}

/** Dopravní značky pro chodce a cyklisty (1/1/17, 2/2/4–5). */
const SIGNS: Sign[] = [
  { id: 'prechod', meaning: 'Přechod pro chodce', hint: 'Modrý čtverec s chodcem na zebře ukazuje přechod.', grade: 1 },
  { id: 'pozor-deti', meaning: 'Pozor, děti', hint: 'Červený trojúhelník varuje řidiče – tady chodí děti, třeba u školy.', grade: 1 },
  { id: 'stop', meaning: 'Řidič musí zastavit', hint: 'Osmiúhelník STOP – řidič musí vždy zastavit.', grade: 1 },
  { id: 'stezka-chodci', meaning: 'Stezka pro chodce', hint: 'Modrý kruh s chodci – cesta jen pro chodce.', grade: 1 },
  { id: 'zakaz-vjezdu', meaning: 'Sem nesmí vjet žádné vozidlo', hint: 'Bílý kruh s červeným okrajem zakazuje vjezd všem vozidlům.', grade: 1 },
  { id: 'zakaz-chodcu', meaning: 'Sem chodci nesmí', hint: 'Červený kruh s chodcem – zákaz vstupu chodců.', grade: 2 },
  { id: 'stezka-cyklisti', meaning: 'Stezka pro cyklisty', hint: 'Modrý kruh s kolem – stezka pro cyklisty.', grade: 2 },
  { id: 'zakaz-cyklistu', meaning: 'Sem cyklisté nesmí', hint: 'Červený kruh s kolem – zákaz vjezdu na kole.', grade: 2 },
  { id: 'dej-prednost', meaning: 'Dej přednost v jízdě', hint: 'Obrácený trojúhelník – řidič dává přednost ostatním.', grade: 2 },
  { id: 'hlavni-silnice', meaning: 'Hlavní silnice', hint: 'Žlutý čtverec na špičce označuje hlavní silnici.', grade: 2 },
  { id: 'obytna-zona', meaning: 'Obytná zóna – děti si tu smí hrát', hint: 'V obytné zóně smí chodci po celé silnici a auta jezdí pomalu.', grade: 2 },
  { id: 'parkoviste', meaning: 'Parkoviště', hint: 'Modrá značka s P – tady se parkuje.', grade: 2 },
];

interface Statement {
  key: string;
  text: string;
  correct: boolean;
  picture?: PrvoukaPicture;
  hint: string;
  grade: 1 | 2;
}

const CROSSING: Statement[] = [
  { key: 'rozhlednout', text: 'Než přejdu silnici, rozhlédnu se vlevo, vpravo a znovu vlevo.', correct: true, hint: 'Vlevo – vpravo – vlevo. Přecházím, až nic nejede.', grade: 1 },
  { key: 'prechod', text: 'Silnici přecházím nejlépe po přechodu pro chodce.', correct: true, hint: 'Přechod je nejbezpečnější místo.', grade: 1 },
  { key: 'bezim', text: 'Přes silnici přebíhám, abych byl rychle na druhé straně.', correct: false, hint: 'Přes silnici chodím, nikdy neběhám.', grade: 1 },
  { key: 'auta', text: 'Přecházím mezi zaparkovanými auty.', correct: false, hint: 'Za zaparkovaným autem mě řidič nevidí.', grade: 1 },
  { key: 'reflex', text: 'Když je venku šero, nosím reflexní prvky.', correct: true, picture: ill('prvouka-dite-batoh', '🦺', 'Dítě s batohem'), hint: 'Reflexní pásek svítí ve světle aut – řidič mě uvidí zdaleka.', grade: 1 },
  { key: 'tmave', text: 'Ve tmě jsem v tmavém oblečení dobře vidět.', correct: false, hint: 'Tmavé oblečení ve tmě splývá. Pomůže světlé oblečení a reflexní prvky.', grade: 1 },
  { key: 'chodnik', text: 'Na chodníku chodím co nejdál od silnice.', correct: true, hint: 'Čím dál od aut, tím bezpečněji.', grade: 1 },
  { key: 'mobil', text: 'Při přecházení si můžu psát zprávy v mobilu.', correct: false, hint: 'Při přecházení se dívám na silnici, ne do mobilu.', grade: 1 },
  { key: 'mic', text: 'Když se mi míč skutálí na silnici, hned pro něj běžím.', correct: false, hint: 'Nejdřív se zastavím a rozhlédnu. Ještě lepší je poprosit dospělého.', grade: 1 },
  { key: 'bez-chodniku', text: 'Kde není chodník, jdu po levé straně silnice proti autům.', correct: true, hint: 'Vlevo vidím auta, která jedou proti mně.', grade: 2 },
  { key: 'helma', text: 'Na kolo si vždycky nasadím helmu.', correct: true, picture: photo('kolo-helma', 'Kluk s helmou na kole'), hint: 'Helma chrání hlavu. Do 18 let ji musíš mít na kole povinně.', grade: 2 },
  { key: 'helma-volna', text: 'Helmu nosím volně, řemínek pod bradou nezapínám.', correct: false, hint: 'Helma musí sedět pevně a řemínek musí být zapnutý.', grade: 2 },
  { key: 'kolo-prechod', text: 'Přes přechod pro chodce kolo vedu.', correct: true, hint: 'Na přechodu jsem chodec – kolo vedu vedle sebe.', grade: 2 },
];

interface Emergency {
  key: string;
  situation: string;
  number: '150' | '155' | '158' | '112';
  picture?: PrvoukaPicture;
  hint: string;
}

/** Tísňová čísla (2/2/3) a na koho se obrátit (1/2/17). */
const EMERGENCIES: Emergency[] = [
  { key: 'hori', situation: 'Hoří dům. Komu zavoláš?', number: '150', picture: ill('prvouka-hasici', '🚒', 'Hasičské auto'), hint: 'Hasiči mají číslo 150.' },
  { key: 'les', situation: 'V lese je požár. Komu zavoláš?', number: '150', hint: 'Oheň hasí hasiči – 150.' },
  { key: 'zraneni', situation: 'Kamarád spadl, krvácí a nemůže vstát. Komu zavoláš?', number: '155', picture: ill('prvouka-zachranka', '🚑', 'Sanitka'), hint: 'Záchranka má číslo 155.' },
  { key: 'babicka', situation: 'Babička omdlela a nemluví. Komu zavoláš?', number: '155', hint: 'Když jde o zdraví, voláme záchranku – 155.' },
  { key: 'zlodej', situation: 'Vidíš, jak někdo krade kolo. Komu zavoláš?', number: '158', picture: ill('prvouka-policie', '🚓', 'Policejní auto'), hint: 'Policie má číslo 158.' },
  { key: 'ztraceny', situation: 'Ztratil ses ve městě a nevíš, kde jsi. Kdo ti pomůže?', number: '158', hint: 'Policie pomáhá i ztraceným dětem – 158.' },
  { key: 'evropa', situation: 'Které číslo platí pro všechny případy v celé Evropě?', number: '112', picture: ill('prvouka-divka-telefon', '📱', 'Holka telefonuje'), hint: 'Jednotné evropské číslo je 112.' },
];

const NUMBER_LABELS: Record<Emergency['number'], string> = {
  150: '150 hasiči',
  155: '155 záchranka',
  158: '158 policie',
  112: '112 tísňová linka',
};

interface FirstAidItem {
  key: string;
  name: string;
  picture: PrvoukaPicture;
  belongs: boolean;
}

/** Lékárnička (1/1/43). */
const FIRST_AID: FirstAidItem[] = [
  { key: 'naplast', name: 'náplast', picture: photo('naplast', 'Náplast'), belongs: true },
  { key: 'dezinfekce', name: 'dezinfekce', picture: photo('dezinfekce', 'Dezinfekce'), belongs: true },
  { key: 'nuzky', name: 'nůžky', picture: ill('matika-nuzky', '✂️', 'Nůžky'), belongs: true },
  { key: 'rukavice', name: 'gumové rukavice', picture: photo('rukavice', 'Rukavice'), belongs: true },
  { key: 'teplomer', name: 'teploměr', picture: photo('teplomer', 'Teploměr'), belongs: true },
  { key: 'cokolada', name: 'čokoláda', picture: ill('prvouka-cokolada', '🍫', 'Čokoláda'), belongs: false },
  { key: 'kleste', name: 'kleště', picture: ill('prvouka-kleste', '🔧', 'Kleště'), belongs: false },
  { key: 'auticko', name: 'autíčko', picture: ill('matika-auto', '🚗', 'Auto'), belongs: false },
  { key: 'klubko', name: 'klubko vlny', picture: ill('matika-klubko', '🧶', 'Klubko'), belongs: false },
];

interface Injury {
  key: string;
  question: string;
  picture: PrvoukaPicture;
  right: string;
  wrong: string[];
  hint: string;
}

const INJURIES: Injury[] = [
  {
    key: 'koleno',
    question: 'Odřel sis koleno. Co uděláš?',
    picture: ill('prvouka-uraz-koleno', '🩹', 'Odřené koleno'),
    right: 'Umyju ránu čistou vodou a přelepím ji',
    wrong: ['Nechám ránu špinavou', 'Ránu zasypu hlínou'],
    hint: 'Ránu vypláchneme čistou vodou, vydezinfikujeme a přelepíme náplastí.',
  },
  {
    key: 'nos',
    question: 'Teče ti krev z nosu. Co uděláš?',
    picture: ill('prvouka-krev-z-nosu', '🩸', 'Krev z nosu'),
    right: 'Předkloním hlavu a stisknu nos',
    wrong: ['Zakloním hlavu dozadu', 'Rychle si lehnu na záda'],
    hint: 'Hlavu předkloníme, ne zakloníme, a nosní křídla stiskneme.',
  },
  {
    key: 'zlomenina',
    question: 'Kamarád si asi zlomil ruku. Co uděláš?',
    picture: ill('prvouka-uraz-zlomenina', '🦴', 'Zlomenina'),
    right: 'Řeknu mu, ať s rukou nehýbe, a zavolám dospělého',
    wrong: ['Zkusím mu ruku narovnat', 'Necháme to být a hrajeme dál'],
    hint: 'Se zraněnou rukou nehýbeme a hned voláme dospělého nebo záchranku 155.',
  },
  {
    key: 'kotnik',
    question: 'Podvrtl sis kotník. Co pomůže?',
    picture: ill('prvouka-uraz-kotnik', '🦶', 'Úraz kotníku'),
    right: 'Dám nohu nahoru a přiložím studený obklad',
    wrong: ['Hned si na něj zaskáču', 'Dám na něj horký obklad'],
    hint: 'Klid, chlad a noha nahoře.',
  },
];

function capital(text: string): string {
  return `${text[0].toUpperCase()}${text.slice(1)}`;
}

function textOptions(right: string, wrong: string[]): PrvoukaChoiceOption[] {
  return [right, ...wrong].map((label) => ({ id: label, label, correct: label === right }));
}

export const bezpecnostGame: PrvoukaGame = {
  id: 'bezpecnost',
  name: 'Bezpečně venku',
  tagline: 'Značky, přecházení, tísňová čísla a lékárnička.',
  accent: '#2c3f98',
  surface: '#e2f0ff',
  titleColor: '#4e2bf3',
  cover: { kind: 'sign', sign: 'prechod', alt: 'Přechod pro chodce' },
  topics: [
    { id: 'znacky', label: 'Dopravní značky', defaultGrades: [1, 2], pages: '1/1/17, 2/2/4' },
    { id: 'prechazeni', label: 'Přecházení a vidět', defaultGrades: [1, 2], pages: '1/1/16–17, 2/2/5' },
    { id: 'tisnove', label: 'Tísňová čísla', defaultGrades: [1, 2], pages: '1/2/17, 2/2/3' },
    { id: 'lekarnicka', label: 'Lékárnička a první pomoc', defaultGrades: [1, 2], pages: '1/1/43, 2/2/8' },
  ],
  buildPool: ({ grade, topics, random }) => {
    const pool: PrvoukaQuestion[] = [];
    const on = (topic: string) => topics.includes(topic);
    const local = createRandom(Math.floor(random() * 1e9));

    if (on('znacky')) {
      const signs = SIGNS.filter((sign) => sign.grade <= grade);
      for (const sign of signs) {
        const wrong = pickMany(SIGNS.filter((other) => other.id !== sign.id), 2, local).map((other) => other.meaning);
        pool.push({
          key: `znacky:${sign.id}`,
          prompt: 'Co znamená tahle značka?',
          icons: ['pozoruj'],
          picture: { kind: 'sign', sign: sign.id, alt: sign.meaning },
          task: { kind: 'choice', layout: 'grid', options: textOptions(sign.meaning, wrong) },
          hint: sign.hint,
        });
        const otherSigns = pickMany(signs.filter((other) => other.id !== sign.id), 2, local);
        pool.push({
          key: `znacky:najdi:${sign.id}`,
          prompt: `Najdi značku: ${sign.meaning.toLowerCase()}.`,
          icons: ['zakrouzkuj'],
          task: {
            kind: 'choice',
            layout: 'pictures',
            options: [sign, ...otherSigns].map((item) => ({ id: item.id, label: '', picture: { kind: 'sign', sign: item.id, alt: item.meaning }, correct: item.id === sign.id })),
          },
          hint: sign.hint,
        });
      }
      pool.push({
        key: 'znacky:semafor-cervena',
        prompt: 'Smím teď přejít?',
        icons: ['pozoruj'],
        picture: { kind: 'sign', sign: 'semafor-cervena', alt: 'Červený panáček' },
        task: { kind: 'choice', layout: 'yesno', options: [{ id: 'ano', label: 'Ano', correct: false }, { id: 'ne', label: 'Ne', correct: true }] },
        hint: 'Červený panáček stojí – čekám.',
      });
      pool.push({
        key: 'znacky:semafor-zelena',
        prompt: 'Smím teď přejít?',
        icons: ['pozoruj'],
        picture: { kind: 'sign', sign: 'semafor-zelena', alt: 'Zelený panáček' },
        task: { kind: 'choice', layout: 'yesno', options: [{ id: 'ano', label: 'Ano', correct: true }, { id: 'ne', label: 'Ne', correct: false }] },
        hint: 'Zelený panáček jde – ale i tak se rozhlédnu.',
      });
    }

    if (on('prechazeni')) {
      // Výroky říkají děti z ilustrací prvouky – jako bubliny v sešitě.
      const speakers = ['prvouka-holka', 'prvouka-holka2-premysli', 'prvouka-kluk-one', 'prvouka-holka-sedici', 'prvouka-deti'];
      CROSSING.filter((item) => item.grade <= grade).forEach((statement, index) => {
        const speaker = speakers[index % speakers.length];
        pool.push({
          key: `prechazeni:${statement.key}`,
          prompt: 'Je to správně?',
          icons: ['cti'],
          picture: statement.picture ?? ill(speaker, '🧒', 'Dítě'),
          caption: statement.text,
          captionStyle: 'bubble',
          task: {
            kind: 'choice',
            layout: 'yesno',
            options: [
              { id: 'ano', label: 'Ano', correct: statement.correct },
              { id: 'ne', label: 'Ne', correct: !statement.correct },
            ],
          },
          hint: statement.hint,
        });
      });
    }

    if (on('tisnove')) {
      for (const item of EMERGENCIES) {
        const numbers = (Object.keys(NUMBER_LABELS) as Emergency['number'][]);
        // 112 pomůže vždycky, proto ho mezi možnosti dáváme jen u otázky na 112.
        const options = item.number === '112' ? numbers : numbers.filter((number) => number !== '112');
        pool.push({
          key: `tisnove:${item.key}`,
          prompt: item.situation,
          icons: ['povidej'],
          picture: item.picture,
          task: {
            kind: 'choice',
            layout: 'grid',
            options: options.map((number) => ({ id: number, label: NUMBER_LABELS[number], correct: number === item.number })),
          },
          hint: item.hint,
        });
      }
      pool.push({
        key: 'tisnove:rict',
        prompt: 'Co musíš do telefonu říct jako první?',
        icons: ['povidej'],
        picture: ill('prvouka-divka-telefon', '📱', 'Holka telefonuje'),
        task: {
          kind: 'choice',
          layout: 'grid',
          options: textOptions('Co se stalo a kde jsem', ['Jakou mám rád barvu', 'Kolik je hodin']),
        },
        hint: 'Řekni, co se stalo, kde jsi a jak se jmenuješ. Hovor neukončuj, dokud ti to neřeknou.',
      });
      pool.push({
        key: 'tisnove:zertem',
        prompt: 'Smím na tísňové číslo zavolat jen tak pro legraci?',
        icons: ['povidej'],
        task: { kind: 'choice', layout: 'yesno', options: [{ id: 'ano', label: 'Ano', correct: false }, { id: 'ne', label: 'Ne', correct: true }] },
        hint: 'Zbytečný hovor blokuje linku pro někoho, kdo pomoc opravdu potřebuje.',
      });
    }

    if (on('lekarnicka')) {
      for (const item of FIRST_AID) {
        pool.push({
          key: `lekarnicka:${item.key}`,
          prompt: 'Patří to do lékárničky?',
          icons: ['pozoruj'],
          picture: item.picture,
          caption: item.name,
          task: {
            kind: 'choice',
            layout: 'yesno',
            options: [
              { id: 'ano', label: 'Ano', correct: item.belongs },
              { id: 'ne', label: 'Ne', correct: !item.belongs },
            ],
          },
          hint: 'V lékárničce je náplast, obvaz, dezinfekce, nůžky, rukavice a teploměr.',
        });
      }
      for (const injury of INJURIES) {
        pool.push({
          key: `lekarnicka:${injury.key}`,
          prompt: injury.question,
          icons: ['povidej'],
          picture: injury.picture,
          task: { kind: 'choice', layout: 'grid', options: textOptions(injury.right, injury.wrong).map((option) => ({ ...option, label: capital(option.label) })) },
          hint: injury.hint,
        });
      }
    }

    return pool;
  },
};
