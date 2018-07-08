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
            var lastPointShownAt = question.lastPointShownAt;
            var periods = [{ year: lastPointShownAt, class: 'blue', title: "" }, { year: maxYear, class: 'blue', title: "Ihre\nEinschätzung"
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

                c.axis.append('g').attr("class", "y axis").call(c.yAxis);
                /*    
                // Null-Linie
                if(graphMinY < 0) {
                    c.axis.append('g')
                        .classed('nullaxis', true)
                        .attr("transform", "translate(0," + c.y(0) + ")")
                        .call(
                            d3.axisBottom(c.x)
                                .tickValues([])
                                .tickSize(0)
                        );
                }
                // null auf y-achse
                c.axis.append('text')
                    .text("0")
                    .attr('transform', "translate(-15, " + (c.y(0)+5) + ")");
                    */
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
                var area = d3.area().curve(d3.curveMonotoneX).x(ƒ('year', c.x)).y0(ƒ('value', c.y)).y1(c.height).defined(definedFn);
                var line = d3.area().curve(d3.curveMonotoneX).x(ƒ('year', c.x)).y(ƒ('value', c.y)).defined(definedFn);

                if (lower == minYear) {
                    makeLabel(minYear, addClass);
                }
                var svgClass = addClass + (upper == medianYear ? " median" : '');

                var group = c.charts.append('g');
                group.append('path').attr('d', area(data)).attr('class', 'area ' + svgClass).attr('fill', 'url(#gradient-' + addClass + ')');
                group.append('path').attr('d', line(data)).attr('class', 'line ' + svgClass);
                ;

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
                left: isMobile ? 20 : 100
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

            c.defs.append('marker').attr('id', 'preview-arrowp').attr('orient', 'auto').attr("viewBox", "0 0 10 10").attr('markerWidth', 6).attr('markerHeight', 6).attr('refX', 1).attr('refY', 5).append('path').attr('d', 'M 0 0 L 10 5 L 0 10 z');

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

            var userSel = c.svg.append('path').attr('class', 'your-line');
            c.dots = c.svg.append('g').attr('class', 'dots');

            // configure axes
            c.xAxis = d3.axisBottom().scale(c.x);
            // c.xAxis.tickFormat(d => "'" + String(d).substr(2)).ticks(maxYear - minYear);
            c.xAxis.tickFormat(function (d) {
                return d;
            }).ticks(maxYear - minYear);
            c.yAxis = d3.axisLeft().scale(c.y).tickValues(c.y.ticks(6));
            c.yAxis.tickFormat(function (d) {
                return formatValue(d);
            });
            drawAxis(c);

            c.titles = sel.append('div').attr('class', 'titles').call(applyMargin);

            // add a preview pointer 
            var xs = c.x(medianYear);
            var ys = c.y(indexedData[medianYear]);

            var xArrowStart = ys <= 350 ? xs + 45 : xs + 70;
            var yArrowStart = ys <= 350 ? ys + 30 : ys - 30;
            var yTextStart = ys <= 350 ? c.y(indexedData[lastPointShownAt]) + 30 : c.y(indexedData[lastPointShownAt]) - 65;
            var xTextStart = ys <= 350 ? c.x(lastPointShownAt) + 30 : c.x(lastPointShownAt) + 65;

            c.preview = c.svg.append('path').attr('class', 'controls preview-pointer').attr('marker-end', 'url(#preview-arrowp)').attr("d", "M" + xArrowStart + "," + yArrowStart + " Q" + xArrowStart + "," + ys + " " + (xs + 15) + "," + ys);

            // add preview wave
            var arc = d3.arc().startAngle(0).endAngle(Math.PI);

            var nrWaves = Array(10).fill({});
            c.wave = c.svg.append("g").attr("class", "wave controls");
            c.wave.append('clipPath').attr('id', 'wave-clip-' + key).append('rect').attr('width', c.width).attr('height', c.height);

            c.wave = c.wave.append("g").attr('clip-path', 'url(#wave-clip-' + key + ')').append("g").attr("transform", "translate(" + xs + ", " + ys + ")").selectAll("path").data(nrWaves).enter().append('path').attr("class", "wave").attr("d", arc);

            moveWave();
            function moveWave() {
                console.log("moveWave");
                c.wave.style("opacity", .6).transition().ease(d3.easeLinear).delay(function (d, i) {
                    return 1000 + i * 300;
                }).duration(4000).attrTween("d", arcTween()).style("opacity", 0).on("end", restartWave);
            }

            function restartWave(d, i) {
                if (i === nrWaves.length - 1) {
                    // restart after last wave is finished
                    // Intialize waves
                    var nrWaves2 = Array(nrWaves.length).fill({});
                    c.wave = c.wave.data(nrWaves2);
                    c.wave.attr("d", arc);
                    moveWave();
                }
            }

            function arcTween() {
                return function (d) {
                    if (sel.classed("drawn")) {
                        c.wave.interrupt();
                        console.log("waves interrupted");
                        return;
                    }
                    var interpolate = d3.interpolate(0, 100);
                    return function (t) {
                        d.innerRadius = interpolate(t);
                        d.outerRadius = interpolate(t) + 3;
                        return arc(d);
                    };
                };
            }

            // add preview notice
            c.controls = sel.append('div').attr('class', 'controls').call(applyMargin).style('padding-left', c.x(minYear) + 'px');

            c.controls.append('span').style('left', xTextStart + 'px').style('top', yTextStart + 'px').text('Zeichnen Sie von hier\ndie Linie zu Ende');

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
            // const userLine = d3.line().x(ƒ('year', c.x)).y(ƒ('value', c.y));
            var userLine = d3.line().x(ƒ('year', c.x)).y(ƒ('value', c.y)).curve(d3.curveMonotoneX);

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
                var year = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : medianYear;

                userSel.attr('d', userLine.defined(ƒ('defined'))(state[key].yourData));

                // const d = state[key].yourData[state[key].yourData.length-1];
                var d = state[key].yourData.filter(function (d) {
                    return d.year === year;
                })[0];

                if (!d.defined) {
                    return;
                }

                var yourResult = c.labels.selectAll('.your-result').data([d]);
                yourResult.enter().append('div').classed('data-label your-result', true).classed('edge-right', isMobile).merge(yourResult).style('left', function () {
                    return c.x(year) + 'px';
                })
                // .style('left', () => c.x(maxYear) + 'px')
                .style('top', function (r) {
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
                var yearPoint = void 0;

                state[key].yourData.forEach(function (d) {
                    if (d.year > medianYear) {
                        if (Math.abs(d.year - year) < .5) {
                            d.value = value;
                            yearPoint = d.year;
                        }
                        if (d.year - year < 0.5) {
                            d.defined = true;
                        }
                    }
                });

                drawUserLine(yearPoint);

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
                c.labels.selectAll('.your-result').node().classList.add("hideLabels");
                getScore();
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

            function getScore() {
                var score = 0;
                var truth = data.filter(function (d) {
                    return d.year > medianYear;
                });
                var pred = state[key].yourData;
                var maxDiff = 0;
                var predDiff = 0;
                truth.forEach(function (ele, i) {
                    maxDiff += Math.max(graphMaxY - ele.value, ele.value - graphMinY);
                    predDiff += Math.abs(ele.value - state[key].yourData[i + 1].value);
                });
                var scoreFunction = d3.scaleLinear().domain([0, maxDiff]).range([100, 0]);
                // score = (Math.floor((predDiff / maxDiff) * 100));
                score = scoreFunction(predDiff).toFixed(1);

                console.log(state[key].yourData);
                console.log(data);
                console.log("The pred is: " + predDiff);
                console.log("The maxDiff is: " + maxDiff);
                console.log("The score is: " + score);
            }
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