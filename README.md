# Flottenatelier

Eine Desktop-Websimulation für die strategische maritime Rüstungsplanung. Gruppen bauen eine eigene Marine unter begrenztem Aufbaukapital, jährlichem Betrieb und Personal. Die fachliche Bewertung bleibt bei den Lehrenden.

## Lokal starten

Voraussetzung: Node.js 22 oder neuer. Keine Installation zusätzlicher Pakete nötig.

```sh
node server.mjs
```

Im Browser `http://127.0.0.1:43127` öffnen. Die Anwendung wird über HTTP gestartet, nicht durch Doppelklick auf die HTML-Datei (ES-Module). Der kleine Server dient nur der lokalen Vorschau. Auf GitHub Pages werden ausschließlich statische Dateien ausgeliefert.

## Auf GitHub bereitstellen

1. Ein GitHub-Repository anlegen und dieses Projekt auf dessen Branch `main` hochladen. Den Ordner `.github` mit hochladen.
2. Im Repository **Settings → Pages → Build and deployment → Source → GitHub Actions** auswählen.
3. Unter **Settings → Secrets and variables → Actions → Variables** die Repository-Variable **PAGES_ENABLED** mit dem Wert **true** anlegen. Ohne diese Freigabe bleibt die Veröffentlichung deaktiviert; die Tests laufen weiterhin.
4. Unter **Actions → Publish GitHub Pages → Run workflow** die erste Veröffentlichung starten. Weitere Pushes auf `main` prüfen und veröffentlichen automatisch.
5. Der erfolgreiche Deployment-Auftrag zeigt den Link unter **github-pages** an.

Die relativen Pfade funktionieren auch unter `https://ACCOUNT.github.io/REPOSITORY/`. Veröffentlicht wird nur `dist/`, nicht die Lehrkraftdokumentation oder die Tests. Kein ChatGPT Sites, kein Backend, keine Cloud-Datenbank und keine Zugangsschlüssel erforderlich.

GitHub Pages ist für öffentliche Repositories mit GitHub Free und für private Repositories je nach GitHub-Tarif verfügbar. Repository-Sichtbarkeit und Zugriff auf die veröffentlichte Website sind gesondert zu prüfen. [GitHub-Dokumentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

Die Dateien lassen sich ebenso auf jedem statischen Webserver veröffentlichen.

## Funktionsumfang

- 23 Grundkarten mit Beiträgen, Grenzen, Mengenbeschreibungen und getrennten Ressourcenwerten.
- Startkontingent: **720 Aufbau / 370 Betrieb / 340 Personal**.
- Suche, Kategoriefilter, Hinzufügen über Plus oder Drag-and-drop, Flottenstapel und Mengenänderungen.
- Spezialisierungen für Kampfschiffe und Marineflieger, Einzelzählung bemannter Luftfahrzeuge, Einschiffungskapazitäten und landgestützte Marineinfanterie. Expeditionäre Logistik wird erst bei Einschiffung verlangt.
- Rückgängig für Entwurfsänderungen; Überschreitung im Entwurf erlaubt, Abgabe dann gesperrt.
- Vier Begründungsfragen, unveränderliche Abgabestände und separate Überarbeitungen.
- Lokale Speicherung, validierter JSON-Export/-Import und Druckansicht einschließlich Zuordnungen.
- Keine automatische Bewertung, keine Referenzflotte in der Teilnehmeroberfläche.

## Datenspeicherung

Entwürfe bleiben im Browser auf diesem Gerät (`localStorage`). Es gibt keine Synchronisation zwischen Gruppen oder Geräten. Der Export enthält den aktuellen Entwurf und alle bisherigen Abgaben. Ein Import ersetzt den lokalen Stand erst nach Bestätigung. Die Daten werden nicht an GitHub oder andere Dienste gesendet. Browserdaten können gelöscht werden; deshalb vor Gerätewechsel und nach Abgabe exportieren.

Abgaben sind innerhalb der Anwendung schreibgeschützt. JSON-Dateien sind kein manipulationssicheres Prüfungsarchiv. Texte aus Dateien werden ausschließlich als Text angezeigt; Karten und Kombinationen werden beim Import validiert.

## Projektstruktur

- `dist/catalog.js`: Ressourcenlimits, Karten, Paketgrößen und Voraussetzungen.
- `dist/engine.js`: Zustandsmodell, Zuordnungen, Ressourcen, Abgabe und Importvalidierung.
- `dist/app.js`, `dist/styles.css`: Oberfläche, lokale Speicherung, Export und Druck.
- `tests/engine.test.mjs`: Spielregeln, Referenz- und Trägerrechnung, Snapshots, Import.
- `docs/LEHRKRAFT.md`: ausschließlich für Lehrende, inklusive Kalibrierung und Seminarablauf.
- `.github/workflows/`: Prüfung und Veröffentlichung über GitHub Pages.

## Prüfen

```sh
npm run check
npm test
```

Ressourcen und Regeln können zentral im Katalog angepasst werden. Bei inkompatiblen Modelländerungen `CATALOG_VERSION` erhöhen und eine ausdrückliche Importmigration ergänzen; alte Dateien werden sonst bewusst abgelehnt. Fiktive Spielpunkte, keine realen Haushalts- oder Personalwerte.

## Repository und Veröffentlichungsstatus

Repository: https://github.com/Pijaythepahl/flottenatelier (öffentlich). Die Veröffentlichung auf GitHub Pages wurde vom Eigentümer am 20.09.2026 nach den Tests freigegeben. Zieladresse: https://pijaythepahl.github.io/flottenatelier/. Der Workflow prüft den Code und alle Tests vor jeder Veröffentlichung.

## Modellversion 2 und alte Entwürfe

Neue Daten liegen unter `flottenatelier.v2`. Beim ersten Laden wird ein vorhandener v1-Stand validiert, vor der Umstellung unter einem datierten Backup-Schlüssel gesichert und als v2 gespeichert. Der ursprüngliche v1-Schlüssel bleibt erhalten. Alte Importdateien werden ebenfalls gesichert. Bereits abgegebene Stände verwenden dauerhaft den eingefrorenen v1-Katalog; erst die Überarbeitung wird migriert. Bei einem Fehler bleibt die Quelle erhalten. Backups bleiben lokal und können über die Browser-Entwicklerwerkzeuge unter Application/Local Storage als JSON gesichert werden.

`catalog.js` speichert Kosten in ganzzahligen Viertelpunkten, Limits bleiben sichtbare Punkte. `unitCost()` und `totals()` liefern sichtbare Punkte. Änderungen an Einheitenausstattung laufen durch `setModules()`; `assignUnit()` übernimmt Plattform und Logistik gemeinsam. `groupUnits()` gruppiert identische Ausstattungen. Die eingefrorenen Dateien `catalog-v1.js` und `engine-v1.js` dürfen nicht an neue Regeln angepasst werden.

Die Miniaturen liegen lokal unter `dist/assets/`; Generierung und Prompts sind in `docs/MINIATUREN.md` dokumentiert. Es gibt keine externe Bildabfrage zur Laufzeit.
