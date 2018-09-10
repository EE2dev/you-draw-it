import { getLanguage } from "../youdrawit.js";

export const formatValue = function(val, unit, precision, defaultPrecision) {
  const data = precision ?
    Number(val).toFixed(precision) :
    (defaultPrecision !== 0) ? 
      Number(val).toFixed(defaultPrecision) : 
      (defaultPrecision === 0) ? 
        Number(val).toFixed() : 
        val;
  // revert decimal and thousands separator based on country
  let dataDelimited = numberWithCommas(data);
  if (getLanguage() === "de") {
    const temp1 = dataDelimited.replace(/\./g, "whatever"); 
    const temp2 = temp1.replace(/,/g, ".");
    dataDelimited = temp2.replace(/whatever/g, ","); 
  } else if (getLanguage() === "fr") {
    const temp1 = dataDelimited.replace(/\./g, "whatever"); 
    const temp2 = temp1.replace(/,/g, " ");
    dataDelimited = temp2.replace(/whatever/g , ",");     
  }
  return dataDelimited + (unit ? " " + unit : "");
};

const numberWithCommas = (x) => {
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
};