(function() {
    const state = {};

    const drawGraphs = function () {
        d3.selectAll('.you-draw-it').each(function () {
            const sel = d3.select(this);
            const key = this.dataset.key;
            const question = window.ydi_data[key];
            const globals = window.ydi_globals;
            const originalData = question.data;
            const indexedTimepoint = Object.keys(originalData);
            const data = Object.keys(originalData).map((key, index) => {
                return {
                    // year: Number(key),
                    year: index,
                    timePointIndex: index,
                    timePoint: key,
                    value: originalData[key]
                }
            });
            const indexedData = Object.keys(originalData).map(key => originalData[key]);

            if(!state[key]) {
                state[key] = {};
            }

            if (data.length < 1) {
                console.log("No data available for:", key);
                return;
            }

            const isMobile = window.innerWidth < 760;

            const minYear = data[0].year;
            const maxYear = data[data.length - 1].year;
            const lastPointShownAtIndex = indexedTimepoint.indexOf(question.lastPointShownAt.toString());
            const periods = [
                {year: lastPointShownAtIndex, class: 'blue', title: ""},
                {year: maxYear, class: 'blue', title: globals.predictionTitle}
               // {year: maxYear, class: 'blue', title: "Ihre\nEinschätzung"}
               // {year: Math.min(2018, maxYear), class: 'blue', title: "Deine\nEinschätzung"}
                /*
                {year: 2010, class: 'black', title: "Amtszeit\nJürgen Rüttgers"},
                {year: 2012, class: 'red', title: "I. Amtszeit\nHannelore Kraft"},
                {year: Math.min(2017, maxYear), class: 'red', title: "II. Amtszeit\nHannelore Kraft"}
                */
            ];
            // const medianYear = (periods.length > 1) ? periods[periods.length - 2].year : periods[0].year;
            // const medianYear = lastPointShownAtIndex;
            const minY = d3.min(data, d => d.value);
            const maxY = d3.max(data, d => d.value);
            const segmentBorders = [minYear].concat(periods.map(d => d.year));

            const ƒ = function () {
                const functions = arguments;

                //convert all string arguments into field accessors
                for (let i = 0; i < functions.length; i++) {
                    if (typeof(functions[i]) === 'string' || typeof(functions[i]) === 'number') {
                        functions[i] = (str => function (d) {
                            return d[str];
                        })(functions[i]);
                    }
                }

                //return composition of functions
                return function (d) {
                    let i = 0, l = functions.length;
                    while (i++ < l) d = functions[i - 1].call(this, d);
                    return d
                }
            };

            const drawAxis = function (c) {
                c.axis.append('g')
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + c.height + ")")
                    .call(c.xAxis);

                c.axis.append('g')
                    .attr("class", "y axis")
                    .call(c.yAxis);
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

            const formatValue = function(val, defaultPrecision) {
                const data = question.precision ?
                    Number(val).toFixed(question.precision) :
                        (defaultPrecision !== 0) ? 
                            Number(val).toFixed(defaultPrecision) : 
                            (defaultPrecision === 0) ? 
                                Number(val).toFixed() : 
                                val;
                return String(data).replace('.', ',') + (question.unit ? ' ' + question.unit : '');
            };

            const makeLabel = function (pos, addClass) {
                const x = c.x(pos);
                const y = c.y(indexedData[pos]);
                const text = formatValue(indexedData[pos]);

                const label = c.labels.append('div')
                    .classed('data-label', true)
                    .classed(addClass, true)
                    .style('left', x + 'px')
                    .style('top', y + 'px');
                label.append('span')
                    .text(text);

                if (pos == minYear && isMobile) {
                    label.classed('edge-left', true);
                }
                if (pos == maxYear && isMobile) {
                    label.classed('edge-right', true);
                }

                return [
                    c.dots.append('circle')
                        .attr('r', 4.5)
                        .attr('cx', x)
                        .attr('cy', y)
                        .attr('class', addClass),
                    label
                ];
            };

            const drawChart = function (lower, upper, addClass) {
                const definedFn = (d, i) => d.year >= lower && d.year <= upper;
                const area = d3.area().curve(d3.curveMonotoneX).x(ƒ('year', c.x)).y0(ƒ('value', c.y)).y1(c.height).defined(definedFn);
                const line = d3.area().curve(d3.curveMonotoneX).x(ƒ('year', c.x)).y(ƒ('value', c.y)).defined(definedFn);

                if (lower == minYear) {
                    makeLabel(minYear, addClass);
                }
                const svgClass = addClass + (upper == lastPointShownAtIndex ? " median" : '');

                const group = c.charts.append('g');
                group.append('path').attr('d', area(data)).attr('class', 'area ' + svgClass).attr('fill', `url(#gradient-${addClass})`);
                group.append('path').attr('d', line(data)).attr('class', 'line ' + svgClass);
                ;

                return [
                    group,
                ].concat(makeLabel(upper, svgClass));
            };

            const clamp = function (a, b, c) {
                return Math.max(a, Math.min(b, c))
            };

            // make visual area empty
            sel.html('');

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

            function getRandom(min, max) {
                return Math.random() * (max - min) + min;
            }

            // configure scales
            const graphMinY = question.yAxisMin ? question.yAxisMin : 
                minY >= 0 ? 0 : minY * getRandom(1, 1.5);
            const graphMaxY = question.yAxisMax ? question.yAxisMax : 
                maxY + (maxY - graphMinY) * getRandom(0.4, 1); // add 40 - 100% for segment titles
            // const graphMinY = Math.min(minY, 0);
            // const graphMaxY = Math.max(indexedData[medianYear] * 2, maxY + (maxY - graphMinY) * 0.4); // add 40% for segment titles
            c.x = d3.scaleLinear().range([0, c.width]);
            c.x.domain([minYear, maxYear]);
            c.y = d3.scaleLinear().range([c.height, 0]);
            c.y.domain([graphMinY, graphMaxY]);

            c.svg = sel.append('svg')
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .attr("width", c.width)
                .attr("height", c.height);

            // gradients
            c.defs = d3.select(c.svg.node().parentNode).append('defs');
            ['black', 'red', 'blue'].forEach(color => {
                const gradient = c.defs.append('linearGradient')
                    .attr('id', 'gradient-' + color)
                    .attr('x1', '0%')
                    .attr('y1', '0%')
                    .attr('x2', '0%')
                    .attr('y2', '100%');
                gradient.append('stop').attr('offset', '0%').attr('class', 'start');
                gradient.append('stop').attr('offset', '100%').attr('class', 'end');
            });

            c.defs.append('marker')
                .attr('id', 'preview-arrowp')
                .attr('orient', 'auto')
                .attr("viewBox", "0 0 10 10")
                .attr('markerWidth', 6)
                .attr('markerHeight', 6)
                .attr('refX', 1)
                .attr('refY', 5)
                .append('path')
                .attr('d', 'M 0 0 L 10 5 L 0 10 z');

            // make background grid
            c.grid = c.svg.append('g')
                .attr('class', 'grid');
            c.grid.append('g').attr('class', 'horizontal').call(
                d3.axisBottom(c.x)
                    .tickValues(c.x.ticks(maxYear - minYear))
                    .tickFormat("")
                    .tickSize(c.height)
            )
                .selectAll('line')
                .attr('class', (d, i) => segmentBorders.indexOf(d) !== -1 ? 'highlight' : '');

            c.grid.append('g').attr('class', 'vertical').call(
                d3.axisLeft(c.y)
                    .tickValues(c.y.ticks(6))
                    .tickFormat("")
                    .tickSize(-c.width)
            );

            const applyMargin = function (sel) {
                sel.style('left', margin.left + 'px')
                    .style('top', margin.top + 'px')
                    .style('width', c.width + 'px')
                    .style('height', c.height + 'px');

            };

            // invisible rect for dragging to work
            const dragArea = c.svg.append('rect')
                .attr('class', 'draggable')
                .attr('x', c.x(lastPointShownAtIndex))
                .attr('width', c.x(maxYear) - c.x(lastPointShownAtIndex))
                .attr('height', c.height)
                .attr('opacity', 0);

            setTimeout(() => {
                const clientRect = c.svg.node().getBoundingClientRect();
                c.top = clientRect.top + window.scrollY;
                c.bottom = clientRect.bottom + window.scrollY;
            }, 1000);

            c.labels = sel.append('div')
                .attr('class', 'labels')
                .call(applyMargin);
            c.axis = c.svg.append('g');
            c.charts = c.svg.append('g');

            const userSel = c.svg.append('path').attr('class', 'your-line');
            c.dots = c.svg.append('g').attr('class', 'dots');

            // configure axes
            c.xAxis = d3.axisBottom().scale(c.x);
            // c.xAxis.tickFormat(d => "'" + String(d).substr(2)).ticks(maxYear - minYear);
            c.xAxis.tickFormat(d => indexedTimepoint[d]).ticks(maxYear - minYear);
            c.yAxis = d3.axisLeft().scale(c.y).tickValues(c.y.ticks(6));
            c.yAxis.tickFormat(d => formatValue(d));
            drawAxis(c);

            c.titles = sel.append('div')
                .attr('class', 'titles')
                .call(applyMargin)
                .style("top", "0px");

            // add a preview pointer 
            const xs = c.x(lastPointShownAtIndex);
            const ys = c.y(indexedData[lastPointShownAtIndex]);

            const xArrowStart = (ys <= 300) ? (xs + 45) : (xs + 70);
            const yArrowStart = (ys <= 300) ? (ys + 30) : (ys - 30);
            const yTextStart = (ys <= 300) ? (c.y(indexedData[lastPointShownAtIndex]) + 30) : (c.y(indexedData[lastPointShownAtIndex]) - 65);
            const xTextStart = (ys <= 300) ? (c.x(lastPointShownAtIndex)  + 30) : (c.x(lastPointShownAtIndex)  + 65)

            c.preview = c.svg.append('path')
                .attr('class', 'controls preview-pointer')
                .attr('marker-end', 'url(#preview-arrowp)')
                .attr("d", "M" + xArrowStart + "," + yArrowStart + 
                    " Q" + xArrowStart + "," + ys + 
                    " " + (xs + 15) + "," + ys);

            // add preview wave
            let arc = d3.arc()
                .startAngle(0)
                .endAngle(Math.PI);

            let nrWaves = initializeWaves(4);
            c.wave = c.svg.append("g").attr("class", "wave controls");
            c.wave.append('clipPath')
                    .attr('id', `wave-clip-${key}`)
                .append('rect')
                    .attr('width', c.width)
                    .attr('height', c.height);

            c.wave = c.wave
                .append("g")
                    .attr('clip-path', `url(#wave-clip-${key})`)
                .append("g")
                    .attr("transform", "translate(" + xs + ", " + ys + ")")
                .selectAll("path")
                .data(nrWaves)
                .enter()
                .append('path')
                    .attr("class", "wave")
                    .attr("d", arc);

            moveWave();    
            function moveWave(){
                console.log ("moveWave");
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
            c.controls = sel.append('div')
                .attr('class', 'controls')
                .call(applyMargin)
                .style('padding-left', c.x(minYear) + 'px');
                    
            c.controls.append('span')
                .style('left', xTextStart + 'px')
                .style('top', yTextStart + 'px')
                .text('Zeichnen Sie von hier\ndie Linie zu Ende'); 

            // make chart
            const charts = periods.map((entry, key) => {
                const lower = key > 0 ? periods[key - 1].year : minYear;
                const upper = entry.year;

                // segment title
                c.titles.append('span')
                    .style('left', c.x(lower) + 'px')
                    .style('width', c.x(upper) - c.x(lower) + 'px')
                    .text(entry.title);

                return drawChart(lower, upper, entry.class);
                // ma1
                // return drawChart(lower, upper, "black");
            });
            const resultChart = charts[charts.length - 1][0];
            const resultClip = c.charts.append('clipPath')
                .attr('id', `result-clip-${key}`)
                .append('rect')
                .attr('width', c.x(lastPointShownAtIndex))
                .attr('height', c.height);
            const resultLabel = charts[charts.length - 1].slice(1, 3);
            resultChart.attr('clip-path', `url(#result-clip-${key})`)
                .append('rect')
                .attr('width', c.width)
                .attr('height', c.height)
                .attr('fill', 'none');
            resultLabel.map(e => e.style('opacity', 0));

            /**
             * Interactive user selection part
             */
            // const userLine = d3.line().x(ƒ('year', c.x)).y(ƒ('value', c.y));
            const userLine = d3.line().x(ƒ('year', c.x)).y(ƒ('value', c.y)).curve(d3.curveMonotoneX);

            if(!state[key].yourData) {
                state[key].yourData = data.map(d => ({year: d.year, value: indexedData[lastPointShownAtIndex], defined: 0}))
                    .filter(d => {
                        if (d.year == lastPointShownAtIndex) d.defined = true;
                        return d.year >= lastPointShownAtIndex
                    });
            }

            const resultSection = d3.select('.result.' + key);

            const drawUserLine = function(year) {
                userSel.attr('d', userLine.defined(ƒ('defined'))(state[key].yourData));
                // const d = state[key].yourData[state[key].yourData.length-1];
                const d = state[key].yourData.filter(d => d.year === year)[0];
                const dDefined = state[key].yourData.filter(d => d.defined && (d.year !== lastPointShownAtIndex));
                
                if(!d.defined) {
                    return;
                }
                
                const dot = c.dots.selectAll('circle.result')
                    .data(dDefined);
                dot.enter()
                    .append('circle')
                    .merge(dot)
                    .attr('r', 4.5)
                    .attr('cx', de => c.x(de.year))
                    .attr('cy', de => c.y(de.value))
                    .attr('class', "result");

                const yourResult = c.labels.selectAll('.your-result')
                    .data([d]);
                yourResult.enter()
                    .append('div')
                    .classed('data-label your-result', true)
                    .classed('edge-right', isMobile)
                    .merge(yourResult)
                    .style('left', () => c.x(year) + 'px')
                    // .style('left', () => c.x(maxYear) + 'px')
                    .style('top', r => c.y(r.value) + 'px')
                    .html('')
                    .append('span')
                   // .text(r => formatValue(r.value, 2));
                   .text(r => question.precision ? formatValue(r.value) : formatValue(r.value, 0));
            };
            drawUserLine(lastPointShownAtIndex);

            const interactionHandler = function() {
                if (state[key].resultShown) {
                    return;
                }

                sel.node().classList.add('drawn');

                const pos = d3.mouse(c.svg.node());
                const year = clamp(lastPointShownAtIndex, maxYear, c.x.invert(pos[0]));
                const value = clamp(c.y.domain()[0], c.y.domain()[1], c.y.invert(pos[1]));
                let yearPoint = lastPointShownAtIndex;

                state[key].yourData.forEach(d => {
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

                drawUserLine(yearPoint);

                if (!state[key].completed && d3.mean(state[key].yourData, ƒ('defined')) == 1) {
                    state[key].completed = true;
                    resultSection.node().classList.add('finished');
                    resultSection.select('button').node().removeAttribute('disabled');
                }
            };

            c.svg.call(d3.drag().on('drag', interactionHandler));
            c.svg.on('click', interactionHandler);

            const showResultChart = function () {
                if(!state[key].completed) {
                    return;
                }
                c.labels.selectAll('.your-result').node().classList.add("hideLabels");
                if (!state[key].score) { 
                    getScore();
                }
                state[key].resultShown = true;
                resultClip.transition()
                    .duration(700)
                    .attr('width', c.x(maxYear));
                dragArea.attr('class', '');
                setTimeout(() => {
                    resultLabel.map(e => e.style('opacity', 1));
                    resultSection.node().classList.add('shown');
                }, 700);
            };
            resultSection.select('button').on('click', showResultChart);
            if(state[key].resultShown) {
                showResultChart();
            }

            sel.on('mousemove', () => {
                const pos = d3.mouse(c.svg.node());
                const y = Math.min(Math.max(pos[1], c.y(graphMaxY)), c.y(graphMinY));
                c.preview.attr('y2', y);
            });

            function getScore() {
                let score = 0;
                let truth = data.filter(d => d.year > lastPointShownAtIndex);
                let pred = state[key].yourData;
                let maxDiff = 0;
                let predDiff = 0;
                truth.forEach(function(ele, i) {
                    maxDiff += Math.max(graphMaxY - ele.value, ele.value - graphMinY);
                    predDiff += Math.abs(ele.value - state[key].yourData[i+1].value)
                });
                const scoreFunction = d3.scaleLinear().domain([0, maxDiff]).range([100,0]);
                // score = (Math.floor((predDiff / maxDiff) * 100));
                score = scoreFunction(predDiff).toFixed(1);
                state[key].predictionDiff = predDiff;
                state[key].score = +score;

                let completed = true;
                Object.keys(state).forEach((ele) => {completed = completed && (typeof state[ele].score !== "undefined") });
                if (completed) {
                    let scores = 0;
                    Object.keys(state).forEach((ele) => {scores = scores + state[ele].score});
                    const finalScoreFunction = d3.scaleLinear().domain([0, 100 * Object.keys(state).length]).range([0,100]);
                    let finalScore = finalScoreFunction(scores).toFixed();
                    console.log("The final score is: " + finalScore);
                    showFinalScore(+finalScore);
                }
                
                console.log(state[key].yourData);
                console.log(data);
                console.log("The pred is: " + predDiff);
                console.log("The maxDiff is: " + maxDiff);
                console.log("The score is: " + score);
            }

            function showFinalScore(finalScore) {
                let fs = {};
                fs.div = resultSection.select("div.text")
                    .append("div")
                        .attr("class", "finalScore");

                fs.div.append("div")
                        .attr("class", "before-finalScore")
                    .append("strong")
                    .text(globals.yourResult);

                fs.svg = fs.div.append("svg")
                    .attr("width", 500)
                    .attr("height", 75);
            
                fs.g = fs.svg
                    .append("g")
                        .attr("transform", "translate(5, 10)");

                const xScale = d3.scaleLinear().domain([0, 100]).range([0, 400])
                const xAxis = d3.axisBottom(xScale).ticks(4);
                fs.g.append("g")
                    .attr("transform", "translate(0, 45)")
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

            function showText() {
                d3.select('.result.' + key).select("text.scoreText")
                    .style("opacity", 1);
            }
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

    window.addEventListener('resize', debounce(() => {
        drawGraphs();
    }, 500));

})();