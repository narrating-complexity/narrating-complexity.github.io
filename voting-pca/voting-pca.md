---
layout: page
title: Tools for projecting voting data using PCA
---

<link href="projection-dashboard.css" rel="stylesheet">
<script src="lib/d3.v5.min.js"></script>
<script src="lib/ml.min.js"></script>

This page contains a demo for a dashboard to generate PCA visualizations from voting records. The demo shows congress voting data from the United States Fourteenth Amendment & The Civil Rights Act of 1866 Convention, as seen in the [Quill Project Database](https://www.quillproject.net/overview_3/143).

The dashboard consists of three main elements: a timeline, a scatterplot and a chart.

<br>

## Timeline

The timeline shows the timespan of the entire convention. Events are shown as dots, and they are identified by different colors:
- ORANGE dots are sessions, arranged over the timeline. Other dots are put on top of sessions and represent individual events.
- BLUE dots are decisions that have RECORDED INDIVIDUAL VOTES.
- DARK GREY dots are decisions that have no recorded votes, but are flagged as ANONYMOUS.
- LIGHT GREY dots are decisions that have no recorded votes and are not anonymous either.

The settings menu allows filtering of data, by choosing between delegation or individual voting, or choosing a particular committee or document.

<div id="timeline-sidebar" class="options-frame">
    <div>
        <div class="panel-heading">
            <h3 class="panel-title">Timeline settings</h3>
        </div>

        <div class="panel-body">
                <span>View by:</span>
                <select class="halfsize-selector" id="selector-person-delegation">
                    <option value="delegation" selected="selected">Delegation</option>
                    <option value="individual">Individual</option>
                </select>
                <br>

                <span>Committee(s):</span>
                <select class="halfsize-selector" id="selector-committee">
                    <option value="-1" selected="selected"> All </option>
                </select>
                <br>

                <span>Document:</span>
                <select class="halfsize-selector" id="selector-document">
                    <option value="-1" selected="selected"> All </option>
                </select>
                <br>             
        </div>
    </div>
    
</div>

<div id="timeline-canvas" class="svg-frame">
    <input type="radio" name="tl-operator" id="checkbox-timeline-operator-nav" checked="true" value="navigate">Navigate
    <input type="radio" name="tl-operator" id="checkbox-timeline-operator-st0" value="select-t0">Select main sample
    <input type="radio" name="tl-operator" id="checkbox-timeline-operator-st1" value="select-t1">Select comparison sample
    <br>
    <svg id="timeline-svg"></svg>
</div>

To generate a PCA projection to visualize, you must select a time sample from the timeline. Use the toggles on the upper side of the timeline to choose between navigating (zooming with the mouse wheel or panning by clicking and dragging) or selecting samples for visualization. To select a sample, click one of the SELECT SAMPLE toggles and click and drag the cursor through a section of the timeline. The timespans below will update to show the selected time samples.
You can select either a single main sample or a main sample and a comparison sample, to be shown side-by-side on the scatterplot.
Once you are happy with your selection, you may click the GENERATE PCA button to display the selected information on the scatterplot. You can come back and select new samples to project at any time.

<div class="options-frame">
    <span>Main Sample Timespan:</span>
    <span id="description-dates-t0" style="background-color: #b3bcdd; color: #000000; font-weight:bold"> </span><br>

    <span>Comparison Sample Timespan:</span>
    <span id="description-dates-t1" style="background-color: #b3bcdd; color: #000000; font-weight:bold"> </span><br>

    <button id="button-project" type="button" class="btn btn-primary btn-sm">Generate PCA</button>
</div>

<br>

## Scatterplot

The scatterplot is the actual PCA visualization. A PCA projection is a transformation over the original data that aims to encode the maximum possible amount of covariance within each dimension without distortion, as to show trends and correlation between data points as explicitly as possible.
In this visualization, each voter (person or delegation) will be shown as a BLACK dot, and its position on X and Y axes is determined by a combination of their votes - voters with similar voting behavior will be shown close together, while different behaviors will be shown far apart.
If a comparison sample was selected, the comparison sample can be shown in RED. The comparison sample is projected using a different PCA calculation and is matched to the main sample as best as possible using Procrustes Analysis. Arrows are then drawn from the dots of every voter in the main sample to their position in the comparison sample.
When a PCA projection is generated, the sidebar will also display the amount of variance contained in each axis. These numbers vary from 0 to 1 and indicate how well the data is represented by each axis of the PCA projection.

<div id="scatterplot-sidebar"  class="options-frame">
    <div class="panel-heading">
        <h3 class="panel-title">Scatterplot settings</h3>
    </div>
    <div class="panel-body">
        <span>Display:</span>
        <select class="halfsize-selector" id="selector-projection-display">
            <option value="voters" selected="selected">Voters</option>
            <option value="decisions">Decisions with valid votes</option>
        </select>
        <br>
        <span>Show comparison sample: </span>
        <input type="checkbox" id="checkbox-show-proj1">
        <br>
        <span>Movement display threshold:</span>
        <input type="range" orient="horizontal" min="0" max="99" value="0" class="halfsize-selector" id="slider-movement-threshold">
        <br>
        <span>Hide dots below threshold: </span>
        <input type="checkbox" id="checkbox-hide-dots">
        <br>
    </div>
</div>

<div id="scatterplot-canvas" class="svg-frame">
    <svg id="scatterplot-svg"></svg>
    <br>
    <span style="margin-left:10px">Amount of variance contained in X axis: </span>
    <span id="xvariance-description" style="background-color: #b3bcdd; color: #000000; font-weight:bold"> </span>
    <br>
    <span style="margin-left:10px; margin-bottom:10px;">Amount of variance contained in Y axis: </span>
    <span id="yvariance-description" style="background-color: #b3bcdd; color: #000000; font-weight:bold"> </span>

</div>

The settings menu allows configuration of certain parameters:
- The DISPLAY selector allows changing the display from VOTERS to DECISIONS - this means each dot will now be a decision and position will indicate how similar their votes were. Decisions are shown as BLUE dots.
- The SHOW COMPARISON SAMPLE checkbox enables the display of voters according to the comparison sample.
- The MOVEMENT THRESHOLD slider and checkbox allow you to hide dots that did not change more than a certain amount between the main sample and comparison sample.

<br>

## Charts

These charts contain information on the behavior of the PCA itself: as positioning on each axis is a combination of different votes, users can view the individual influence of each decision over each axis: this can give insight over what being on a certain part of the screen actually means for data.
The settings menu allows the selection of different axis for observation, the ordering of decisions (by date or by value), and enabling a second plot for comparison.


<div id="charts-sidebar"  class="options-frame">
    <div class="panel panel-default">
        <div class="panel-heading">
            <h3 class="panel-title">Decision charts settings</h3>
        </div>
        <div class="panel-body">
            <span>Show:</span>
            <select id="selector-chart0-type" class="halfsize-selector">
                <option value="0"> Impact on Voter PCA X axis </option>
                <option value="1"> Impact on Voter PCA Y axis </option>
                <option value="2"> Impact on Voter PCA X+Y axis </option>
                <option value="3"> Total number of votes </option>
            </select>
            <br>
            <span>Order by:</span>
            <select id="selector-chart0-order" class="halfsize-selector">
                <option value="0"> Date </option>
                <option value="1"> Value </option>
            </select>
            <br>
            <br>
            <span>Plot additional graph:</span>
            <input type="checkbox" id="checkbox-show-chart1">
            <br>
            <span>Show:</span>
            <select id="selector-chart1-type" class="halfsize-selector" disabled>
                <option value="0"> Impact on Voter PCA X axis </option>
                <option value="1"> Impact on Voter PCA Y axis </option>
                <option value="2"> Impact on Voter PCA X+Y axis </option>
                <option value="3"> Total number of votes </option>
            </select>
            <br>
            <span>Order by:</span>
            <select id="selector-chart1-order" class="halfsize-selector" disabled>
                <option value="0"> Date </option>
                <option value="1"> Value </option>
            </select>
            <br>
        </div>
    </div>
</div>

<div id="charts-canvas" class="svg-frame">
    <svg id="charts-svg"></svg>
</div>


<div style="text-align:right">This analysis tool was designed and implemented by Gabriel Dias Cantareira and Alfie Abdul-Rahman at King's College London, and partially funded by a grant from Engineering and Physical Sciences Research Council (EP/V028871/1).</div>

<script type="text/javascript" src="projection-dashboard.js"></script>

    