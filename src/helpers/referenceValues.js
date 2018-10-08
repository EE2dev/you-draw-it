import * as d3 from "d3";
import { ƒ } from "./function";

/* 
 * params:
 * sel: DOM selection for the text label of the reference value. A <span> is added with the text
 * svg: SVG for the lines connecting the graph with the label
 * referenceValues: question.referenceValues
 * c: object constant with graphical DOM selections as properties
 */
export function addReferenceLines (sel, svg, referenceValues, c){
  let gRef;
  let data;
  const referenceLine = d3.line().x(ƒ("year", c.x)).y(ƒ("value", c.y)).curve(d3.curveMonotoneX);

  referenceValues.forEach(function (ref, i){
    data = ref.value.map((ele, index) => {
      return {
        year: index,
        value: ele[Object.keys(ele)[0]]
      };
    });
    data.text = ref.text;
    data.anchor = parsePosition(ref.textPosition);
    data.offset = getOffset(data.anchor);

    gRef = svg.append("g")
      .attr("class", "reference question-referenceValues referenceLine controls line-" + data.text.trim());
    
    gRef.append("path").attr("d", referenceLine(data)).attr("class", "line referencePath").attr("id", "curvedPath-" + i);

    gRef.append("text")
      .attr("class", "question-referenceText update-font")
      .attr("dy", "-5")
      .append("textPath")
      .attr("class", "referenceTextPath")
      .attr("text-anchor",data.anchor)
      .attr("startOffset",data.offset)
      .attr("xlink:href", "#curvedPath-" + i)
      .text(data.text);
  });
}

function parsePosition(pos) {
  if (pos !== "start" && pos !== "end") {
    pos = "middle";
  }
  return pos;
}

function getOffset(pos) {
  let offset;
  if (pos === "start") {
    offset = "2%";
  } else if (pos === "end") {
    offset = "98%";
  } else {
    offset = "50%";
  }
  return offset;
}

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
      .attr("class", "reference question-referenceValues controls");

    gRef.append("line")
      .attr("x1", 0)
      .attr("y1", c.y(ref.value))
      .attr("x2", len / 2)
      .attr("y2", c.y(ref.value));

    gRef.append("line")
      .attr("x1", len / 2)
      .attr("y1", c.y(ref.value))
      .attr("x2", len)
      .attr("y2", positions[i] + shiftSpan);
       
    sel.append("span")
      .style("left", (len + 3) + "px")
      .style("top", positions[i] + "px")
      .append("div")
      .attr("class", "question-referenceValues update-font")
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