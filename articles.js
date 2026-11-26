// Artikelliste: Name, Preis pro Stück und optional Pfand pro Stück.
// pfand: 0 = keine Pfandoption für diesen Artikel.
// { separator: true } = optische Trennzeile zwischen Artikelgruppen.
// Die Reihenfolge nicht ändern, solange ein Vorgang läuft (Mengen werden nach Position gespeichert).
var articles = [
  { name: 'Glühwein', price: 4.00, pfand: 2.00 },
  { name: 'Rentierpunsch', price: 4.00, pfand: 2.00 },
  { name: 'Extraschuß', price: 1.50, pfand: 0.00 },
  { separator: true },
  { name: 'Hot Aperol', price: 5.50, pfand: 2.00 },
  { separator: true },
  { name: 'Bier 0,33', price: 3.00, pfand: 1.00 },
  { separator: true },
  { name: 'Kinderpunsch', price: 4.50, pfand: 2.00 },
  { name: 'Limo/Spezi/Wasser', price: 2.50, pfand: 1.00 }
];