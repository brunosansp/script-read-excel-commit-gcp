'use strict'
const { Firestore } = require('@google-cloud/firestore');
const { v4 } = require('uuid');
const excelToJson = require('convert-excel-to-json');

const db = new Firestore();

const gcpFirestore = { collection: "produtos-consoles" };

const textTitleCase = (text) => {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word === 'x/s' ? 'X/S' : word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

async function main() {
  const resultReadExcel = excelToJson({ sourceFile: './produtos_consoles.xlsx', header: { rows: 1 } });
  const results = resultReadExcel.consultas;
  const batch = db.batch();
  results.forEach((result) => {
    const strProduct = result.A.toLowerCase().replace(/console\s/, '');
    const product = textTitleCase(strProduct);
    const uuid = v4();
    const data = {
      productId: uuid,
      productName: product,
      description: `Console ${product}`,
      price: `R$ ${(result.C).toFixed(2)}`,
      available: result.D === 'S' ? true : false,
      active: true,
      provider: result.E,
      contacts: {
        phone: result.F,
        email: result.G
      },
      createdAt: new Date().toISOString()
    };
    const ref = db.collection(gcpFirestore.collection).doc(uuid);
    batch.set(ref, data);
  });
  await batch.commit();
  return console.log("itens cadastrados com suceso!");
}
main();