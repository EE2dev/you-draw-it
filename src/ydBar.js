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
  
  
  /*
  const periods = [
    { year: lastPointShownAtIndex, class: "blue", title: ""},
    { year: maxX, class: "blue", title: globals.predictionTitle}
  ];
  */
  // const segmentBorders = [minX].concat(periods.map(d => d.year));

  const drawAxes = function (c) {
    c.axis.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + c.height + ")")
      .call(c.xAxis);

    c.axis.append("g")
      .attr("class", "y axis")
      .call(c.yAxis);
  };

  const makeLabel = function (pos, addClass) {
    // const x = c.x(pos);
    const x = c.x(truth) + (c.x.bandwidth() / 2); 
    // const y = c.y(indexedData[pos]);
    // const y = c.y(graphMinY);
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

    /*
    return [
      c.dots.append("circle")
        .attr("r", 4.5)
        .attr("cx", x)
        .attr("cy", y)
        .attr("class", addClass),
      label
    ];
    */
    return [{}, label];
  };

  /*
  const drawChart = function (lower, upper, addClass) {
    const definedFn = (d) => d.year >= lower && d.year <= upper;
    const area = d3.area().curve(d3.curveMonotoneX).x(ƒ("year", c.x)).y0(ƒ("value", c.y)).y1(c.height).defined(definedFn);
    const line = d3.area().curve(d3.curveMonotoneX).x(ƒ("year", c.x)).y(ƒ("value", c.y)).defined(definedFn);

    if (lower == minX) {
      makeLabel(minX, addClass);
    }
    const svgClass = addClass + (upper == lastPointShownAtIndex ? " median" : "");

    const group = c.charts.append("g");
    group.append("path").attr("d", area(data)).attr("class", "area " + svgClass).attr("fill", `url(#gradient-${addClass})`);
    group.append("path").attr("d", line(data)).attr("class", "line " + svgClass);
        

    return [
      group,
    ].concat(makeLabel(upper, svgClass));
  };
  */
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

  // configure scales
  /*
  const graphMinY = question.yAxisMin ? question.yAxisMin : 
    minY >= 0 ? 0 : minY * getRandom(1, 1.5);
  const graphMaxY = question.yAxisMax ? question.yAxisMax : 
    maxY + (maxY - graphMinY) * getRandom(0.4, 1); // add 40 - 100% for segment titles
  c.x = d3.scaleLinear().range([0, c.width]);
  c.x.domain([minX, maxX]);
  c.y = d3.scaleLinear().range([c.height, 0]);
  c.y.domain([graphMinY, graphMaxY]);
  */
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

  /*
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
    */

  // make background grid
  c.grid = c.svg.append("g")
    .attr("class", "grid");
  /*
  c.grid.append("g").attr("class", "horizontal").call(
    d3.axisBottom(c.x)
      .tickValues(c.x.ticks(maxX - minX))
      .tickFormat("")
      .tickSize(c.height)
  )
    .selectAll("line")
    .attr("class", (d) => segmentBorders.indexOf(d) !== -1 ? "highlight" : "");
  */
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

    // invisible rect for dragging to work
  const dragArea = c.svg.append("rect")
    .attr("class", "draggable")
    .attr("x", c.x(prediction))
    // .attr("width", c.x(maxX) - c.x(lastPointShownAtIndex))
    .attr("width", c.x.bandwidth())
    .attr("height", c.height)
    .attr("opacity", 0);

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

  // const userSel = c.svg.append("path").attr("class", "your-line");
  const userSel = c.svg.append("rect").attr("class", "your-rect");
  c.dots = c.svg.append("g").attr("class", "dots");

  // configure axes
  c.xAxis = d3.axisBottom().scale(c.x);
  // c.xAxis.tickFormat(d => indexedTimepoint[d]).ticks(maxX - minX);
  c.yAxis = d3.axisLeft().scale(c.y).tickValues(c.y.ticks(6));
  c.yAxis.tickFormat(d => formatValue(d), question.unit, question.precision);
  drawAxes(c);

  c.titles = sel.append("div")
    .attr("class", "titles")
    .call(applyMargin)
    .style("top", "0px");

  // add a preview pointer 
  /*
  const xs = c.x(lastPointShownAtIndex);
  const ys = c.y(indexedData[lastPointShownAtIndex]);
  */
  const xs = c.xPredictionCenter;
  const ys = c.height - 30;

  /*
  const xArrowStart = (ys <= 300) ? (xs + 45) : (xs + 70);
  const yArrowStart = (ys <= 300) ? (ys + 30) : (ys - 30);
  const yTextStart = (ys <= 300) ? (c.y(indexedData[lastPointShownAtIndex]) + 30) : (c.y(indexedData[lastPointShownAtIndex]) - 65);
  const xTextStart = (ys <= 300) ? (c.x(lastPointShownAtIndex)  + 30) : (c.x(lastPointShownAtIndex)  + 65);

  c.preview = c.svg.append("path")
    .attr("class", "controls preview-pointer")
    .attr("marker-end", "url(#preview-arrowp)")
    .attr("d", "M" + xArrowStart + "," + yArrowStart + 
            " Q" + xArrowStart + "," + ys + 
            " " + (xs + 15) + "," + ys);
            */
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
  /*
    .startAngle(-Math.PI / 2)
    .endAngle(Math.PI / 2);*/
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
    console.log ("moveWave for bars");
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
  //.style("padding-left", c.x(minX) + "px");
            
  c.controls.append("span")
    .style("left", xTextStart + "px")
    .style("top", yTextStart + "px")
    .text("Ziehen Sie den Balken\nin die entsprechende Höhe"); 

  // make chart
  /*
  const charts = periods.map((entry, key) => {
    const lower = key > 0 ? periods[key - 1].year : minX;
    const upper = entry.year;

    // segment title
    c.titles.append("span")
      .style("left", c.x(lower) + "px")
      .style("width", c.x(upper) - c.x(lower) + "px")
      .text(entry.title);
    
    return drawChart(lower, upper, entry.class);
  });
  */
  const truthSelection = drawChart("blue");
  /*
  const resultChart = charts[charts.length - 1][0];
  const resultClip = c.charts.append("clipPath")
    .attr("id", `result-clip-${key}`)
    .append("rect")
    .attr("width", c.x(lastPointShownAtIndex))
    .attr("height", c.height);
  

  const resultLabel = charts[charts.length - 1].slice(1, 3);
  resultChart.attr("clip-path", `url(#result-clip-${key})`)
    .append("rect")
    .attr("width", c.width)
    .attr("height", c.height)
    .attr("fill", "none");
  resultLabel.map(e => e.style("opacity", 0));
*/

  // Interactive user selection part
  // const userLine = d3.line().x(ƒ("year", c.x)).y(ƒ("value", c.y)).curve(d3.curveMonotoneX);

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
  /*
  const drawUserLine = function(year) {
    userSel.attr("d", userLine.defined(ƒ("defined"))(state.get(key, yourData)));
    const d = state.get(key, yourData).filter(d => d.year === year)[0];
    const dDefined = state.get(key, yourData).filter(d => d.defined && (d.year !== lastPointShownAtIndex));

    if(!d.defined) {
      return;
    }
        
    const dot = c.dots.selectAll("circle.result")
      .data(dDefined);
    dot.enter()
      .append("circle")
      .merge(dot)
      .attr("r", 4.5)
      .attr("cx", de => c.x(de.year))
      .attr("cy", de => c.y(de.value))
      .attr("class", "result");

    const yourResult = c.labels.selectAll(".your-result")
      .data([d]);
    yourResult.enter()
      .append("div")
      .classed("data-label your-result", true)
      .classed("edge-right", isMobile)
      .merge(yourResult)
      .style("left", () => c.x(year) + "px")
      .style("top", r => c.y(r.value) + "px")
      .html("")
      .append("span")
      .text(r => question.precision ? formatValue(r.value, question.unit, question.precision) 
        : formatValue(r.value, question.unit, question.precision, 0));
  };
  drawUserLine(lastPointShownAtIndex);
  */

  const drawUserBar = function(year) {
    // userSel.attr("d", userLine.defined(ƒ("defined"))(state.get(key, yourData)));
    const h = c.y(state.get(key, yourData)[0].value);
    // userSel.attr("height", c.y(state.get(key, yourData)[0].value));
    userSel.attr("y", h)
      .attr("height", c.height - h);
    console.log (state.get(key, yourData)[0].value);
    const d = state.get(key, yourData).filter(d => d.year === year)[0];
    // const dDefined = state.get(key, yourData).filter(d => d.defined && (d.year !== lastPointShownAtIndex));

    if(!d.defined) {
      return;
    }
      
    /*
    const dot = c.dots.selectAll("circle.result")
      .data(dDefined);
    dot.enter()
      .append("circle")
      .merge(dot)
      .attr("r", 4.5)
      .attr("cx", de => c.x(de.year))
      .attr("cy", de => c.y(de.value))
      .attr("class", "result");
    */      

    const yourResult = c.labels.selectAll(".your-result")
      .data([d]);
    yourResult.enter()
      .append("div")
      .classed("data-label your-result", true)
      .classed("edge-right", isMobile)
      .merge(yourResult)
      // .style("left", () => c.x(year) + "px")
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
    // const year = clamp(lastPointShownAtIndex, maxX, c.x.invert(pos[0]));
    const value = clamp(c.y.domain()[0], c.y.domain()[1], c.y.invert(pos[1]));
    let yearPoint = lastPointShownAtIndex;
    /*
    state.get(key, yourData).forEach(d => {
      if(d.year > lastPointShownAtIndex) {
        if(Math.abs(d.year - year) < .5) {
          d.value = value;
          yearPoint = d.year;
        }
        if(d.year - year < 0.5) {
          d.defined = true;
          yearPoint = d.year;
        }
      }
    });
    */
    state.get(key, yourData).forEach(d => {
      d.value = value;
      d.defined = true;
      yearPoint = d.year;
    });

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
    if (!state.get(key, score)) { 
      const truth = data.filter(d => d.year === lastPointShownAtIndex);
      getScore(key, truth, state, graphMaxY, graphMinY, resultSection, globals.yourResult);
    }
    state.set(key, resultShown, true);
    /*
    resultClip.transition()
      .duration(700)
      .attr("width", c.x(maxX));
    dragArea.attr("class", "");
    setTimeout(() => {
      resultLabel.map(e => e.style("opacity", 1));
      resultSection.node().classList.add("shown");
    }, 700);
    */
    const h = c.y(data[0].value);
    truthSelection.transition()
      .duration(700)
      .attr("y", h)
      .attr("height", c.height - h);

    /*
    c.labels.select("div.data-label")
      .style("opacity", 1)
      .transition()
      .duration(700)
      .style("top", h + "px");
    
    c.labels.select("div.data-label span")
      .transition()
      .duration(700)
      .attrTween("opacity", labelTween);

    function labelTween() {
      return function() {
        var interpolate = d3.interpolate(graphMinY, h);
        return function(t) {
          const text = formatValue(interpolate(t), question.unit, question.precision);
          d3.select(this).text(text);
          console.log(text);
          return 1;
        };
      };
    }
    */

    dragArea.attr("class", "");
    
    setTimeout(() => {
      c.labels.select("div.data-label").style("opacity", 1);
      // resultLabel.map(e => e.style("opacity", 1));
      resultSection.node().classList.add("shown");
    }, 700);

  };
  resultSection.select("button").on("click", showResultChart);
  if (state.get(key, resultShown)) {
    showResultChart();
  }

  /*
  sel.on("mousemove", () => {
    const pos = d3.mouse(c.svg.node());
    const y = Math.min(Math.max(pos[1], c.y(graphMaxY)), c.y(graphMinY));
    c.preview.attr("y2", y);
  });
  */
}