import { getLanguage } from "../youdrawit.js";

export const formatValue = function(val, unit, precision, defaultPrecision) {
  const data = precision ?
    Number(val).toFixed(precision) :
    (defaultPrecision !== 0) ? 
      Number(val).toFixed(defaultPrecision) : 
      (defaultPrecision === 0) ? 
        Number(val).toFixed() : 
        val;
  const dataDelimited = (getLanguage() === "German") ? String(data).replace(".", ",") : String(data);
  return dataDelimited + (unit ? " " + unit : "");
};