'use strict'
import { Firestore } from '@google-cloud/firestore';
import { v4 } from 'uuid';
import excelToJson from 'convert-excel-to-json';

const db = new Firestore();

const gcpFirestore = { collection: "produtos-consoles" };

const textTitleCase = (text) => {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word === 'xbox' ? 'XBOX' : word.charAt(0).toUpperCase() + word.slice(1))
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
      name: product,
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