/**
 * Created by gabrieldc on 14/08/2022.
 */

class selectionRect{
    element	= null;
    previousElement = null;
    currentY = 0;
    currentX = 0;
    originX	= 0;
    originY	= 0;
    stype = '';

    constructor(stype){
        if (stype == 0) this.stype = "selection0";
        else this.stype = "selection1";
    }

    init(newX, newY) {
        var rectElement = projectionDashboard.variables.tl_selectionRectLayer.append("rect")
            .attr("class",this.stype)
            .attr("rx",4)
            .attr("ry",4)
            .attr("x",0)
            .attr("y",projectionDashboard.variables.svgMarginY)
            .attr("width",0)
            .attr("height",projectionDashboard.variables.tl_height-(projectionDashboard.variables.svgMarginY*2))
            .on("click",function(){this.remove();});
        this.setElement(rectElement);
        this.originX = newX;
        this.originY = newY;
        this.update(newX, newY);
    }

    setElement(ele) {
        this.previousElement = this.element;
        this.element = ele;
    }

    getNewAttributes() {
        var x = this.currentX<this.originX?this.currentX:this.originX;
        var y = this.currentY<this.originY?this.currentY:this.originY;
        var width = Math.abs(this.currentX - this.originX);
        var height = Math.abs(this.currentY - this.originY);
        return {
            x       : x,
            y       : y,
            width  	: width,
            height  : height
        };
    }

    getCurrentAttributes() {
        var x = +this.element.attr("x");
        var y = +this.element.attr("y");
        var width = +this.element.attr("width");
        var height = +this.element.attr("height");
        return {
            x1  : x,
            y1	: y,
            x2  : x + width,
            y2  : y + height
        };
    }

    update(newX, newY) {
        this.currentX = newX;
        this.currentY = newY;
        var newAttributes = this.getNewAttributes();
        this.element.attr("x",newAttributes.x);
        this.element.attr("width",newAttributes.width);
    }

    remove() {
        this.element.remove();
        this.element = null;
    }

    removePrevious() {
        if(this.previousElement) {
            this.previousElement.remove();
        }
    }
    
    //dragging behavior based on http://bl.ocks.org/paradite/71869a0f30592ade5246
}

var projectionDashboard = {};

projectionDashboard.variables = {
    //tl = timeline, sp = scatterplot, ct = chart
    tl_width : document.getElementById("timeline-svg").parentElement.clientWidth,
    tl_height : 300,
    tl_dotRadius : 4,
    tl_dotColor0 : "steelblue",
    tl_dotColor1 : "tomato",
    tl_dotColor2 : "darkgrey",
    tl_dotColor3 : "lightgrey",

    sp_width : document.getElementById("scatterplot-svg").parentElement.clientWidth,
    sp_height : document.getElementById("scatterplot-svg").parentElement.clientWidth*(4/5),
    sp_dotRadius : 4,
    sp_mainProjColor : "#40404077",
    sp_ghostProjColor : "#CA002066",
    sp_inverseProjColor : "steelblue",
    sp_transitionColor : "rgba(0,0,0,0.3)",

    ct_width : document.getElementById("charts-svg").parentElement.clientWidth,
    ct_height : 300,
    ct_dotRadius : 4,
    ct_color0 : "steelblue",
    ct_color1 : "tomato",

    svgMarginX : 60,
    svgMarginY : 30,


    conventionId: -1,

    rawData : null,
    votingdata : null,
    sessions: null,
    committees: null,
    documents: null,

    votematrix: null,
    votematrix_ppl: null,
    votematrix_dlg: null,
    votematrixslice0: null,
    votematrixslice1: null,
    sliceIndexes0 : null,
    sliceIndexes1 : null,

    chartData : null,

    tl_svg : null,
    tl_scaleX : null,
    tl_currentScaleX : null,
    tl_axis : null,
    tl_selectionSessions : null,
    tl_selectionDecisions : null,

    tl_selectionRectLayer : null,
    tl_interaction : null,
    tl_dragBehavior : null,
    tl_navBehavior : null,
    tl_currentZoom : null,
    tl_previousZoom : null,
    tl_currentScaleX : null,
    tl_selectedDecisions : null,

    sessionfilter : null,
    decisionfilter : null,

    tl_selRectT0 : new selectionRect(0),
    tl_selRectT1 : new selectionRect(1),
    activeRect : null,
    activeDateWindow : null,
    dateWindowT0 : [],
    dateWindowT1 : [],

    proj0 : null,
    proj1 : null,
    proj0indexes : null,
    proj1indexes : null,

    iproj0 : null,

    sp_showArrows : true,
    sp_svg : null,
    sp_xmax : null,
    sp_xmin : null,
    sp_ymax : null,
    sp_ymin : null,
    sp_scaleX : null,
    sp_scaleY : null,
    sp_currentScaleX: null,
    sp_currentScaleY: null,
    sp_transitionScale: null,
    sp_axisX : null,
    sp_axisY : null,
    sp_gridX : null, 
    sp_gridY : null,
    sp_selectionProj0 : null,
    sp_selectionProj1 : null,
    sp_selectionTransitions : null,

    sp_selectionProj0Inverse : null,
    sp_iScaleX : null,
    sp_iScaleY : null,
    sp_ciScaleX : null,
    sp_ciScaleY : null,
    sp_ilimits : null,

    sp_navBehavior : null,
    sp_tCoords : null,
    sp_transitionLengths : null,
    sp_maxTransition : 0,
    sp_minTransition: 0,
    sp_currentZoom : null,   
    sp_previousZoom : null,  

    ct_svg : null,
    ct_scaleX : null,
    ct_chart0ScaleY : null,
    ct_chart1ScaleY : null,

    isScatterplotActive : false,
    isSingleProjection : true,
};

projectionDashboard.elements = {
    //tl = timeline, sp = scatterplot, ct = chart
    //s = selector, c = checkbox
    tl_sPersonDelegation : document.getElementById("selector-person-delegation"),
    tl_sCommittee : document.getElementById("selector-committee"),
    tl_sDocument : document.getElementById("selector-document"),
    sp_sDisplay : document.getElementById("selector-projection-display"),
    sp_sThreshold : document.getElementById("slider-movement-threshold"),
    sp_cHideDots : document.getElementById("checkbox-hide-dots"),
    sp_showProj1 : document.getElementById("checkbox-show-proj1"),
    ct_sC0Type : document.getElementById("selector-chart0-type"),
    ct_sC0Order : document.getElementById("selector-chart0-order"),
    ct_sC1Type : document.getElementById("selector-chart1-type"),
    ct_sC1Order : document.getElementById("selector-chart1-order"),
    ct_cShowC1 : document.getElementById("checkbox-show-chart1"),
    tl_cOperatorNav : document.getElementById("checkbox-timeline-operator-nav"),
    tl_cOperatorST0 : document.getElementById("checkbox-timeline-operator-st0"),
    tl_cOperatorST1 : document.getElementById("checkbox-timeline-operator-st1"),

    //decisionTooltip : null,
    //voterTooltip : null,
    focusFilter : null
}

projectionDashboard.prototype = {
    init: function() {
        var conventionId = window.location.href;
        conventionId = conventionId.slice(conventionId.lastIndexOf('/') + 1);
        projectionDashboard.variables.conventionId = conventionId;
        projectionDashboard.prototype.firstLoad();
    },

    firstLoad: function() {
        projectionDashboard.prototype.setupInputs();
        projectionDashboard.prototype.getProjectionData();
        //projectionDashboard.prototype.windowResized();
    },

    getProjectionData: function() {
        d3.json('data/votes_143_full.json').then(function(d){
            projectionDashboard.variables.rawData = d;
            projectionDashboard.prototype.setupTimeline();
        });
    },

    //set up the effects of all interaction elements outside of svgs (pressing buttons, changing selections, etc)
    setupInputs: function() {
        
        function tl_sPersonDelegationChanged(){
            projectionDashboard.prototype.updateTimelineVoteTypes();
        }
        projectionDashboard.elements.tl_sPersonDelegation.onchange = tl_sPersonDelegationChanged;
        
        function tl_sCommitteeChanged(){
            projectionDashboard.prototype.updateTimelineVisibility();
        };
        projectionDashboard.elements.tl_sCommittee.onchange = tl_sCommitteeChanged;
        
        function tl_sDocumentChanged(){
            projectionDashboard.prototype.updateTimelineVisibility();
        };
        projectionDashboard.elements.tl_sDocument.onchange = tl_sDocumentChanged;

        function tl_cOperatorNavChanged(){
            if (projectionDashboard.elements.tl_cOperatorNav.checked = true) {
                projectionDashboard.variables.tl_interaction.selectAll("*").style("pointer-events", "none");
                projectionDashboard.variables.tl_interaction.select("#timeline-nav").style("pointer-events", "all");
            }
        }
        projectionDashboard.elements.tl_cOperatorNav.onclick = tl_cOperatorNavChanged;
        projectionDashboard.elements.tl_cOperatorNav.checked = true;
    
        function tl_cOperatorST0Changed(){
            if (projectionDashboard.elements.tl_cOperatorST0.checked = true) {
                projectionDashboard.variables.tl_interaction.selectAll("*").style("pointer-events", "none");
                projectionDashboard.variables.tl_interaction.select("#timeline-drag").style("pointer-events", "all");
                projectionDashboard.variables.activeRect = projectionDashboard.variables.tl_selRectT0;
            }
        }
        projectionDashboard.elements.tl_cOperatorST0.onclick = tl_cOperatorST0Changed;

        function tl_cOperatorST1Changed(){
            if (projectionDashboard.elements.tl_cOperatorST1.checked = true) {
                projectionDashboard.variables.tl_interaction.selectAll("*").style("pointer-events", "none");
                projectionDashboard.variables.tl_interaction.select("#timeline-drag").style("pointer-events", "all");
                projectionDashboard.variables.activeRect = projectionDashboard.variables.tl_selRectT1;
            }
        }
        projectionDashboard.elements.tl_cOperatorST1.onclick = tl_cOperatorST1Changed;


        function sp_sDisplayChanged(){
            if (projectionDashboard.elements.sp_sDisplay.selectedIndex == 0) {
                if (projectionDashboard.variables.isSingleProjection) {
                    projectionDashboard.elements.sp_showProj1.disabled = false;
                    sp_showProj1Changed();
                }
            }
            else {
                projectionDashboard.elements.sp_showProj1.disabled = true;
                projectionDashboard.elements.sp_cHideDots.disabled = true;
                projectionDashboard.elements.sp_sThreshold.disabled = true;
            }
            projectionDashboard.prototype.updateScatterplotVisibility();
        }
        projectionDashboard.elements.sp_sDisplay.onchange = sp_sDisplayChanged;
        projectionDashboard.elements.sp_sDisplay.selectedIndex = 0;
        projectionDashboard.elements.sp_sDisplay.disabled = true;

        function sp_sThresholdChanged(){
            projectionDashboard.prototype.updateScatterplotVisibility();
        }
        projectionDashboard.elements.sp_sThreshold.onchange = sp_sThresholdChanged;
        projectionDashboard.elements.sp_sThreshold.disabled = true;
        
        function sp_cHideDotsChanged(){
            projectionDashboard.prototype.updateScatterplotVisibility();
        }
        projectionDashboard.elements.sp_cHideDots.onchange = sp_cHideDotsChanged;
        projectionDashboard.elements.sp_cHideDots.disabled = true;
        
        function sp_showProj1Changed(){
            if (!projectionDashboard.elements.sp_showProj1.checked){
                d3.select("#proj0").selectAll("circle").attr("visibility","visible");
                d3.select("#proj1").selectAll("circle").attr("visibility","hidden");
                d3.select("#transitions").selectAll("line").attr("visibility","hidden");
                projectionDashboard.elements.sp_cHideDots.disabled = true;
                projectionDashboard.elements.sp_sThreshold.disabled = true;
            }
            else{
                projectionDashboard.prototype.updateScatterplotVisibility();
                projectionDashboard.elements.sp_cHideDots.disabled = false;
                projectionDashboard.elements.sp_sThreshold.disabled = false;
            }
        }
        projectionDashboard.elements.sp_showProj1.onchange = sp_showProj1Changed; 
        projectionDashboard.elements.sp_showProj1.disabled = true;
        

        function ct_sC0sChanged(){
            projectionDashboard.elements.ct_cShowC1.checked = false;
            projectionDashboard.elements.ct_sC1Type.disabled = true;
            projectionDashboard.elements.ct_sC1Order.disabled = true;
            projectionDashboard.prototype.drawChart0(projectionDashboard.variables.chartData[projectionDashboard.elements.ct_sC0Order.selectedIndex][projectionDashboard.elements.ct_sC0Type.selectedIndex]);
        }
        projectionDashboard.elements.ct_sC0Type.onchange = ct_sC0sChanged;
        projectionDashboard.elements.ct_sC0Order.onchange = ct_sC0sChanged;
        
        function ct_sC1sChanged(){
            projectionDashboard.prototype.drawChart1(projectionDashboard.variables.chartData[projectionDashboard.elements.ct_sC1Order.selectedIndex][projectionDashboard.elements.ct_sC1Type.selectedIndex]);
        }
        projectionDashboard.elements.ct_sC1Type.onchange = ct_sC1sChanged;
        projectionDashboard.elements.ct_sC1Order.onchange = ct_sC1sChanged;
        
        //still need to check for errors here
        function ct_cShowC1Changed(){
            if (projectionDashboard.elements.ct_cShowC1.checked){
                projectionDashboard.elements.ct_sC1Type.disabled = false;
                projectionDashboard.elements.ct_sC1Order.disabled = false;
                projectionDashboard.prototype.drawChart1(projectionDashboard.variables.chartData[projectionDashboard.elements.ct_sC1Order.selectedIndex][projectionDashboard.elements.ct_sC1Type.selectedIndex]);
            }
            else {
                projectionDashboard.elements.ct_sC1Type.disabled = true;
                projectionDashboard.elements.ct_sC1Order.disabled = true;
                projectionDashboard.prototype.drawChart1(null);
            }
        }
        projectionDashboard.elements.ct_cShowC1.onchange = ct_cShowC1Changed;

        projectionDashboard.prototype.disableChartInteraction(true);
        
        
        //projectionDashboard.elements.decisionTooltip = d3.select("body").append("div").attr("class","decision-tooltip").attr("hidden","true").style("opacity",0);
        //projectionDashboard.elements.voterTooltip = d3.select("body").append("div").attr("class","voter-tooltip").attr("hidden","true").style("opacity",0);


        d3.select("body").append("div").attr("id","focus-filter").attr("hidden","true").style("left", "0px").style("top", "0px");
        projectionDashboard.elements.focusFilter = document.getElementById("focus-filter");
        function clickAway(){
            d3.select("#focus-filter")
                .attr("hidden","true")
                .selectAll("div").remove();
        }
        projectionDashboard.elements.focusFilter.onclick = clickAway;


        function projectButtonClicked(){

            var pdselection = projectionDashboard.elements.tl_sPersonDelegation.options[projectionDashboard.elements.tl_sPersonDelegation.selectedIndex].value;
            if (pdselection == "individual") {
                projectionDashboard.variables.votematrix = projectionDashboard.variables.votematrix_ppl;
                projectionDashboard.variables.votingdata.votes = projectionDashboard.variables.votingdata.votes_ppl;
                projectionDashboard.variables.votingdata.voter_names = projectionDashboard.variables.votingdata.person_names;
                projectionDashboard.variables.votingdata.voter_ids = projectionDashboard.variables.votingdata.person_ids;
            }
            else {
                projectionDashboard.variables.votematrix = projectionDashboard.variables.votematrix_dlg;
                projectionDashboard.variables.votingdata.votes = projectionDashboard.variables.votingdata.votes_ppl;
                projectionDashboard.variables.votingdata.voter_names = projectionDashboard.variables.votingdata.delegation_names;
                projectionDashboard.variables.votingdata.voter_ids = projectionDashboard.variables.votingdata.delegation_ids;
            }

            if (projectionDashboard.variables.tl_selRectT0.element == null){
                window.alert("Please select a sample with two or more valid votes for visualization");
                return;
            }
        
            projectionDashboard.variables.sliceIndexes0 = projectionDashboard.prototype.getDecisionIndexesByDate(projectionDashboard.variables.dateWindowT0);
            projectionDashboard.variables.votematrixslice0 = projectionDashboard.variables.votematrix.selection(d3.range(0,projectionDashboard.variables.votematrix.rows),projectionDashboard.variables.sliceIndexes0);

            if (projectionDashboard.variables.sliceIndexes0.length < 2) {
                window.alert("Please select a sample with two or more valid votes for visualization");
                return;
            }
        
            var tproj0 = projectionDashboard.prototype.generatePCA(projectionDashboard.variables.votematrixslice0);
            projectionDashboard.variables.iproj0 = projectionDashboard.prototype.generatePCA(projectionDashboard.variables.votematrixslice0.transpose());
            projectionDashboard.variables.iproj0.projection = projectionDashboard.variables.iproj0.projection.to2DArray();

            if (projectionDashboard.variables.tl_selRectT1.element != null){
                projectionDashboard.elements.sp_showProj1.disabled = false;
                projectionDashboard.elements.sp_showProj1.checked = false;

                projectionDashboard.elements.sp_sThreshold.disabled = true;
                projectionDashboard.elements.sp_cHideDots.disabled = true;
                
                projectionDashboard.elements.sp_sThreshold.value = 0;
                projectionDashboard.elements.sp_cHideDots.checked = false;
        
                projectionDashboard.variables.sliceIndexes1 = projectionDashboard.prototype.getDecisionIndexesByDate(projectionDashboard.variables.dateWindowT1);
                projectionDashboard.variables.votematrixslice1 = projectionDashboard.variables.votematrix.selection(d3.range(0,projectionDashboard.variables.votematrix.rows),projectionDashboard.variables.sliceIndexes1);
                
                if (projectionDashboard.variables.sliceIndexes1.length < 2) {
                    window.alert("The selected comparison sample is empty");
                    return;
                }
                
                var tproj1 = projectionDashboard.prototype.generatePCA(projectionDashboard.variables.votematrixslice1);
        
                var proc = projectionDashboard.prototype.procrustes(tproj0.projection,tproj1.projection);
                tproj0.projection = proc[0].to2DArray();
                tproj1.projection = proc[1].to2DArray();
                projectionDashboard.variables.proj0 = tproj0;
                projectionDashboard.variables.proj1 = tproj1;
        
                projectionDashboard.prototype.setupScatterplot();
            }
        
            else {
                projectionDashboard.elements.sp_sThreshold.disabled = true;
                projectionDashboard.elements.sp_cHideDots.disabled = true;
                projectionDashboard.elements.sp_showProj1.disabled = true;
        
                tproj0.projection = tproj0.projection.to2DArray();
                projectionDashboard.variables.proj0 = tproj0;
        
                projectionDashboard.prototype.setupScatterplotSingle();
            }

            projectionDashboard.variables.isScatterplotActive = true;
            projectionDashboard.elements.sp_sDisplay.disabled = false;
            projectionDashboard.prototype.disableChartInteraction(false);
        };
        document.getElementById("button-project").onclick = projectButtonClicked;

    },

    disableChartInteraction : function(disable) {
        projectionDashboard.elements.ct_sC0Type.disabled = disable;
        projectionDashboard.elements.ct_sC0Order.disabled = disable;
        projectionDashboard.elements.ct_sC1Type.disabled = disable;
        projectionDashboard.elements.ct_sC1Order.disabled = disable;
        projectionDashboard.elements.ct_cShowC1.disabled = disable;
    },

    //set up data and svgs to display the timeline
    setupTimeline: function() {
        projectionDashboard.variables.votingdata = projectionDashboard.variables.rawData.voting_data;
        projectionDashboard.variables.sessions = projectionDashboard.variables.rawData.sessions;
        projectionDashboard.variables.committees = projectionDashboard.variables.rawData.committees;
    
        projectionDashboard.variables.votematrix_ppl = new ML.Matrix(projectionDashboard.variables.votingdata.votes_ppl);
        projectionDashboard.variables.votematrix_dlg = new ML.Matrix(projectionDashboard.variables.votingdata.votes_dlg);
    
        projectionDashboard.variables.documents = d3.map(projectionDashboard.variables.votingdata.decision_details, function(d){return d.document_id;}).keys();
    
        d3.select("#selector-committee").selectAll(".extra")
            .data(projectionDashboard.variables.committees)
            .join("option")
                .html(function(d){return d.name;})
                .attr("value",function(d){return d.id;});
    
        d3.select("#selector-document").selectAll(".extra")
            .data(projectionDashboard.variables.documents)
            .join("option")
                .html(function(d){return d;})
                .attr("value",function(d){return d;});
        
        //This would probably be easier to get done in the python backend before sending the json, but here we are...
        //It would also be better to rework the data structure as to only keep track of votes for decisions with 
        //non zero lines; it's less pointless data to be sent by the server
        projectionDashboard.variables.votingdata.decision_details.map(function(d,di){
            d['total_votes'] = projectionDashboard.variables.votingdata.votes_ppl.reduce(function(acc,v){
                if (v[di] > 0) return acc+v[di];
                else return acc-v[di];
            },0);
            d['total_votes_dlg'] = projectionDashboard.variables.votingdata.votes_dlg.reduce(function(acc,v){
                if (v[di] > 0) return acc+v[di];
                else return acc-v[di];
            },0);
        });
    
        projectionDashboard.variables.sessions.sort((a,b)=>{return (Date.parse(a.date) > Date.parse(b.date));})
    
        //making a small list of decisions per session for quick access. The contents of the array are just the
        //relevant indexes from the decision_ids array on votingdata
        projectionDashboard.variables.sessions.map(function(d,di){
            d['decisions'] = projectionDashboard.variables.votingdata.decision_details.map(function(v,vi){
                if (v.session_id == d.id) return vi; else return -1;
            })
                .filter(function(v,vi){return (v>-1);})
                .sort(function(a,b){return (projectionDashboard.variables.votingdata.decision_ids[a]>projectionDashboard.variables.votingdata.decision_ids[b]);});
    
            //average amount of non-zero votes per decision
            /*d['total_votes'] = (d.decisions.length < 1) ? 0 :
                d.decisions.reduce(function(acc,v){
                    return acc+projectionDashboard.variables.votingdata.decision_details[v].total_votes;
                },0) / d.decisions.length;

            d['total_votes_dlg'] = (d.decisions.length < 1) ? 0 :
                d.decisions.reduce(function(acc,v){
                    return acc+projectionDashboard.variables.votingdata.decision_details[v].total_votes_dlg;
                },0) / d.decisions.length;*/
        });

        projectionDashboard.prototype.drawTimeline();

    },

    //redraw timeline and reset svg
    drawTimeline : function(){
        //this assumes voting data has been previously ordered
        var maxdate = Date.parse(projectionDashboard.variables.votingdata.decision_details[projectionDashboard.variables.votingdata.decision_details.length-1].session_date);
        var mindate = Date.parse(projectionDashboard.variables.votingdata.decision_details[0].session_date);
        projectionDashboard.variables.tl_scaleX = d3.scaleTime()
            .domain([mindate,maxdate])
            .range([projectionDashboard.variables.svgMarginX,projectionDashboard.variables.tl_width-projectionDashboard.variables.svgMarginX]);
        projectionDashboard.variables.tl_currentScaleX = d3.scaleTime()
            .domain([mindate,maxdate])
            .range([projectionDashboard.variables.svgMarginX,projectionDashboard.variables.tl_width-projectionDashboard.variables.svgMarginX]);
            //TODO: there's a smarter way of initializing currentscaleX
    
        projectionDashboard.variables.tl_svg = d3.select("#timeline-svg")
            .attr("width",projectionDashboard.variables.tl_width)
            .attr("height",projectionDashboard.variables.tl_height);

        projectionDashboard.variables.tl_svg.selectAll("*").remove();

        /*projectionDashboard.variables.tl_svg.append("defs").append("clipPath")
            .attr("id","timeline-clip")
            .append("rect")     
                .attr("x",projectionDashboard.variables.svgMarginX)
                .attr("y",projectionDashboard.variables.svgMarginY)
                .attr("width",projectionDashboard.variables.tl_width-projectionDashboard.variables.svgMarginX*2)
                .attr("height",projectionDashboard.variables.tl_height-projectionDashboard.variables.svgMarginY*2);*/

                /*.attr("clip-path","url(#timeline-clip)")*/
    
        projectionDashboard.variables.tl_axis = projectionDashboard.variables.tl_svg.append("g")
            .attr("transform", "translate(0," + (projectionDashboard.variables.tl_height-projectionDashboard.variables.svgMarginY) + ")")
            .call(d3.axisBottom(projectionDashboard.variables.tl_scaleX));
    
        projectionDashboard.variables.tl_interaction = projectionDashboard.variables.tl_svg.append("g");
        projectionDashboard.prototype.setupTimelineSelectionBehavior();
        projectionDashboard.prototype.setupTimelineNavigationBehavior();
    
        projectionDashboard.variables.tl_selectionSessions = projectionDashboard.variables.tl_svg.append("g")
            .attr("id","timeline-sessions")
            .selectAll("g")
            .data(projectionDashboard.variables.sessions)
            .join("g")
    
        projectionDashboard.variables.tl_selectionDecisions = projectionDashboard.variables.tl_selectionSessions.selectAll("circle")
            .data(function(d,di){return d.decisions;})
            .join("circle")
                .attr("cx", function(d,di){return projectionDashboard.variables.tl_scaleX(Date.parse(projectionDashboard.variables.votingdata.decision_details[d].session_date));})
                .attr("cy", function(d,di){return projectionDashboard.variables.tl_height-(projectionDashboard.variables.svgMarginY+14)-(di*10);})
                .attr("r", projectionDashboard.variables.tl_dotRadius)
                .style("fill", function(d,di){
                    //if (projectionDashboard.variables.votingdata.decision_details[d].total_votes > 0) return projectionDashboard.variables.tl_dotColor0;
                    if (projectionDashboard.prototype.getVoteByType(projectionDashboard.variables.votingdata.decision_details[d]) > 0) return projectionDashboard.variables.tl_dotColor0;
                    else if (projectionDashboard.variables.votingdata.decision_details[d].anonymous) return projectionDashboard.variables.tl_dotColor2;
                    else return projectionDashboard.variables.tl_dotColor3;
                })
                .on("mouseover",projectionDashboard.prototype.mouseOverTLDecision)
                .on("mouseout",projectionDashboard.prototype.mouseOverTLDecisionOut)
                .on("click",projectionDashboard.prototype.clickTLDecision);
    
        projectionDashboard.variables.tl_selectionSessions.append("circle")
            .attr("cx", function(d,di){return projectionDashboard.variables.tl_scaleX(Date.parse(d.date));})
            .attr("cy", projectionDashboard.variables.tl_height-(projectionDashboard.variables.svgMarginY+4))
            .attr("r", projectionDashboard.variables.tl_dotRadius)
            .style("fill", projectionDashboard.variables.tl_dotColor1)
            .on("mouseover",projectionDashboard.prototype.mouseOverTLSession)
            .on("mouseout",projectionDashboard.prototype.mouseOverTLSessionOut)
            .on("click",projectionDashboard.prototype.clickTLSession);

        projectionDashboard.variables.tl_selectionRectLayer = projectionDashboard.variables.tl_svg.append("g");

        projectionDashboard.prototype.drawTimelineNavControls();
    
        projectionDashboard.prototype.updateTimelineVisibility();
    },

    //buttons to control zooming and panning
    //uses many hardcoded coordinates but they are always drawn at the same spot
    drawTimelineNavControls : function() {
        var navigationButtons = projectionDashboard.variables.tl_svg.append("g")
            .attr("class","svg-navigation-button");

        var plusButton = navigationButtons.append("g")
            .on("click",function(){d3.select("#timeline-nav").transition().call(projectionDashboard.variables.tl_navBehavior.scaleBy,2.0);});
        plusButton.append("circle")
            .attr("cx", projectionDashboard.variables.tl_width-projectionDashboard.variables.svgMarginX-132)
            .attr("cy", projectionDashboard.variables.svgMarginY+20)
            .attr("r",15);
        plusButton.append("text")
            .attr("x",projectionDashboard.variables.tl_width-projectionDashboard.variables.svgMarginX-138)
            .attr("y",55).attr("font-size",18)
            .attr("fill","black")
            .text("+")
            .attr("pointer-events","none");
            
        var minusButton = navigationButtons.append("g")
            .on("click",function(){d3.select("#timeline-nav").transition().call(projectionDashboard.variables.tl_navBehavior.scaleBy,0.5);});
        minusButton.append("circle")
            .attr("cx", projectionDashboard.variables.tl_width-projectionDashboard.variables.svgMarginX-96)
            .attr("cy", projectionDashboard.variables.svgMarginY+20)
            .attr("r",15);
        minusButton.append("text")
            .attr("x",projectionDashboard.variables.tl_width-projectionDashboard.variables.svgMarginX-99)
            .attr("y",55)
            .attr("font-size",18)
            .attr("fill","black")
            .text("-")
            .attr("pointer-events","none");

        var resetButton = navigationButtons.append("g")
            .on("click",function(){projectionDashboard.prototype.tl_resetZoom();});
        resetButton.append("rect")
            .attr("x", projectionDashboard.variables.tl_width-projectionDashboard.variables.svgMarginX-75)
            .attr("y", projectionDashboard.variables.svgMarginY+5)
            .attr("rx",15)
            .attr("ry",15)
            .attr("width",60)
            .attr("height",30);    
        resetButton.append("text")
            .attr("x",projectionDashboard.variables.tl_width-projectionDashboard.variables.svgMarginX-62)
            .attr("y",53)
            .attr("fill","black")
            .text("reset")
            .attr("pointer-events","none");
    },

    //extra function added to allow switching between delegation and individual total votes for each decision on the fly;
    //adding this check to every draw call for decisions may not be a good idea.
    getVoteByType : function(decision){
        if (projectionDashboard.elements.tl_sPersonDelegation.options[projectionDashboard.elements.tl_sPersonDelegation.selectedIndex].value == 'individual')
            return decision.total_votes;
        else return decision.total_votes_dlg;
    },

    //updates the color for each timeline dot according to the total number of votes computed
    updateTimelineVoteTypes : function(){
        projectionDashboard.variables.tl_selectionDecisions.style("fill", function(d,di){
            if (projectionDashboard.prototype.getVoteByType(projectionDashboard.variables.votingdata.decision_details[d]) > 0) return projectionDashboard.variables.tl_dotColor0;
            else if (projectionDashboard.variables.votingdata.decision_details[d].anonymous) return projectionDashboard.variables.tl_dotColor2;
            else return projectionDashboard.variables.tl_dotColor3;
        });
    },

    //utility function to write on d3.attr(). Returns 'hidden' or 'visible' for a boolean variable
    getHidden : function(value){
        if (value) return "hidden";
        else return "visible";
    },

    //filter sessions to be hidden/visible according to selection of committee and document
    filterSessions: function(){
        var cmtselection = projectionDashboard.elements.tl_sCommittee.options[projectionDashboard.elements.tl_sCommittee.selectedIndex].value;
        return projectionDashboard.variables.sessions.map(function(d,di){
            if (((cmtselection == -1) || (cmtselection == d.committee_id)) && (d.decisions.length>0)) return true;
            else return false;
        });
    },

    //filter decisions to be hidden/visible according to selection of committee and document
    //does not really need to check for committees again but some redundancy would be good here
    filterDecisions: function(){
        var cmtselection = projectionDashboard.elements.tl_sCommittee.options[projectionDashboard.elements.tl_sCommittee.selectedIndex].value;
        var docselection = projectionDashboard.elements.tl_sDocument.options[projectionDashboard.elements.tl_sDocument.selectedIndex].value;
        return projectionDashboard.variables.votingdata.decision_details.map(function(d,di){
            if (((cmtselection == -1) || (cmtselection == d.committee_id)) && ((docselection == -1) || (docselection == d.document_id))) return true;
            //the cmt and doc selections != -1 can be done just once before the map function is called, but I don't know if the performance improvement is worth the trouble
            else return false;
        });
    },

    //update visibility of everything on the timeline according to selected options
    updateTimelineVisibility: function(){
        projectionDashboard.variables.sessionfilter = projectionDashboard.prototype.filterSessions();
        projectionDashboard.variables.decisionfilter = projectionDashboard.prototype.filterDecisions();
        projectionDashboard.variables.tl_selectionSessions.attr("visibility",function(d,di){return projectionDashboard.prototype.getHidden(!projectionDashboard.variables.sessionfilter[di]);});
        projectionDashboard.variables.tl_selectionDecisions.attr("visibility",function(d){return projectionDashboard.prototype.getHidden(!projectionDashboard.variables.decisionfilter[d]);});
    },

    //effect of hovering cursor over decisions on the timeline
    //contents of the description box are defined here
    mouseOverTLDecision: function(d,i){
        var rect = this.getBoundingClientRect();
        var box = d3.select("body").append("div")
            .attr("class","decision-tooltip")
            .style("left", (rect.left+rect.width)+"px")
            .style("top", (rect.top+rect.height)+"px")
            .style("opacity",0);
        /*var box = d3.select(".decision-tooltip")
            .style("left", (rect.left+rect.width)+"px")
            .style("top", (rect.top+rect.height)+"px")
            .attr("hidden",null);*/
    
        box.append("p")
        .style("margin","5px")
        .style("font-size", "14px")
        .text("Decision "+projectionDashboard.variables.votingdata.decision_ids[d]);

        box.append("p")
        .style("margin","5px")
        .style("font-size", "12px")
        .text(projectionDashboard.variables.votingdata.decision_details[d].proposal_name);
        
        box.append("p")
        .style("margin","5px")
        .style("font-size", "12px")
        .text("Date: "+projectionDashboard.variables.votingdata.decision_details[d].session_date);
    
        box.append("p")
        .style("margin","5px")
        .style("font-size", "12px")
        .text("Committee: "+projectionDashboard.variables.committees.find(c => c.id == projectionDashboard.variables.votingdata.decision_details[d].committee_id).name);
    
        box.append("p")
        .style("margin","5px")
        .style("font-size", "12px")
        .text("Number of non-zero votes: "+projectionDashboard.prototype.getVoteByType(projectionDashboard.variables.votingdata.decision_details[d]));

        box.append("p")
        .style("margin","5px")
        .style("font-size", "12px")
        .text("Anonymous voting: "+(projectionDashboard.variables.votingdata.decision_details[d].anonymous? "Yes" : "No"));
    
        box.append("p")
        .style("margin","5px")
        .style("font-size", "12px")
        .text("Decision Type: "+projectionDashboard.variables.votingdata.decision_details[d].type);
    
        box.transition()
            .duration(100)
            .style('opacity', .9);

        d3.select(this).attr("r",projectionDashboard.variables.tl_dotRadius*1.75);
    },
    
    //effect of moving cursor away from decisions on the timeline
    mouseOverTLDecisionOut: function(d,i){
        d3.select(this).attr("r",projectionDashboard.variables.tl_dotRadius);

        /*d3.selectAll(".decision-tooltip").transition()
            .duration(500)
            .style("opacity",0)
            .attr("hidden","true");*/
            
        d3.selectAll(".decision-tooltip").transition()
            .duration(100)
            .style("opacity",0)
            .remove();
    },
    
    //effect of moving cursor over sessions on the timeline
    //contents of the description box are defined here
    mouseOverTLSession: function(d,i){
        var rect = this.getBoundingClientRect();
        var box = d3.select("body").append("div")
            .attr("class","session-tooltip")
            .style("left", (rect.left+rect.width)+"px")
            .style("top", (rect.top+rect.height)+"px")
            .style("opacity",0);
    
        box.append("p")
        .style("margin","5px")
        .style("font-size", "14px")
        .text("Session "+projectionDashboard.variables.sessions[i].id);
        
        box.append("p")
        .style("margin","5px")
        .style("font-size", "12px")
        .text("Date: "+d.date);
    
        box.append("p")
        .style("margin","5px")
        .style("font-size", "12px")
        .text("Committee: "+projectionDashboard.variables.committees.find(c => c.id == d.committee_id).name);

        box.append("p")
        .style("margin","5px")
        .style("font-size", "12px")
        .text("Number of decisions: "+d.decisions.length);

        /*box.append("p")
        .style("margin","5px")
        .style("font-size", "12px")
        .text("Average non-zero votes per decision: "+projectionDashboard.prototype.getVoteByType(projectionDashboard.variables.sessions[i]));*/
    
        box.append("p")
        .style("margin","5px")
        .style("font-size", "12px")
        .text("Description: "+projectionDashboard.variables.sessions[i].description);

        box.transition()
        .duration(100)
        .style('opacity', .9);
    
        d3.select(this).attr("r",projectionDashboard.variables.tl_dotRadius*1.5);
    },
    
    //effect of moving cursor away form sessions on the timeline
    mouseOverTLSessionOut: function(d,i){
        d3.select(this).attr("r",projectionDashboard.variables.tl_dotRadius);
        d3.selectAll(".session-tooltip").transition()
            .duration(100)
            .style("opacity",0)
            .remove();
    },
    
    //effect of clicking decisions on the timeline
    //URL for decision on quill is shown here
    clickTLDecision: function(d,i){
        var rect = this.getBoundingClientRect();
        var box = d3.select("#focus-filter").append("div")
            .attr("class","hyperlink-popup")
            .style("left", (rect.left+rect.width)+"px")
            .style("top", (rect.top+rect.height-20)+"px");
    
        box.append("a")
            .style("margin","5px")
            .style("font-size", "14px")
            .attr("href","/event_visualize/"+projectionDashboard.variables.votingdata.decision_ids[d])
            .attr("target","_blank")
            .html("Go to Decision");
    
        d3.select("#focus-filter").attr("hidden",null);
    },
    
    //effect of clicking decisions on the timeline
    //URL for session on quill is shown here
    clickTLSession: function(d,i){
        var rect = this.getBoundingClientRect();
        var box = d3.select("#focus-filter").append("div")
            .attr("class","hyperlink-popup")
            .style("left", (rect.left+rect.width)+"px")
            .style("top", (rect.top+rect.height-20)+"px");
    
        box.append("a")
            .style("margin","5px")
            .style("font-size", "14px")
            .attr("href","/session_visualize/"+projectionDashboard.variables.sessions[i].id)
            .attr("target","_blank")
            .html("Go to Session");
    
        d3.select("#focus-filter").attr("hidden",null);
    },

    //set up behavior for timeline navigation (zooming/panning)
    setupTimelineNavigationBehavior : function(){
        projectionDashboard.variables.tl_navBehavior = d3.zoom()
            .extent([[0,0], [projectionDashboard.variables.tl_width,0]])
            .scaleExtent([0.5, 20])
            .translateExtent([[-projectionDashboard.variables.svgMarginX,0],[projectionDashboard.variables.tl_width+projectionDashboard.variables.svgMarginX,0]])
            .on("zoom", projectionDashboard.prototype.tl_zoomAndUpdate);
        projectionDashboard.variables.tl_currentZoom = 1;
    
        projectionDashboard.variables.tl_interaction.append("rect")
            .attr("id","timeline-nav")
            .attr("width", projectionDashboard.variables.tl_width)
            .attr("height", projectionDashboard.variables.tl_height)
            .attr("fill","none")
            .style("pointer-events", "all")
            .call(projectionDashboard.variables.tl_navBehavior)
            .on("dblclick.zoom",projectionDashboard.prototype.tl_resetZoom);
    },
    
    //update function for zoom on timeline
    tl_zoomAndUpdate : function(){
        projectionDashboard.variables.tl_currentScaleX = d3.event.transform.rescaleX(projectionDashboard.variables.tl_scaleX);
        projectionDashboard.variables.tl_previousZoom = projectionDashboard.variables.tl_currentZoom;
        projectionDashboard.variables.tl_currentZoom = d3.event.transform.k;
        var zoomChanged = (projectionDashboard.variables.tl_previousZoom != projectionDashboard.variables.tl_currentZoom);
        
        projectionDashboard.variables.tl_axis.call(d3.axisBottom(projectionDashboard.variables.tl_currentScaleX));
    
        projectionDashboard.variables.tl_selectionSessions.selectAll("circle")
            .attr("cx", function(d,di){return projectionDashboard.variables.tl_currentScaleX(Date.parse(d.date));})
        projectionDashboard.variables.tl_selectionDecisions.attr("cx", function(d,di){return projectionDashboard.variables.tl_currentScaleX(Date.parse(projectionDashboard.variables.votingdata.decision_details[d].session_date));})
    
        if (projectionDashboard.variables.tl_selRectT0.element != null)
            projectionDashboard.variables.tl_selRectT0.element.remove();
        if (projectionDashboard.variables.tl_selRectT1.element != null)
            projectionDashboard.variables.tl_selRectT1.element.remove();
    },

    //resets zoom/position for timeline navigation
    tl_resetZoom : function(){
        d3.select("#timeline-nav").transition().call(projectionDashboard.variables.tl_navBehavior.transform,d3.zoomIdentity)
    },

    //set up behavior for timeline selection (clicking and dragging)
    //activated when selecting sample for projection
    setupTimelineSelectionBehavior : function(){  
        projectionDashboard.variables.tl_dragBehavior = d3.drag()
            .on("drag", projectionDashboard.prototype.tl_dragMove)
            .on("start", projectionDashboard.prototype.tl_dragStart)
            .on("end", projectionDashboard.prototype.tl_dragEnd);
        
        projectionDashboard.variables.tl_interaction.append("rect")
            .attr("id","timeline-drag")
            .attr("width", projectionDashboard.variables.tl_width)
            .attr("height", projectionDashboard.variables.tl_height)
            .attr("fill","none")
            .style("pointer-events", "all")
            .call(projectionDashboard.variables.tl_dragBehavior);
    },

    //effect for starting drag action on timeline selection
    tl_dragStart : function() {
        var p = d3.mouse(this);
        projectionDashboard.variables.activeRect.init(p[0], p[1]);
        projectionDashboard.variables.activeRect.removePrevious();
    },
    
    //effect for movement drag action on timeline selection
    tl_dragMove : function() {
        var p = d3.mouse(this);
        projectionDashboard.variables.activeRect.update(p[0], p[1]);
    },
    
    //effect for ending drag action on timeline selection
    tl_dragEnd : function() {
        var finalAttributes = projectionDashboard.variables.activeRect.getCurrentAttributes();
        //checks if start point is end point (click)
        if(finalAttributes.x2 - finalAttributes.x1 > 1 && finalAttributes.y2 - finalAttributes.y1 > 1){
            d3.event.sourceEvent.preventDefault();
            if (projectionDashboard.variables.activeRect.stype == 'selection0'){
                projectionDashboard.variables.dateWindowT0 = [projectionDashboard.variables.tl_currentScaleX.invert(finalAttributes.x1),projectionDashboard.variables.tl_currentScaleX.invert(finalAttributes.x2)]
                document.getElementById("description-dates-t0").innerHTML = 
                projectionDashboard.prototype.formatDate(projectionDashboard.variables.dateWindowT0[0]) + " to " + projectionDashboard.prototype.formatDate(projectionDashboard.variables.dateWindowT0[1]);
            }
            else {
                projectionDashboard.variables.dateWindowT1 = [projectionDashboard.variables.tl_currentScaleX.invert(finalAttributes.x1),projectionDashboard.variables.tl_currentScaleX.invert(finalAttributes.x2)]
                document.getElementById("description-dates-t1").innerHTML = 
                    projectionDashboard.prototype.formatDate(projectionDashboard.variables.dateWindowT1[0]) + " to " + projectionDashboard.prototype.formatDate(projectionDashboard.variables.dateWindowT1[1]);
            }
            //todo: this is way too messy, make it cleaner
        } else {
            if (projectionDashboard.variables.activeRect.stype == 'selection0') document.getElementById("description-dates-t0").innerHTML = '';
            else document.getElementById("description-dates-t1").innerHTML = '';
            projectionDashboard.variables.activeRect.remove();
        }
    },
    
    //utility: formatting for dates used in this dashboard
    formatDate : function(date){
        return date.getFullYear()+"/"+(("0"+(date.getMonth()+1))).slice(-2)+"/"+(("0"+date.getDate()).slice(-2));
    },
    
    //set up data, svgs and PCA projection for two scatterplots and transitions
    setupScatterplot : function(){
        var x0 = projectionDashboard.variables.proj0.projection.map(function(d){return d[0]});
        var y0 = projectionDashboard.variables.proj0.projection.map(function(d){return d[1]});
    
        var x1 = projectionDashboard.variables.proj1.projection.map(function(d){return d[0]});
        var y1 = projectionDashboard.variables.proj1.projection.map(function(d){return d[1]});
    
        projectionDashboard.variables.isSingleProjection = false;

        projectionDashboard.variables.sp_tCoords = x0.map(function(d,di){
            return {
                x0: x0[di],
                x1: x1[di],
                y0: y0[di],
                y1: y1[di]
            }
        });
        
        projectionDashboard.variables.sp_xmax = projectionDashboard.prototype.amax(x0.concat(x1));
        projectionDashboard.variables.sp_ymax = projectionDashboard.prototype.amax(y0.concat(y1));
        projectionDashboard.variables.sp_xmin = projectionDashboard.prototype.amin(x0.concat(x1));
        projectionDashboard.variables.sp_ymin = projectionDashboard.prototype.amin(y0.concat(y1));
    
        projectionDashboard.prototype.setupScatterplotInverse();

        projectionDashboard.prototype.drawScatterplot();
        projectionDashboard.prototype.setupCharts();
    },

    //redraw scatterplot and reset svgs, two samples
    drawScatterplot : function(){
        projectionDashboard.variables.sp_scaleX = d3.scaleLinear()
            .domain([projectionDashboard.variables.sp_xmin,projectionDashboard.variables.sp_xmax])
            .range([projectionDashboard.variables.svgMarginX,projectionDashboard.variables.sp_width-projectionDashboard.variables.svgMarginX]);
        projectionDashboard.variables.sp_scaleY = d3.scaleLinear()
            .domain([projectionDashboard.variables.sp_ymin,projectionDashboard.variables.sp_ymax])
            .range([projectionDashboard.variables.sp_height-projectionDashboard.variables.svgMarginY,projectionDashboard.variables.svgMarginY]);

        projectionDashboard.variables.sp_svg = d3.select("#scatterplot-svg")
            .attr("width",projectionDashboard.variables.sp_width)
            .attr("height",projectionDashboard.variables.sp_height);

        projectionDashboard.variables.sp_svg.selectAll("*").remove();

        projectionDashboard.prototype.setupScatterplotGrid();

        d3.select("#arrow").attr("fill",projectionDashboard.variables.sp_transitionColor);
        projectionDashboard.variables.sp_selectionTransitions = projectionDashboard.variables.sp_svg.append("g")
                .attr("id","transitions");
    
        if (projectionDashboard.variables.sp_showArrows) 
            projectionDashboard.variables.sp_selectionTransitions.selectAll("line")
                .data(projectionDashboard.variables.sp_tCoords)
                    .join("line")
                    .attr("stroke",projectionDashboard.variables.sp_transitionColor)
                    .attr('marker-end', 'url(#arrow)')
                    .attr("x1",function(d){return projectionDashboard.variables.sp_scaleX(d.x0);})
                    .attr("x2",function(d){return projectionDashboard.variables.sp_scaleX(d.x1);})
                    .attr("y1",function(d){return projectionDashboard.variables.sp_scaleY(d.y0);})
                    .attr("y2",function(d){return projectionDashboard.variables.sp_scaleY(d.y1);});

        else 
            projectionDashboard.variables.sp_selectionTransitions.selectAll("line")
                .data(projectionDashboard.variables.sp_tCoords)
                    .join("line")
                    .attr("stroke",projectionDashboard.variables.sp_transitionColor)
                    .attr("x1",function(d){return projectionDashboard.variables.sp_scaleX(d.x0);})
                    .attr("x2",function(d){return projectionDashboard.variables.sp_scaleX(d.x1);})
                    .attr("y1",function(d){return projectionDashboard.variables.sp_scaleY(d.y0);})
                    .attr("y2",function(d){return projectionDashboard.variables.sp_scaleY(d.y1);});
        
        
        projectionDashboard.variables.sp_transitionLengths = projectionDashboard.variables.sp_tCoords.map(function(d){
            return Math.pow((d.x0-d.x1),2) + Math.pow((d.y0-d.y1),2)
        });

        projectionDashboard.variables.sp_maxTransition = projectionDashboard.prototype.amax(projectionDashboard.variables.sp_transitionLengths);
        projectionDashboard.variables.sp_minTransition = projectionDashboard.prototype.amin(projectionDashboard.variables.sp_transitionLengths);
        projectionDashboard.variables.sp_transitionScale = d3.scaleLinear()
            .domain([0,99])
            .range([0,projectionDashboard.variables.sp_maxTransition]);

        projectionDashboard.prototype.setupScatterplotNavigation();

        projectionDashboard.variables.sp_selectionProj0 = projectionDashboard.variables.sp_svg.append("g")
            .attr("id","proj0");
        projectionDashboard.variables.sp_selectionProj0.selectAll("circle")
            .data(projectionDashboard.variables.proj0.projection)
                .join("circle")
                .attr("cx", function (d) { return projectionDashboard.variables.sp_scaleX(d[0]); } )
                .attr("cy", function (d) { return projectionDashboard.variables.sp_scaleY(d[1]); } )
                .attr("r", projectionDashboard.variables.sp_dotRadius)
                .style("fill", projectionDashboard.variables.sp_mainProjColor)
                .on("mouseover",projectionDashboard.prototype.mouseOverSPVoter)
                .on("mouseout",projectionDashboard.prototype.mouseOverSPVoterOut)
                .on("click",projectionDashboard.prototype.clickSPVoter);
        projectionDashboard.variables.sp_selectionProj1 = projectionDashboard.variables.sp_svg.append("g")
            .attr("id","proj1");
        projectionDashboard.variables.sp_selectionProj1.selectAll("circle")
            .data(projectionDashboard.variables.proj1.projection)
                .join("circle")
                .attr("cx", function (d) { return projectionDashboard.variables.sp_scaleX(d[0]); } )
                .attr("cy", function (d) { return projectionDashboard.variables.sp_scaleY(d[1]); } )
                .attr("r", projectionDashboard.variables.sp_dotRadius)
                .style("fill", projectionDashboard.variables.sp_ghostProjColor)
                .on("mouseover",projectionDashboard.prototype.mouseOverSPVoter)
                .on("mouseout",projectionDashboard.prototype.mouseOverSPVoterOut)
                .on("click",projectionDashboard.prototype.clickSPVoter);

        d3.select("#xvariance-description")
            .html(projectionDashboard.variables.proj0.variance_ratio[0].toFixed(2));
        d3.select("#yvariance-description")   
            .html(projectionDashboard.variables.proj0.variance_ratio[1].toFixed(2));

        projectionDashboard.prototype.drawScatterplotInverse();

        projectionDashboard.prototype.drawScatterplotNavControls();

        projectionDashboard.prototype.updateScatterplotVisibility();
    },
    
    //set up data, svgs and PCA projection for scatterplot of a single sample
    setupScatterplotSingle : function(){
        var x0 = projectionDashboard.variables.proj0.projection.map(function(d){return d[0]});
        var y0 = projectionDashboard.variables.proj0.projection.map(function(d){return d[1]});
    
        projectionDashboard.variables.sp_xmax = projectionDashboard.prototype.amax(x0);
        projectionDashboard.variables.sp_ymax = projectionDashboard.prototype.amax(y0);
        projectionDashboard.variables.sp_xmin = projectionDashboard.prototype.amin(x0);
        projectionDashboard.variables.sp_ymin = projectionDashboard.prototype.amin(y0);

        projectionDashboard.variables.isSingleProjection = true;
    
        projectionDashboard.prototype.setupScatterplotInverse();

        projectionDashboard.prototype.drawScatterplotSingle();
        projectionDashboard.prototype.setupCharts();
    },

    //redraw scatterplot and resets svgs, single sample
    drawScatterplotSingle : function(){
        projectionDashboard.variables.sp_scaleX = d3.scaleLinear()
            .domain([projectionDashboard.variables.sp_xmin,projectionDashboard.variables.sp_xmax])
            .range([projectionDashboard.variables.svgMarginX,projectionDashboard.variables.sp_width-projectionDashboard.variables.svgMarginX]);
        projectionDashboard.variables.sp_scaleY = d3.scaleLinear()
            .domain([projectionDashboard.variables.sp_ymin,projectionDashboard.variables.sp_ymax])
            .range([projectionDashboard.variables.sp_height-projectionDashboard.variables.svgMarginY,projectionDashboard.variables.svgMarginY]);

        projectionDashboard.variables.sp_svg = d3.select("#scatterplot-svg");
        projectionDashboard.variables.sp_svg.attr("width",projectionDashboard.variables.sp_width)
            .attr("height",projectionDashboard.variables.sp_height)

        projectionDashboard.variables.sp_svg.selectAll("g").remove();

        projectionDashboard.prototype.setupScatterplotGrid();
        projectionDashboard.prototype.setupScatterplotNavigation();

        projectionDashboard.variables.sp_selectionProj0 = projectionDashboard.variables.sp_svg.append("g")
            .attr("id","proj0");
        projectionDashboard.variables.sp_selectionProj0.selectAll("circle")
            .data(projectionDashboard.variables.proj0.projection)
                .join("circle")
                .attr("cx", function (d) { return projectionDashboard.variables.sp_scaleX(d[0]); } )
                .attr("cy", function (d) { return projectionDashboard.variables.sp_scaleY(d[1]); } )
                .attr("r", projectionDashboard.variables.sp_dotRadius)
                .style("fill", projectionDashboard.variables.sp_mainProjColor)
                .on("mouseover",projectionDashboard.prototype.mouseOverSPVoter)
                .on("mouseout",projectionDashboard.prototype.mouseOverSPVoterOut)
                .on("click",projectionDashboard.prototype.clickSPVoter);

        projectionDashboard.variables.sp_selectionProj1 = projectionDashboard.variables.sp_svg.select("#proj1");
        projectionDashboard.variables.sp_selectionTransitions = projectionDashboard.variables.sp_svg.select("#transitions");

        d3.select("#xvariance-description")
            .html(projectionDashboard.variables.proj0.variance_ratio[0].toFixed(2));
        d3.select("#yvariance-description")   
            .html(projectionDashboard.variables.proj0.variance_ratio[1].toFixed(2));

        projectionDashboard.prototype.drawScatterplotInverse();

        projectionDashboard.prototype.drawScatterplotNavControls();

        projectionDashboard.prototype.updateScatterplotVisibility();
    },

    //sets up variables for inverse scatterplot
    setupScatterplotInverse : function(){
        var x0 = projectionDashboard.variables.iproj0.projection.map(function(d){return d[0]});
        var y0 = projectionDashboard.variables.iproj0.projection.map(function(d){return d[1]});

        projectionDashboard.variables.sp_ilimits = {
            xmax : projectionDashboard.prototype.amax(x0),
            ymax : projectionDashboard.prototype.amax(y0),
            xmin : projectionDashboard.prototype.amin(x0),
            ymin : projectionDashboard.prototype.amin(y0)
        };

    },

    //draws dots for inverse scatterplot (decisions)
    drawScatterplotInverse : function(){
        projectionDashboard.variables.sp_iScaleX = d3.scaleLinear()
            .domain([projectionDashboard.variables.sp_ilimits.xmin,projectionDashboard.variables.sp_ilimits.xmax])
            .range([projectionDashboard.variables.svgMarginX,projectionDashboard.variables.sp_width-projectionDashboard.variables.svgMarginX]);
        projectionDashboard.variables.sp_iScaleY = d3.scaleLinear()
            .domain([projectionDashboard.variables.sp_ilimits.ymin,projectionDashboard.variables.sp_ilimits.ymax])
            .range([projectionDashboard.variables.sp_height-projectionDashboard.variables.svgMarginY,projectionDashboard.variables.svgMarginY]);

        projectionDashboard.variables.sp_selectionProj0Inverse = projectionDashboard.variables.sp_svg.append("g")
            .attr("id","iproj0");
        projectionDashboard.variables.sp_selectionProj0Inverse.selectAll("circle")
            .data(projectionDashboard.variables.iproj0.projection)
                .join("circle")
                .attr("cx", function (d) { return projectionDashboard.variables.sp_iScaleX(d[0]); } )
                .attr("cy", function (d) { return projectionDashboard.variables.sp_iScaleY(d[1]); } )
                .attr("r", projectionDashboard.variables.sp_dotRadius)
                .style("fill", projectionDashboard.variables.sp_inverseProjColor)
                .on("mouseover",projectionDashboard.prototype.mouseOverCTDecision)
                .on("mouseout",projectionDashboard.prototype.mouseOverCTDecisionOut)
                .on("click",projectionDashboard.prototype.clickCTDecision);

        projectionDashboard.variables.sp_selectionProj0Inverse.attr("visibility","hidden");
    },
    
    //buttons to control zooming and panning
    //uses many hardcoded coordinates but they are always drawn at the same spot
    //is pretty much the same function as drawTimelineNavControls. Could be done as a single function with a lot of parameters
    drawScatterplotNavControls : function() {
        var navigationButtons = projectionDashboard.variables.sp_svg.append("g")
            .attr("class","svg-navigation-button");

        var plusButton = navigationButtons.append("g")
            .on("click",function(){d3.select("#scatterplot-nav").transition().call(projectionDashboard.variables.sp_navBehavior.scaleBy,2.0);});
        plusButton.append("circle")
            .attr("cx", projectionDashboard.variables.sp_width-projectionDashboard.variables.svgMarginX-132)
            .attr("cy", projectionDashboard.variables.svgMarginY+20)
            .attr("r",15);
        plusButton.append("text")
            .attr("x",projectionDashboard.variables.sp_width-projectionDashboard.variables.svgMarginX-138)
            .attr("y",55).attr("font-size",18)
            .attr("fill","black")
            .text("+")
            .attr("pointer-events","none");
            
        var minusButton = navigationButtons.append("g")
            .on("click",function(){d3.select("#scatterplot-nav").transition().call(projectionDashboard.variables.sp_navBehavior.scaleBy,0.5);});
        minusButton.append("circle")
            .attr("cx", projectionDashboard.variables.sp_width-projectionDashboard.variables.svgMarginX-96)
            .attr("cy", projectionDashboard.variables.svgMarginY+20)
            .attr("r",15);
        minusButton.append("text")
            .attr("x",projectionDashboard.variables.sp_width-projectionDashboard.variables.svgMarginX-99)
            .attr("y",55)
            .attr("font-size",18)
            .attr("fill","black")
            .text("-")
            .attr("pointer-events","none");

        var resetButton = navigationButtons.append("g")
            .on("click",function(){projectionDashboard.prototype.sp_resetZoom();});
        resetButton.append("rect")
            .attr("x", projectionDashboard.variables.sp_width-projectionDashboard.variables.svgMarginX-75)
            .attr("y", projectionDashboard.variables.svgMarginY+5)
            .attr("rx",15)
            .attr("ry",15)
            .attr("width",60)
            .attr("height",30);    
        resetButton.append("text")
            .attr("x",projectionDashboard.variables.sp_width-projectionDashboard.variables.svgMarginX-62)
            .attr("y",53)
            .attr("fill","black")
            .text("reset")
            .attr("pointer-events","none");
    },

    //set up grid and axes for scatterplot
    setupScatterplotGrid : function(){
        projectionDashboard.variables.sp_axisX = projectionDashboard.variables.sp_svg.append("g")
            .attr("transform", "translate(0," + (projectionDashboard.variables.sp_height-projectionDashboard.variables.svgMarginY) + ")")
            .call(d3.axisBottom(projectionDashboard.variables.sp_scaleX));
    
        projectionDashboard.variables.sp_axisY = projectionDashboard.variables.sp_svg.append("g")
            .attr("transform", "translate("+projectionDashboard.variables.svgMarginX+",0)")
            .call(d3.axisLeft(projectionDashboard.variables.sp_scaleY));
    
        // add the X gridlines
        projectionDashboard.variables.sp_gridX = projectionDashboard.variables.sp_svg.append("g")			
            .attr("class", "projgrid")
            .attr("transform", "translate(0," + (projectionDashboard.variables.sp_height-projectionDashboard.variables.svgMarginY) + ")")
            .call(d3.axisBottom(projectionDashboard.variables.sp_scaleX)
                .ticks(9)
                .tickSize(-projectionDashboard.variables.sp_height+projectionDashboard.variables.svgMarginY*2)
                .tickFormat("")
            ).attr("opacity",0.4)
    
        // add the Y gridlines
        projectionDashboard.variables.sp_gridY = projectionDashboard.variables.sp_svg.append("g")			
            .attr("class", "projgrid")
            .attr("transform", "translate("+projectionDashboard.variables.svgMarginX+",0)")
            .call(d3.axisLeft(projectionDashboard.variables.sp_scaleY)
                .ticks(9)
                .tickSize(-projectionDashboard.variables.sp_width+projectionDashboard.variables.svgMarginX*2)
                .tickFormat("")
            ).attr("opacity",0.4)
    },
    
    //set up navigation (zooming/panning) for scatterplot
    setupScatterplotNavigation : function(){
        projectionDashboard.variables.sp_navBehavior = d3.zoom()
            .extent([[0,0], [projectionDashboard.variables.sp_width,projectionDashboard.variables.sp_height]])
            .scaleExtent([0.5, 20])
            .translateExtent([[-projectionDashboard.variables.svgMarginX,-projectionDashboard.variables.svgMarginY],
                [projectionDashboard.variables.sp_width+projectionDashboard.variables.svgMarginX,projectionDashboard.variables.sp_height+projectionDashboard.variables.svgMarginY]])
            .on("zoom", projectionDashboard.prototype.sp_zoomAndUpdate);
    
        projectionDashboard.variables.sp_svg.append("rect")
            .attr("id","scatterplot-nav")
            .attr("transform", "translate("+projectionDashboard.variables.svgMarginX+","+projectionDashboard.variables.svgMarginY+")")
            .attr("width", projectionDashboard.variables.sp_width-projectionDashboard.variables.svgMarginX*2)
            .attr("height", projectionDashboard.variables.sp_height-projectionDashboard.variables.svgMarginY*2)
            .attr("fill","none")
            .style("pointer-events", "all")
            .call(projectionDashboard.variables.sp_navBehavior)
            .on("dblclick.zoom",projectionDashboard.prototype.sp_resetZoom);
    },
    
    //update function for zoom on timeline
    sp_zoomAndUpdate : function(){
        projectionDashboard.variables.sp_currentScaleX = d3.event.transform.rescaleX(projectionDashboard.variables.sp_scaleX);
        projectionDashboard.variables.sp_currentScaleY = d3.event.transform.rescaleY(projectionDashboard.variables.sp_scaleY);
        
        projectionDashboard.prototype.updateScatterplotAxes(projectionDashboard.variables.sp_currentScaleX,projectionDashboard.variables.sp_currentScaleY);
        if (!projectionDashboard.variables.isSingleProjection) projectionDashboard.prototype.updateScatterplotTransitions(projectionDashboard.variables.sp_currentScaleX,projectionDashboard.variables.sp_currentScaleY);
        projectionDashboard.prototype.updateScatterplotPoints(projectionDashboard.variables.sp_currentScaleX,projectionDashboard.variables.sp_currentScaleY);

        projectionDashboard.variables.sp_ciScaleX = d3.event.transform.rescaleX(projectionDashboard.variables.sp_iScaleX);
        projectionDashboard.variables.sp_ciScaleY = d3.event.transform.rescaleY(projectionDashboard.variables.sp_iScaleY);
        projectionDashboard.prototype.updateInverseScatterplotPoints(projectionDashboard.variables.sp_ciScaleX,projectionDashboard.variables.sp_ciScaleY);
    },

    //resets zoom/position for scatterplot
    sp_resetZoom : function(){
        d3.select("#scatterplot-nav").transition().call(projectionDashboard.variables.sp_navBehavior.transform,d3.zoomIdentity);
    },
    
    //update function for scatterplot axes to reflect zoom/pan
    updateScatterplotAxes : function(newScaleX,newScaleY){
        projectionDashboard.variables.sp_axisX.call(d3.axisBottom(newScaleX));
    
        projectionDashboard.variables.sp_axisY.call(d3.axisLeft(newScaleY));
    
        projectionDashboard.variables.sp_gridX.call(d3.axisBottom(newScaleX)
                .ticks(9)
                .tickSize(-projectionDashboard.variables.sp_height+projectionDashboard.variables.svgMarginY*2)
                .tickFormat("")
            ).attr("opacity",0.4)
    
        projectionDashboard.variables.sp_gridY.call(d3.axisLeft(newScaleY)
                .ticks(9)
                .tickSize(-projectionDashboard.variables.sp_width+projectionDashboard.variables.svgMarginX*2)
                .tickFormat("")
            ).attr("opacity",0.4)
    },
    
    //update function for refreshing scatterplot points to reflect zoom/pan
    updateScatterplotPoints : function(newScaleX,newScaleY){
        projectionDashboard.variables.sp_selectionProj0.selectAll("circle")
            .attr("cx", function (d) { return newScaleX(d[0]); } )
            .attr("cy", function (d) { return newScaleY(d[1]); } );
    
        projectionDashboard.variables.sp_selectionProj1.selectAll("circle")
            .attr("cx", function (d) { return newScaleX(d[0]); } )
            .attr("cy", function (d) { return newScaleY(d[1]); } );
    },

    //refreshes inverse scatterplot points
    //todo: refactor both update functions to a single one that receives the selection to be updated as parameter
    updateInverseScatterplotPoints : function(newScaleX,newScaleY){
        projectionDashboard.variables.sp_selectionProj0Inverse.selectAll("circle")
            .attr("cx", function (d) { return newScaleX(d[0]); } )
            .attr("cy", function (d) { return newScaleY(d[1]); } );
    },
    
    //update function for refreshing scatterplot transitions/arrows
    updateScatterplotTransitions : function(newScaleX,newScaleY){
        if (projectionDashboard.variables.sp_showArrows) 
            projectionDashboard.variables.sp_selectionTransitions.selectAll("line")
                .attr("x1",function(d){return newScaleX(d.x0);})
                .attr("x2",function(d){return newScaleX(d.x1);})
                .attr("y1",function(d){return newScaleY(d.y0);})
                .attr("y2",function(d){return newScaleY(d.y1);});
    
        else 
            projectionDashboard.variables.sp_selectionTransitions.selectAll("line")
                .attr("stroke",projectionDashboard.variables.sp_transitionColor)
                .attr("x1",function(d){return newScaleX(d.x0);})
                .attr("x2",function(d){return newScaleX(d.x1);})
                .attr("y1",function(d){return newScaleY(d.y0);})
                .attr("y2",function(d){return newScaleY(d.y1);});
        
        projectionDashboard.variables.sp_transitionLengths = projectionDashboard.variables.sp_tCoords.map(function(d){
            return Math.pow((d.x0-d.x1),2) + Math.pow((d.y0-d.y1),2)
        });
    
        projectionDashboard.variables.sp_maxTransition = projectionDashboard.prototype.amax(projectionDashboard.variables.sp_transitionLengths);
        projectionDashboard.variables.sp_minTransition = projectionDashboard.prototype.amin(projectionDashboard.variables.sp_transitionLengths);
        projectionDashboard.variables.sp_transitionScale = d3.scaleLinear()
            .domain([0,99])
            .range([0,projectionDashboard.variables.sp_maxTransition]);
    },
    
    //TODO: clean up this function
    //update function to reflect changes in visibility in scatterplot
    updateScatterplotVisibility : function(){
        if (projectionDashboard.elements.sp_sDisplay.selectedIndex == 0) {
            projectionDashboard.variables.sp_selectionProj0Inverse.attr("visibility","hidden");
            var threshold = (projectionDashboard.variables.sp_transitionScale != undefined)? projectionDashboard.variables.sp_transitionScale(projectionDashboard.elements.sp_sThreshold.value) : 0;
            if (projectionDashboard.elements.sp_showProj1.checked == false) {
                projectionDashboard.variables.sp_selectionProj0.selectAll("circle").attr("visibility","visible");
                projectionDashboard.variables.sp_selectionProj1.selectAll("circle").attr("visibility","hidden");
                projectionDashboard.variables.sp_selectionTransitions.selectAll("line").attr("visibility","hidden");
            }
            else {
                if (projectionDashboard.elements.sp_cHideDots.checked == true && projectionDashboard.elements.sp_cHideDots.disabled == false) {
                    projectionDashboard.variables.sp_selectionProj0.selectAll("circle").attr("visibility",function(d,di){return (projectionDashboard.prototype.getHidden(projectionDashboard.variables.sp_transitionLengths[di]<threshold));});
                    projectionDashboard.variables.sp_selectionProj1.selectAll("circle").attr("visibility",function(d,di){return (projectionDashboard.prototype.getHidden(projectionDashboard.variables.sp_transitionLengths[di]<threshold));});
                }
                else {
                    projectionDashboard.variables.sp_selectionProj0.selectAll("circle").attr("visibility","visible");
                    projectionDashboard.variables.sp_selectionProj1.selectAll("circle").attr("visibility","visible");
                }
                projectionDashboard.variables.sp_selectionTransitions.selectAll("line").attr("visibility",function(d,di){return (projectionDashboard.prototype.getHidden(projectionDashboard.variables.sp_transitionLengths[di]<threshold));});
            }
        }
        else {
            projectionDashboard.variables.sp_selectionProj0.selectAll("circle").attr("visibility","hidden");
            projectionDashboard.variables.sp_selectionProj1.selectAll("circle").attr("visibility","hidden");
            projectionDashboard.variables.sp_selectionTransitions.selectAll("line").attr("visibility","hidden");
            projectionDashboard.variables.sp_selectionProj0Inverse.attr("visibility","visible");
        }
    },
    
    //effect of moving cursor over voters on the scatterplot
    //contents of the description box are defined here
    mouseOverSPVoter : function(d,i){
        var rect = this.getBoundingClientRect();
        var box = d3.select("body").append("div")
            .attr("class","voter-tooltip")
            .style("left", (rect.left+rect.width)+"px")
            .style("top", (rect.top+rect.height)+"px")
            .style("opacity",0);
    
        box.append("p")
            .style("margin","5px")
            .style("font-size", "14px")
            .text(projectionDashboard.variables.votingdata.voter_ids[i]+": "+projectionDashboard.variables.votingdata.voter_names[i]);

        box.transition()
            .duration(100)
            .style('opacity', .9);
    
        d3.select(this).attr("r",projectionDashboard.variables.sp_dotRadius*1.5);
    },
    
    //effect of moving cursor away from voters on the scatterplot
    mouseOverSPVoterOut : function(d,i){
        d3.select(this).attr("r",projectionDashboard.variables.sp_dotRadius);
        d3.selectAll(".voter-tooltip").transition()
            .duration(100)
            .style("opacity",0)
            .remove();
        
    },
    
    //effect of clicking voter on the scatterplot
    //hyperlinks to quill are defined here
    clickSPVoter : function(d,i){
        var rect = this.getBoundingClientRect();
        var box = d3.select("#focus-filter").append("div")
            .attr("class","hyperlink-popup")
            .style("left", (rect.left+rect.width)+"px")
            .style("top", (rect.top+rect.height-20)+"px");
    
        box.append("a")
            .style("margin","5px")
            .style("font-size", "14px")
            .attr("href","/person_visualize/"+projectionDashboard.variables.votingdata.voter_ids[i])
            .attr("target","_blank")
            .html("Go to Person");
    
        d3.select("#focus-filter").attr("hidden",null);
    },
    
    //set up data and svgs for chart visualization
    setupCharts : function(){
        //absolute values for each pca component
        projectionDashboard.variables.proj0.components[0] = projectionDashboard.variables.proj0.components[0].map(function(d){return d<0? -d : d});
        projectionDashboard.variables.proj0.components[1] = projectionDashboard.variables.proj0.components[1].map(function(d){return d<0? -d : d});
    
        projectionDashboard.variables.chartData = [];
        projectionDashboard.variables.chartData.push([]);
        projectionDashboard.variables.chartData[0].push(projectionDashboard.variables.proj0.components[0]);
        projectionDashboard.variables.chartData[0].push(projectionDashboard.variables.proj0.components[1]);
        projectionDashboard.variables.chartData[0].push(projectionDashboard.variables.proj0.components[0].map(function(d,di){
            return projectionDashboard.variables.proj0.components[0][di]+projectionDashboard.variables.proj0.components[1][di];
        }));
        projectionDashboard.variables.chartData[0].push(projectionDashboard.variables.proj0.components[0].map(function(d,di){
            return projectionDashboard.prototype.getVoteByType(projectionDashboard.variables.votingdata.decision_details[projectionDashboard.variables.sliceIndexes0[di]]);
        }));
    
        projectionDashboard.variables.chartData.push([]);
        projectionDashboard.variables.chartData[1].push(projectionDashboard.variables.chartData[0][0].slice().sort((a, b) => a - b));
        projectionDashboard.variables.chartData[1].push(projectionDashboard.variables.chartData[0][1].slice().sort((a, b) => a - b));
        projectionDashboard.variables.chartData[1].push(projectionDashboard.variables.chartData[0][2].slice().sort((a, b) => a - b));
        projectionDashboard.variables.chartData[1].push(projectionDashboard.variables.chartData[0][3].slice().sort((a, b) => a - b));
    
        projectionDashboard.elements.ct_cShowC1.checked = false;
        projectionDashboard.elements.ct_sC1Type.disabled = true;
        projectionDashboard.elements.ct_sC1Order.disabled = true;

        projectionDashboard.prototype.drawCharts();
    },

    //draw and reset chart svg
    drawCharts : function(){
        projectionDashboard.variables.ct_svg = d3.select("#charts-svg")
            .attr("width",projectionDashboard.variables.ct_width)
            .attr("height",projectionDashboard.variables.ct_height);
        projectionDashboard.variables.ct_svg.selectAll("*").remove();

        projectionDashboard.prototype.drawChart0(projectionDashboard.variables.chartData[projectionDashboard.elements.ct_sC0Order.selectedIndex][projectionDashboard.elements.ct_sC0Type.selectedIndex]);
        if (projectionDashboard.elements.ct_cShowC1.checked)
            projectionDashboard.prototype.drawChart1(projectionDashboard.variables.chartData[projectionDashboard.elements.ct_sC1Order.selectedIndex][projectionDashboard.elements.ct_sC1Type.selectedIndex]);
    },
    
    //draw first chart
    drawChart0 : function(data){
        projectionDashboard.variables.ct_svg.selectAll("g").remove();
        projectionDashboard.variables.ct_scaleX = d3.scaleLinear()
            .domain([0,data.length])
            .range([projectionDashboard.variables.svgMarginX,projectionDashboard.variables.ct_width-projectionDashboard.variables.svgMarginX]);
    
        projectionDashboard.variables.ct_chart0ScaleY = d3.scaleLinear()
            .domain([0, d3.max(data, function(d) {return d;})])
            .range([projectionDashboard.variables.ct_height-projectionDashboard.variables.svgMarginY, projectionDashboard.variables.svgMarginY]);
        
        projectionDashboard.variables.ct_svg.append("g")
            .attr("transform", "translate(0," + (projectionDashboard.variables.ct_height-projectionDashboard.variables.svgMarginY) + ")")
            .call(d3.axisBottom(projectionDashboard.variables.ct_scaleX));
        
        projectionDashboard.variables.ct_svg.append("g")
            .attr("transform", "translate("+projectionDashboard.variables.svgMarginX+",0)")
            .call(d3.axisLeft(projectionDashboard.variables.ct_chart0ScaleY));
    
        projectionDashboard.variables.ct_svg.append("g")
            .attr("id","chart0-plot")
            .append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", projectionDashboard.variables.ct_color0)
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(function(d,di) {return projectionDashboard.variables.ct_scaleX(di);})
                .y(function(d,di) {return projectionDashboard.variables.ct_chart0ScaleY(d);})
                );
    
        projectionDashboard.variables.ct_svg.append("g")
            .attr("id","chart0-dots")
            .selectAll("circle")
            .data(data)
            .join("circle")
                .attr("cx", function(d,di){return projectionDashboard.variables.ct_scaleX(di);})
                .attr("cy", function(d,di){return projectionDashboard.variables.ct_chart0ScaleY(d);})
                .attr("r", projectionDashboard.variables.ct_dotRadius)
                .style("fill", projectionDashboard.variables.ct_color0)
                .on("mouseover",projectionDashboard.prototype.mouseOverCTDecision)
                .on("mouseout",projectionDashboard.prototype.mouseOverCTDecisionOut)
                .on("click",projectionDashboard.prototype.clickCTDecision);
    },
    
    //draw second chart
    drawChart1 : function(data){
        projectionDashboard.variables.ct_svg.selectAll("#chart1").remove();
        if (data == null) return;
    
        var csvg1 = projectionDashboard.variables.ct_svg.append("g")
            .attr("id","chart1")
    
        projectionDashboard.variables.ct_chart1ScaleY = d3.scaleLinear()
            .domain([0, d3.max(data, function(d) {return d;})])
            .range([projectionDashboard.variables.ct_height-projectionDashboard.variables.svgMarginY, projectionDashboard.variables.svgMarginY]);
        
        
        csvg1.append("g")
            .attr("transform", "translate("+(projectionDashboard.variables.ct_width-projectionDashboard.variables.svgMarginX)+",0)")
            .call(d3.axisRight(projectionDashboard.variables.ct_chart1ScaleY));
    
        csvg1.append("g")
            .attr("id","chart1-plot")
            .append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", projectionDashboard.variables.ct_color1)
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(function(d,di) {return projectionDashboard.variables.ct_scaleX(di);})
                .y(function(d,di) {return projectionDashboard.variables.ct_chart1ScaleY(d);})
                );
    
        csvg1.append("g")
            .attr("id","chart1-dots")
            .selectAll("circle")
            .data(data)
            .join("circle")
                .attr("cx", function(d,di){return projectionDashboard.variables.ct_scaleX(di);})
                .attr("cy", function(d,di){return projectionDashboard.variables.ct_chart1ScaleY(d);})
                .attr("r", projectionDashboard.variables.ct_dotRadius)
                .style("fill", projectionDashboard.variables.ct_color1)
                .on("mouseover",projectionDashboard.prototype.mouseOverCTDecision)
                .on("mouseout",projectionDashboard.prototype.mouseOverCTDecisionOut)
                .on("click",projectionDashboard.prototype.clickCTDecision);
    },
    
    //effect of moving cursor over decisions on charts
    //contents of description box are defined here
    mouseOverCTDecision : function(d,i){
        var rect = this.getBoundingClientRect();
        var box = d3.select("body").append("div")
            .attr("class","decision-tooltip")
            .style("left", (rect.left+rect.width)+"px")
            .style("top", (rect.top+rect.height)+"px")
            .style("opacity",0);
    
        box.append("p")
        .style("margin","5px")
        .style("font-size", "14px")
        .text("Decision "+projectionDashboard.variables.votingdata.decision_ids[projectionDashboard.variables.sliceIndexes0[i]]);

        box.append("p")
        .style("margin","5px")
        .style("font-size", "12px")
        .text(projectionDashboard.variables.votingdata.decision_details[projectionDashboard.variables.sliceIndexes0[i]].proposal_name);
        
        box.append("p")
        .style("margin","5px")
        .style("font-size", "12px")
        .text("Date: "+projectionDashboard.variables.votingdata.decision_details[projectionDashboard.variables.sliceIndexes0[i]].session_date);
    
        box.append("p")
        .style("margin","5px")
        .style("font-size", "12px")
        .text("Committee: "+projectionDashboard.variables.committees.find(c => c.id == projectionDashboard.variables.votingdata.decision_details[projectionDashboard.variables.sliceIndexes0[i]].committee_id).name);
    
        box.append("p")
        .style("margin","5px")
        .style("font-size", "12px")
        .text("Number of non-zero votes: "+projectionDashboard.prototype.getVoteByType(projectionDashboard.variables.votingdata.decision_details[projectionDashboard.variables.sliceIndexes0[i]]));

        box.append("p")
        .style("margin","5px")
        .style("font-size", "12px")
        .text("Anonymous voting: "+(projectionDashboard.variables.votingdata.decision_details[projectionDashboard.variables.sliceIndexes0[i]].anonymous? "Yes" : "No"));
    
        box.append("p")
        .style("margin","5px")
        .style("font-size", "12px")
        .text("Decision Type: "+projectionDashboard.variables.votingdata.decision_details[projectionDashboard.variables.sliceIndexes0[i]].type);
    
        box.transition()
            .duration(100)
            .style('opacity', .9);

        d3.select(this).attr("r",projectionDashboard.variables.tl_dotRadius*1.75);
    },
    
    //effect of moving cursor away from decisions on charts
    mouseOverCTDecisionOut : function(d,i){
        d3.select(this).attr("r",projectionDashboard.variables.ct_dotRadius);
        d3.selectAll(".decision-tooltip").transition()
            .duration(100)
            .style("opacity",0)
            .remove();
    },
    
    //effect of clicking decisions on charts
    clickCTDecision : function(d,i){
        var rect = this.getBoundingClientRect();
        var box = d3.select("#focus-filter").append("div")
            .attr("class","hyperlink-popup")
            .style("left", (rect.left+rect.width)+"px")
            .style("top", (rect.top+rect.height-20)+"px");
    
        box.append("a")
            .style("margin","5px")
            .style("font-size", "14px")
            .attr("href","/event_visualize/"+projectionDashboard.variables.votingdata.decision_ids[projectionDashboard.variables.sliceIndexes0[i]])
            .attr("target","_blank")
            .html("Go to Decision");
    
        d3.select("#focus-filter").attr("hidden",null);
    },
    
    //get indexes for all decisions in a date window to slice the vote matrix. Also removes decisions with no votes.
    getDecisionIndexesByDate : function(datewindow){
        return projectionDashboard.variables.votingdata.decision_details.map(function(d,di){
            var sdate = Date.parse(d.session_date);
            //if ( (sdate>=datewindow[0]) && (sdate<=datewindow[1]) && (projectionDashboard.variables.decisionfilter[di] == true) && (d.total_votes > 0)) return di;
            if ( (sdate>=datewindow[0]) && (sdate<=datewindow[1]) && (projectionDashboard.variables.decisionfilter[di] == true) && (projectionDashboard.prototype.getVoteByType(d) > 0)) return di;
            else return -1;
        }).filter(function(d){return d>=0;});
    },
    
    //get max value from array
    amax : function(a) {
        return a.reduce(function(a, b) {
            return Math.max(a, b);
        }, -Infinity);
    },

    //get min value from array
    amin : function(a) {
        return a.reduce(function(a, b) {
            return Math.min(a, b);
        }, Infinity);
    },

    //function for calculating PCA
    generatePCA : function(data){
        var pca = new ML.PCA(data);
        var proj = pca.predict(data);
        var projxy = proj.selection(d3.range(0,proj.rows),[0,1]);
        var componentx = pca.getEigenvectors().getColumn(0);
        var componenty = pca.getEigenvectors().getColumn(1);
        var ratios = pca.getExplainedVariance().slice(0,2);

        /*var pca = new ML.PCA(data,{"method":"NIPALS"});
        var projxy = pca.predict(data);
        var componentx = pca.getEigenvectors().getColumn(0);
        var componenty = pca.getEigenvectors().getColumn(1);
        var ratios = pca.getExplainedVariance().slice(0,2);*/

        return {"projection":projxy,"components":[componentx,componenty],"variance_ratio":ratios};
    },

    //function for calculating procrustes for aligning projections
    procrustes : function(A,B){
        var An = A.norm();
        var Bn = B.norm();
        var A2 = ML.Matrix.div(A,An);
        var B2 = ML.Matrix.div(B,Bn);

        var t = ( (B2.transpose()).mmul(A2) ).transpose();
        var svd = new ML.SVD(t)
        var u = svd.U;
        var w = svd.s;
        var v = svd.V.transpose();

        var R = u.mmul(v);
        var s = w.reduce((acc,d)=>acc+d,0);
        var output = ML.Matrix.mul(B2.mmul(R.transpose()), s);

        //var diff = ML.Matrix.sub(A2,output);
        //diff = diff.pow(2).sum();
        return [A2, output];
    },

    //what happens when the window is resized
    windowResized: function() {
        $(window).resize(function() {
            clearTimeout($.data(this, 'resizeTimer'));
            projectionDashboard.variables.tl_width = document.getElementById("timeline-svg").parentElement.clientWidth;
            projectionDashboard.variables.sp_width = document.getElementById("scatterplot-svg").parentElement.clientWidth;
            projectionDashboard.variables.sp_height = document.getElementById("scatterplot-svg").parentElement.clientWidth*(4/5);
            projectionDashboard.variables.ct_width = document.getElementById("charts-svg").parentElement.clientWidth;
            $.data(this, 'resizeTimer', setTimeout(function() {
                projectionDashboard.prototype.drawTimeline();
                if (projectionDashboard.variables.isScatterplotActive) {
                    if (projectionDashboard.variables.isSingleProjection) projectionDashboard.prototype.drawScatterplotSingle();
                    else projectionDashboard.prototype.drawScatterplot();
                    projectionDashboard.prototype.drawCharts();
                }
            }, 250));
        });
    },

}

projectionDashboard.prototype.init();