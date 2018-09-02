import * as d3 from "d3";
import { yourData, score, predictionDiff } from "../helpers/constants";

function compareGuess(truth, guess, graphMaxY, graphMinY) {
  let maxDiff = 0;
  let predDiff = 0;
  truth.forEach(function(ele, i) {
    maxDiff += Math.max(graphMaxY - ele.value, ele.value - graphMinY);
    predDiff += Math.abs(ele.value - guess[i].value);
  });
  return {maxDiff: maxDiff, predDiff: predDiff};  
}

export function getScore(key, truth, state, graphMaxY, graphMinY, resultSection, scoreTitle, scoreButtonText, scoreButtonTooltip, scoreHtml) {
  let myScore = 0;
  const guess = state.getResult(key, yourData);
  const r = compareGuess(truth, guess, graphMaxY, graphMinY);
  const maxDiff = r.maxDiff;
  const predDiff = r.predDiff;
  const scoreFunction = d3.scaleLinear().domain([0, maxDiff]).range([100,0]);
  
  myScore = scoreFunction(predDiff).toFixed(1);
  state.set(key, predictionDiff, predDiff);
  state.set(key, score, +myScore);

  let completed = true;
  state.getAllQuestions().forEach((ele) => {completed = completed && (typeof state.get(ele, score) !== "undefined"); });
  if (completed) {
    let scores = 0;
    state.getAllQuestions().forEach((ele) => {scores = scores + state.get(ele, score);});
    const finalScoreFunction = d3.scaleLinear().domain([0, 100 * state.getAllQuestions().length]).range([0,100]);
    let finalScore = finalScoreFunction(scores).toFixed();
    console.log("The final score is: " + finalScore);

    drawScore(+finalScore, resultSection, key, scoreTitle, scoreButtonText, scoreButtonTooltip, scoreHtml);
  }
        
  console.log(state.get(key, yourData));
  // console.log(truth);
  console.log("The pred is: " + predDiff);
  console.log("The maxDiff is: " + maxDiff);
  console.log("The score is: " + myScore);
  console.log(state.getState());
}

function drawScore(finalScore, resultSection, key, scoreTitle, scoreButtonText, scoreButtonTooltip, scoreHtml) {
  // add final result button
  const ac = resultSection
    .append("div")
    .attr("class", "actionContainer finalScore");
  const button = ac.append("button")
    .attr("class", "showAction globals-scoreButtonText update-font")
    .text(scoreButtonText);

  const tt = ac.append("div")
    .attr("class", "tooltipcontainer")
    .append("span")
    .attr("class", "showAction globals-scoreButtonTooltip update-font")
    .text(scoreButtonTooltip);

    // add final result graph
  let fs = {};
  fs.div = resultSection.select("div.text")
    .append("div")
    .attr("class", "finalScore text")
    .style("visibility", "hidden");
  
  fs.div.append("div")
    .attr("class", "before-finalScore globals-scoreTitle update-font")
    .append("strong")
    .text(scoreTitle);
  
  fs.svg = fs.div.append("svg")
    .attr("width", 500)
    .attr("height", 75);

  const ch = resultSection.select("div.text").append("div")
    .attr("class", "customHtml")
    .style("visibility", "hidden")
    .style("text-align", "center");

  if (typeof scoreHtml !== "undefined") {
    const sHtml = scoreHtml.filter(d => d.lower <= finalScore && d.upper > finalScore);
    ch.selectAll("p")
      .data(sHtml)
      .enter()
      .append("p")
      .attr("class", "globals-scoreHtml update-font")
      .html(d => d.html);
  }

  // adding some space at the bottom to reserved the final display space and 
  // to have space below the botton (for the tooltip) 
  // (30 = margin-top from fs.div) , 70 = margin-bottom from div.result.finished.shown)
  const h = fs.div.node().offsetHeight  + ch.node().offsetHeight + 30 + 70 - ac.node().clientHeight;
  fs.div.style("display", "none").style("visibility", "visible"); // reset to avoid taking up space 
  ch.style("display", "none").style("visibility", "visible");

  const dummy = resultSection
    .append("div")
    .attr("class", "dummy")
    .style("height", h + "px");

  button.on("click", function() {
    d3.select(this).style("display", "none");
    tt.style("display", "none");
    dummy.remove();
    showFinalScore(finalScore, resultSection, key);
  }); 
}

function showFinalScore(finalScore, resultSection, key) {

  function showText() {
    d3.select(".result." + key).select("text.scoreText")
      .style("opacity", 1);
    resultSection.select("div.customHtml")
      .style("visibility", "visible");
  }

  resultSection.select("div.finalScore.text")
    .style("display", "block");
  resultSection.select("div.customHtml")
    .style("display", "block")
    .style("visibility", "hidden");

  let fs = {};
    
  fs.g = resultSection.select(".finalScore.text > svg")
    .append("g")
    .attr("transform", "translate(5, 10)");

  const xScale = d3.scaleLinear().domain([0, 100]).range([0, 400]);
  const xAxis = d3.axisBottom(xScale).ticks(4);
  fs.g.append("g")
    .attr("transform", "translate(0, 45)")
    .attr("class", "x axis")
    .call(xAxis);

  fs.rect = fs.g.append("rect")
    .attr("class", "final-score-result")
    .attr("x", 0)
    .attr("y", 0)
    .attr("height", 40)
    .attr("width", 0);
        
  fs.txt = fs.g.append("text")
    .attr("class", "scoreText")
    .attr("x", xScale(finalScore) + 5)
    .attr("dy", 27)
    .text("(" + finalScore + "/100)");

  fs.rect.transition()
    .duration(3000)
    .attr("width", xScale(finalScore))
    .on("end", showText);
}
