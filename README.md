# druck.

Privates, offlinefähiges Blutdrucktagebuch von Marpet Studio.

## GitHub Pages
1. Neues **öffentliches** Repository `druck-web` erstellen.
2. Alle Dateien **aus diesem ZIP** ins Hauptverzeichnis des Repositorys hochladen (nicht den ZIP-Ordner selbst).
3. Unter **Settings → Pages → Build and deployment** `Deploy from a branch`, Branch `main`, Folder `/(root)` wählen und speichern.
4. Die unter Pages angezeigte URL öffnen und auf Android über das Browsermenü **Zum Startbildschirm hinzufügen** / **App installieren** wählen.

## Datenschutz & Backup
Messungen werden ausschließlich im localStorage des Browsers auf dem verwendeten Gerät gespeichert. Sie werden nicht auf GitHub hochgeladen. Browserdaten löschen, ein anderer Browser oder Gerätewechsel kann die Messungen entfernen. Deshalb regelmäßig über **Backup & Einstellungen** eine JSON-Datei exportieren. Beim Import werden bestehende Daten ersetzt.

Die Schrift **Permanent Marker** ist lokal als `permanent-marker.ttf` eingebunden und wird offline zwischengespeichert. **DM Sans** wird bei Internetverbindung über Google Fonts geladen; offline steht eine Systemschrift als Ersatz bereit. Die App selbst ist nach dem ersten erfolgreichen Laden offlinefähig.

## Hinweise
Die Referenzlinien sind keine Diagnose. Das Diagramm zeigt die Messungen gleichmäßig nach Reihenfolge, nicht maßstabsgetreu nach Zeitabstand. Eine automatische Hintergrund-Synchronisation oder Cloud-Sicherung gibt es nicht.

## Bedienung (Version 1.1)
Die Startkacheln öffnen eine bildschirmfüllende Ansicht unter dem festen Header.
Am grauen Griff nach unten ziehen oder auf den Griff tippen, um die Ansicht zu schließen.
Das Logo `d.` schließt die Ansicht ebenfalls.


## Fotoerkennung (Version 1.2)
In „Neue Messung“ auf „Foto vom Messgerät“ tippen. Das Foto wird per Tesseract.js **im Browser** ausgewertet. Die OCR-Bibliothek und das englische Sprachmodell müssen beim ersten Einsatz über eine Internetverbindung geladen werden. Der Foto-Inhalt wird nicht an einen OCR-Dienst hochgeladen. Die OCR-Ergebnisse sind fehleranfällig; alle drei Zahlen vor dem Speichern mit dem Messgerät vergleichen. Manuelle Eingabe bleibt jederzeit möglich. Offline-Fotoerkennung ist nicht garantiert, solange die OCR-Dateien nicht fest ins Repository eingebunden sind.
