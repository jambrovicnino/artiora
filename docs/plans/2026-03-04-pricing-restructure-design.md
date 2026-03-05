# Pricing Restructure — Korak-po-korak konfigurator

## Povzetek

Prestrukturiranje cenovnega modela in UI iz enotne cene v 3-plastni korak-po-korak konfigurator z opcijskim impasto dodatkom.

## Podatkovni model

### Velikosti (6, brez 3 najmanjših)

| Velikost | canvasPrint (brez DDV) | canvasStretched (brez DDV) |
|----------|----------------------|--------------------------|
| 30×40 | €15,00 | €32,05 |
| 40×50 | €20,00 | €41,92 |
| 45×60 | €25,00 | €50,58 |
| 50×70 | €30,00 | €59,23 |
| 60×90 | €40,00 | €76,54 |
| 76×102 | €50,00 | €93,36 |

### Cenovna formula

```
Plast 1 (samo tisk):     canvasPrint × MARKUP × DDV + AI_FEE
Plast 2 (+ podokvir):    canvasStretched × MARKUP × DDV + AI_FEE
Plast 3 (+ okvir):       (canvasStretched + frame_cost + DELO) × MARKUP × DDV + AI_FEE
Opcija impasto:           +IMPASTO_COST × MARKUP × DDV
```

Konstante:
- MARKUP = 2.5
- DDV = 1.22
- AI_FEE = €1 (flat, maloprodajna)
- DELO = €25 (samo pri okvirjanju)
- IMPASTO_COST = €5 (opcijsko, samo pri okvirjanju)
- frame_cost = frame.pricePerTm × perimeter_m

### Okvirji (10 profilov iz Vidal cenika)

Nespremenjeni — 231, 1717, 1335, 048, 3507, AL, Siena, 076, 184 (ODPRODAJA), 370.

## UI Flow

### Korak ① VELIKOST
6 gumbov v 2×3 gridu. Vsak prikazuje dimenzijo IN ceno tiska.

### Korak ② IZDELEK
3 radio opcije:
- Samo tisk na platno (cena Plast 1)
- Tisk + podokvir + napenjanje (cena Plast 2)
- Umetnina z okvirjem (cena Plast 3, "od €X")

### Korak ③ OKVIR (pogojno)
Vidno samo ko je izbrana opcija "z okvirjem". Grid okvirjev z mini predogledom in končno ceno za vsak okvir.

### ☐ Impasto gel zaključek (pogojno)
Checkbox pod okvirji. Opcijsko +€15 maloprodajno.

### Korak ④ POSVETILO
Tekstovno polje, nespremenjeno.

### SKUPAJ + Košarica
Dinamična cena + gumb.

## Datoteke za spremembo

1. `src/data/frameOptions.js` — novi wholesale.canvasPrint, posodobljena getPrice()
2. `src/components/studio/FramingStep.jsx` — nov UI flow
3. `src/components/studio/FramingStep.css` — stili za nov layout
4. `src/pages/StudioPage.jsx` — nova state spremenljivka (productType, impasto)
