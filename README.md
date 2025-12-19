# Winter Games - Ski Jump Clone

Ein browserfähiger Clone des klassischen Schanzenspringens aus **WINTER GAMES** von EPYX (1985).

## Features

- 🎮 Authentisches 8-Bit Retro-Gameplay
- 🎿 Originalgetreue Schanzenspring-Mechanik
- 👥 1-4 Spieler Unterstützung (lokal, gleiche Tastatur)
- 🎨 Pixelgenaue Grafik im Stil des Originals
- 🔊 8-Bit Sound-Effekte und Hymne
- 🏆 Vollständiger Spielablauf: Startbildschirm → Zeremonie → Wettkampf → Siegerehrung

## Spielablauf

1. **Startbildschirm** - Klassischer Winter Games Title Screen
2. **Eröffnungszeremonie** - Animation der olympischen Fackel
3. **Spieler-Setup** - Auswahl von 1-4 Spielern mit Namen und Nationen
4. **Schanzenspringen** - 2 Sprünge pro Spieler
5. **Siegerehrung** - Podium und Hymne für den Gewinner

## Steuerung

- **LEERTASTE**: Start des Anlaufs / Absprung / Menü-Auswahl
- **Buchstaben**: Namenseingabe
- **ENTER**: Spieler-Setup bestätigen

### Im Flug (Authentic Winter Games Controls):
- **LINKS**: Zurücklehnen (wenn zu weit vorne)
- **RECHTS**: Vorlehnen (wenn zu weit hinten)
- **HOCH**: Knie strecken (wenn zu nah am Körper)
- **RUNTER**: Ski entwirren (wenn gekreuzt)

**Ziel:** Halte alle Werte nahe 0 für perfekte Haltung! Die Posture-Anzeige oben rechts hilft dir dabei.

## Schanzenspringen im Detail

1. **Anlauf**: Drücke LEERTASTE zum Starten
2. **Absprung**: Drücke LEERTASTE im richtigen Moment (zwischen den Markierungen) - spätes Abspringen ist besser!
3. **Flug**: Korrigiere kontinuierlich deine Haltung mit den Pfeiltasten
   - Beobachte die vergrößerte Posture-Anzeige oben rechts
   - Perfekte Haltung = Arme eng am Körper, Ski parallel
4. **Landung**: Automatisch - Haltung zum Zeitpunkt der Landung beeinflusst die Note stark
5. **Punktevergabe**: **Weite × 3 + Haltungspunkte** (Original-Formel!)

## 🎮 Online spielen

**[► JETZT SPIELEN (GitHub Pages)](https://isartaler76.github.io/wintergames_clone/)**

Das Spiel wird automatisch über GitHub Pages deployed und ist direkt im Browser spielbar!

## Lokal spielen

Öffne einfach `index.html` in einem modernen Webbrowser!

```bash
# Mit Python 3 lokalen Server starten:
python3 -m http.server 8000

# Dann öffne im Browser:
# http://localhost:8000
```

## Technologie

- HTML5 Canvas für pixelgenaue 8-Bit Grafik
- Vanilla JavaScript (keine Dependencies)
- Web Audio API für authentische 8-Bit Sounds

## Credits

Basierend auf **WINTER GAMES** © 1985 EPYX, Inc.
Dieses Projekt ist ein Fan-made Clone zu Bildungszwecken.

---

🎮 **Viel Spaß beim Springen!**
