import * as d3 from "d3";
import { ƒ } from "./helpers/function";
import { formatValue } from "./helpers/formatValue";
import { clamp } from "./helpers/clamp";
import { getRandom } from "./helpers/getRandom";
import { yourData, resultShown, completed, score, prediction, truth } from "./helpers/constants";
import { getScore } from "./results/score";

export function ydBar(isMobile, state, sel, key, question, globals, data, indexedTimepoint, indexedData) {
  const minX = data[0].timePointIndex;
  const maxX = data[data.length - 1].timePointIndex;
  const minY = d3.min(data, d => d.value);
  const maxY = d3.max(data, d => d.value);
  const lastPointShownAtIndex = indexedTimepoint.indexOf(question.lastPointShownAt.toString());
  
  const drawAxes = function (c) {
    c.axis.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + c.height + ")");
    // .call(c.xAxis);

    c.axis.append("g")
      .attr("class", "y axis")
      .call(c.yAxis);
  };

  const makeLabel = function (pos, addClass) {
    const x = c.x(truth) + (c.x.bandwidth() / 2); 
    const truthValue = data[0].value;
    const y = c.y(truthValue);

    const text = formatValue(truthValue, question.unit, question.precision);

    const label = c.labels.append("div")
      .classed("data-label", true)
      .classed(addClass, true)
      .style("opacity", 0)
      .style("left", x + "px")
      .style("top", y + "px");
    label.append("span")
      .classed("no-dot", true)
      .text(text);

    if (pos == minX && isMobile) {
      label.classed("edge-left", true);
    }
    if (pos == maxX && isMobile) {
      label.classed("edge-right", true);
    }

    return [{}, label];
  };

  const drawChart = function (addClass) {
    const group = c.charts.append("g").attr("class", "truth");

    makeLabel(truth, addClass);
    
    const truthSelection = group.append("rect")
      .attr("class", "bar")
      .attr("x", c.x(truth))
      .attr("y", c.height)
      .attr("height", 0)
      .attr("width", c.x.bandwidth());
    return truthSelection;
  };

  // make visual area empty
  sel.html("");

  const margin = {
    top: 20,
    right: isMobile ? 20 : 50,
    bottom: 30,
    left: isMobile ? 20 : 100
  };
  const width = sel.node().offsetWidth;
  const height = 400;
  const c = {
    width: width - (margin.left + margin.right),
    height: height - (margin.top + margin.bottom)
  };

  const graphMinY = question.yAxisMin ? question.yAxisMin : 
    minY >= 0 ? 0 : minY * getRandom(1, 1.5);
  const graphMaxY = question.yAxisMax ? question.yAxisMax : 
    maxY + (maxY - graphMinY) * getRandom(0.4, 1); // add 40 - 100% for segment titles
  c.x = d3.scaleBand().rangeRound([0, c.width]).padding(0.1);
  c.x.domain([prediction, truth]);
  c.y = d3.scaleLinear().range([c.height, 0]);
  c.y.domain([graphMinY, graphMaxY]);

  c.svg = sel.append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr("width", c.width)
    .attr("height", c.height);

  // gradients
  c.defs = d3.select(c.svg.node().parentNode).append("defs");
  ["black", "red", "blue"].forEach(color => {
    const gradient = c.defs.append("linearGradient")
      .attr("id", "gradient-" + color)
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    gradient.append("stop").attr("offset", "0%").attr("class", "start");
    gradient.append("stop").attr("offset", "100%").attr("class", "end");
  });

  c.defs.append("marker")
    .attr("id", "preview-arrowp")
    .attr("orient", "auto")
    .attr("viewBox", "0 0 10 10")
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("refX", 1)
    .attr("refY", 5)
    .append("path")
    .attr("d", "M 0 0 L 10 5 L 0 10 z");

  // make background grid
  c.grid = c.svg.append("g")
    .attr("class", "grid");

  c.grid.append("g").attr("class", "vertical").call(
    d3.axisLeft(c.y)
      .tickValues(c.y.ticks(6))
      .tickFormat("")
      .tickSize(-c.width)
  );

  const applyMargin = function (sel) {
    sel.style("left", margin.left + "px")
      .style("top", margin.top + "px")
      .style("width", c.width + "px")
      .style("height", c.height + "px");
  };

  setTimeout(() => {
    const clientRect = c.svg.node().getBoundingClientRect();
    c.top = clientRect.top + window.scrollY;
    c.bottom = clientRect.bottom + window.scrollY;
  }, 1000);

  c.labels = sel.append("div")
    .attr("class", "labels")
    .call(applyMargin);
  c.axis = c.svg.append("g");
  c.charts = c.svg.append("g").attr("class", "charts");
  c.xPredictionCenter = c.x(prediction) + (c.x.bandwidth() / 2);

  const userSel = c.svg.append("rect").attr("class", "your-rect");

  // invisible rect for dragging to work
  const dragArea = c.svg.append("rect")
    .attr("class", "draggable")
    .attr("x", c.x(prediction))
    .attr("width", c.x.bandwidth())
    .attr("height", c.height)
    .attr("opacity", 0);

  // configure axes
  c.xAxis = d3.axisBottom().scale(c.x);
  c.yAxis = d3.axisLeft().scale(c.y).tickValues(c.y.ticks(6));
  c.yAxis.tickFormat(d => formatValue(d), question.unit, question.precision);
  drawAxes(c);

  c.titles = sel.append("div")
    .attr("class", "titles")
    .call(applyMargin)
    .style("top", "0px");

  // add a preview pointer 
  const xs = c.xPredictionCenter;
  const ys = c.height - 30;
  const xArrowStart = xs + 45;
  const yArrowStart = ys - 50;
  const xTextStart = xArrowStart + 5;
  const yTextStart = yArrowStart - 10;
  
  c.preview = c.svg.append("path")
    .attr("class", "controls preview-pointer")
    .attr("marker-end", "url(#preview-arrowp)")
    .attr("d", "M" + xArrowStart + "," + yArrowStart + 
          " Q" + xs + "," + yArrowStart + 
          " " + xs + "," + (ys - 10));

  // add preview wave
  let arc = d3.arc()
    .startAngle(0)
    .endAngle(2 * Math.PI);

  let nrWaves = initializeWaves(4);
  c.wave = c.svg.append("g").attr("class", "wave controls");
  c.wave.append("clipPath")
    .attr("id", `wave-clip-${key}`)
    .append("rect")
    .attr("width", c.width)
    .attr("height", c.height);

  c.wave = c.wave
    .append("g")
    .attr("clip-path", `url(#wave-clip-${key})`)
    .append("g")
    .attr("transform", "translate(" + xs + ", " + ys + ")")
    .selectAll("path")
    .data(nrWaves)
    .enter()
    .append("path")
    .attr("class", "wave")
    .attr("d", arc);

  moveWave();    
  function moveWave(){
    // console.log ("moveWave for bars");
    c.wave.style("opacity", .6)
      .transition()
      .ease(d3.easeLinear) 
      .delay((d,i) => 1000 + i * 300)
      .duration(4000)
      .attrTween("d", arcTween())
      .style("opacity", 0)
      .on("end", restartWave);
  }

  function initializeWaves(nr){
    let nrWaves = [];
    for (let i = 0; i < nr; i++) {nrWaves.push({});}
    return nrWaves;
  }

  function restartWave(d,i){
    if (i === (nrWaves.length - 1)) { // restart after last wave is finished
      let nrWaves2 = initializeWaves(4);
      c.wave = c.wave.data(nrWaves2);
      c.wave.attr("d", arc);
      moveWave();
    }
  }

  function arcTween() {
    return function(d) {
      if (sel.classed("drawn")){
        c.wave.interrupt();
        console.log("waves interrupted");
        return;
      }
      var interpolate = d3.interpolate(0, 100);
      return function(t) {
        d.innerRadius = interpolate(t);
        d.outerRadius = interpolate(t) + 3;
        return arc(d);
      };
    };
  }

  // add preview notice
  c.controls = sel.append("div")
    .attr("class", "controls")
    .call(applyMargin)
    .style("padding-left", c.xPredictionCenter);
            
  c.controls.append("span")
    .style("left", xTextStart + "px")
    .style("top", yTextStart + "px") 
    .text(globals.drawBar); 

  // make chart
  const truthSelection = drawChart("blue");

  // segment title
  c.predictionTitle = c.titles.append("span")
    /*
    .style("left", c.x(prediction) + "px")
    .style("width", c.x.bandwidth() + "px")
    */
    .style("left", "1px")
    .style("width", (c.width / 2) - 1 + "px")
    .text(globals.drawAreaTitle);

  // Interactive user selection part
  userSel.attr("x", c.x(prediction))
    .attr("y", c.height - 30)
    .attr("width", c.x.bandwidth())
    .attr("height", 30);

  if(!state.get(key, yourData)){
    const val = data.map(d => ({year: d.year, value: indexedData[lastPointShownAtIndex], defined: 0}))
      .filter(d => {
        if (d.year == lastPointShownAtIndex) d.defined = true;
        return d.year >= lastPointShownAtIndex;
      });
    state.set(key, "yourData", val);
  }

  const resultSection = d3.select(".result." + key);
  const drawUserBar = function(year) {
    const h = c.y(state.get(key, yourData)[0].value);
    userSel.attr("y", h)
      .attr("height", c.height - h);
    const d = state.get(key, yourData).filter(d => d.year === year)[0];
    // const dDefined = state.get(key, yourData).filter(d => d.defined && (d.year !== lastPointShownAtIndex));

    if(!d.defined) {
      return;
    }

    const yourResult = c.labels.selectAll(".your-result")
      .data([d]);
    yourResult.enter()
      .append("div")
      .classed("data-label your-result", true)
      .classed("edge-right", isMobile)
      .merge(yourResult)
      .style("left", c.xPredictionCenter + "px")
      .style("top", r => c.y(r.value) + "px")
      .html("")
      .append("span")
      .classed("no-dot", true)
      .text(r => question.precision ? formatValue(r.value, question.unit, question.precision) 
        : formatValue(r.value, question.unit, question.precision, 0));
  };
  if (sel.classed("drawn")){
    drawUserBar(lastPointShownAtIndex);
  }

  const interactionHandler = function() {
    if (state.get(key, resultShown)) {
      return;
    }

    sel.node().classList.add("drawn");

    const pos = d3.mouse(c.svg.node()); 
    if (pos[1] < margin.top) { return; }
    const value = clamp(c.y.domain()[0], c.y.domain()[1], c.y.invert(pos[1]));
    let yearPoint = lastPointShownAtIndex;

    state.get(key, yourData).forEach(d => {
      d.value = value;
      d.defined = true;
      yearPoint = d.year;
    });

    if (pos[1] < 80) { c.predictionTitle.style("opacity", 0);
    } else if (pos[1] >= 80)  { c.predictionTitle.style("opacity", 1); }

    drawUserBar(yearPoint);

    if (!state.get(key, completed) && d3.mean(state.get(key, yourData), ƒ("defined")) == 1) {
      state.set(key, completed, true);
      resultSection.node().classList.add("finished");
      resultSection.select("button").node().removeAttribute("disabled");
    }
  };

  c.svg.call(d3.drag().on("drag", interactionHandler));
  c.svg.on("click", interactionHandler);

  const showResultChart = function () {
    if(!state.get( key, completed)) {
      return;
    }
    c.labels.selectAll(".your-result").node().classList.add("hideLabels");
    
    const h = c.y(data[0].value);
    truthSelection.transition()
      .duration(1300)
      .attr("y", h)
      .attr("height", c.height - h);

    dragArea.attr("class", "");
    
    setTimeout(() => {
      c.labels.select("div.data-label").style("opacity", 1);
      resultSection.node().classList.add("shown");

      if (!state.get(key, score)) { 
        const truth = data.filter(d => d.year === lastPointShownAtIndex);
        getScore(key, truth, state, graphMaxY, graphMinY, resultSection, globals.scoreTitle);
      }
      state.set(key, resultShown, true);
    }, 1300);

  };
  resultSection.select("button").on("click", showResultChart);
  if (state.get(key, resultShown)) {
    showResultChart();
  }
}