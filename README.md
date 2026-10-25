# Flottenatelier

Browserbasierte Gruppenübung für Stabsoffiziere: Eine Marine unter begrenztem Aufbaukapital, jährlichem Betrieb und Personal entwerfen, Schwerpunkte sichtbar machen und Entscheidungen diskutieren. Der Ablauf ist auf **120 Minuten einschließlich Auswertung** ausgelegt.

## Lokal starten

Node.js 22 oder neuer; keine zusätzlichen Pakete erforderlich.

```sh
node server.mjs
```

Im Browser http://127.0.0.1:43127 öffnen. Für die Entwicklung wird die Anwendung über HTTP gestartet; die getrennten JavaScript-Module funktionieren nicht durch Doppelklick auf die jetzige index.html.

Die Anwendung läuft vollständig im Browser. Kein Backend, Konto, zentraler Speicher oder externer Laufzeitdienst ist nötig. Eine spätere einzelne Offline-HTML-Datei und ein ILIAS-HTML-Paket bleiben vorgesehen, sind aber entsprechend der Absprache **noch nicht umgesetzt**. Die vorhandenen statischen Dateien können bereits auf einem geeigneten Webserver oder als HTML-Lernmodul mit relativen Pfaden bereitgestellt werden; die konkrete LMS-Installation ist gesondert zu testen.

## Spielablauf

- **Aufbauen:** links eine kompakte, aufklappbare Einheitenauswahl nach Kategorien; in der Mitte Details und Spezialisierungen; rechts die aktuelle Flotte. Mengen von 1 bis 50 gemeinsam hinzufügen.
- **Voraussetzungen:** Infrastruktur steht nicht in der Einkaufsliste. Fehlende Marinestützpunkte, Marinefliegerbasen, Führungsnetz und expeditionäre Logistik werden in einem gemeinsamen Dialog mit Gesamtkosten angeboten. Abbrechen verändert nichts.
- **Stationierung:** nur landgestützt oder bordgestützt wählen. Freie Bordplätze werden automatisch zugeordnet; Sammelkäufe verteilen sich bei Bedarf über mehrere Schiffe. Eine Marinefliegerbasis hat 48 Kapazitätspunkte: Hubschrauber 1, Flugzeuge 2, Drohnenpakete 1; Trägerluftgruppe als Gesamtpaket 48.
- **Überblicken:** bildschirmbreite Gesamtübersicht mit Flotte, Infrastrukturkapazität, Stationierung, Unterstützung und Vergleich zwischen Absicht und Ausstattung.
- **Begründen:** ein oder zwei Fähigkeitsschwerpunkte wählen; optional bewusste Lücken und Partnerunterstützung markieren; vier offene Fragen mit wenigen Sätzen beantworten.
- **Diskutieren:** Stand abschließen, gemeinsam auswerten und gegebenenfalls überarbeiten. Keine automatische fachliche Bewertung.

Aufbau / Betrieb / Personal bleiben bei **880 / 450 / 430**. Überziehen ist im Entwurf erlaubt; der Abschluss ist dann gesperrt. Fähigkeitsprofile zeigen getrennte Spielpunkte in AAW, ASuW, ASW, Mine Warfare und Strike. Es gibt keine Gesamtstärke, Zielampel oder Rangliste.

Der sichtbare Einstieg ersetzt eine lange Bedienungseinweisung. Unter „Kurzanleitung“ stehen die wenigen Regeln und der Vorschlag 10 / 45 / 15 / 35 / 15 Minuten. Das ist eine Ablaufplanung, noch kein Nachweis durch eine Erprobung mit einem realen Lehrgang.

## Daten und Kompatibilität

Keine Übermittlung an einen Server. Browserlokale Sicherung dient nur als Komfort; Export, Import und Drucken/PDF sind optional. Ein Speicherausfall verhindert das Spielen nicht. Für Gerätewechsel optional exportieren.

Neue Daten verwenden Schema 5 und den Schlüssel `flottenatelier.v5`. Bestehende v1/v2/v3/v4-Entwürfe werden nach Validierung und lokaler Sicherung auf die neuen Regeln umgestellt; fehlende Infrastruktur wird ergänzt, Kosten können steigen. Alte Browserquellen bleiben erhalten. Bereits abgeschlossene Stände verwenden weiterhin ihren eingefrorenen Katalog. Erst eine Überarbeitung wird migriert.

Die eingefrorenen v1/v2/v3/v4-Dateien dürfen nicht an neue Regeln angepasst werden. Alte Referenzrechnungen gelten ausschließlich für die jeweilige historische Version. Das neu kalibrierte Budget deckt die vollständige Referenz samt Infrastruktur und zusätzlichem Fachpersonal. Rechenweg und Quellen: [docs/KALIBRIERUNG.md](docs/KALIBRIERUNG.md).

## Prüfen

```sh
npm run check
npm test
```

Alternativ ohne npm: `node scripts/check.mjs` und `node --test tests/*.test.mjs`.

Prüfungen sichern historische Rechnungen, neue Beschaffung samt Abbruch/Quellschutz, Kapazitäten, Spezialisierungen, Fähigkeiten, Einschiffung, Abschluss und Dateikompatibilität. Details zum Modell und zur Erprobung stehen in [docs/LEHRKRAFT.md](docs/LEHRKRAFT.md).

## Veröffentlichung

Repository: https://github.com/Pijaythepahl/flottenatelier
Bisherige Zieladresse: https://pijaythepahl.github.io/flottenatelier/

Die bestehenden GitHub-Actions-Workflows prüfen vor Veröffentlichung. Voraussetzung ist die Repository-Variable PAGES_ENABLED=true sowie GitHub Pages mit Quelle GitHub Actions. Veröffentlicht wird ausschließlich dist/; ein Update von main startet den vorhandenen Veröffentlichungsablauf.

## Aufbau des Projekts

- dist/catalog.js und dist/engine.js: aktuelles Modell, Fähigkeitspunkte, Voraussetzungen und validierte Beschaffung.
- dist/app.js und dist/styles.css: Oberfläche und lokale Dateifunktionen; Bilder unter dist/assets/.
- dist/catalog-v1.js bis dist/catalog-v4.js und dist/engine-v1.js bis dist/engine-v4.js: eingefrorene historische Modelle.
- tests/: historische und aktuelle Regeltests; scripts/check.mjs: Programme und lokale Dateien prüfen.
- docs/LEHRKRAFT.md: Ablauf, Spielannahmen und Bewertungshinweise ausschließlich für Lehrende.


## Unbemannte Plattformen

Im Katalog stehen genau drei Familien: Luft (UAV), Überwasser (USV), Unterwasser (UUV). Jeweils bis zu zwei passende Fähigkeitsbausteine wählen. Minenabwehr benötigt kein bemanntes Minenjagdboot. Einzelheiten, Preise und Quellen: [docs/UNBEMANNTE_SYSTEME.md](docs/UNBEMANNTE_SYSTEME.md).
