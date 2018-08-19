import * as d3 from "d3";
import { debounce } from  "./helpers/debounce";
import { ydLine } from "./ydLine";
import { ydBar } from "./ydBar";
import { default as myState } from "./state";

let globals = {};

export function youdrawit(_globals, questions) {
  const isMobile = window.innerWidth < 760;
  globals = _globals;
  let state = myState();

  const drawGraphs = function () {
    d3.selectAll(".you-draw-it").each(function (d, i) {
      const sel = d3.select(this);
      const question = questions[i];
      const key = question.key;
      const originalData = question.data;

      const data = originalData.map((ele, index) => {
        return {
          year: index,
          timePointIndex: index,
          timePoint: Object.keys(ele)[0],
          value: ele[Object.keys(ele)[0]]
        };
      });

      const indexedTimepoint = data.map((ele) => ele.timePoint); 
      const indexedData = data.map((ele) => ele.value); 

      state.setQuestion(key);

      if (data.length < 1) {
        console.log("No data available for:", key);
        return;
      }

      if (question.chartType === "barChart") {
        ydBar(isMobile, state, sel, key, question, globals, data, indexedTimepoint, indexedData);
      } else {
        ydLine(isMobile, state, sel, key, question, globals, data, indexedTimepoint, indexedData);
      }
    });
  };

  document.addEventListener("DOMContentLoaded", drawGraphs);

  window.addEventListener("resize", debounce(() => {
    drawGraphs();
  }, 500));
}

export function getLanguage() {
  return globals.default;
}