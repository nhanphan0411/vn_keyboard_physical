import Papa from "papaparse";

// const dictionaryURL =
//   "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZlzyD5wC0EQ7aQ9vIha6l-EJXQcke5j2SaHv-7DGFHa7hMM2uerUyF7siMXWcaa5TRB3TDBcYYwkC/pub?gid=493231825&single=true&output=csv";

const dictionaryURL =
  "tu_dien_tieng_viet_2.csv";


  interface DictionaryEntry {
    word: string;
    _word_: string;
    description: string; 
  }

export async function fetchDictionary(): Promise<DictionaryEntry[]> {
  const response = await fetch(dictionaryURL);
  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse<DictionaryEntry>(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (err: Error) => reject(err),
    });
  });
}