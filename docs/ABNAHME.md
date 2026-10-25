# Technische Abnahme – 25. Oktober 2026

## Automatisiert

- `node scripts/check.mjs`: Syntax sämtlicher aktueller und eingefrorener Programme, Startdateien und lokale Miniaturen geprüft.
- `node --test tests/*.test.mjs`: 76 Tests bestanden, einschließlich Kalibrierung, Personalzuschlägen, Referenzrechnung, Kapazitätsumstellung, unbemannten Plattformen und historischen Prüfungen.
- Beschaffungsplanung verändert die Quelle nicht; bestätigt wird die gesamte Änderung. Voraussetzungen, Kapazitäten und Kosten werden unabhängig vom Anzeigecode geprüft.
- Hafen-/Flugplatzgrenzen, Spezialisierungen, Einschiffung, Logistik, Abschluss, Überarbeitung und Importvalidierung geprüft. Historische Abgaben behalten ihren alten Katalog.

## Im Browser durchgespielt

- Nachtrag Version 5: Genau drei unbemannte Plattformfamilien sichtbar. USV mit Minenabwehr und Sensorik zeigt 12 / 5 / 2,25 sowie 3 Mine-Warfare-Punkte; zwei belegte Bausteinplätze sperren weitere Module. Fehlendes Führungsnetz wird gemeinsam angeboten. UUV mit Minenabwehr ohne bemanntes Minenjagdboot gekauft: 12 / 5 / 2,5 sowie weitere 3 Mine-Warfare-Punkte. UAV-Minensuche zeigt 1 Mine-Warfare-Punkt und 1 Flugplatzpunkt. Keine Browserfehler oder Warnungen. Abbildung unter `artifacts/seminar-qa/unbemannte-drei-domaenen.png`. Historische v4-Abgaben bleiben eingefroren; die Übernahme alter Drohnen und Minenpakete ist zusätzlich automatisiert geprüft.
- Erste Fregatte: gemeinsamer Dialog für Fregatte und Marinestützpunkt, Kosten 28 / 14 / 15. Abbruch lässt Ressourcen bei null; Bestätigung ergänzt beides.
- Zwei Fregatten mit U-Boot-Jagd und Strike: ein fehlendes Führungsnetz gemeinsam angeboten, Gesamtkosten der Änderung 80 / 34 / 25.
- Fähigkeitssummen einer Grundfregatte plus zwei solchen spezialisierten Fregatten: AAW 6, ASuW 6, ASW 9, Mine Warfare 0, Strike 6.
- Zwei Schwerpunkte gewählt; weitere Schwerpunktkästchen gesperrt, optionale Lücken und Partnerunterstützung weiterhin wählbar. Vier offene Antworten ausgefüllt und in der Zusammenfassung kontrolliert.
- Abschluss mit schreibgeschütztem Stand; Überarbeitung mit unverändertem ursprünglichen Diskussionsstand.
- Marinehubschrauber samt Marinefliegerbasis hinzugefügt. Einmal Rückgängig entfernt beide gemeinsam und stellt die bisherigen Ressourcen wieder her.
- Marineinfanterie einem Dockschiff zugeordnet: eigenes Logistikpaket angeboten; Zuordnung einschließlich Logistik in Gesamtübersicht kontrolliert.
- Gruppierung bleibt beim Auswählen geschlossen; Wechsel der Hauptansichten über Enter möglich, Fokus bleibt auf der gewählten Schaltfläche.
- Optionaler JSON-Export ausgelöst und die tatsächlich heruntergeladene Datei erneut mit dem Importvalidator geprüft: Schema 3, zehn Bausteine, ein früherer Diskussionsstand, gewählte Schwerpunkte erhalten.
- Darstellung bei 1366×768, 820×1180 und 390×844 geprüft. Kein horizontaler Seitenüberlauf. Auf Laptopgröße bleiben Anzahl und Hinzufügen sichtbar; die Detailspalte scrollt separat.
- Keine Browserfehler oder Warnungen während dieser Abläufe. Aufnahmen der überarbeiteten Ansichten liegen lokal unter `artifacts/seminar-qa/`.

## Grenzen dieser Abnahme

Kalibrierungsnachtrag Version 4: unabhängige Referenzsumme 835,5 / 417 / 401,75 gegen Budget 880 / 450 / 430 bestätigt. Sichtbare Modulaufschläge und Budgets im Browser geprüft; ASW-Fregatte zeigt 26 / 12 / 11 sowie +1 Personal am Modul. Frühere v3-Abgaben behalten ihre Preise und Grenzen. Details und Quellen einschließlich Grenzen der Bestandsannahmen stehen in [KALIBRIERUNG.md](KALIBRIERUNG.md). Die folgenden historischen Ablaufaufzeichnungen beschreiben jeweils ihren damaligen Modellstand.

Nachtrag zu Stationierung und Flugplatzkapazität: Acht zusätzliche Regeltests prüfen automatische Bordzuordnung über mehrere Plattformen, freie Kapazität, Land/Bord-Umschaltung einschließlich Logistik, getrennte Gruppierung, neue Einheitennamen sowie 48 Flugplatzpunkte mit Verbrauch 1/2/1 für Hubschrauber/Flugzeug/Drohnenpaket. Der bisherige Browserdurchlauf oben beschreibt den Erststand mit konkreter Plattformauswahl; die aktuelle Oberfläche verwendet nur noch landgestützt/bordgestützt. Zusätzlich im Browser geprüft: zwei Fregatten und drei automatisch verteilte Bordhubschrauber; die Gesamtübersicht zeigt „3× Marinehubschrauber – Bordgestützt“ und eine Flugplatzkapazität von 3/48. Keine Schiffsnummern im Auswahlfeld oder in der Stationierungsübersicht, keine Browserfehler. Aufnahme unter `artifacts/seminar-qa/stationierung-48-punkte.png`.

Die zwei Stunden sind als Lehrgangsablauf mit 10 / 45 / 15 / 35 / 15 Minuten umgesetzt. Ein echter Durchgang mit Stabsoffizieren wurde nicht durchgeführt; eine Nutzerbewertung von fünf Sternen kann aus technischen Prüfungen nicht abgeleitet werden. Fähigkeitspunkte und Infrastrukturkapazitäten sind dokumentierte didaktische Startwerte.

Vor Einsatz empfiehlt sich ein kurzer Pilot ohne Bedienungsvortrag: erste spezialisierte Einheit einschließlich Voraussetzungen hinzufügen, Fähigkeitsprofil erklären, eine weitere Einheit zuordnen und die Begründung erreichen. Dabei Beobachtungen und notwendige Hilfestellungen erfassen. Der eigentliche Lehrgang muss anschließend einschließlich gemeinsamer Auswertung in 120 Minuten erprobt werden.

Offline-Einzeldatei, spezielle ILIAS-Verpackung und Übertragung an ein LMS wurden wie besprochen zurückgestellt. Das Spiel selbst benötigt weiterhin kein Backend oder zentrale Datenspeicherung. Eine Veröffentlichung ist über den vorhandenen GitHub-Pages-Workflow vorgesehen.

Nachtrag zu den verstellbaren Spalten: Bei der kommentierten Bildschirmgröße 1229×1244 die rechte Trennlinie von 300 auf 440 Pixel Detailbreite gezogen; linke Trennlinie zusätzlich per Pfeiltaste verschoben. Nach Neuladen 235/450 Pixel erhalten. Pos1 begrenzt Details auf 260 Pixel; Doppelklick stellt 245/300 wieder her. Die fünf Fähigkeitswerte liegen auch bei zweizeiligem „Mine Warfare“ auf exakt derselben Höhe. Tablet 820×1180 und Mobilansicht 390×844 ohne seitlichen Überlauf, Ziehgriffe dort ausgeblendet. Keine Browserfehler. Aufnahme: `artifacts/seminar-qa/spalten-und-faehigkeiten.png`.

Standardbreiten nach Nutzervorlage geändert: schmale Auswahl (11,5 Prozent, 210–300 Pixel), übriger Platz annähernd halbiert zwischen Details und Flotte. Bei 2550×1273 ergeben sich 293 / 1130 / 1107 Pixel ohne Überlauf oder Browserfehler; bestehende individuelle Breiten bleiben erhalten. Aufnahme: `artifacts/seminar-qa/standardbreiten.png`.
