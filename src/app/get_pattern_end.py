# SOUBOR PRO SMAZÁNÍ
with open('/components/PatternSequenceGame.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()
    
# Zobrazení posledních 100 řádků
start = max(0, len(lines) - 100)
for i, line in enumerate(lines[start:], start + 1):
    print(f"{i}: {line.rstrip()}")