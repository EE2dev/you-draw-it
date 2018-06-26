'use strict';

(function () {
    var state = {};

    var drawGraphs = function drawGraphs() {
        d3.selectAll('.you-draw-it').each(function () {
            var sel = d3.select(this);
            var key = this.dataset.key;
            var question = window.ydi_data[key];
            var indexedData = question.data;
            var data = Object.keys(indexedData).map(function (key) {
                return {
                    year: Number(key),
                    value: indexedData[key]
                };
            });

            if (!state[key]) {
                state[key] = {};
            }

            if (data.length < 1) {
                console.log("No data available for:", key);
                return;
            }

            var isMobile = window.innerWidth < 760;

            var minYear = data[0].year;
            var maxYear = data[data.length - 1].year;
            var lastDataPoint = question.lastDataPoint;
            var periods = [{ year: lastDataPoint, class: 'blue', title: "" }, { year: maxYear, class: 'blue', title: "Deine\nEinschätzung"

                // {year: Math.min(2018, maxYear), class: 'blue', title: "Deine\nEinschätzung"}
                /*
                {year: 2010, class: 'black', title: "Amtszeit\nJürgen Rüttgers"},
                {year: 2012, class: 'red', title: "I. Amtszeit\nHannelore Kraft"},
                {year: Math.min(2017, maxYear), class: 'red', title: "II. Amtszeit\nHannelore Kraft"}
                */
            }];
            var medianYear = periods.length > 1 ? periods[periods.length - 2].year : periods[0].year;
            var minY = d3.min(data, function (d) {
                return d.value;
            });
            var maxY = d3.max(data, function (d) {
                return d.value;
            });
            var segmentBorders = [minYear].concat(periods.map(function (d) {
                return d.year;
            }));

            var ƒ = function ƒ() {
                var functions = arguments;

                //convert all string arguments into field accessors
                for (var i = 0; i < functions.length; i++) {
                    if (typeof functions[i] === 'string' || typeof functions[i] === 'number') {
                        functions[i] = function (str) {
                            return function (d) {
                                return d[str];
                            };
                        }(functions[i]);
                    }
                }

                //return composition of functions
                return function (d) {
                    var i = 0,
                        l = functions.length;
                    while (i++ < l) {
                        d = functions[i - 1].call(this, d);
                    }return d;
                };
            };

            var drawAxis = function drawAxis(c) {
                c.axis.append('g').attr("class", "x axis").attr("transform", "translate(0," + c.height + ")").call(c.xAxis);
                // Null-Linie
                if (graphMinY < 0) {
                    c.axis.append('g').classed('nullaxis', true).attr("transform", "translate(0," + c.y(0) + ")").call(d3.axisBottom(c.x).tickValues([]).tickSize(0));
                }
                // null auf y-achse
                c.axis.append('text').text("0").attr('transform', "translate(-15, " + (c.y(0) + 5) + ")");
            };

            var formatValue = function formatValue(val, defaultPrecision) {
                var data = question.precision ? Number(val).toFixed(question.precision) : defaultPrecision ? Number(val).toFixed(defaultPrecision) : val;
                return String(data).replace('.', ',') + (question.unit ? ' ' + question.unit : '');
            };

            var makeLabel = function makeLabel(pos, addClass) {
                var x = c.x(pos);
                var y = c.y(indexedData[pos]);
                var text = formatValue(indexedData[pos]);

                var label = c.labels.append('div').classed('data-label', true).classed(addClass, true).style('left', x + 'px').style('top', y + 'px');
                label.append('span').text(text);

                if (pos == minYear && isMobile) {
                    label.classed('edge-left', true);
                }
                if (pos == maxYear && isMobile) {
                    label.classed('edge-right', true);
                }

                return [c.dots.append('circle').attr('r', 4.5).attr('cx', x).attr('cy', y).attr('class', addClass), label];
            };

            var drawChart = function drawChart(lower, upper, addClass) {
                var definedFn = function definedFn(d, i) {
                    return d.year >= lower && d.year <= upper;
                };
                var area = d3.area().x(ƒ('year', c.x)).y0(ƒ('value', c.y)).y1(c.height).defined(definedFn);
                var line = d3.area().x(ƒ('year', c.x)).y(ƒ('value', c.y)).defined(definedFn);

                if (lower == minYear) {
                    makeLabel(minYear, addClass);
                }
                var svgClass = addClass + (upper == medianYear ? " median" : '');

                var group = c.charts.append('g');
                group.append('path').attr('d', area(data)).attr('class', 'area ' + svgClass).attr('fill', 'url(#gradient-' + addClass + ')');
                group.append('path').attr('d', line(data)).attr('class', 'line ' + svgClass);

                return [group].concat(makeLabel(upper, svgClass));
            };

            var clamp = function clamp(a, b, c) {
                return Math.max(a, Math.min(b, c));
            };

            // make visual area empty
            sel.html('');

            var margin = {
                top: 20,
                right: isMobile ? 20 : 50,
                bottom: 20,
                left: isMobile ? 20 : 50
            };
            var width = sel.node().offsetWidth;
            var height = 400;
            var c = {
                width: width - (margin.left + margin.right),
                height: height - (margin.top + margin.bottom)
            };

            // configure scales
            var graphMinY = Math.min(minY, 0);
            var graphMaxY = Math.max(indexedData[medianYear] * 2, maxY + (maxY - graphMinY) * 0.4); // add 40% for segment titles
            c.x = d3.scaleLinear().range([0, c.width]);
            c.x.domain([minYear, maxYear]);
            c.y = d3.scaleLinear().range([c.height, 0]);
            c.y.domain([graphMinY, graphMaxY]);

            c.svg = sel.append('svg').attr("width", width).attr("height", height).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")").attr("width", c.width).attr("height", c.height);

            // gradients
            c.defs = d3.select(c.svg.node().parentNode).append('defs');
            ['black', 'red', 'blue'].forEach(function (color) {
                var gradient = c.defs.append('linearGradient').attr('id', 'gradient-' + color).attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
                gradient.append('stop').attr('offset', '0%').attr('class', 'start');
                gradient.append('stop').attr('offset', '100%').attr('class', 'end');
            });
            c.defs.append('marker').attr('id', 'preview-arrow').attr('orient', 'auto').attr('markerWidth', 2).attr('markerHeight', 4).attr('refX', 0.1).attr('refY', 2).append('path').attr('d', 'M0,0 V4 L2,2 Z');

            // make background grid
            c.grid = c.svg.append('g').attr('class', 'grid');
            c.grid.append('g').attr('class', 'horizontal').call(d3.axisBottom(c.x).tickValues(c.x.ticks(maxYear - minYear)).tickFormat("").tickSize(c.height)).selectAll('line').attr('class', function (d, i) {
                return segmentBorders.indexOf(d) !== -1 ? 'highlight' : '';
            });

            c.grid.append('g').attr('class', 'vertical').call(d3.axisLeft(c.y).tickValues(c.y.ticks(6)).tickFormat("").tickSize(-c.width));

            var applyMargin = function applyMargin(sel) {
                sel.style('left', margin.left + 'px').style('top', margin.top + 'px').style('width', c.width + 'px').style('height', c.height + 'px');
            };

            // invisible rect for dragging to work
            var dragArea = c.svg.append('rect').attr('class', 'draggable').attr('x', c.x(medianYear)).attr('width', c.x(maxYear) - c.x(medianYear)).attr('height', c.height).attr('opacity', 0);

            setTimeout(function () {
                var clientRect = c.svg.node().getBoundingClientRect();
                c.top = clientRect.top + window.scrollY;
                c.bottom = clientRect.bottom + window.scrollY;
            }, 1000);

            c.labels = sel.append('div').attr('class', 'labels').call(applyMargin);
            c.axis = c.svg.append('g');
            c.charts = c.svg.append('g');

            // add a preview line
            c.preview = c.svg.append('line').attr('class', 'preview-line').attr('marker-end', 'url(#preview-arrow)').attr('x1', c.x(medianYear)).attr('y1', c.y(indexedData[medianYear])).attr('x2', c.x(medianYear) + 50).attr('y2', c.y(indexedData[medianYear]));

            var userSel = c.svg.append('path').attr('class', 'your-line');
            c.dots = c.svg.append('g').attr('class', 'dots');

            // configure axes
            c.xAxis = d3.axisBottom().scale(c.x);
            c.xAxis.tickFormat(function (d) {
                return "'" + String(d).substr(2);
            }).ticks(maxYear - minYear);
            drawAxis(c);

            c.titles = sel.append('div').attr('class', 'titles').call(applyMargin);

            c.controls = sel.append('div').attr('class', 'controls').call(applyMargin).style('padding-left', c.x(medianYear) + 'px');
            c.controls.append('div').attr('class', 'box').text('Zeichnen Sie die Linie zu Ende');

            // make chart
            var charts = periods.map(function (entry, key) {
                var lower = key > 0 ? periods[key - 1].year : minYear;
                var upper = entry.year;

                // segment title
                c.titles.append('span').style('left', c.x(lower) + 'px').style('width', c.x(upper) - c.x(lower) + 'px').text(entry.title);

                return drawChart(lower, upper, entry.class);
                // ma1
                // return drawChart(lower, upper, "black");
            });
            var resultChart = charts[charts.length - 1][0];
            var resultClip = c.charts.append('clipPath').attr('id', 'result-clip-' + key).append('rect').attr('width', c.x(medianYear)).attr('height', c.height);
            var resultLabel = charts[charts.length - 1].slice(1, 3);
            resultChart.attr('clip-path', 'url(#result-clip-' + key + ')').append('rect').attr('width', c.width).attr('height', c.height).attr('fill', 'none');
            resultLabel.map(function (e) {
                return e.style('opacity', 0);
            });

            /**
             * Interactive user selection part
             */
            var userLine = d3.line().x(ƒ('year', c.x)).y(ƒ('value', c.y));

            if (!state[key].yourData) {
                state[key].yourData = data.map(function (d) {
                    return { year: d.year, value: indexedData[medianYear], defined: 0 };
                }).filter(function (d) {
                    if (d.year == medianYear) d.defined = true;
                    return d.year >= medianYear;
                });
            }

            var resultSection = d3.select('.result.' + key);

            var drawUserLine = function drawUserLine() {
                userSel.attr('d', userLine.defined(ƒ('defined'))(state[key].yourData));

                var d = state[key].yourData[state[key].yourData.length - 1];
                if (!d.defined) {
                    return;
                }

                var yourResult = c.labels.selectAll('.your-result').data([d]);
                yourResult.enter().append('div').classed('data-label your-result', true).classed('edge-right', isMobile).merge(yourResult).style('left', function () {
                    return c.x(maxYear) + 'px';
                }).style('top', function (r) {
                    return c.y(r.value) + 'px';
                }).html('').append('span').text(function (r) {
                    return formatValue(r.value, 2);
                });
            };
            drawUserLine();

            var interactionHandler = function interactionHandler() {
                if (state[key].resultShown) {
                    return;
                }

                sel.node().classList.add('drawn');

                var pos = d3.mouse(c.svg.node());
                var year = clamp(medianYear, maxYear, c.x.invert(pos[0]));
                var value = clamp(c.y.domain()[0], c.y.domain()[1], c.y.invert(pos[1]));

                state[key].yourData.forEach(function (d) {
                    if (d.year > medianYear) {
                        if (Math.abs(d.year - year) < .5) {
                            d.value = value;
                        }
                        if (d.year - year < 0.5) {
                            d.defined = true;
                        }
                    }
                });

                drawUserLine();

                if (!state[key].completed && d3.mean(state[key].yourData, ƒ('defined')) == 1) {
                    state[key].completed = true;
                    resultSection.node().classList.add('finished');
                    resultSection.select('button').node().removeAttribute('disabled');
                }
            };

            c.svg.call(d3.drag().on('drag', interactionHandler));
            c.svg.on('click', interactionHandler);

            var showResultChart = function showResultChart() {
                if (!state[key].completed) {
                    return;
                }

                state[key].resultShown = true;
                resultClip.transition().duration(700).attr('width', c.x(maxYear));
                dragArea.attr('class', '');
                setTimeout(function () {
                    resultLabel.map(function (e) {
                        return e.style('opacity', 1);
                    });
                    resultSection.node().classList.add('shown');
                }, 700);
            };
            resultSection.select('button').on('click', showResultChart);
            if (state[key].resultShown) {
                showResultChart();
            }

            sel.on('mousemove', function () {
                var pos = d3.mouse(c.svg.node());
                var y = Math.min(Math.max(pos[1], c.y(graphMaxY)), c.y(graphMinY));
                c.preview.attr('y2', y);
            });
        });
    };

    document.addEventListener("DOMContentLoaded", drawGraphs);

    var debounce = function debounce(func, wait, immediate) {
        var timeout = void 0;
        return function () {
            var context = this,
                args = arguments;
            var later = function later() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };

    window.addEventListener('resize', debounce(function () {
        drawGraphs();
    }, 500));
})();