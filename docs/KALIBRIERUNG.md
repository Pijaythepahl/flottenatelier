# Kalibrierung der Spiellogik · 25. Oktober 2026

## Ergebnis und Geltungsbereich

Diese Prüfung dokumentiert den Katalogstand Version 4. Version 5 übernimmt Budget und Referenz unverändert und ersetzt die bisherigen Drohnen-/Minenpakete durch drei unbemannte Plattformfamilien mit Fähigkeitsbausteinen. Deren gesonderte Spielwerte und Quellen stehen in [UNBEMANNTE_SYSTEME.md](UNBEMANNTE_SYSTEME.md).

**Mit dokumentierten Einschränkungen einsatzbereit.** Budget, Basiswerte aller 24 Karten, 22 zulässige Spezialisierungen, Infrastruktur, Personaldoppelzählung und historische Spielstände wurden geprüft. Änderungen sind umgesetzt. Der Rechenweg ist mit `node scripts/calibrate.mjs` wiederholbar und wird unabhängig gegen die Spielrechnung getestet.

Die Referenz ist eine **großzügige Belastungsreferenz für eine bestandsnahe Marine um 2026**, keine tagesgenau bestätigte Inventarliste und keine Musterlösung für Teilnehmende. Besonders der Hubschrauberwechsel Sea Lynx/Sea Tiger und laufende Flugzeugzuläufe erlauben aus den öffentlich geprüften Quellen keine vollständige Bestandsinventur für den 25. Oktober. Geplante und bereits gelieferte Systeme werden deshalb ausdrücklich getrennt. Einheitenbestand bedeutet außerdem nicht Einsatzbereitschaft.

| Ressource | Bisheriges Budget | Vollständige Referenz nach bisherigen Modulpreisen | Referenz nach neuer Personalregel | Neues Budget | Frei |
|---|---:|---:|---:|---:|---:|
| Aufbau | 720 | 835,5 | 835,5 | **880** | 44,5 |
| Betrieb pro Jahr | 370 | 417 | 417 | **450** | 33 |
| Personalbindung | 340 | 381 | 401,75 | **430** | 28,25 |

Die alte, kleinere Referenzrechnung 703 / 356,5 / 323 enthielt insbesondere keine vier ASW-spezialisierten F123, keine vollständige Schwerpunktsetzung der Korvetten und nicht die neuen Hafenpakete. Sie belegte daher nicht die heute gewünschte Finanzierbarkeit. Die hier festgelegten Punktwerte sind **didaktische Modellentscheidungen**, keine abgeleiteten Euro- oder Dienstpostenwerte.

## Referenz, Quellen und Unsicherheit

Der Testentwurf enthält 11 Fregatten (vier Grundplattformen für F125, vier ASW für F123, drei AAW für F124), fünf Korvetten mit Überwasser-Schwerpunkt, sechs U-Boote, zehn Minenabwehreinheiten, drei EGV, drei Flottendienstboote, sechs Tender, zwei Tanker als großzügigen Übergangsansatz; ferner 18 Transport-/SAR-Hubschrauber, einen ASW-Hubschrauberpool von 22, drei Seefernaufklärer mit ASW/Aufklärung und zwei generisch angenäherte Ölaufklärer. Zwei abstrakte Marineinfanterie-Kräftepakete und ein Führungsnetz ergänzen die Rechnung.

**Die 22 ASW-Hubschrauber sind ein Belastungsansatz aus der früheren Sea-Lynx-Flotte und keine behauptete aktuelle Stückzahl.** Es werden niemals 22 Sea Lynx plus alle 31 bestellten Sea Tiger gerechnet. Die drei P-8A folgen der zuletzt im Sommer 2026 berichteten Lieferung, nicht dem gesamten Auftrag. Zwei Tanker und fünf Korvetten sind Struktur-/Übergangsansätze; den tagesgenauen Zulauf beziehungsweise Abgang bestätigt die Quellenlage nicht vollständig. Zwei Landkräftepakete sind eine Spielabstraktion, keine Behauptung über Bataillons- oder Personalzahlen. Ausbildungs-, Forschungs-, Schlepp- und andere Hilfsfahrzeuge werden nicht einzeln behauptet; gemeinsame Landorganisation ist in den Strukturkarten abstrahiert.

Geprüfte Quellen (Abruf 25.10.2026):

- [Bundeswehr: heutige Fregattenklassen](https://www.bundeswehr.de/de/ausruestung-technik-bundeswehr/seesysteme-bundeswehr/luebeck-f122-fregatte) und [F123](https://www.bundeswehr.de/de/ausruestung-technik-bundeswehr/seesysteme-bundeswehr/brandenburg-klasse-f123-fregatte): vier F123, drei F124, vier F125; F123-Schwerpunkt ASW. Die F123-Seite enthält unterschiedliche Angaben zur Stammcrew im Fließtext und in der technischen Tabelle. Eine exakte Personenumrechnung wird daraus ausdrücklich nicht vorgenommen.
- [Bundeswehr: F124](https://www.bundeswehr.de/de/ausruestung-technik-bundeswehr/seesysteme-bundeswehr/sachsen-klasse-f124-fregatte): drei Schiffe mit Luftverteidigungsschwerpunkt; eine Bordfliegerkomponente kommt zur Schiffsstammbesatzung hinzu.
- [Bundeswehr: F125](https://www.bundeswehr.de/de/ausruestung-technik-bundeswehr/seesysteme-bundeswehr/baden-wuerttemberg-klasse-f125-fregatten) und [Mehrbesatzungsmodell](https://www.bundeswehr.de/de/organisation/marine/struktur/erklaerstueck-mehrbesatzungsmodell): kleinere Stammcrew kann mit zusätzlichen Crews und eingeschifftem Zusatzpersonal verbunden sein. Die Spielkarte ist daher kein fester Kopfzahlfaktor.
- [Bundeswehr: Korvettengeschwader](https://www.bundeswehr.de/de/organisation/marine/struktur/einsatzflottille-1/1-korvettengeschwader): fünf benannte Bestandsschiffe; Seeraumüberwachung und Wirkung gegen See-/Landziele. Aus der Liste allein wird kein Ausschluss inzwischen erfolgter weiterer Zuläufe abgeleitet.
- [Bundeswehr: Ubootgeschwader](https://www.bundeswehr.de/de/organisation/marine/struktur/einsatzflottille-1/1-ubootgeschwader): sechs U-Boote, drei benannte Flottendienstboote und insgesamt sechs Tender der Marine, davon ein U-Boot-Tender.
- [Bundeswehr: Minenjagd, 24.06.2026](https://www.bundeswehr.de/de/organisation/marine/seeminenkriegfuehrung/minenjagd): zehn Minenjagdboote mit verschiedenen Ausstattungen; Standarddrohnen sind in der Spielkarte enthalten.
- [Bundeswehr: EGV](https://www.bundeswehr.de/de/ausruestung-technik-bundeswehr/seesysteme-bundeswehr/berlin-klasse-egv-702): drei Schiffe, Versorgungs-/Sanitätsaufgaben und zwei Hubschrauber im Hangar. Der vorherige Spielwert sechs wurde auf zwei korrigiert.
- [Bundeswehr: Sea Lion vollständig ausgeliefert](https://www.bundeswehr.de/de/meldungen/bilder-aus-der-bundeswehr-woche-5-5575690): 18 Maschinen. [Erster Sea Tiger, 16.12.2025](https://www.bundeswehr.de/de/organisation/marine/aktuelles/deutsche-marine-erhaelt-ersten-bordhubschrauber-6052166): erster Zulauf und Auftrag 31. [Marinefliegerkommando](https://www.bundeswehr.de/de/organisation/marine/struktur/marinefliegerkommando) und [Ausrüstungsübersicht](https://www.bundeswehr.de/de/organisation/marine/ausruestung-und-technik) beschreiben den Ausphasungszeitpunkt des Sea Lynx unterschiedlich; keine scheinpräzise Tageszahl.
- [EDR: direkte Aussagen des Marinefliegerkommandeurs auf der ILA, 11.06.2026](https://www.edrmagazine.eu/ila-2026-the-presence-of-the-p-8a-poseidon-underlines-the-rapid-growth-of-the-german-naval-aviation): drei bis dahin gelieferte P-8A. [Bundeswehr: P-8A-Einsatz 2026](https://www.bundeswehr.de/de/organisation/marine/aktuelles/u-boot-jagd-uebung-dynamic-manta-6078944): Missions- und Technikpersonal erforderlich. [Beschaffung](https://www.bundeswehr.de/de/organisation/ausruestung-baainbw/aktuelles/beschaffung-seefernaufklaerer-p8a-5885384): acht bestellt, kein Nachweis acht bereits gelieferter Flugzeuge.
- [Bundeswehr: DO 228](https://www.bundeswehr.de/de/ausruestung-technik-bundeswehr/luftsysteme-bundeswehr/oelaufklaerer-dornier-do228-lm): zwei unbewaffnete Ölaufklärer mit spezieller Sensorik. Die generische Flugzeugkarte bildet deren Größenunterschied zur P-8A nicht exakt ab.

Sensitivität: Auch acht statt drei P-8A als **Zulaufszenario**, ohne alte P-3C zusätzlich zu zählen, passen mit 878 / 439,5 / 420,5 noch in den Rahmen. Das ist kein aktueller Ist-Bestand. Die Referenz benötigt 49 Hafenplätze und 50 Flugplatzpunkte, somit fünf Hafen- und zwei Flugplatzpakete. Flugplatzpakete sind abstrakte Organisationskapazitäten, keine Behauptung über zwei reale Flugplätze.

## Prüfung der Personal- und Kostenlogik

Grundpersonal umfasst den regulären Betrieb einer Grundplattform, Standardbewaffnung, Ausbildung, Wartung und die notwendige Personalvorhaltung in abstrakter Form. Es entspricht weder nur der momentanen Besatzung an Bord noch einer festen Anzahl realer Dienstposten. Die Landorganisation wird zusätzlich über Strukturkarten erfasst. Ein Personalkartenwert ist kein realer Besatzungsvergleich zwischen einzelnen Schiffsklassen.

| Spezialisierung | Zusatzpersonal | Begründung der Spielregel |
|---|---:|---|
| ASW auf Fregatte, Korvette oder Zerstörer/Kreuzer | +1 | zusätzliche Sensor-/Auswerte- und Instandsetzungsbindung über die Grundfähigkeit hinaus |
| AAW auf Fregatte oder Zerstörer/Kreuzer | +1 | zusätzliche Luftraumüberwachung und spezialisierte Führung/Technik |
| Strike auf Schiffen | +0,5 | zusätzliche Ziel-/Einsatzplanung und Waffenunterstützung |
| ASW auf bemanntem Luftfahrzeug oder Drehflüglerdrohnenpaket | +0,5 | Missions-/Sensorpersonal beziehungsweise zusätzliche Fachbetreuung |
| Vertiefte Aufklärung auf Luftfahrzeugen/Drohnen | +0,25 | zusätzliche Auswertung und Betreuung |
| Seezielbekämpfung | +0 | reguläre Waffenbedienung der Grundplattform; Hardware und jährlicher Betrieb kosten bereits zusätzlich |

Die exakten Zuschläge sind bewusst kleine Modellwerte, keine aus Quellen gemessenen Personalmehrbedarfe. Eine ASW-Fregatte kostet jetzt 26 Aufbau / 12 Betrieb / 11 Personal statt 26 / 12 / 10. Wird ihr ein ASW-Hubschrauber zugeordnet, bringt dieser seine eigenen 3 / 2 / 1,5 mit. Die bloße Umschaltung land-/bordgestützt erhöht den Personalwert nicht noch einmal. Die Fregatten-ASW-Spezialisierung kauft keinen Hubschrauber mit.

Alle Aufbau- und Betriebsgrundwerte wurden beibehalten: Es wurde keine allgemeingültige Inkonsistenz nachgewiesen, die eine weitere Preisänderung rechtfertigt. Die Reihenfolge ist qualitativ schlüssig: komplexe große Kampfschiffe und Träger binden besonders viele Ressourcen; kleine Spezialplattformen weniger Aufbau, aber eigene Betriebs-/Personalbindung; Drohnen sind betreute Systempakete und damit nicht unmittelbar mit einem einzelnen Fluggerät vergleichbar. Unterstützungsschiffe bleiben trotz geringer Kampfpunkte für Versorgung und Durchhaltefähigkeit relevant.

Die Tabelle aller Karten unten dokumentiert auch die Entscheidungen bei nicht deutschen Plattformen. Träger, Trägerluftgruppe, Zerstörer/Kreuzer und amphibische Plattformen sind alternative Spieloptionen; sie sind nicht als aktueller deutscher Bestand kalibriert. Körpergröße oder Verdrängung werden nicht pauschal als Preis-/Personalformel verwendet.

## Kompatibilität und Überprüfung

Version 4 bekommt einen eigenen Katalog und Browserstand. Die bisherigen v1/v2/v3-Kataloge bleiben eingefroren. Frühere Abgaben behalten Kosten, Personalbedarf und damalige Budgets. Bestehende Entwürfe und Überarbeitungen werden auf neue Regeln umgestellt; Texte, Prioritäten und Identitäten bleiben erhalten. Mehr als zwei EGV-Hubschrauber werden bei einer Umstellung auf andere freie kompatible Plätze oder an Land verteilt. Keine Luftfahrzeuge werden gelöscht; die alte Browserquelle bleibt gesichert.

Die unabhängige Zeilenrechnung enthält explizite Preise und eigene Infrastrukturformeln und muss mit der tatsächlichen Beschaffungslogik übereinstimmen. Zusätzlich werden Modulaufschläge, Doppelzählung, Kapazitäten, Abschluss, Import und historische Stände getestet. Keine automatische Bewertung oder Musterflotte wird in der Teilnehmendenoberfläche ergänzt.

Prüfungsumfang (Nenner bezeichnen den abgegrenzten Prüfumfang, keine pauschale Genauigkeitsquote):

| Kategorie | Beobachtete verbleibende Defekte | Bewertung |
|---|---|---|
| Nützlichkeit der Spielreferenz | 0 / 3 Ressourcen | vollständige Belastungsrechnung und Zulaufszenario finanzierbar; keine Aussage exakter Ist-Kosten |
| Verständlichkeit der Darstellung | 0 / 2 Darstellungen | Gesamtressourcen und Zusatzpersonal an Modulen stimmen mit der neuen Regel überein |
| Dashboard-Interaktionen | N/A | kein analytisches Dashboard beauftragt |

| Kategorie | Beobachtete verbleibende Defekte | Bewertung |
|---|---|---|
| Autorität und Aktualität | 0 / 8 Bestandsgruppen | geprüfte Quellen mit offen ausgewiesenen Übergangs-/Stichtagslücken; keine komplette Tagesinventur |
| Rechenwerte | 0 / 3 Ressourcensummen | unabhängige Rechnung gegen Spielmodell, einschließlich Infrastruktur |
| Einheitspreise | 0 / 24 Grundkarten | alle geprüft; qualitative Modellannahmen, keine Eurokalibrierung |
| Spezialisierungen | 0 / 22 Kombinationen | Personal differenziert; Hardware-/Betriebswerte beibehalten |
| Konsistenz/Historie | 0 / 4 Modellgenerationen | alte Abgaben und Budgets bleiben eingefroren; Umstellung geprüft |
| Quellen-/Dashboardansichten | N/A | Evidenz im Dokument; keine interaktiven Datenquellenansichten vorhanden |
| Schlussfolgerung | 0 / 2 Kernaussagen | bisheriger Rahmen war zu klein; neuer Rahmen trägt die definierte Referenz. Punktgenaue reale Leistung ist ausdrücklich nicht behauptet |

Wichtigste Reparaturen: Budget an vollständige Referenz angepasst; pauschal kostenlose Spezialisierungspersonale differenziert; EGV-Hangarwert korrigiert; historische Spielstände gegen nachträgliche Umrechnung geschützt. Nicht auflösbare Tagesbestandsfragen bleiben als Unsicherheit neben dem jeweiligen Ansatz sichtbar.

## Vollständiger Preisstand

Alle folgenden Werte sind sichtbare Spielpunkte in der Reihenfolge Aufbau / jährlicher Betrieb / Personal. Grundwerte gelten ohne separat gewählte Spezialisierungen.


| Karte | Grundkosten | Spezialisierungen: zusätzliche Kosten |
|---|---|---|
| Fregatte | 20 / 10 / 10 | asw: 6 / 2 / 1; surface: 4 / 1 / 0; air: 4 / 1 / 1; strike: 10 / 3 / 0.5 |
| Korvette | 10 / 5 / 5 | asw: 6 / 2 / 1; surface: 4 / 1 / 0; strike: 10 / 3 / 0.5 |
| Konventionelles U-Boot | 15 / 7 / 5 | keine |
| Minenabwehreinheit | 8 / 4 / 4 | keine |
| Einsatzgruppenversorger | 12 / 6 / 6 | keine |
| Unterstützungstender | 8 / 4 / 4 | keine |
| Flottentanker | 6 / 3 / 2 | keine |
| Aufklärungsschiff | 11 / 5 / 5 | keine |
| Marinehubschrauber | 1.5 / 0.75 / 1 | asw: 1.5 / 1.25 / 0.5; surface: 2 / 1 / 0; recon: 1 / 0.5 / 0.25 |
| Zusätzliche unbemannte Minenabwehr | 6 / 3 / 2 | keine |
| Führungs- und Datennetz | 8 / 4 / 5 | keine |
| Marinefliegerbasis | 8 / 5 / 6 | keine |
| Flugzeugträger | 320 / 140 / 140 | keine |
| Trägerluftgruppe | 140 / 70 / 60 | keine |
| Amphibisches Transport- und Dockschiff | 14 / 6 / 5 | keine |
| Amphibischer Hubschrauberträger | 22 / 10 / 9 | keine |
| Landungsboote | 4 / 2 / 1 | keine |
| Marineinfanterie | 8 / 5 / 9 | keine |
| Expeditionäre Logistik | 5 / 3 / 4 | keine |
| Zerstörer/Kreuzer | 40 / 18 / 16 | asw: 6 / 2 / 1; surface: 4 / 1 / 0; air: 4 / 1 / 1; strike: 10 / 3 / 0.5 |
| Marineflächenflugzeug | 4 / 2 / 3 | asw: 2.5 / 1.5 / 0.5; surface: 3 / 1.5 / 0; recon: 2 / 1 / 0.25 |
| Drehflüglerdrohnen | 6 / 3 / 2 | asw: 3 / 1 / 0.5; surface: 3 / 1 / 0; recon: 2 / 1 / 0.25 |
| Flächenflüglerdrohnen | 8 / 4 / 2 | surface: 4 / 1.5 / 0; recon: 2 / 1 / 0.25 |
| Marinestützpunkt | 8 / 4 / 5 | keine |
