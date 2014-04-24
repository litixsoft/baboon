
#bbc.alert

- - -

Baboon liefert einen Service mit einer Directive zum Anzeigen von Informationen für den User mit. Dafür wird eine Box temporär in der UI eingeblendet. Über die Methoden und Parameter des Services lassen sich Inhalt und Aussehen der Alarmbox steuern.

Für weitere Details besuchen Sie bitte unsere <a href="/doc#/api/bbc.alert.directive:bbcAlert" target="_self">API Referenz</a>.

###Methoden

 * info: Liefert einen einfachen Hinweis zur Information des Benutzers.
 * success: Liefert eine Meldung für den erfolgreichen Abschluß eines Bearbeitungsvorgangs.
 * warning: Liefert eine auffällige Warnmeldung.
 * danger: Liefert eine Alarmmeldung bei schwereren Fehlern.
 * close: Blendet die Messagebox wieder aus.

Der Parameter Message enthält die anzuzeigende Nachricht.

###Beispiel