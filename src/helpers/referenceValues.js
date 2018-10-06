/*
 * params:
 * sel: DOM selection for the text label of the reference value. A <span> is added with the text
 * svg: SVG for the lines connecting the graph with the label
 * referenceValues: question.referenceValues
 * c: object constant with graphical DOM selections as properties
 */
export function addReferenceValues (sel, svg, referenceValues, c){
  const len = 10;
  const shiftSpan = 8;
  let rectHeight = 30;
  let data = referenceValues.map(d => c.y(d.value) - shiftSpan);
  const positions = getPositions(data, rectHeight, c.height);
  let gRef;

  referenceValues.forEach(function (ref, i){
    gRef = svg.append("g")
      .attr("class", "reference question-referenceValue controls");
    // gRef = gRef.style("stroke", gRef.style("color"));

    gRef.append("line")
    //  .style("stroke", "grey")
    // .style("stroke-dasharray","3 1")
      .attr("x1", 0)
      .attr("y1", c.y(ref.value))
      .attr("x2", len / 2)
      .attr("y2", c.y(ref.value));

    gRef.append("line")
    // .style("stroke", "grey")
    // .style("stroke-dasharray","3 1")
      .attr("x1", len / 2)
      .attr("y1", c.y(ref.value))
      .attr("x2", len)
    //.attr("y2", c.y(ref.value));
      .attr("y2", positions[i] + shiftSpan);
       
    sel.append("span")
      .style("left", (len + 3) + "px")
    //.style("top", (c.y(ref.value) - 8) + "px") 
      .style("top", positions[i] + "px")
      .append("div")
      .attr("class", "question-referenceValue update-font")
      .text(ref.text); 
  });
}

function getPositions(data, rectHeight) {
  let newPositions;
  var dataObject = createObject(data, rectHeight);
  dataObject = adjustBottoms(dataObject);
  newPositions = trimObject(dataObject);
  // drawRectangles(g, data2, "after");
    
  if (newPositions[newPositions.length-1] < 0) {
    dataObject = adjustTops(dataObject);
    newPositions = trimObject(dataObject);
    // drawRectangles(g, data3, "final");
  }
  return newPositions;
}
  
function createObject(data, rectHeight, height) {
  // setup data structure with rectangles from bottom to the top
  var dataObject = [];
  var obj = {top: height, bottom: height + rectHeight}; // add dummy rect for lower bound
      
  dataObject.push(obj);
  data.forEach(function(d){
    obj = {top: d, bottom: d + rectHeight};
    dataObject.push(obj);
  });
  obj = {top: 0 - rectHeight, bottom: 0}; // add dummy rect for upper bound
  dataObject.push(obj);
  
  return dataObject;
}
  
function trimObject(dataObject) { // convert back to original array of values, also remove dummies
  var data3 = [];
  dataObject.forEach(function(d,i){
    if (!(i === 0 || i === dataObject.length-1)) {
      data3.push(d.top);
    }
  });
  return data3;
}
  
function adjustBottoms(dataObject){
  dataObject.forEach(function(d,i){
    if (!(i === 0 || i === dataObject.length-1)) {
      var diff = dataObject[i-1].top - d.bottom;
      if (diff < 0) { // move rect up   
        d.top += diff;
        d.bottom += diff;
      }
    }
  });
  return dataObject;
}
  
function adjustTops(dataObject){
  for (var i = dataObject.length; i-- > 0; ){
    if (!(i === 0 || i === dataObject.length-1)) {
      var diff = dataObject[i+1].bottom - dataObject[i].top;
      if (diff > 0) { // move rect down
        dataObject[i].top += diff;
        dataObject[i].bottom += diff;
      }
    }
  }
  return dataObject;
}