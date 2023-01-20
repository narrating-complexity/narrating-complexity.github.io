---
layout: page
---

<link href="person-visualize.css" rel="stylesheet">
<script src="lib/d3.v5.min.js"></script>
<script> window.d3v5 = window.d3; </script>
<script src="lib/d3.min.js"></script>
<script src="lib/d3.layout.cloud.js"></script>
<script src="lib/jquery-3.6.0.min.js"></script>

# Tools for visualizing person records

This page contains a demo for visualizing records from people in the United States Fourteenth Amendment & The Civil Rights Act of 1866 Convention data set from the [Quill Project Database](https://www.quillproject.net/overview_3/143).
The page consists of five main elements: a committee involvement list, a keyword cloud, a relationship map, an event list, and a voting breakdown.

This page shows visualization components using a static sample of the dataset. To access different committees or people, please see [here](https://www.quillproject.net/person_visualize/143/4564).

## Committee Involvement

The committee involvement section displays a person's participation in different committees of a convention. The colored donuts show the percentage of events in the committee in which the person in mentioned by name, and the number within refers to the total amount. Committees with no participation from the person are shown in gray. The following sections will visualize the person's participation in the committee shown with a red outline.

<div class="panel panel-default">
    <div class="panel-heading panel-heading-height">
        <div class="pull-left">
            <h3 class="panel-title panel-title-size font-color"><strong><span id="committee-list-person-name">Person</span>'s committee involvements</strong></h3>
            <!--<p>(Events participated: numbers show total amount, rings show percentage. Click a committee to see involvement details.)</p>-->
        </div>
    </div>
    <div class="panel-body">
        <div id="list-view-committees"></div>
    </div>
</div>
<br>


## Keyword Cloud

From a given committee, we search for keywords in its event descriptions that can be used to indicate topics that were discussed. While the Quill platform has support for recording keywords, we use Yake to collect them when they are not available. Keywords are shown in a keyword cloud format, with a chart underneath indicating scores for the 20 most frequent keywords. Hovering over a score will highlight the word in the cloud, and vice-versa.

<div class="panel panel-default">
    <div class="panel-heading panel-heading-height">
        <div class="pull-left">
            <h3 class="panel-title panel-title-size font-color"><strong>Keywords related to <span id="wordcloud-committee-name">involved committees</span></strong></h3>
            <!--<p>(WordCloud Visualization - larger words indicate stronger presence in documents)</p>-->
        </div>
    </div>
    <div class="panel-body">
        <div id="word-cloud" style="display:inline"></div>
        <div id="horizontal-bar" style="display:inline"></div>
    </div>
</div>
<br>


## Relationship Map

For each committee, we generate a relationship map to show other people that may be politically aligned with the person in question. Relationships are estimated by calculating distances between votes along all sessions in the committee. The 2D projection of the relationship map is generated with t-SNE. Below the relationship map are shown the 5 people with alignment most similar to the person (allies) and the 5 people who are the most opposed (opponents). The number listed on each person's name indicates the distance between them and the selected person, from 0 to 1.

<div class="panel panel-default">
    <div class="panel-heading panel-heading-height">
        <div class="pull-left">
            <h3 class="panel-title panel-title-size font-color"><strong><span id="relationships-person-name">Person</span>'s relationships in <span id="relationships-committee-name">committee</span></strong></h3>
            <p>(Relationship map is an approximation generated with t-SNE. Click on a name to view their Person page.)</p>
        </div>
    </div>
    <div class="panel-body">
        <div id="canvas-neighborhood-projection" style="display:inline-block"></div>
        <div id="allies-enemies-container" style="display:inline-block; width:90%">
            <div id="allies-display" style="width:45%; float:left"><strong style="font-size:120%">Top 5 Allies: </strong><br></div>
            <div id="enemies-display" style="width:45%; float:right"><strong style="font-size:120%">Top 5 Opponents: </strong><br></div>
        </div>
    </div>
</div>
<br>


## Event List

Using the icons present in the Quill platform, a timeline of events in the committee is built over the course of its sessions. Each line is a session occurring on a different day, over which a sequence of event icons are laid out. Events in which the person has participated are shown in higher opacity. By default, only sessions with at least one event participation from the person are shown.

<div class="panel panel-default">
    <div class="panel-heading panel-heading-height">
        <div class="pull-left">
            <h3 class="panel-title panel-title-size font-color">
                <strong>
                    <span id="committee-clicked-text"></span>:
                    <span id="no-of-sessions">0</span> sessions,
                    <span id="no-of-events">0</span> events.
                    <span id="event-list-person-name"> </span>
                     appears in <span id="no-of-events-participated">0</span> events.
                </strong>
            </h3>
            <!--<p>(Event timeline organized by sessions. Click on the event to view to the specific event page)</p>-->
        </div>
    </div>
    <div class="panel-body">
        <input type="checkbox" id="checkbox-events-disable-filter"> Show sessions without their participation <br><br>
        <div id="canvas-person-events-timeline" style="overflow: auto;"></div>
    </div>
</div>
<br>


## Voting Breakdown 

This display shows a breakdown of all voting and general decisions in the committee. Multiple decisions can be grouped into sessions, as they occurred in the same day. For each decision, the total of votes is displayed, according to each category: in favor, against, uncertain, or abstentions. The person's choice in each of these votes is highlighted. A second person can also be chosen to compare votes, which is shown below:

<!--<div class="panel panel-default">
    <div class="panel-heading panel-heading-height">
        <div class="pull-left">
            <h3 class="panel-title panel-title-size font-color"><strong>Compare votes</strong></h3>
            <p>Choose a person to compare to...</p>   
        </div>
    </div>
    <div class="panel-body">
        <select class="form-control" id="selector-person-comparison">
            <option value="-1" selected="selected">None</option>
        </select>
    </div>
</div>-->

<div class="panel panel-default">
    <div class="panel-heading panel-heading-height">
        <div class="pull-left">
            <h3 class="panel-title panel-title-size font-color">
                <strong>
                    <span id="voting-summary-person-name">Person</span>'s voting details on <span id="committee-clicked-text-voting"></span>
                </strong>
            </h3>
            <!--<p>(Voting breakdown per decision event. Click on the proposal name on the right to view to the specific event page)</p>-->
        </div>
    </div>
    <div class="panel-body">
        <input type="checkbox" id="checkbox-votes-disable-filter"> Show decisions without recorded votes <br><br>
        <div id="canvas-person-votes-in-committee" style="overflow-x: auto;"></div>
    </div>
</div>
<br>

<div style="text-align:right">These tools were designed and implemented by Gabriel Dias Cantareira, Yiwen Xing, and Alfie Abdul-Rahman at King's College London, and partially funded by a grant from Engineering and Physical Sciences Research Council (EP/V028871/1).</div>

<script type="text/javascript" src="person-visualize.js"></script>
