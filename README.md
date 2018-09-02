# my-quiz

-Work in progress-

Adopted the you-draw-it implementation from the great work at https://github.com/wdr-data/you-draw-it. Original idea developed by [the New York Times](https://www.nytimes.com/interactive/2015/05/28/upshot/you-draw-it-how-family-income-affects-childrens-college-chances.html).

## Installing

~~If you use NPM, `npm install myquiz`. Otherwise, download the [latest release](https://unpkg.com/myquiz).~~


## API Reference

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

<a href="#q-yAxisMin" id="q-yAxisMin">#</a> question.<b>yAxisMin</b>

<a href="#q-yAxisMax" id="q-yAxisMax">#</a> question.<b>yAxisMax</b>

## Additional customizations

### Using a different font

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
| question.heading | question-heading      |    update-font |
| question.subHeading | question-subHeading      |    update-font |
| question.resultHtml | question-resultHtml      |    update-font |
| (question.unit) → label | question-label      |    update-font |

| question.subHeading | question-subHeading      |    update-font |

question-resultHtml
    g.default
    x g.header
    x g.subHeader
    x g.drawAreaTitle
    x g.drawLine
    x g.drawBar
    x g.resultButtonText
    x g.resultButtonTooltip
    x g.scoreTitle
    x g.scoreButtonText
    x g.scoreButtonTooltip
    x g.scoreHtml

    q.data
    x q.heading
    x q.subHeading
    x q.resultHtml
    q.unit
    q.precision
    q.lastPointShownAt
    q.yAxisMin
    q.yAxisMax
