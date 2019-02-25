const fs = require("fs");
const util = require("util");

const readFiles = (dirname, onFileContent, onError) => {
  data = {};
  return new Promise((resolve, reject) => {
    fs.readdir(dirname, (err, filenames) => {
      if (err) {
        onError(err);
        reject(err);
        return;
      }
      filenames.forEach((filename, index) => {
        fs.readFile(dirname + filename, "utf-8", (err, content) => {
          if (err) {
            onError(err);
            reject(err);
            return;
          }
          onFileContent(filename, content);
          data[filename] = content;
          if (filenames.length === index + 1) {
            resolve(data);
          }
        });
      });
    });
  });
};

const billData = async () => {
  let total_fees = 0;
  let totals = 0;
  let bill_data = [];

  await readFiles(
    "./pdf/convert/",
    (filename, content) => {},
    err => {
      throw err;
    }
  ).then(data => {
    for (let property in data) {
      let content = data[property];
      let filename = property;
      const fees = getFees(content);
      const current_bill_amount = parseFloat(getTotal(content));
      const current_bill_fees = parseFloat(fees.fees_total);
      totals = totals + current_bill_amount;
      total_fees = total_fees + current_bill_fees;
      bill_data.push({
        //content: content,
        filename: filename,
        bill_amount: current_bill_amount,
        bill_fees: current_bill_fees,
        bill_fees_percent: (current_bill_fees / current_bill_amount) * 100,
        fees: fees
      });
    }
  });
  return {
    bills: bill_data,
    fees: total_fees,
    total: totals,
  };
};

const getTotal = data => {
  const data_array = data.split("\n").filter(item => item.trim().length);
  const arr = ["total current charges"];
  const checker = value =>
    arr.some(element => value.toLocaleLowerCase().includes(element));

  let output = data_array
    .filter(checker)[0]
    .split("$ ")
    .reverse()[0]
    .replace(/[^0-9.]/g, "");
  //console.log('Bill Total:', output);
  return output;
};
const getFees = data => {
  const data_array = data.split("\n").filter(item => item.trim().length);
  let fees = [],
    processed_fees = [];
  const arr = [
    "service charge",
    "transaction fee",
    "administration charge",
    "distribution charge",
    "transmission charge",
    "rate riders",
    "municipal franchise fee",
    "local access fee",
    "balancing pool allocation",
    "carbon levy"
  ];
  const checker = value =>
    arr.some(element => value.toLocaleLowerCase().includes(element));
  const text_array = data_array.filter(checker);

  text_array.forEach(item => {
    let fee = item.split("$");
    let processed_fee =
      fee.length === 3 && !fee[0].includes("Transaction Fee")
        ? fee[1]
        : fee.reverse()[0];
    let fee_int = parseFloat(processed_fee.replace(/[^0-9.]/g, ""));

    if (!isNaN(parseFloat(fee_int)) && !processed_fee.includes("CR")) {
      processed_fees.push(processed_fee);
      fees.push(parseFloat(fee_int));
    }
  });
  let output = {
    parsed_strings: text_array,
    processed_fee_chunks: processed_fees,
    fees: fees,
    fees_total: fees.reduce((a, b) => a + b, 0)
  };
  //console.log(output);
  return output;
};

billData()
  .then(data => {
    data.bills.map(obj => {
      console.log(obj);
    });
  })
  .catch(e => console.error(e));
//console.log('Bill Data:', bill_data);
