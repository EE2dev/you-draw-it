export const ƒ = function () {
  const functions = arguments;

  //convert all string arguments into field accessors
  for (let i = 0; i < functions.length; i++) {
    if (typeof(functions[i]) === "string" || typeof(functions[i]) === "number") {
      functions[i] = (str => function (d) {
        return d[str];
      })(functions[i]);
    }
  }

  //return composition of functions
  return function (d) {
    let i = 0, l = functions.length;
    while (i++ < l) d = functions[i - 1].call(this, d);
    return d;
  };
};