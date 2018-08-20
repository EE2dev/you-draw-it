import { youdrawit } from "./youdrawit";
import * as d3 from "d3";

export default function () {
  "use strict";

  let options = {};
  options.containerDiv = d3.select("body");
  options.questions = [];
  /* options.questions is an array of question objects q with:
    q.data
    q.heading
    q.subheading
    q.resultHtml
    q.unit
    q.precision
    q.lastPointShownAt
    q.yAxisMin
    q.yAxisMax

    // the following are internal properties
    q.chartType
    q.key
  */
  
  options.globals = {};
  /* option.globals contain:
    g.default
    g.title
    g.header
    g.subheader
    g.drawAreaTitle
    g.drawLine
    g.drawBar
    g.resultButtonText
    g.resultButtonTooltip
    g.scoreTitle
  */

  // API for external access
  function chartAPI(selection) {
    selection.each(function () {
      options.containerDiv = d3.select(this);
      if (!options.questions) { console.log("no questions specified!"); }
      if (Object.keys(options.globals).length === 0) { setGlobalDefault("English"); }
      completeQuestions();
      completeDOM();
      youdrawit(options.globals, options.questions);
    });
    return chartAPI;
  }

  chartAPI.questions = function(_) {
    if (!arguments.length) return options.questions;
    options.questions = _;
    return chartAPI;
  };

  chartAPI.globals = function(_) {
    if (!arguments.length) return options.globals;
    for (var key in _) {
      if (_.hasOwnProperty(key)) {
        options.globals[key] = _[key];
        if (key === "default") { setGlobalDefault(_[key]);}
      }
    }
    return chartAPI;
  };

  function setGlobalDefault(lang) {
    let g = options.globals;
    if (lang === "de") { // German
      g.title = "Quiz";
      g.resultButtonText = "Zeig mir die Lösung!"; 
      g.resultButtonTooltip = "Zeichnen Sie Ihre Einschätzung. Der Klick verrät, ob sie stimmt.";
      g.scoreTitle = "Ihr Ergebnis:";
      g.drawAreaTitle = "Ihre\nEinschätzung";
      g.drawLine = "Zeichnen Sie von hier\ndie Linie zu Ende";
      g.drawBar = "Ziehen Sie den Balken\nin die entsprechende Höhe";
    }  else { // lang === "English"
      g.default = "en";
      g.title = "Trivia";
      g.resultButtonText = "Show me the result!"; 
      g.resultButtonTooltip = "Draw your guess. Upon clicking here, you see if you're right.";
      g.scoreTitle = "Your result:";
      g.drawAreaTitle = "Your\nguess";
      g.drawLine = "drag the line\nfrom here to the end";
      g.drawBar = "drag the bar\nto the estimated height";
    }
  }

  function completeQuestions() {
    options.questions.forEach(function(q, index) {
      if (!q.data) { console.log("no data specified!"); }
      if (!checkResult(q.resultHtml)) { console.log("invalid result!");}

      q.chartType = !isNumber(q.data) ? "timeSeries" : "barChart";
      q.heading = (typeof q.heading === "undefined") ? "" : q.heading; 
      q.subheading = (typeof q.subheading === "undefined") ? "" : q.subHeading; 
      q.resultHtml = (typeof q.resultHtml === "undefined") ? "<br>" : q.resultHtml; 
      q.unit = (typeof q.unit === "undefined") ? "" : q.unit; 
      q.precision = (typeof q.precision === "undefined") ? 1 : q.precision; 
      q.key = "q" + (index + 1); 

      if (q.chartType === "barChart") {
        q.data = [{ value: q.data}];
      }

      if (!q.lastPointShownAt) {
        if (q.chartType === "timeSeries") {
          const nextToLast = q.data[q.data.length - 2]; 
          q.lastPointShownAt = Object.keys(nextToLast)[0]; 
        } else if (q.chartType === "barChart") {
          const onlyElement = q.data[0]; 
          q.lastPointShownAt = Object.keys(onlyElement)[0]; 
        }
      }
      console.log("display question " + index + " as " + q.chartType);
    });
  }

  function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  function completeDOM() {
    d3.select("header")
      .append("title")
      .text(options.globals.title);

    const art = options.containerDiv
      .append("article")
      .attr("id", "content")
      .attr("class", "container");

    const intro = art.append("div")
      .attr("class", "intro");
    intro.append("h1")
      .text(options.globals.header);
    intro.append("p")
      .text(options.globals.subheader);

    const questions = art.append("div")
      .attr("class", "questions");

    options.questions.forEach(function(q) {
      const question = questions.append("div")
        .attr("class", "question");
      question.append("h2")
        .text(q.heading);
      question.append("h3")
        .text(q.subheading);
      question.append("div")
        .attr("class", "you-draw-it " + q.key)
        .attr("data-key", q.key);

      const res = question.append("div")
        .attr("class", "result " + q.key);
      const ac = res.append("div")
        .attr("class", "actionContainer");
      ac.append("button")
        .attr("class", "showAction")
        .attr("disabled", "disabled")
        .text(options.globals.resultButtonText);
      ac.append("div")
        .attr("class", "tooltipcontainer")
        .append("span")
        .attr("class", "tooltiptext")
        .text(options.globals.resultButtonTooltip);

      res.append("div")
        .attr("class", "text")
        .append("p")
        .html(q.resultHtml);
    });

    /*
    const fs = art.append("hr")
      .append("div")
      .attr("class", "actionContainer final-score");

    fs.append("button")
      .attr("class", "showAction")
      .attr("disabled", "disabled")
      .text(options.globals.resultButtonText);
    fs.append("div")
      .attr("class", "tooltipcontainer")
      .append("span")
      .attr("class", "tooltiptext")
      .text(options.globals.resultButtonTooltip);
    fs.append("div")
      .attr("class", "text")
      .append("text").text("hallo erstmal");

    art.append("hr");
    art.append("hr");
    */
  }

  function checkResult(exp){
    if (!exp) { return true; }
    const expUC = exp.toUpperCase();
    if (expUC.indexOf("<") !== -1 && expUC.indexOf("SCRIPT") !== -1 && expUC.indexOf(">") !== -1) {
      return false;
    } else {
      return true; 
    }
  }

  return chartAPI;
}