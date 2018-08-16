export const formatValue = function(val, unit, precision, defaultPrecision) {
  const data = precision ?
    Number(val).toFixed(precision) :
    (defaultPrecision !== 0) ? 
      Number(val).toFixed(defaultPrecision) : 
      (defaultPrecision === 0) ? 
        Number(val).toFixed() : 
        val;
  return String(data).replace(".", ",") + (unit ? " " + unit : "");
};