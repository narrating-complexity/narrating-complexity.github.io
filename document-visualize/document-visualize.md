---
layout: page
title: Tools for visualizing document records
---

<link href="document-visualize.css" rel="stylesheet">
<script src="lib/d3.v5.min.js"></script>
<script src="lib/jquery-3.6.0.min.js"></script>

This page contains a demo for an interface for visualizing document timelines and relationships between documents, applied to the U.S. Constitutional Convention 1787 (2019) dataset from the [Quill Project Database](https://www.quillproject.net/overview_3/114).
The interface consists of three components: a global dataset timeline view, a document timeline view, and a text view. 

This page shows visualziation components using a static sample of document + committee data from the dataset, namely one of the amended versions of the Virginia Plan discussed by the Committee of the Whole House. The Quill platform allows interactive selection and navigation between different documents, and can be seen [here](https://www.quillproject.net/document_visualize2/63571).

<br>

## Global Dataset Timeline

This component displays a timeline of the selected document in the context of other documents and sessions occurring in the convention dataset. 

<div id="first-row">
    <div id="global-timeline-panel">
        <div class="panel panel-default">
            <div class="panel-heading">
                <div class="panel-title" id="global-timeline-title">Global Timeline</div>
                <!--(Purple bar = accepted proposals, dashed bar = rejected proposals, yellow bar = pending proposals. Yellow icons = new documents created.)
                (Sessions related to selected document are shown opaque, other sessions are shown faded.) -->
                <input type="checkbox" id="cb-ov-hide" name="cb-ov-hide">
                <label for="cb-ov-hide"> hide overview </label><br>
            </div>
            <div class="panel-body">
                <div id="global-timeline-view" style="width:100%; display:inline-block;">
                </div>
            </div>
        </div>
    </div>
</div>

## Document Timeline

This component displays a local timeline for events pertaining a version of a document discussed by a given committee.

<div id="second-row">
    <div id="timeline-panel">
        <div class="panel panel-default">
            <div class="panel-heading">
                <div class="panel-title" id="timeline-title">Timeline</div>
                <input type="checkbox" id="cb-tl-collapse" name="cb-tl-collapse">
                <label for="cb-tl-collapse"> collapse sessions </label><br>
            </div>
            <div class="panel-body">
                <div id="timeline-view" style="width:100%; display:inline-block;">
                </div>
            </div>
        </div>
    </div>
</div>

<button id="button-reset-selection" type="button">Reset Selection</button>

## Document Text

This component contains four panels: related documents, a text viewer, and selection boxes for people and keywords.

<div id="third_row" style="display: table-row">
    <!-- Document relationships-->
    <div id="document-info-panel" style="width: 16%; display: table-cell">
        <div class="panel panel-default">
            <div class="panel-heading">
                <div class="panel-title">Relationships</div>
            </div>
            <div class="panel-body">
                <div id="document-info-view" style="overflow-y: scroll; height: 200px">
                        <div>
                            <div> Ancestor Line </div>
                            <table class="table table-condensed" id="table-doc-ancestors"> 
                                <tbody></tbody>
                            </table>
                        </div>
                        <div>
                            <div> Descendants </div>
                            <table class="table table-condensed" id="table-doc-children"> 
                                <tbody></tbody>
                            </table>
                        </div>
                        <div>
                            <div> Imports </div>
                            <table class="table table-condensed" id="table-doc-imports"> 
                                <tbody></tbody>
                            </table>
                        </div>
                        <div>
                            <div> Outcomes </div>
                            <table class="table table-condensed" id="table-doc-outcomes"> 
                                <tbody></tbody>
                            </table>
                        </div>
                </div>
            </div>
        </div>
    </div>
    <!-- Text viewer -->
    <div id="document-text-panel" style="width:50%; display: table-cell">
        <div class="panel panel-default">
            <div class="panel-heading">
                <div class="panel-title" id="document-text-title">Text viewer</div>
                <input type="checkbox" id="checkbox-hide-deletions"> Hide removed text
                <input type="checkbox" id="checkbox-hide-evids"> Hide event references
            </div>
            <div class="panel-body">
                <div id="document-text-view" style="overflow-y: scroll; height: 180px">
                </div>
            </div>
        </div>
    </div>
    <!-- People list -->
    <div id="related-people-panel" style="width:16%; display: table-cell">
        <div class="panel panel-default">
            <div class="panel-heading">
                <div class="panel-title">People</div>
            </div>
            <div class="panel-body">
                <div id="related-people-view" style="overflow-y: scroll; height: 200px">
                </div>
            </div>
        </div>
    </div>
    <!-- Keywords and topics -->
    <div id="keywords-panel" style="width:16%; display: table-cell">
        <div class="panel panel-default">
            <div class="panel-heading">
                <div class="panel-title">Keywords</div>
            </div>
            <div class="panel-body">
                <div id="keywords-view" style="overflow-y: scroll; height: 200px">
                </div>
            </div>
        </div>
    </div>

</div>

<br>

These tools were designed and implemented by Gabriel Dias Cantareira, Yiwen Xing, and Alfie Abdul-Rahman at King's College London, and partially funded by a grant from Engineering and Physical Sciences Research Council (EP/V028871/1).

<script type="text/javascript" src="document-visualize.js"></script>
