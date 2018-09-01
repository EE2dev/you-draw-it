import { youdrawit } from "./youdrawit";
import * as d3 from "d3";

export default function () {
  "use strict";

  let options = {};
  options.containerDiv = d3.select("body");
  options.globals = {};
  /* option.globals contain:
    g.default
    g.header
    g.subHeader
    g.drawAreaTitle
    g.drawLine
    g.drawBar
    g.resultButtonText
    g.resultButtonTooltip
    g.scoreTitle
    g.scoreButtonText
    g.scoreButtonTooltip
    g.scoreHtml
  */
  options.questions = [];
  /* options.questions is an array of question objects q with:
    q.data
    q.heading
    q.subHeading
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
    if (lang === "de") { // de (German)
      g.resultButtonText = (typeof g.resultButtonText === "undefined") ? "Zeig mir die Lösung!" : g.resultButtonText;
      g.resultButtonTooltip = (typeof g.resultButtonTooltip === "undefined") ? "Zeichnen Sie Ihre Einschätzung. Der Klick verrät, ob sie stimmt." : g.resultButtonTooltip;
      g.scoreTitle = (typeof g.scoreTitle === "undefined") ? "Ihr Ergebnis:" : g.scoreTitle;
      g.scoreButtonText = (typeof g.scoreButtonText === "undefined") ? "Zeig mir, wie gut ich war!" : g.scoreButtonText;
      g.scoreButtonTooltip = (typeof g.scoreButtonTooltip === "undefined") ? "Klicken Sie hier, um Ihr Gesamtergebnis zu sehen" : g.scoreButtonTooltip;
      g.drawAreaTitle = (typeof g.drawAreaTitle === "undefined") ? "Ihre\nEinschätzung" : g.drawAreaTitle;
      g.drawLine = (typeof g.drawLine === "undefined") ? "Zeichnen Sie von hier\nden Verlauf zu Ende" : g.drawLine;
      g.drawBar = (typeof g.drawBar === "undefined") ? "Ziehen Sie den Balken\nauf die entsprechende Höhe" : g.drawBar;
    }  else { // lang === "en" (English)
      g.default = "en";
      g.resultButtonText = (typeof g.resultButtonText === "undefined") ? "Show me the result!" : g.resultButtonText; 
      g.resultButtonTooltip = (typeof g.resultButtonTooltip === "undefined") ? "Draw your guess. Upon clicking here, you see if you're right." : g.resultButtonTooltip;
      g.scoreTitle = (typeof g.scoreTitle === "undefined") ? "Your result:" : g.scoreTitle;
      g.scoreButtonText = (typeof g.scoreButtonText === "undefined") ? "Show me how good I am!" : g.scoreButtonText;
      g.scoreButtonTooltip = (typeof g.scoreButtonTooltip === "undefined") ? "Click here to see your result" : g.scoreButtonTooltip;
      g.drawAreaTitle = (typeof g.drawAreaTitle === "undefined") ? "Your\nguess" : g.drawAreaTitle;
      g.drawLine = (typeof g.drawLine === "undefined") ? "draw the graph\nfrom here to the end" : g.drawLine;
      g.drawBar = (typeof g.drawBar === "undefined") ? "drag the bar\nto the estimated height" : g.drawBar;
    }
  }

  function completeQuestions() {
    if (typeof options.globals.scoreHtml !== "undefined"){
      if (typeof options.globals.scoreHtml === "string" || options.globals.scoreHtml instanceof String) {
        if (!checkResult(options.globals.scoreHtml)) { 
          console.log("invalid scoreHtml!");
          options.globals.scoreHtml = void 0; // set to undefined
        } else {
          options.globals.scoreHtml = [{lower: 0, upper: 101, html: options.globals.scoreHtml}];
        }
      }
      else { // options.globals.scoreHtml is an array
        if (typeof options.globals.scoreHtml.length !== "undefined") {
          options.globals.scoreHtml.forEach(function (range) {
            let exp = range.html;
            if (!checkResult(exp)) { 
              console.log("invalid scoreHtml! -> set to empty string");
              range.html = ""; 
            } 
          }); 
        }
      }
    }

    options.questions.forEach(function(q, index) {
      if (!q.data) { console.log("no data specified!"); }
      if (!checkResult(q.resultHtml)) { console.log("invalid result!");}

      q.chartType = !isNumber(q.data) ? "timeSeries" : "barChart";
      q.heading = (typeof q.heading === "undefined") ? "" : q.heading; 
      q.subHeading = (typeof q.subHeading === "undefined") ? "" : q.subHeading; 
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
    const art = options.containerDiv
      .append("article")
      .attr("id", "content")
      .attr("class", "container");

    const intro = art.append("div")
      .attr("class", "intro");
    intro.append("h1")
      .html(options.globals.header);
    intro.append("p")
      .html(options.globals.subHeader);

    const questions = art.append("div")
      .attr("class", "questions");

    options.questions.forEach(function(q) {
      const question = questions.append("div")
        .attr("class", "question");
      question.append("h2")
        .html(q.heading);
      question.append("h3")
        .html(q.subHeading);
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
  }

  function checkResult(exp){ // checks if html might contain javascript
    if (!exp) { return true; }
    const expUC = exp.toUpperCase();
    if (expUC.indexOf("<") !== -1 && expUC.indexOf("SCRIPT") !== -1 && expUC.indexOf(">") !== -1) {
      console.log("--- invalid html!");
      console.log("--- expression was: ");
      console.log(exp);
      return false;
    } else {
      return true; 
    }
  }

  return chartAPI;
}