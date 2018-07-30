import * as d3 from "d3";
import { ydLine } from "./ydLine";

export default function() {
  const isMobile = window.innerWidth < 760;
  const state = {};

  const drawGraphs = function () {
    d3.selectAll(".you-draw-it").each(function () {
      const sel = d3.select(this);
      const key = this.dataset.key;
      const question = window.ydi_data[key];
      const globals = window.ydi_globals;
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

      if(!state[key]) {
        state[key] = {};
      }

      if (data.length < 1) {
        console.log("No data available for:", key);
        return;
      }

      ydLine(isMobile, state, sel, key, question, globals, data, indexedTimepoint, indexedData);
    });
  };

  document.addEventListener("DOMContentLoaded", drawGraphs);

  const debounce = function (func, wait, immediate) {
    let timeout;
    return function () {
      const context = this, args = arguments;
      const later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };

  window.addEventListener("resize", debounce(() => {
    drawGraphs();
  }, 500));
}