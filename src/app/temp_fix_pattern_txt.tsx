Hledám místo v souboru PatternSequenceGame.tsx, kde se používají pozice v renderování DraggablePattern elementů.

Problém je, že generuji pozice v procentech, ale při renderování se nepoužívají správně.

Pozice jsou:
- x: procenta (5-95%)  
- y: procenta (57-92%)
- rotation: stupně (-20 až +20)

Ale v renderování se asi používají absolutní pixely místo procent!