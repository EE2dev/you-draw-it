# you-draw-it

you-draw-it lets you configure a quiz with questions. The user can specify the numeric answers (single number or time series) by drawing interactively.

The you-draw-it implementation is adapted from the great work at https://github.com/wdr-data/you-draw-it. Original idea developed by [the New York Times](https://www.nytimes.com/interactive/2015/05/28/upshot/you-draw-it-how-family-income-affects-childrens-college-chances.html).

## Examples
- [fun facts](https://bl.ocks.org/EE2dev/raw/8cc9d3a19df00f30cf011a8fd5f3d7e4/)

## How to use you-draw-it
The easiest way to start off is to create an html file with the following content:
```
<!DOCTYPE html>
  <meta charset="utf-8">

  <head>
    <title>My quiz</title>
    <meta name="viewport" content="width=device-width,user-scalable=yes,initial-scale=1,minimum-scale=1">
    <link rel="stylesheet" href="https://ee2dev.github.io/ydi/css/style.css">
  </head>

  <body>
    <script src="https://d3js.org/d3.v5.min.js"></script>
    <script src="https://ee2dev.github.io/ydi/js/youdrawit.min.js"></script>    
    <script>
      var questions = [];
      var question = {};
     
      var globals = { 
        default: "en"
      };

      // ----- for additional questions, copy FROM here
      question = { 
        heading: "Question 1",
        data: [
          {2015: 1503451}, 
          {2016: -1491897}, 
          {2017: 1495333}, 
          {2018: 1453203}, 
          {2019: 1458438}, 
          {2020: 1442801}
          ]
      };
      questions.push(question);
      // ----- for additional questions, copy TO here     

      // ----- for additional questions, copy FROM here
      question = {
        heading: "Question 2",
        data: 17.1,
      };
      questions.push(question);
      // ----- for additional questions, copy TO here  

      var myChart = youdrawit
        .chart()
        .globals(globals)
        .questions(questions);

      d3.select("body")
        .append("div")
        .attr("class", "chart")
        .call(myChart);
    </script>
  </body>
</html>  
```
In the javascript portion three variables are defined:
- `questions` which is an *array* of `question` *objects*.
- `question` which is an *object* containing all infos about that question
- `globals` which is an *object* containing global settings, mainly *text* or *html* strings, which are displayed during the course of the quiz.

All you need to do is
1. to adjust the two properties of each `question`
    - `heading` refering to a *string* with one particular quiz question. This *string* can contain *text* or *html* (in case want to format your question in a certain way).
    - `data` refering to the value or values of the correct answer. 
       - In case a single value is the answer (which is represented by a bar chart), `data` has to be initialized with the correct *number*.
       - In case a sequence of values is the answer (which is represented by a line chart), `data` has to be initialized by an *array* of *objects*. Each *object* is a point in the sequence and has to be initialized by a key (which will be the x coordinate) and its value (which will be the y coordinate)
2. to to add more `question`'s you can simply copy the block commented with ... `copy FROM here` until ... `copy TO here`, adjust the properties and you are ready to go!.

## Tips & tricks
- **number of digits**
I recommend using at most 4 digits for any value. All digits are displayed with all thousands as well as the decimal separator. The number of displayed digits after the decimal spearator can be specified with [`question.precision`](https://github.com/EE2dev/you-draw-it#q-precision) 
- ***text* vs *html***
The following options can be set with either *text* or *html*:
    - [`globals.header`](https://github.com/EE2dev/you-draw-it#g-header)
    - [`globals.subHeader`](https://github.com/EE2dev/you-draw-it#g-subHeader)
    - [`globals.scoreHtml`](https://github.com/EE2dev/you-draw-it#g-scoreHtml)
    - [`question.heading`](https://github.com/EE2dev/you-draw-it#q-heading)
    - [`question.subHeading`](https://github.com/EE2dev/you-draw-it#q-subHeading)
    - [`question.resultHtml`](https://github.com/EE2dev/you-draw-it#q-resultHtml)

- **final score**
You can add a text or html after the final score is shown. In addition you can show a different *text* or *html* based on the final score. See [`question.scoreHtml`](https://github.com/EE2dev/you-draw-it#g-scoreHtml) for details.
- **using a different font**
See section [Using a different font](https://github.com/EE2dev/you-draw-it#Using-a-different-font)
- **template**
You can use [this template]() which lists all `global` and `question` options.

## API Reference

To do: add picture with options

### The configuration object `globals`

<a href="#g-default" id="g-default">#</a> globals.<b>default</b>

<a href="#g-header" id="g-header">#</a> globals.<b>header</b>

<a href="#g-subHeader" id="g-subHeader">#</a> globals.<b>subHeader</b>

<a href="#g-drawAreaTitle" id="g-drawAreaTitle">#</a> globals.<b>drawAreaTitle</b>

<a href="#g-drawLine" id="g-drawLine">#</a> globals.<b>drawLine</b>

<a href="#g-drawBar" id="g-drawBar">#</a> globals.<b>drawBar</b>

<a href="#g-resultButtonText" id="g-resultButtonText">#</a> globals.<b>resultButtonText</b>

<a href="#g-resultButtonTooltip" id="g-resultButtonTooltip">#</a> globals.<b>resultButtonTooltip</b>

<a href="#g-scoreTitle" id="g-scoreTitle">#</a> globals.<b>scoreTitle</b>

<a href="#g-scoreButtonText" id="g-scoreButtonText">#</a> globals.<b>scoreButtonText</b>

<a href="#g-scoreButtonTooltip" id="g-scoreButtonTooltip">#</a> globals.<b>scoreButtonTooltip</b>

<a href="#g-scoreHtml" id="g-scoreHtml">#</a> globals.<b>scoreHtml</b>

### The configuration object `question`

<a href="#q-data" id="q-data">#</a> question.<b>data</b>

<a href="#q-heading" id="q-heading">#</a> question.<b>heading</b>

<a href="#q-subHeading" id="q-subHeading">#</a> question.<b>subHeading</b>

<a href="#q-resultHtml" id="q-resultHtml">#</a> question.<b>resultHtml</b>

<a href="#q-unit" id="q-unit">#</a> question.<b>unit</b>

<a href="#q-precision" id="q-precision">#</a> question.<b>precision</b>

<a href="#q-lastPointShownAt" id="q-lastPointShownAt">#</a> question.<b>lastPointShownAt</b>

Determines the last point shown for the line chart. The user guesses start from the next point.
Default value is the next to last point in the sequence. This leaves the user to guess just the last point. Any point but the last can be specified.
Is irrelevant for the bar chart.  

<a href="#q-yAxisMin" id="q-yAxisMin">#</a> question.<b>yAxisMin</b>

Sets the lowest value for the y axis. 
Default value is:
   - 0, if all values are positive numbers
   - Min(value) - *random number* * Min(value), if min(values) is a negative number. *random number* is a number between 0.4 and 1.0.

<a href="#q-yAxisMax" id="q-yAxisMax">#</a> question.<b>yAxisMax</b>

Sets the highest value for the y axis. 
Default value is:
   - Max(value) + *random number* * Max(value). *random number* is a number between 0.4 and 1.0.

## Using a different font

The font of the quiz can be changed in the ```<head>``` of the html document by 
1. importing the new font 
2. assigning the font to the desired text elements 

Three possible choices are:
### Using a different font for all text elements

```
<head>
    ...
    <link href="https://fonts.googleapis.com/css?family=Indie+Flower" rel="stylesheet">
    <style>
        .update-font, .tick text {
            font-family: 'Indie Flower', cursive;
            font-size: 1.5em;
        }
    </style>
</head>
```

### Using a different font for all text elements but the axes 

```
<head>
    ...
    <link href="https://fonts.googleapis.com/css?family=Indie+Flower" rel="stylesheet">
    <style>
        .globals-drawLine, .globals-drawBar {
            font-family: 'Indie Flower', cursive;
            font-size: 1.5em;
        }
    </style>
</head>
```

### Using a different font for just the call-to-action text elements

```
<head>
    ...
    <link href="https://fonts.googleapis.com/css?family=Indie+Flower" rel="stylesheet">
    <style>
        .update-font {
            font-family: 'Indie Flower', cursive;
            font-size: 1.5em;
        }
    </style>
</head>
```

### Table with the css classes of the text elements

You can CSS style any text element by applying class selectors as referenced below:

| object key       | class1          | class2  |
| ------------- |:-------------|:-----|
| globals.header      | globals-header  | update-font |
| globals.subHeader     | globals-subHeader      |   update-font |
| globals.resultButtonText     | globals-resultButtonText     |   update-font |
| globals.resultButtonTooltip    | globals-resultButtonTooltip     |   update-font |
| globals.drawAreaTitle    | globals-drawAreaTitle     |   update-font |
| globals.drawLine    | globals-drawLine     |   update-font |
| globals.drawBar    | globals-drawBar     |   update-font |
| globals.scoreButtonText    | globals-scoreButtonText     |   update-font |
| globals.scoreButtonTooltip    | globals-scoreButtonTooltip     |   update-font |
| globals.scoreTitle    | globals-scoreTitle     |   update-font |
| globals.scoreHtml    | globals-scoreHtml     |   update-font |
| () → .scoreText    | globals-scoreText    |   update-font |
| question.heading | question-heading      |    update-font |
| question.subHeading | question-subHeading      |    update-font |
| question.resultHtml | question-resultHtml      |    update-font |
| (question.unit) → label | question-label      |    update-font |

## Calculating the final score
The final score is calculated as follows:
- for each question a score is calculated by
    - (if line chart) 
        - compute the max possible distance for all points
        - give score (0 - 100) for this question based on absolute distances
    - (if bar chart) 
        - compute the max possible distance
        - give score (0 - 100) for this question based on absolute distance
- final score is mean of all individual scores

## License  
This code is released under the [BSD license](https://github.com/EE2dev/you-draw-it//blob/master/LICENSE).