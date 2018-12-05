
import * as d3 from "d3";
import { yourData, resultShown, completed, score } from "./helpers/constants";
import { getFinalScore } from "./results/score";
/*
import { ƒ } from "./helpers/function";
import { formatValue } from "./helpers/formatValue";
import { clamp } from "./helpers/clamp";
import { getRandom } from "./helpers/getRandom";
import { yourData, resultShown, completed, score, prediction, truth } from "./helpers/constants";
import { getScore } from "./results/score";
import { addReferenceValues } from "./helpers/referenceValues";
*/

export function ydCheckbox(isMobile, state, sel, key, question, globals, data) {

  sel.html("");
  let selDiv = sel.append("div");
  let selLabel;
  let prediction = [];
  let cb;

  data.forEach(function(ele, i) {
    selLabel = selDiv
      .append("label")
      .attr("class", "question-multipleChoice update-font answer-container l-" + i)
      .html(ele.timePoint);

    // checkbox for answers
    selLabel
      .append("span")
      .attr("class", "answer-checkmark-truth t-" + i)
      .append("div")
      .attr("class", "input");
      
    // checkbox for guesses
    cb = selLabel.append("input")
      .attr("type", "checkbox")
      .attr("name", "cb")
      .attr("value", "v" + i)
      .on("click", handleClick);
      
    selLabel.append("span")
      .attr("class", "answer-checkmark");
    
    // preset the checkboxes with the guesses already made for resize event
    prediction[i] = state.get(key, yourData) ? state.get(key, yourData)[i] : false;
    cb.node().checked = prediction[i];
  });

  const resultSection = d3.select(".result." + key);
  resultSection.select("button").on("click", showResultChart);


  if (state.get(key, resultShown)) {
    showResultChart();
  }

  function handleClick() {
    if (state.get(key, resultShown)) {
      return;
    }
    const index = d3.select(this).attr("value").substring(1);
    console.log("Clicked, new value [" + index + "] = " + d3.select(this).node().checked);
    prediction[index] = d3.select(this).node().checked;
    state.set(key, yourData, prediction);
    resultSection.node().classList.add("finished");
    resultSection.select("button").node().removeAttribute("disabled");
  }

  function showResultChart() {
    state.set(key, completed, true);
    // disable hovers
    var css = ".answer-container:hover input ~ .answer-checkmark { background-color: #eee;}";
    css = css + " .answer-container input:checked ~ .answer-checkmark { background-color: orange;}";
    var style = document.createElement("style");
    
    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
    document.getElementsByTagName("head")[0].appendChild(style);

    // disable checkboxes
    sel.selectAll("div input").each(function() {
      d3.select(this).node().disabled=true;
    });
    // display result (with transition)
    let correctAnswers = 0;
    data.forEach((ele,i) => { 
      if (ele.value === prediction[i]) { correctAnswers = correctAnswers + 1;}
      sel.select("div span.answer-checkmark-truth.t-" + i)
        .classed("checked", ele.value)
        .style("background-color", "#fff")
        .transition()
        .ease(ele.value ? d3.easeExpIn : d3.easeLinear)
        .duration(100)
        .delay(i * 100)
        .style("background-color", (ele.value) ? "#00345e" : "#eee");
      
      sel.select("div span.answer-checkmark-truth.t-" + i +" div.input")
        .classed("checked", ele.value);

      sel.select("div .answer-container.l-" + i)
        .transition()
        .duration(100)
        .delay(i * 100)
        .style("color", (ele.value) ? "#00345e" : "#eee");
    });

    // call getScore 
    const durationTrans = 100 * (data.length + 1);
    setTimeout(() => {
      resultSection.node().classList.add("shown");
      if (!state.get(key, score) && globals.showScore) { 
        const myScore = Math.round(correctAnswers / prediction.length * 100);
        console.log("score: " + myScore);
        state.set(key, score, myScore);
        getFinalScore(key, state, resultSection, globals.scoreTitle, 
          globals.scoreButtonText, globals.scoreButtonTooltip, globals.scoreHtml);
      }
      state.set(key, resultShown, true);
    }, durationTrans);
  }
}