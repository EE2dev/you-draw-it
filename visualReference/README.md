# A visual reference of the configuration options for you-draw-it

![visual reference of the configuration options- 1](https://github.com/EE2dev/you-draw-it/blob/master/images/ydi1.png)

![visual reference of the configuration options- 2](https://github.com/EE2dev/you-draw-it/blob/master/images/ydi2.png)

![visual reference of the configuration options- 1](https://github.com/EE2dev/you-draw-it/blob/master/images/ydi3.png)

![visual reference of the configuration options- 1](https://github.com/EE2dev/you-draw-it/blob/master/images/ydi4.png)

![visual reference of the configuration options- 1](https://github.com/EE2dev/you-draw-it/blob/master/images/ydi5.png)

## API Reference

### The configuration object `globals`

<a href="#g-default" id="g-default">#</a> globals.<b>default</b>

Sets the several undefined properties of `globals` to default values. If a property is already defined, it is not overridden.
Two values are currently supported:
- globals.default = "en". 
Initialization with English defaults. In addtion, the thousands separator is set to `,`(comma) and the decimal separator to `.`(dot). The English default is also applied if no default is specified.  
```
// globals.default = "en" applies the following initialization:
var globals = { 
        default: "en",
        resultButtonText: "Show me the result!",
        resultButtonTooltip: "Draw your guess. Upon clicking here, you see if you're right.",
        scoreTitle: "Your result:",
        scoreButtonText: "Show me how good I am!",
        scoreButtonTooltip: "Click here to see your result",
        drawAreaTitle: "Your\nguess",
        drawLine: "draw the graph\nfrom here to the end",
        drawBar: "drag the bar\nto the estimated height",
    };
```
- globals.default = "de".
Initialization with German defaults. In addtion, the thousands separator is set to `.`(dot) and the decimal separator to `,`(comma).
```
// globals.default = "en" applies the following initialization:
var globals = { 
        default: "en",
        resultButtonText: "Zeig mir die Lösung!",
        resultButtonTooltip: "Zeichnen Sie Ihre Einschätzung. Der Klick verrät, ob sie stimmt.",
        scoreTitle: "Ihr Ergebnis:",
        scoreButtonText: "Zeig mir, wie gut ich war!",
        scoreButtonTooltip: "Klicken Sie hier, um Ihr Gesamtergebnis zu sehen"",
        drawAreaTitle: "Ihre\nEinschätzung",
        drawLine: "Zeichnen Sie von hier\nden Verlauf zu Ende",
        drawBar: "Ziehen Sie den Balken\nauf die entsprechende Höhe",
    };
```

<a href="#g-header" id="g-header">#</a> globals.<b>header</b>

Sets the *text* or *html* containing the header (= first line of the quiz).

<a href="#g-subHeader" id="g-subHeader">#</a> globals.<b>subHeader</b>

Sets the *text* or *html* containing the subHeader (= second line of the quiz).

<a href="#g-drawAreaTitle" id="g-drawAreaTitle">#</a> globals.<b>drawAreaTitle</b>

Sets the *text* denoting the area to be drawn by the user.

<a href="#g-drawLine" id="g-drawLine">#</a> globals.<b>drawLine</b>

Sets the *text* denoting the call to action for the user to continue drawing the line chart.

<a href="#g-drawBar" id="g-drawBar">#</a> globals.<b>drawBar</b>

Sets the *text* denoting the call to action for the user to adjusting the bar chart.

<a href="#g-resultButtonText" id="g-resultButtonText">#</a> globals.<b>resultButtonText</b>

Sets the *text* denoting the button to reveal the correct answer.

<a href="#g-resultButtonTooltip" id="g-resultButtonTooltip">#</a> globals.<b>resultButtonTooltip</b>

Sets the *text* denoting the tooltip of the button to reveal the correct answer.

<a href="#g-scoreButtonText" id="g-scoreButtonText">#</a> globals.<b>scoreButtonText</b>

Sets the *text* denoting the button to reveal the total score.

<a href="#g-scoreButtonTooltip" id="g-scoreButtonTooltip">#</a> globals.<b>scoreButtonTooltip</b>

Sets the *text* denoting the tooltip of the button to reveal the total score.

<a href="#g-scoreTitle" id="g-scoreTitle">#</a> globals.<b>scoreTitle</b>

Sets the *text* denoting the the headline on top of the score evaluation.

<a href="#g-scoreHtml" id="g-scoreHtml">#</a> globals.<b>scoreHtml</b>

There are two ways to specify that propery:
1. specify a *text* or *html* for any score:
```
var globals = { 
        ...
        scoreHtml: "Next time you can do better!",
    };
```
Sets the *text* or *html* shown after the total score is revealed.

2. specify a *text* or *html* depending on the score: 
```
var globals = { 
        ...
        scoreHtml: [{lower: 0, upper: 50, html: "<b>That wasn't much, was it??</b>"}, 
        {lower: 50, upper: 101, html: "<b>Excellent!!</b>"}],
    };
```
Sets the *text* or *html* based on the score. In this case, `g.scoreHtml` is an `array` of `objects`. The array contains as many objects as there are intervalls. Each `object` defines the intervall with its lower and upper bound. It also contains an html property for the *text* or *html* to be displayed in this case.

### The configuration object `question`

<a href="#q-data" id="q-data">#</a> question.<b>data</b>

Sets the value/ values which is/are the correct response for the question.
- In case a single value is the answer (which is re presented by a bar chart), `data` has to be initialized with the correct *number*.
- In case a sequence of values is the answer (which is represented by a line chart), `data` has to be initialized by an *array* of *objects*. Each *object* is a point in the sequence and has to be initialized by a key (which will be the x coordinate) and its value (which will be the y coordinate)

Note that the decimal separator has to denoted by a `.`(dot). The display, however, can be modified with `globals.default` (`.`(dot) vs `,`(comma)) 

```
// examples for setting question.data
question = { 
    ...
    data: 385, // or
    data: 2.545, // or

    data: [
          {"1998 (JP)": 32000}, 
          {"2002 (US)": 22000}, 
          {"2006 (IT)": 18000}, 
          {"2010 (CA)": 18500}, 
          {"2014 (RU)": 25000}, 
          {"2018 (CN)": 22400},
          ], // or

    data: [
          {"Mon": 32.0}, 
          {"Tue": 20.2}, 
          {"Wed": 18.7}, 
          {"Thu": 18.3}, 
          {"Fri": 25.2}, 
          {"Sat": 22.1},
          {"Son": 22.9},
          ],  
...};
```

<a href="#q-heading" id="q-heading">#</a> question.<b>heading</b>

Sets the *text* or *html* containing the question.

<a href="#q-subHeading" id="q-subHeading">#</a> question.<b>subHeading</b>

Sets the *text* or *html* below the `heading`.

<a href="#q-resultHtml" id="q-resultHtml">#</a> question.<b>resultHtml</b>

Sets the *text* or *html* after the user has drawn his guess and the correct result is shown.

<a href="#q-unit" id="q-unit">#</a> question.<b>unit</b>

Sets a *string* which is attached to the values of the y axis and the label of the tooltip when the user makes. 

```
// examples for setting question.unit
question = { 
    ...
    unit: "sec", // or
    unit: "Mio", // or
    unit: "US$", // or
    unit: "€", 
...};
```

<a href="#q-precision" id="q-precision">#</a> question.<b>precision</b>

Sets the number of decimal places. The default is 1.

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
