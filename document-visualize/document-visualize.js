const DECISION_TYPES = {
    "POSITIVE": ["ADOPT_PROPOSAL","NO_OBJECTION"],
    "NEGATIVE": ["REJECT_PROPOSAL","DROP_PROPOSAL"],
    "POSTPONED": ["POSTPONE_DEBATE"],
    "OTHER": ["REPORT_PROPOSAL","OTHER"]
};

const ICON_PATHS = {
    "DOC_IMPORT" : "/img/icons2/icon-doc-subtype-script-import.svg",
    "DOC_NEW": "/img/icons2/icon-doc-subtype-script-add.svg",
    "DOC_COPY": "/img/icons2/icon-doc-subtype-script-amend.svg",
    "DEC_REFER": "/img/icons2/icon-decision-refer.svg",
    "DEC_ADOPT": "/img/icons2/icon-decision-adopt.svg",
    "DEC_REJECT": "/img/icons2/icon-decision-reject.svg",
    "DEC_DROP": "/img/icons2/icon-decision-drop.svg",
    "DEC_FORWARD": "/img/icons2/icon-decision-forward.svg",
}

var documentVisualize = {};

documentVisualize.variables = {
    documentId: -1,
    timestampId: -1,
    conventionId: -1,
    timelineData: {},
    events: {},
    sessions: [],
    people: [],
    keywords: [],
    currentText: null,
    rawData: null,

    globalTimelineData: null,

    selectedIds: null,
    selectedElement: null,

    selectionTLEvents: null,
    selectionTLSessions: null,
    selectionPeople: null,
    selectionKeywords: null,

    timelineWidth: $('#timeline-view').parent().width(),
    timelineScaleX: null,
    timelineScaleXCurrent: null,

    timelineCollapsed: false
};

documentVisualize.parameters = {
    dotRadius : 4,
};

documentVisualize.prototype = {

    init: function(id,cid){
        documentVisualize.variables.documentId = id;
        documentVisualize.variables.conventionId = cid;
        documentVisualize.variables.timestampId = documentVisualize.prototype.getTimestampId();

        d3.json("data/documentdata_"+documentVisualize.variables.documentId+".json").then(function(d){
            documentVisualize.variables.rawData = d;
            documentVisualize.prototype.getDocumentTimelineData();
            documentVisualize.prototype.getGlobalTimelineData();
            documentVisualize.prototype.setupButtons();
            documentVisualize.prototype.setupWindowResize();
        });
    },

    setupButtons: function(){
        var elementCheckboxHideDeletions = $("#checkbox-hide-deletions")[0];
        elementCheckboxHideDeletions.onchange = function(){
            if (elementCheckboxHideDeletions.checked)
                d3.selectAll(".quill-diff-delete").attr("hidden",true);
            else d3.selectAll(".quill-diff-delete").attr("hidden",null);
        }
        elementCheckboxHideDeletions.checked = false;

        var elementCheckboxHideEvIds = $("#checkbox-hide-evids")[0];
        elementCheckboxHideEvIds.onchange = function(){
            if (elementCheckboxHideEvIds.checked)
                d3.selectAll(".quill-diff-explain").attr("hidden",true);
            else d3.selectAll(".quill-diff-explain").attr("hidden",null);
        }
        elementCheckboxHideEvIds.checked = false;

        var elementButtonResetSelection = $("#button-reset-selection")[0];
        elementButtonResetSelection.onclick = function(){
            documentVisualize.prototype.disableColors();
            documentVisualize.prototype.applyDefaultColors();
            documentVisualize.variables.selectedIds = null;
        }

        var elementCheckboxHideOverview = $("#cb-ov-hide")[0];
        elementCheckboxHideOverview.onclick = function(){
            if (elementCheckboxHideOverview.checked)
                d3.select("#global-timeline-view").select("svg").attr("hidden",true);
            else d3.select("#global-timeline-view").select("svg").attr("hidden",null);
        }

        var elementCheckboxCollapseTimeline = $("#cb-tl-collapse")[0];
        elementCheckboxCollapseTimeline.onclick = function(){
            documentVisualize.variables.timelineCollapsed = elementCheckboxCollapseTimeline.checked;
            documentVisualize.prototype.drawTimeline(d3.select("#timeline-view").select("svg"),documentVisualize.variables.timelineData.sessions,documentVisualize.variables.timelineData.ppr);
            if (documentVisualize.variables.selectedIds != null)
                documentVisualize.prototype.applySelectionColors(documentVisualize.variables.selectedIds);
        }

        d3.select("body").append("div").attr("id","focus-filter").attr("hidden","true").style("left", "0px").style("top", "0px");
        var focusFilter = document.getElementById("focus-filter");
        function clickAway(){
            d3.select("#focus-filter")
                .attr("hidden","true")
                .selectAll("div").remove();
            d3.select(".ff-name-selected")
                //these need to be functions because js will otherwise still try to get the attribute even if the selection is empty
                .style("color",function(){return d3.select(".ff-name-selected").attr("ff-previous-c");})
                .style("background-color",function(){return d3.select(".ff-name-selected").attr("ff-previous-bg");})
                .attr("ff-previous-c",null)
                .attr("ff-previous-bg",null)
                .classed("ff-name-selected",false);
        }
        focusFilter.onclick = clickAway;
        focusFilter.oncontextmenu = clickAway;
    },

    //Call to get data to build the global document timeline
    //As this component was added later, it is somewhat independent from the others
    //As such, this call may also be getting repeated information that could be optimized
    //Calls global timeline setup upon successful retrieval
    getGlobalTimelineData: function() {
        var response = documentVisualize.variables.rawData.getDocumentTimelineFull;
        documentVisualize.variables.globalTimelineData = response;
        documentVisualize.prototype.setupGlobalTimeline(response);
    },

    //Call to get event data to build timeline for document within a committee
    //Visualization setup is called upon successful retrieval
    getDocumentTimelineData: function() {
        var response = documentVisualize.variables.rawData.getDocumentHistory;
        documentVisualize.variables.timelineData = response;
        documentVisualize.prototype.setup(response);
    },

    getTimestampId: function() {
        var eventId = -1;
        if (location.hash !== '') {
            eventId = location.hash.replace('#','');
        } else {
            eventId = -1;
        }
        return eventId;
    },

    //Sets up data and components for global timeline visualization
    setupGlobalTimeline: function(data) {
        //link all sessions to its proposals and vice-versa
        //link all proposals to its documents and vice-versa
        data.documents.map(function(d){
            d["committee"] = data.committees.find(function(c){return d.committee_id == c.id;});
            d["session"] = d.committee.sessions.find(function(s){return d.session_id == s.id;});
            d["events"] = [];
            d["parents"] = data.documents.filter(function(d2){return d2.id == d.parent_id;});
            d["children"] = data.documents.filter(function(d2){return d2.parent_id == d.id;});
        });
        var allSessions = data.committees.reduce(function(acc,c){
            return acc = acc.concat(c.sessions);
        },[]);
        data.committees.map(function(c,ci){
            c["index"] = ci; //used for height when we don't have access to ci; it is very bad practice, fix later
            c.sessions.map(function(s){
                s["committee"] = c;
                s["events"] = [];
                s["pcounts"] = [0,0,0,0];
                s["creations"] = [];
                s["referrals"] = [];
                s["documents"] = [];
            })
            c.proposals.map(function(p){
                p["session"] = c.sessions.find(function(s){return p.session_id == s.id;});
                p.session.events.push(p);
                if (p.outcome != null)
                    p.outcome["session"] = c.sessions.find(function(s){return p.outcome.session_id == s.id;});
                p["document"] = data.documents.find(function(d){return p.document_id == d.id;});
                p.document.events.push(p);
                if (!p.session.documents.includes(p.document)) p.session.documents.push(p.document);
                p["status"] = null;
                if (p.outcome == null) {p.status = "PENDING"; p.session.pcounts[0]++;}
                else if (p.outcome.type == "ADOPT_PROPOSAL") {p.status = "ACCEPTED"; p.session.pcounts[1]++;}
                else if (p.outcome.type == "REJECT_PROPOSAL") {p.status = "REJECTED"; p.session.pcounts[2]++;}
                else p.status = "OTHER";
            })
        });
        data.documents.map(function(d){
            d.session.events.push(d);
            d.session.creations.push(d);
            if (d.outcome != null) {
                d.outcome["session"] = d.committee.sessions.find(function(s){return d.outcome.session_id == s.id;});
                d.outcome.session.events.push(d.outcome);
            }
            d["parent_session"] = null;
            if (d.parent_session_id != null) {
                d.parent_session = allSessions.find(function(s){return d.parent_session_id == s.id;});
                d.parent_session.referrals.push(d);
            }
        });
        data.committees.map(function(c){
            c.sessions.map(function(s){
                s["creations"].map(function(d,di){d["index_in_session"] = di;});
                s.creations.sort(function(a,b){return a.id-b.id;});
                s["subdocument_events"] = (s.creations.concat(s.referrals)).sort(function(e1,e2){return e1.id-e2.id});
                s["document_ids"] = s.documents.map(function(d){return d.id;});
                //check this later
            });
        });

        var transfers = [];
        data.documents.map(function(d){
            if (d.parent_session_id != null) {
                transfers.push({
                    "origin_session" : d.parent_session,
                    "origin_document" : d.parents[0],
                    "origin_height" : 0,
                    "destination_session" : d.session,
                    "destination_height" : d.index_in_session,
                    "destination_document" : d
                });
            }
        });
        data["transfers"] = transfers;

        var globalTimelineSVG = d3.select("#global-timeline-view").append("svg");
        var thisDocument = data.documents[0];
        documentVisualize.prototype.drawGlobalTimeline(globalTimelineSVG,data.committees,data.documents,transfers,thisDocument);

        d3.select("#global-timeline-title")
            .html("Global Timeline for "+thisDocument.name);
    },

    //Drawing function for global timeline SVG
    drawGlobalTimeline: function(tsvg,committees,documents,transfers,currentDocument) {
        var width = documentVisualize.variables.timelineWidth;
        var margin = {top:20,bottom:40,left:60,right:60}
        var cheight = 85;
        var cheight_min = 35;
        //var height = (committees.length*cheight)+margin.top+margin.bottom;
        var dotRadius = 4;
        var columnWidth = dotRadius *2.5;

        var usableWidth = width - margin.left - margin.right;
        var maxDate = committees.reduce(function(acc,c){
            var val = Date.parse(c.sessions[c.sessions.length-1].date);
            if (acc > val) return acc;
            else return val;
        },-Infinity);
        var minDate = committees.reduce(function(acc,c){
            var val = Date.parse(c.sessions[0].date);
            if (acc < val) return acc;
            else return val;
        },Infinity);

        var maxEvents = committees.reduce(function(acc,c){
            var val = c.sessions.reduce(function(acc,s){
                var sum = s.pcounts[0]+s.pcounts[1]+s.pcounts[2];
                if (sum > acc) return sum;
                else return acc;
            },0)
            c["max_event_height"] = val;
            if (val > acc) return val;
            else return acc;
        },0);

        var scaleX = d3.scaleTime()
            .domain([minDate,maxDate])
            .range([0+margin.left,0+margin.left+usableWidth]);
        var currentScaleX = scaleX;

        var cscaleY = d3.scaleLinear()
            .domain([0,maxEvents])
            .range([0,cheight-10]);

        var cheights = committees.map(function(c){
            var height = 10+cscaleY(c.max_event_height);
            if (cheight_min > height) return cheight_min;
            else return height;
        });

        var height = getCommitteeHeight(committees.length-1)+margin.bottom;

        tsvg.attr("width",usableWidth+margin.left+margin.right)
            .attr("height",height)

        tsvg.selectAll("*").remove();

        tsvg.append('defs')
            .append('pattern')
            .attr('id', 'hatch')
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('width', 4)
            .attr('height', 4)
            .append('path')
            .attr('d', 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2')
            .attr('stroke', '#5C2334')
            .attr('stroke-width', 1.5);

        var axisX = tsvg.append("g")
            .attr("transform", "translate(0," + (height-margin.bottom+15) + ")")
            .call(d3.axisBottom(scaleX).tickFormat(d3.timeFormat("%b %d, %Y")).tickValues(scaleX.domain()));

        var selLinks = tsvg.append("g")
            .attr("class","gtl-transfers");

        selLinks = selLinks.selectAll("path")
            .data(transfers)
                .join("path")
                .attr("d",function(d){
                    if (d.origin_session.committee.index == d.destination_session.committee.index) {

                    }
                    else
                    return "M "+scaleX(Date.parse(d.origin_session.date))+" "+(getCommitteeHeight(d.origin_session.committee.index)-3)
                        +" C "+(scaleX(Date.parse(d.origin_session.date))+20)+" "+(getCommitteeHeight(d.origin_session.committee.index)-3)
                        +" "+(scaleX(Date.parse(d.destination_session.date))-20)+" "+(getCommitteeHeight(d.destination_session.committee.index)-3)
                        +" "+scaleX(Date.parse(d.destination_session.date))+" "+(getCommitteeHeight(d.destination_session.committee.index)-3);
                })
                .attr("fill","transparent")
                .attr("stroke","black")
                .attr("stroke-width",0.75);

        selLinks.attr("opacity",function(d){
            if (d.origin_document == currentDocument) return 1;
            if (d.destination_document == currentDocument) return 1;
            else return 0.4;
        });

        var selCommittees = tsvg.append("g").selectAll("g")
            .data(committees)
                .join("g")
                    .attr("id",function(d){return "gtl-c-"+d.id;});
        selCommittees.append("line")
            .attr("class","gtl-sessions-line")
            .attr("x1",scaleX(minDate))
            .attr("x2",scaleX(maxDate))
            .attr("y1",function(d,di){return getCommitteeHeight(di)-3;})
            .attr("y2",function(d,di){return getCommitteeHeight(di)-3;})
            .attr("stroke","#dd4814")
            .attr("stroke-width",1);
        selCommittees.append("text")
            .attr("x",margin.left)
            .attr("y",function(d,di){return (getCommitteeHeight(di))+10;})  
            .style("font-size","8pt")
            .text(function(d){return d.name;});
                
        var selSessions = selCommittees.append("g")
            .attr("class","gtl-sessions")
            .attr("transform",function(d,di){return "translate(0 "+(getCommitteeHeight(di)-3)+")";})
            .selectAll("g")
            .data(function(d){return d.sessions;})
                .join("g")
                    .attr("transform",function(d,di){return "translate("+scaleX(Date.parse(d.date))+" 0)";})
                    .attr("id", function(d){return "tl-session-"+d.id;})
                    .on("mouseover",mouseOverGTLElement)
                    .on("mouseout",mouseOverGTLElementOut);
        
        selSessions.append("circle")
            .attr("class","gtl-dot-session")
            .attr("cy",0)
            .attr("r",3)
            .attr("default-color","#fbdace")
            .attr("fill","#dd4814")
            .attr("stroke","#dd4814")
            .attr('stroke-width', 0.5);

        selSessions.append("rect")
            .attr("class","gtl-bar")
            .attr("x",-3)
            .attr("y",function(d){return -3-cscaleY(d.pcounts[1]);})
            .attr("width",6)
            .attr("height",function(d){return cscaleY(d.pcounts[1]);})
            .attr("fill","#5C2334");
        selSessions.append("rect")
            .attr("class","gtl-bar")
            .attr("x",-3)
            .attr("y",function(d){return -3-cscaleY(d.pcounts[1]+d.pcounts[2]);})
            .attr("width",6)
            .attr("height",function(d){return cscaleY(d.pcounts[2]);})
            .attr('fill', "url(#hatch)");
        selSessions.append("rect")
            .attr("class","gtl-bar")
            .attr("x",-3)
            .attr("y",function(d){return -3-cscaleY(d.pcounts[1]+d.pcounts[2]+d.pcounts[0]);})
            .attr("width",6)
            .attr("height",function(d){return cscaleY(d.pcounts[0]);})
            .attr('fill', "#E0BC80");

        d3.selectAll(".gtl-bar,.gtl-dot-session").attr("opacity",function(d){
            if (d.documents.includes(currentDocument)) return 1;
            else return 0.3;
        });
    

        var selSubDocuments = selSessions.append("g")
            .attr("class","gtl-subdocuments")
            .selectAll("g")
            .data(function(d){return d.creations;})
                .join("g")
                .attr("class","gtl-subdocument")
                .style("cursor","pointer")
                .on("mouseover",mouseOverGTLSubDocument)
                .on("mouseout",mouseOverGTLSubDocumentOut)
                .on("click",clickGTLSubDocument);

        selSubDocuments.append("rect")
            .attr("x",-3)
            .attr("y",function(d,di){return 4+(di*8);})
            .attr("width",6)
            .attr("height",6)
            .attr("fill","#E0BC80");
        selSubDocuments.append("path")
            .attr("d",function(d,di){
                var y0 = 4+(di*8); 
                return "M0 "+y0+" L3 "+y0+" L3 "+(y0+3)+" Z"})
            .attr("fill","#dd4814");

        function getCommitteeHeight(index){
            return d3.sum(cheights.slice(0,index+1))-margin.top;
        }
        
        function mouseOverGTLElement(d,i){
            var rect = this.getBoundingClientRect();
            var box = d3.select("body").append("div")
                .attr("class","tooltip")
                .style("right", ($(window).width()-d3.event.clientX+6)+"px")
                .style("top", (rect.top+rect.height)+"px")
                .style("opacity",0)
                .style("text-align","right");
        
            box.append("p")
                .style("margin","5px")
                .style("font-size", "14px")
                .text("Date: "+d.date.slice(0,-13));

            box.append("p")
                .style("margin","5px")
                .style("font-size", "12px")
                .text("Session id: "+d.id);

            box.append("p")
                .style("margin","5px")
                .style("font-size", "12px")
                .text("Total number of proposals: "+(d.pcounts[0]+d.pcounts[1]+d.pcounts[2]+d.pcounts[3]));
            
            box.append("p")
                .style("margin","5px")
                .style("font-size", "12px")
                .text("Approved: "+(d.pcounts[1])+", Rejected: "+d.pcounts[2]+", Pending: "+d.pcounts[0]); 
        
            if (d.documents.length > 0){    
                box.append("p");        
                d.documents.map(function(d){
                    box.append("p")
                        .style("margin","5px")
                        .style("font-size", "12px")
                        .text("DISCUSSED: "+d.name); 
                });
            }

            if (d.creations.length > 0){    
                box.append("p");        
                d.creations.map(function(c){
                    box.append("p")
                        .style("margin","5px")
                        .style("font-size", "12px")
                        .text("CREATED: "+c.name); 
                });
            }

            if (d.referrals.length > 0){
                box.append("p");
                d.referrals.map(function(c){
                    if (c.committee_id != d.committee_id)
                        box.append("p")
                            .style("margin","5px")
                            .style("font-size", "12px")
                            .text("EXPORTED: "+c.name); 
                });
            }

            box.transition()
                .duration(100)
                .style('opacity', .9);

            d3.selectAll(".gtl-bar,.gtl-dot-session").attr("opacity",function(d2){
                if (d2 == d) return 1;
                return d3.select(this).attr("opacity");
            });
            selLinks.attr("opacity",function(d2){
                if (d2.origin_session == d) return 1;
                if (d2.destination_session == d) return 1;
                return d3.select(this).attr("opacity");
            });
             
        }

        function mouseOverGTLElementOut(){
            d3.selectAll(".tooltip").transition()
                .duration(100)
                .style("opacity",0)
                .remove();

            d3.selectAll(".gtl-bar,.gtl-dot-session").attr("opacity",function(d2){
                if (d2.documents.includes(currentDocument)) return 1;
                else return 0.3;
            });
            
            selLinks.attr("opacity",function(d2){
                if (d2.origin_document == currentDocument) return 1;
                if (d2.destination_document == currentDocument) return 1;
                else return 0.4;
            });
        }

        function mouseOverGTLSubDocument(d,i){
            d3.event.stopPropagation();
            var rect = this.getBoundingClientRect();
            var box = d3.select("body").append("div")
                .attr("class","tooltip")
                .style("right", ($(window).width()-d3.event.clientX+6)+"px")
                .style("top", (rect.top+rect.height)+"px")
                .style("opacity",0)
                .style("text-align","right");
        
            box.append("p")
                .style("margin","5px")
                .style("font-size", "14px")
                .text("Name: "+d.name);

            box.append("p")
                .style("margin","5px")
                .style("font-size", "14px")
                .text("id: "+d.id);
        
            box.transition()
                .duration(100)
                .style('opacity', .9);

            d3.selectAll(".gtl-bar,.gtl-dot-session").attr("opacity",function(d2){
                if (d2.documents.includes(d)) return 1;
                else return 0.3;
            });

            selLinks.attr("opacity",function(d2){
                if (d2.origin_document == d) return 1;
                if (d2.destination_document == d) return 1;
                else return 0.4;
            });          
        }

        function mouseOverGTLSubDocumentOut(){
            d3.event.stopPropagation();
            d3.selectAll(".tooltip").transition()
                .duration(100)
                .style("opacity",0)
                .remove();

            d3.selectAll(".gtl-bar,.gtl-dot-session").attr("opacity",function(d2){
                if (d2.documents.includes(currentDocument)) return 1;
                else return 0.3;
            });
            
            selLinks.attr("opacity",function(d2){
                if (d2.origin_document == currentDocument) return 1;
                if (d2.destination_document == currentDocument) return 1;
                else return 0.4;
            });
        }

        function clickGTLSubDocument(d,i){
            d3.event.stopPropagation();
            location.href = ("/document_visualize2/"+d.id);
        }
    },

    //Sets up data and components for the linked visual interface
    setup: function(data) {
        data.sessions.map(function(s,si){s["events"] = []; s["index"] = si});//{proposals: [], creation: [], outcomes: []};}); //change this later
        data.events.creation["session"] = data.sessions.find(function(s){return data.events.creation.session_id == s.id;});
        data.events.creation["tree_ids"] = [data.events.creation.id];
        data.events.creation["parent"] = null;
        data.events.creation.session.events.push(data.events.creation);
        data.events.proposals.map(function(p){
            p["session"] = data.sessions.find(function(s){return p.session_id == s.id;});
            p.session.events.push(p);
            p["outcome"] = null;
            if (p.decisions.length > 0) p.outcome = p.decisions[p.decisions.length-1];
            p["parent"] = null;
            if (p.parent_id == data.events.creation.id) p.parent = data.events.creation;
            else p.parent = data.events.proposals.find(function(p2){return p2.id == p.parent_id;});//this returns undefined (will not keep null) if no parent
            p["tree_ids"] = [p.id];
        });
        data.events.proposals.map(function(p){
            data.events.creation.tree_ids.push(p.id);
            var par = p.parent;
            while (!["CREATE","CREATE_FROM"].includes(par.type)){
                par.tree_ids.push(p.id);
                par = par.parent;
            }
        })
        data.relationships.children.map(function(c){
            //check if child creation event is part of the same committee timeline
            //if not, it will show up as a report decision on the next statement
            if (c.committee_id != data.events.creation.committee_id) return;
            c["session"] = data.sessions.find(function(s){return c.session_id == s.id;});
            c["tree_ids"] = [c.id];
            c["parent"] = null;
            c.session.events.push(c);
        });
        data.events.creation.decisions.map(function(d){
            d["session"] = data.sessions.find(function(s){return d.session_id == s.id;});
            d["tree_ids"] = [d.id];
            d["parent"] = data.events.creation;
            data.events.creation.tree_ids.push(d.id);
            d.session.events.push(d);
        });
        documentVisualize.variables.sessions = data.sessions;

        var PPRelationships = data.sessions.reduce(function(acc,s){
            return acc.concat(s.events.map(function(p,pi){
                if (p.parent==null) return null;
                var date2 = p.date;
                var session2 = p.session;
                var height2 = pi;
                var id2 = p.id;

                var date1 = p.parent.date;
                var session1 = p.parent.session;
                var height1 = p.parent.session.events.findIndex(function(e){return e.id == p.parent.id;});
                var id1 = p.parent.id;
                return {d1:date1,d2:date2,s1:session1,s2:session2,h1:height1,h2:height2,id1:id1,id2:id2};
            }));
        },[]);
        //Create event has no parents but it needs to have an index. It's easier to just add a blank dict then remove it afterwards.
        PPRelationships = PPRelationships.filter(function(d){return d != null;});
        data.ppr = PPRelationships;

        documentVisualize.variables.events = data.events;

        var pscores = documentVisualize.prototype.calculatePersonScores(data.events);
        pscores.sort(function(a,b){return a.score-b.score;}).reverse(); //descending order
        documentVisualize.variables.people = pscores;

        var kwscores = documentVisualize.prototype.calculateKeywordScores(data.events);
        kwscores.sort(function(a,b){return a.score-b.score;}).reverse(); //descending order
        documentVisualize.variables.keywords = kwscores;

        d3.select("#document-text-title")
            .html("Text viewer - latest ("+(d3.timeFormat("%b %d, %Y")(Date.parse(data.sessions[data.sessions.length-1].date)))+")")
        d3.select("#document-text-view")
            .style("font-size","12px")
            .html(data.html_text);
        documentVisualize.prototype.setupTextInteractivity();

        documentVisualize.prototype.updateInfoView(data);

        var selPeople = d3.select("#related-people-view").selectAll(".person-item")
            .data(pscores)
            .join("div")
                .attr("class","person-item")
                .style("font-size","12px")
                .style("cursor","default")
                .html(function(d){return d.name+"("+d.score+")";})
                .on("click",clickName)
                .on("contextmenu",rightClickName);
        documentVisualize.variables.selectionPeople = selPeople;

        var selKeywords = d3.select("#keywords-view").selectAll(".keyword-item")
            .data(kwscores)
            .join("div")
                .attr("class","keyword-item")
                .style("font-size","12px")
                .style("cursor","default")
                .html(function(d){return d.word+"("+d.score+") ";})
                .on("click",clickName)
                .on("contextmenu",rightClickName);
        documentVisualize.variables.selectionKeywords = selKeywords;

        var timelineSVG = d3.select("#timeline-view").append("svg");
        this.drawTimeline(timelineSVG,data.sessions,data.ppr,data.documents);

        d3.select("#timeline-title")
            .html("Timeline for "+data.events.creation.name+" in "+data.events.creation.committee_name);

        //probably better to remove functions from inside parent function at some point
        function clickName(d,i){
            if (documentVisualize.prototype.checkReclickingElement(this)) return;
            else {
                documentVisualize.variables.selectedElement = this;
                var eventIds = d.events.map(function(e){return e.id});
                documentVisualize.prototype.disableColors();
                documentVisualize.prototype.applySelectionColors(eventIds);
                documentVisualize.variables.selectedIds = eventIds;
                d3.select(this).style("background-color","#1D7EDF");
            }
        }

        function rightClickName(d,i){
            d3.event.preventDefault();
            d3.select(this)
                .classed("ff-name-selected",true)
                .attr("ff-previous-bg",d3.select(this).style("background-color"))
                .attr("ff-previous-c",d3.select(this).style("color"))
                .style("color","white")
                .style("background-color","DimGrey");
            var rect = this.getBoundingClientRect();
            var box = d3.select("#focus-filter").append("div")
                .attr("class","context-popup")
                .style("left", (d3.event.clientX)+"px")
                .style("top", (d3.event.clientY-20)+"px");
            if ("name" in d) //element is person
                box.append("div")
                    .attr("class","context-popup-option")
                    .append("a")
                        .style("margin","5px")
                        .style("font-size", "12px")
                        .attr("href","/person_visualize/"+documentVisualize.variables.conventionId+"/"+d.id)
                        .attr("target","_blank")
                        .html("Go to person page");
            if ("word" in d) //element is keyword
                box.append("div")
                    .attr("class","context-popup-option")
                    .append("a")
                        .style("margin","5px")
                        .style("font-size", "12px")
                        .attr("href","/topic_view/"+documentVisualize.variables.conventionId+"#"+d.id)
                        .attr("target","_blank")
                        .html("Go to keyword page");

            d3.select("#focus-filter").attr("hidden",null);
        }
    },

    //Draws committee event timeline
    drawTimeline: function(tsvg,sessionData,treeData,docData){
        var width = documentVisualize.variables.timelineWidth;
        //var height = 300;
        var margin = {top:0,bottom:65,left:60,right:60}
        var dotRadius = 4;
        var columnWidth = dotRadius *2.5;

        var usableWidth = width - margin.left - margin.right;
        var maxDate = Date.parse(sessionData[sessionData.length-1].date);
        var minDate = Date.parse(sessionData[0].date);

        var collapsed = documentVisualize.variables.timelineCollapsed;

        if (collapsed) {
            var filteredSessions = sessionData.filter(function(s){return s.events.length > 0;});
            filteredSessions.map(function(d,di){d.index = di;});
            var fsSize = filteredSessions.length;
            var scaleX = d3.scaleLinear()
                .domain([0,fsSize-1])
                .range([0+(margin.left*2),0+usableWidth]);
        }
        else {
            var scaleX = d3.scaleTime()
                .domain([minDate,maxDate])
                .range([0+margin.left,0+margin.left+usableWidth]);
        }

        var currentScaleX = scaleX;

        var maxSessionHeight = d3.max(sessionData.map(function(s){return s.events.length;}));
        var height = margin.top+margin.bottom+14+(maxSessionHeight*(dotRadius+1)*2)+28;//may get slightly off depending on how many larger event icons are there
        //14: height of axis + session circles; 28: height of legend

        tsvg.attr("width",usableWidth+margin.left+margin.right)
            .attr("height",height)

        tsvg.selectAll("*").remove();

        if (!collapsed){
            var axisX = tsvg.append("g")
                .attr("transform", "translate(0," + (height-margin.bottom) + ")")
                .call(d3.axisBottom(scaleX).tickFormat(d3.timeFormat("%b %d, %Y")).tickValues(scaleX.domain()));

            var navBehavior = d3.zoom()
                .extent([[0,0],[width,0]])
                .scaleExtent([1, 20])
                .translateExtent([[0,0],[width,0]])
                .on("zoom", zoomAndUpdate);
                
            var currentZoom = 1;
        }

        var background = tsvg.append("rect")
            .attr("id","tl-background")
            .attr("x",0)
            .attr("y",0)
            .attr("width", tsvg.attr("width"))
            .attr("height", tsvg.attr("height"))
            .attr("fill","rgba(0,0,0,0)")
            .on("click",documentVisualize.prototype.resetSelection);

        if (!collapsed) {
            background.call(navBehavior)
                    //.style("pointer-events", "all")
                    .on("dblclick.zoom",resetZoom);
        }

        tsvg.append("line")
            .attr("id","tl-sessions-line")
            .attr("x1",function(){if (collapsed) return scaleX(0); else return scaleX(minDate);})
            .attr("x2",function(){if (collapsed) return scaleX(fsSize-1); else return scaleX(maxDate);})
            .attr("y1",height-margin.bottom-3)
            .attr("y2",height-margin.bottom-3)
            .attr("stroke","#dd4814")
            .attr("stroke-width",1);

        tsvg.append('defs')
            .append('marker')
            .attr('id', 'arrow')
            .attr('viewBox', [0, 0, 10, 10])
            .attr('refX', 5)
            .attr('refY', 5)
            .attr('markerWidth', 10)
            .attr('markerHeight', 10)
            .attr('orient', 'auto-start-reverse')
            .append('circle')
                .attr("cx",3)
                .attr("cy",5)
                .attr("r",2)
                .attr("fill","black");

        tsvg.append("defs")
            .append("clipPath")
            .attr("id","tl-clip-margin")
            .append("rect")
                .attr("x",margin.left-6)
                .attr("y",margin.top-6)
                .attr("width",width-margin.left-margin.right+12)
                .attr("height",height-margin.top-margin.bottom+82);

        var selParentConnections = tsvg.append("g")
            .attr("id","tl-parent-connections")
            .selectAll("path")
            .data(treeData)
            .join("path")
                .attr("d",function(d){
                    if (collapsed){
                        var x1 = scaleX(d.s1.index);
                        var x2 = scaleX(d.s2.index);
                    }
                    else{
                        var x1 = scaleX(Date.parse(d.d1)); //not collapsed
                        var x2 = scaleX(Date.parse(d.d2));
                    }
                    var y1 = getDotHeightInTimeline(d.s1,d.h1);
                    var y2 = getDotHeightInTimeline(d.s2,d.h2);
                    //dont need to have date AND session in the same dict. clean later?

                    if (x1 != x2) return ["M "+(x1+4)+" "+y1+" L "+(x2-4)+" "+y2];
                    else return ["M "+(x1-4)+" "+y1+" C "+(x1-(4+((y1-y2)*0.75)))+" "+(y1)+", "+(x2-(4+((y1-y2)*0.75)))+" "+(y2)+", "+(x2-4)+" "+y2];
                })
                .attr("stroke","rgba(0,0,0,0.5)")
                .attr("stroke-width",1)
                .attr("fill","None")
                .attr('marker-end', 'url(#arrow)')
                .attr("visibility","hidden");

        var selSessions = tsvg.append("g")
            .attr("id","tl-sessions")
            .attr("clip-path","url(#tl-clip-margin)")
            .selectAll("g")
            .data(function(){if (collapsed) return filteredSessions; else return sessionData;})
            .join("g")
                .attr("transform",function(d,di){if (collapsed) return "translate("+scaleX(di)+" 0)"; else return "translate("+scaleX(Date.parse(d.date))+" 0)";})
                .attr("id", function(d){return "tl-session-"+d.id;});

        var selEvents = selSessions.selectAll("g")
            .data(function(s){return s.events;})
            .join("g")
                .attr("class","tl-dot-event")
                .attr("transform",function(d,di){return "translate(0 "+(getDotHeightInTimeline(d.session,di))+")";})
                .on("mouseover",mouseOverTLEvent)
                .on("mouseout",mouseOverTLEventOut)
                .on("click",clickTLEvent)
                .on("contextmenu",rightClickTLEvent);

        selEvents.each(function(d,di){
            //this amount of if statements hurts my soul but I think it will be better for readability/consistency
            var el = d3.select(this);

            if (d.type == "PROPOSE_DOCUMENT_AMENDMENT") {
                if ((d.outcome == null) || (DECISION_TYPES.POSTPONED.includes(d.outcome.type)))
                    el.attr("dot-type","proposal-pending");

                else if (DECISION_TYPES.NEGATIVE.includes(d.outcome.type)){
                    if (d.outcome.session_id != d.session_id)
                        el.attr("dot-type","proposal-rejected-later");
                    else
                        el.attr("dot-type","proposal-rejected-now");
                }
                //if (DECISION_TYPES.POSITIVE.includes(d.outcome.type))
                else 
                    if (d.outcome.session_id != d.session_id)
                        el.attr("dot-type","proposal-adopted-later");
                    else
                        el.attr("dot-type","proposal-adopted-now");
            }
            else if (d.type == "IMPORT_FROM") {
                if ((d.outcome == null) || (DECISION_TYPES.POSTPONED.includes(d.outcome.type)))
                    el.attr("dot-type","import-pending");

                else if (DECISION_TYPES.NEGATIVE.includes(d.outcome.type)){
                    if (d.outcome.session_id != d.session_id)
                        el.attr("dot-type","import-rejected-later");
                    else
                        el.attr("dot-type","import-rejected-now");
                }
                //if (DECISION_TYPES.POSITIVE.includes(d.outcome.type))
                else 
                    if (d.outcome.session_id != d.session_id)
                        el.attr("dot-type","import-adopted-later");
                    else
                        el.attr("dot-type","import-adopted-now");
            }
            else {
                if ((d.type == "CREATE") || (d.type == "CREATE_FROM")){
                    if (d.id == documentVisualize.variables.documentId)
                        el.attr("dot-type","document-creation")
                            .attr("transform","translate(0 "+(getDotHeightInTimeline(d.session,di)-1)+")");
                            //redefining transform here just to subtract 1 on the y axis is not really ideal
                    else
                        el.attr("dot-type","child-creation")
                            .attr("transform","translate(0 "+(getDotHeightInTimeline(d.session,di)-1)+")");
                }
                //if ((d.type == "REPORT_PROPOSAL") || (d.type == "DROP_PROPOSAL"))
                else  
                    el.attr("dot-type","decision");
            }
            documentVisualize.prototype.timelineDotLibrary[el.attr("dot-type")].create(el);
        });

        documentVisualize.variables.selectionTLEvents = selEvents;

        var maxProposals = d3.max(sessionData.map(function(d){return d.events.length;}));
        var barScaleY = d3.scaleLinear().domain([0,maxProposals]).range([height-margin.bottom-14,margin.top])

        if (collapsed) {
            var tf = d3.timeFormat("%b, %d, %Y");
            selSessions.append("text")
                    //.attr("x",-height+10)
                    .attr("transform","translate(-15 "+(height)+") rotate(285)")
                    .style("font-size","7pt")
                    .text(function(d){return tf(Date.parse(d.date));});
        }

        selSessions.append("circle")
                .attr("class","tl-dot-session")
                .attr("cy",height-margin.bottom-3)
                .attr("r",dotRadius*1.25)
                .attr("default-color","#fbdace")
                .attr("fill","#fbdace")
                .attr("stroke","#dd4814")
                .attr('stroke-width', 0.5)
                .on("mouseover",mouseOverTLSession)
                .on("mouseout",mouseOverTLSessionOut)
                .on("click",clickTLSession);  
        documentVisualize.variables.selectionTLSessions = selSessions;

        drawTimelineLegend(tsvg);
        drawTimelineNavControls(tsvg);
    
        function getDotHeightInTimeline(session,index){
            const evHeight = {CREATE: 12, CREATE_FROM: 12, PROPOSE_DOCUMENT_AMENDMENT: 10, REPORT_PROPOSAL: 12, DROP_PROPOSAL: 12, IMPORT_FROM: 10};
            var output = height-margin.bottom-14;
            for (var i=0;i<index;i++)
                output -= evHeight[session.events[i].type];
            return output;
        }

        function mouseOverTLSession(d,i){
            var rect = this.getBoundingClientRect();
            var box = d3.select("body").append("div")
                .attr("class","tooltip")
                .style("left", (rect.left+rect.width)+"px")
                .style("top", (rect.top+rect.height)+"px")
                .style("opacity",0);
        
            box.append("p")
                .style("margin","5px")
                .style("font-size", "14px")
                .text(d.date);

            box.append("p")
                .style("margin","5px")
                .style("font-size", "12px")
                .text("Session id: "+d.id);

            box.append("p")
                .style("margin","5px")
                .style("font-size", "12px")
                .text(d.description);
        
            box.transition()
                .duration(100)
                .style('opacity', .9);

            d3.select(this).attr("r",6.5);
        }
        //todo: replace radius value with variable here

        function mouseOverTLSessionOut(){
            d3.selectAll(".tooltip").transition()
                .duration(100)
                .style("opacity",0)
                .remove();

            d3.select(this).attr("r",5);
        }

        function clickTLSession(d,i){
            if (documentVisualize.prototype.checkReclickingElement(this)) return;
            else {
                documentVisualize.variables.selectedElement = this;
                var eventIds = d.events.map(function(e){return e.id;});
                documentVisualize.prototype.applySelectionColors(eventIds);
                documentVisualize.variables.selectedIds = eventIds;
                d3.select(this).select("circle").attr("fill","#1D7EDF");
            }
        }

        function mouseOverTLEvent(d,i){
            var rect = this.getBoundingClientRect();
            var box = d3.select("body").append("div")
                .attr("class","tooltip")
                .style("right", ($(window).width()-d3.event.clientX+6)+"px")
                .style("top", (rect.top+rect.height)+"px")
                .style("opacity",0)
                .style("text-align","right");
        
            box.append("p")
                .style("margin","5px")
                .style("font-size", "14px")
                .text(d.name);

            box.append("p")
                .style("margin","5px")
                .style("font-size", "12px")
                .text(d.id+": "+d.type);
    
            if (d.name) {
                box.append("p")
                    .style("margin","5px")
                    .style("font-size", "12px")
                    .text(d.proposal_name);
            }
            
            box.append("p")
                .style("margin","5px")
                .style("font-size", "12px")
                .text("Date: "+d.date.slice(0,-13));
    
            if (d.decisions) {
                if (d.decisions.length == 0) {
                    box.append("p")
                        .style("margin","5px")
                        .style("font-size", "12px")
                        .text("Last outcome: NONE");
                }
                else {
                    box.append("p")
                        .style("margin","5px")
                        .style("font-size", "12px")
                        .text("Last outcome: "+d.decisions[d.decisions.length-1].type);
                    box.append("p")
                        .style("margin","5px")
                        .style("font-size", "12px")
                        .text("Outcome last changed on: "+d.decisions[d.decisions.length-1].date.slice(0,-13));
                }
            }

            if (d.type == "CREATE" && d.id == documentVisualize.variables.documentId){
                if (documentVisualize.variables.timelineData.relationships.ancestors.length > 0){
                    box.append("p")
                        .style("margin","5px")
                        .style("font-size", "12px")
                        .text("Revision of: "+documentVisualize.variables.timelineData.relationships.ancestors[0].name);
                }
            }

            if (d.type == "CREATE_FROM"){
                box.append("p")
                    .style("margin","5px")
                    .style("font-size", "12px")
                    .text("Created from: "+documentVisualize.variables.timelineData.relationships.ancestors[0].name);
                box.append("p")
                    .style("margin","5px")
                    .style("font-size", "12px")
                    .text("Original Committee: "+documentVisualize.variables.timelineData.relationships.ancestors[0].committee_name);     
            }
        
            box.transition()
                .duration(100)
                .style('opacity', .9);
    
            d3.select(this).attr("transform",this.getAttribute("transform")+" scale(1.3, 1.3)");

            //this reference does not look good
            selParentConnections.attr("visibility",function(c){
                if (d.tree_ids.includes(c.id2)) return "visible";
                else return "hidden";
            })

            selEvents.attr("opacity",function(e){
                var eventIds = d.parent? d.tree_ids.concat(d.parent.id) : d.tree_ids;
                if (eventIds.includes(e.id)) return 1.0;
                else return 0.3;
            })
            
        }
        //reminder to change dot radius value to variable here
        function mouseOverTLEventOut(){
            d3.select(this).attr("transform",this.getAttribute("transform").slice(0,-16));
            selParentConnections.attr("visibility","hidden");
            selEvents.attr("opacity",1.0);

            d3.selectAll(".tooltip").transition()
                .duration(100)
                .style("opacity",0)
                .remove();
        }

        function clickTLEvent(d,i){
            if (documentVisualize.prototype.checkReclickingElement(this)) return;
            else {
                documentVisualize.variables.selectedElement = this;
                var eventIds = [d.id].concat(d.tree_ids);
                //selecting only proposal and its children now
                
                documentVisualize.prototype.applySelectionColors(eventIds);
                documentVisualize.variables.selectedIds = eventIds;
                d3.select(this).select("circle").attr("fill","#1D7EDF");
                //also highlight decisions if necessary?
            }
        }

        function rightClickTLEvent(d,i){
            d3.event.preventDefault();
            var rect = this.getBoundingClientRect();
            var box = d3.select("#focus-filter").append("div")
                .attr("class","context-popup")
                .style("left", (d3.event.clientX)+"px")
                .style("top", (d3.event.clientY-44)+"px");
            box.append("div")
                .attr("class","context-popup-option")
                .append("a")
                    .style("font-size", "12px")
                    .attr("href","/session_visualize/"+d.session.id+"#"+d.id)
                    .attr("target","_blank")
                    .html("Go to event page");

            if (d.type == "PROPOSE_DOCUMENT_AMENDMENT" || d.type == "IMPORT_FROM") 
                box.append("div")
                    .attr("class","context-popup-option")
                    .append("a")
                        .style("font-size", "12px")
                        .attr("href","/document_visualize2/"+documentVisualize.variables.documentId+"#"+d.id)
                        .attr("target","_blank")
                        .html("View document at this point");
            
            if (d.type == "CREATE"){
                if (d.id == documentVisualize.variables.documentId) {
                    if (documentVisualize.variables.timelineData.relationships.ancestors.length > 0) {
                        box.append("div")
                            .attr("class","context-popup-option")
                            .append("a")
                                .style("font-size", "12px")
                                .attr("href","/document_visualize2/"+documentVisualize.variables.timelineData.relationships.ancestors[0].id)
                                .attr("target","_blank")
                                .html("View ancestor document");
                    }
                }
                else {
                    box.append("div")
                        .attr("class","context-popup-option")
                        .append("a")
                            .style("font-size", "12px")
                            .attr("href","/document_visualize2/"+d.id)
                            .attr("target","_blank")
                            .html("View child document");
                }
            }

            if (d.type == "CREATE_FROM"){
                box.append("div")
                .attr("class","context-popup-option")
                .append("a")
                    .style("font-size", "12px")
                    .attr("href","/document_visualize2/"+documentVisualize.variables.timelineData.relationships.ancestors[0].id)
                    .attr("target","_blank")
                    .html("View original document");;     
            }

            d3.select("#focus-filter").attr("hidden",null);
        }

        function drawTimelineLegend(svg){
            var legend = svg.append("g").attr("class","tl-legend");
            
            var propAdoptedNow = legend.append("g").attr("transform","translate(5 7)");
            propAdoptedNow.append("circle")
                .attr("r", dotRadius)
                .attr("fill","#E0BC80")
                .attr("stroke-width","2.0")
                .attr("stroke","#5C2334");
            propAdoptedNow.append("text")
                .attr("x",8)
                .attr("y",3)
                .attr("font-size",10)
                .html("Proposal adopted in same session");
            
            var propAdoptedLater = legend.append("g").attr("transform","translate(5 21)");
            propAdoptedLater.append("circle")
                .attr("r", dotRadius)
                .attr("fill","#E0BC80")
                .attr("stroke-width","2.0")
                .attr("stroke","#5C2334")
                .attr("stroke-dasharray","2,1.5");
            propAdoptedLater.append("text")
                .attr("x",8)
                .attr("y",3)
                .attr("font-size",10)
                .html("Proposal adopted in later session");

            var propRejectedNow = legend.append("g").attr("transform","translate(205 7)");
            propRejectedNow.append("circle")
                .attr("r", dotRadius)
                .attr("fill","#5C2334")
                .attr("stroke-width","2.0")
                .attr("stroke","#5C2334")   
            propRejectedNow.append("line")
                .attr("x1",-2.5).attr("x2",2.5).attr("y1",-2.5).attr("y2",2.5).attr("stroke","white").attr("stroke-width",1.5);
            propRejectedNow.append("line")
                .attr("x1",-2.5).attr("x2",2.5).attr("y1",2.5).attr("y2",-2.5).attr("stroke","white").attr("stroke-width",1.5);
            propRejectedNow.append("text")
                .attr("x",8)
                .attr("y",3)
                .attr("font-size",10)
                .html("Proposal rejected in same session");
            
            var propRejectedLater = legend.append("g").attr("transform","translate(205 21)");
            propRejectedLater.append("circle")
                .attr("r", dotRadius)
                .attr("fill","#5C2334")
                .attr("stroke-width","2.0")
                .attr("stroke","#5C2334")
                .attr("stroke-dasharray","2,1.5"); 
            propRejectedLater.append("line")
                .attr("x1",-2.5).attr("x2",2.5).attr("y1",-2.5).attr("y2",2.5).attr("stroke","white").attr("stroke-width",1.5);
            propRejectedLater.append("line")
                .attr("x1",-2.5).attr("x2",2.5).attr("y1",2.5).attr("y2",-2.5).attr("stroke","white").attr("stroke-width",1.5);
            propRejectedLater.append("text")
                .attr("x",8)
                .attr("y",3)
                .attr("font-size",10)
                .html("Proposal rejected in later session");

            var propPending = legend.append("g").attr("transform","translate(405 7)");
            propPending.append("circle")
                .attr("r", dotRadius)
                .attr("fill","#E0BC80")
                .attr("stroke-width","2.0")
                .attr("stroke","#E0BC80");
            propPending.append("text")
                .attr("x",8)
                .attr("y",3)
                .attr("font-size",10)
                .html("Proposal with pending outcome");

            var docDecision = legend.append("g").attr("transform","translate(405 21)");
            docDecision.append("path")
                .attr("d","M "+(-(dotRadius+0.5))+" 0 L 0 "+(dotRadius+0.5)+" L "+(dotRadius+0.5)+" 0 L 0 "+(-(dotRadius+0.5))+" Z")
                .attr("fill","#5C2334").attr("stroke","black").attr("stroke-width",1);
            docDecision.append("text")
                .attr("x",8)
                .attr("y",3)
                .attr("font-size",10)
                .html("Decision related to whole document");
            
            var docCreated = legend.append("g").attr("transform","translate(605 7)");
            docCreated.append("circle")
                .attr("r",dotRadius+1)
                .attr("fill","white")
                .attr("stroke-width",1.5)
                .attr("stroke","#E0BC80");
            docCreated.append("circle")
                .attr("r",dotRadius-2)
                .attr("fill","#E0BC80");
            docCreated.append("text")
                .attr("x",8)
                .attr("y",3)
                .attr("font-size",10)
                .html("Document was created");

            var childCreated = legend.append("g").attr("transform","translate(605 21)");
            childCreated.append("circle")
                .attr("r",dotRadius+1)
                .attr("fill","white")
                .attr("stroke-width",1.5)
                .attr("stroke","#dd4814");
            childCreated.append("circle")
                .attr("r",dotRadius-2)
                .attr("fill","#dd4814");
            childCreated.append("text")
                .attr("x",8)
                .attr("y",3)
                .attr("font-size",10)
                .html("Child document was created");

            var importAdoptedNow = legend.append("g").attr("transform","translate(805 7)");
            importAdoptedNow.append("circle")
                .attr("r", dotRadius)
                .attr("fill","#dd4814")
                .attr("stroke-width","2.0")
                .attr("stroke","#5C2334");
            importAdoptedNow.append("text")
                .attr("x",8)
                .attr("y",3)
                .attr("font-size",10)
                .html("Proposal to import text from other document");

        }

        function drawTimelineNavControls(svg){
            var navigationButtons = svg.append("g")
                .attr("class","tl-navigation-button");

            var plusButton = navigationButtons.append("g")
                .on("click",function(){d3.select("#tl-background").transition().call(navBehavior.scaleBy,2.0);});
            plusButton.append("circle")
                .attr("cx", width-132)
                .attr("cy", margin.top+20)
                .attr("r",15);
            plusButton.append("text")
                .attr("x", width-138)
                .attr("y",25).attr("font-size",18)
                .attr("fill","black")
                .text("+")
                .style("cursor","default")
                .attr("pointer-events","all");
                
            var minusButton = navigationButtons.append("g")
                .on("click",function(){d3.select("#tl-background").transition().call(navBehavior.scaleBy,0.5);});
            minusButton.append("circle")
                .attr("cx", width-96)
                .attr("cy", margin.top+20)
                .attr("r",15);
            minusButton.append("text")
                .attr("x",width-99)
                .attr("y",25)
                .attr("font-size",18)
                .attr("fill","black")
                .text("-")
                .style("cursor","default")
                .attr("pointer-events","all");

            var resetButton = navigationButtons.append("g")
                .on("click",function(){resetZoom();});
            resetButton.append("rect")
                .attr("x", width-75)
                .attr("y", margin.top+5)
                .attr("rx",15)
                .attr("ry",15)
                .attr("width",60)
                .attr("height",30);    
            resetButton.append("text")
                .attr("x",width-62)
                .attr("y",23)
                .attr("fill","black")
                .text("reset")
                .style("cursor","default")
                .attr("pointer-events","all");
        }

        function zoomAndUpdate(){
            currentScaleX = d3.event.transform.rescaleX(scaleX);
            currentZoom = d3.event.transform.k;

            axisX.call(d3.axisBottom(currentScaleX));
            selSessions.attr("transform",function(d,di){return "translate("+currentScaleX(Date.parse(d.date))+" 0)";});

            selParentConnections.attr("d",function(d){
                    var x1 = currentScaleX(Date.parse(d.d1));
                    var x2 = currentScaleX(Date.parse(d.d2));
                    //todo: use getHeight function here
                    var y1 = getDotHeightInTimeline(d.s1,d.h1);
                    var y2 = getDotHeightInTimeline(d.s2,d.h2);
                    //dont need to have date AND session in the same dict. clean later?
                    if (x1 != x2) return ["M "+(x1+4)+" "+y1+" L "+(x2-4)+" "+y2];
                    else return ["M "+(x1-4)+" "+y1+" C "+(x1-(4+((y1-y2)*0.75)))+" "+(y1)+", "+(x2-(4+((y1-y2)*0.75)))+" "+(y2)+", "+(x2-4)+" "+y2];
                });

        }
    
        //resets zoom/position for timeline navigation
        function resetZoom(){
            d3.select("#tl-background").transition().call(navBehavior.transform,d3.zoomIdentity)
        }

    },

    //Library of drawing functions for each timeline symbol
    timelineDotLibrary: {
        //should i just attribute classes and do coloring with css? 
        //it will feel more confusing to do some things here, some things with css
        "proposal-adopted-now" : {
            test: function(){
                console.log(this);
            },
            create: function(selection){
                selection.append("circle")
                    .attr("class","tl-dot-circle")
                    .attr("r", documentVisualize.parameters.dotRadius)
                    .attr("fill","#E0BC80")
                    .attr("stroke-width","2.0")
                    .attr("stroke","#5C2334");
            },
            applyDefaultColors: function(selection){
                selection.select(".tl-dot-circle")
                    .attr("fill","#E0BC80")
                    .attr("stroke","#5C2334");
            },
            applySelectionColors: function(selection){
                selection.select(".tl-dot-circle")
                    .attr("fill","#6EB7FF")
                    .attr("stroke","DodgerBlue");
            },
            applyDisabledColors: function(selection){
                selection.select(".tl-dot-circle")
                    .attr("fill","LightGrey")
                    .attr("stroke","#ABB2B9");
            }
        },

        "proposal-adopted-later" : {
            create: function(selection){
                selection.append("circle")
                    .attr("class","tl-dot-circle")
                    .attr("r", documentVisualize.parameters.dotRadius)
                    .attr("fill","#E0BC80")
                    .attr("stroke-width","2.0")
                    .attr("stroke","#5C2334")
                    .attr("stroke-dasharray","2,1.5");
            },
            applyDefaultColors: function(selection){
                selection.select(".tl-dot-circle")
                    .attr("fill","#E0BC80")
                    .attr("stroke","#5C2334");
            },
            applySelectionColors: function(selection){
                selection.select(".tl-dot-circle")
                    .attr("fill","#6EB7FF")
                    .attr("stroke","DodgerBlue");
            },
            applyDisabledColors: function(selection){
                selection.select(".tl-dot-circle")
                    .attr("fill","LightGrey")
                    .attr("stroke","#ABB2B9");
            }
        },

        "proposal-rejected-now" : {
            create: function(selection){
                var radius = documentVisualize.parameters.dotRadius;
                var sbox = radius * 0.625;
                selection.append("circle")
                    .attr("class","tl-dot-circle")
                    .attr("r", radius)
                    .attr("fill","#5C2334")
                    .attr("stroke-width","2.0")
                    .attr("stroke","#5C2334");  
                selection.append("line")
                    .attr("class","tl-dot-symbol")
                    .attr("x1",-sbox).attr("x2",sbox).attr("y1",-sbox).attr("y2",sbox).attr("stroke","white").attr("stroke-width",1.5);
                selection.append("line")
                    .attr("class","tl-dot-symbol")
                    .attr("x1",-sbox).attr("x2",sbox).attr("y1",sbox).attr("y2",-sbox).attr("stroke","white").attr("stroke-width",1.5);
            },
            applyDefaultColors: function(selection){
                selection.select(".tl-dot-circle")
                    .attr("fill","#5C2334")
                    .attr("stroke","#5C2334");
            },
            applySelectionColors: function(selection){
                selection.select(".tl-dot-circle")
                    .attr("fill","DodgerBlue")
                    .attr("stroke","DodgerBlue");
            },
            applyDisabledColors: function(selection){
                selection.select(".tl-dot-circle")
                    .attr("fill","#ABB2B9")
                    .attr("stroke","#ABB2B9");
            }
        },

        "proposal-rejected-later" : {
            create: function(selection){
                var radius = documentVisualize.parameters.dotRadius;
                var sbox = radius * 0.625;
                selection.append("circle")
                    .attr("class","tl-dot-circle")
                    .attr("r", radius)
                    .attr("fill","#5C2334")
                    .attr("stroke-width","2.0")
                    .attr("stroke","#5C2334")
                    .attr("stroke-dasharray","2,1.5"); 
                selection.append("line")
                    .attr("class","tl-dot-symbol")
                    .attr("x1",-sbox).attr("x2",sbox).attr("y1",-sbox).attr("y2",sbox).attr("stroke","white").attr("stroke-width",1.5);
                selection.append("line")
                    .attr("class","tl-dot-symbol")
                    .attr("x1",-sbox).attr("x2",sbox).attr("y1",sbox).attr("y2",-sbox).attr("stroke","white").attr("stroke-width",1.5);
            },
            applyDefaultColors: function(selection){
                selection.select(".tl-dot-circle")
                    .attr("fill","#5C2334")
                    .attr("stroke","#5C2334");
            },
            applySelectionColors: function(selection){
                selection.select(".tl-dot-circle")
                    .attr("fill","DodgerBlue")
                    .attr("stroke","DodgerBlue");
            },
            applyDisabledColors: function(selection){
                selection.select(".tl-dot-circle")
                    .attr("fill","#ABB2B9")
                    .attr("stroke","#ABB2B9");
            }
        },

        "proposal-pending": {
            create: function(selection){
                selection.append("circle")
                    .attr("class","tl-dot-circle")
                    .attr("r", documentVisualize.parameters.dotRadius)
                    .attr("fill","#E0BC80")
                    .attr("stroke-width","2.0")
                    .attr("stroke","#E0BC80");
            },
            applyDefaultColors: function(selection){
                selection.select(".tl-dot-circle")
                    .attr("fill","#E0BC80")
                    .attr("stroke","#E0BC80");
            },
            applySelectionColors: function(selection){
                selection.select(".tl-dot-circle")
                    .attr("fill","#6EB7FF")
                    .attr("stroke","#6EB7FF");
            },
            applyDisabledColors: function(selection){
                selection.select(".tl-dot-circle")
                    .attr("fill","LightGrey")
                    .attr("stroke","LightGrey");
            }
        },

        "import-adopted-now" : {
            create: function(selection){
                var radius = documentVisualize.parameters.dotRadius;
                selection.append("circle")
                    .attr("class","tl-dot-circle")
                    .attr("r", radius)
                    .attr("fill","#dd4814")
                    .attr("stroke-width","2.0")
                    .attr("stroke","#5C2334");
            },
            applyDefaultColors: function(selection){
                selection.select(".tl-dot-circle")
                    .attr("fill","#dd4814")
                    .attr("stroke","#5C2334");
            },
            applySelectionColors: function(selection){
                selection.select(".tl-dot-circle")
                    .attr("fill","#4EBE7C")
                    .attr("stroke","DodgerBlue");
            },
            applyDisabledColors: function(selection){
                selection.select(".tl-dot-circle")
                    .attr("fill","LightGrey")
                    .attr("stroke","#ABB2B9");
            }
        },

        "import-adopted-later" : {
            create: function(selection){
                selection.append("circle")
                    .attr("class","tl-dot-circle")
                    .attr("r", documentVisualize.parameters.dotRadius)
                    .attr("fill","#dd4814")
                    .attr("stroke-width","2.0")
                    .attr("stroke","#5C2334")
                    .attr("stroke-dasharray","2,1.5");
            },
            applyDefaultColors: function(selection){
                selection.select(".tl-dot-circle")
                    .attr("fill","#dd4814")
                    .attr("stroke","#5C2334");
            },
            applySelectionColors: function(selection){
                selection.select(".tl-dot-circle")
                    .attr("fill","#4EBE7C")
                    .attr("stroke","DodgerBlue");
            },
            applyDisabledColors: function(selection){
                selection.select(".tl-dot-circle")
                    .attr("fill","LightGrey")
                    .attr("stroke","#ABB2B9");
            }
        },

        "import-rejected-now" : {
            create: function(selection){
                var radius = documentVisualize.parameters.dotRadius;
                var sbox = radius * 0.625;
                selection.append("circle")
                    .attr("class","tl-dot-circle")
                    .attr("r", radius)
                    .attr("fill","#5C2334")
                    .attr("stroke-width","2.0")
                    .attr("stroke","#5C2334");  
                selection.append("line")
                    .attr("class","tl-dot-symbol")
                    .attr("x1",-sbox).attr("x2",sbox).attr("y1",-sbox).attr("y2",sbox).attr("stroke","#dd4814").attr("stroke-width",1.5);
                selection.append("line")
                    .attr("class","tl-dot-symbol")
                    .attr("x1",-sbox).attr("x2",sbox).attr("y1",sbox).attr("y2",-sbox).attr("stroke","#dd4814").attr("stroke-width",1.5);
            },
            applyDefaultColors: function(selection){
                selection.select(".tl-dot-circle")
                    .attr("fill","#5C2334")
                    .attr("stroke","#5C2334");
                selection.selectAll(".tl-dot-symbol")
                    .attr("stroke","#dd4814");
            },
            applySelectionColors: function(selection){
                selection.select(".tl-dot-circle")
                    .attr("fill","DodgerBlue")
                    .attr("stroke","DodgerBlue");
                selection.selectAll(".tl-dot-symbol")
                    .attr("stroke","#4EBE7C");
            },
            applyDisabledColors: function(selection){
                selection.select(".tl-dot-circle")
                    .attr("fill","#ABB2B9")
                    .attr("stroke","#ABB2B9");
            }
        },

        "import-rejected-later" : {
            create: function(selection){
                var radius = documentVisualize.parameters.dotRadius;
                var sbox = radius * 0.625;
                selection.append("circle")
                    .attr("class","tl-dot-circle")
                    .attr("r", radius)
                    .attr("fill","#5C2334")
                    .attr("stroke-width","2.0")
                    .attr("stroke","#5C2334")
                    .attr("stroke-dasharray","2,1.5"); 
                selection.append("line")
                    .attr("class","tl-dot-symbol")
                    .attr("x1",-sbox).attr("x2",sbox).attr("y1",-sbox).attr("y2",sbox).attr("stroke","#dd4814").attr("stroke-width",1.5);
                selection.append("line")
                    .attr("class","tl-dot-symbol")
                    .attr("x1",-sbox).attr("x2",sbox).attr("y1",sbox).attr("y2",-sbox).attr("stroke","#dd4814").attr("stroke-width",1.5);
            },
            applyDefaultColors: function(selection){
                selection.select(".tl-dot-circle")
                    .attr("fill","#5C2334")
                    .attr("stroke","#5C2334");
                selection.selectAll(".tl-dot-symbol")
                    .attr("stroke","#dd4814");
            },
            applySelectionColors: function(selection){
                selection.select(".tl-dot-circle")
                    .attr("fill","DodgerBlue")
                    .attr("stroke","DodgerBlue");
                selection.selectAll(".tl-dot-symbol")
                    .attr("stroke","#4EBE7C");
            },
            applyDisabledColors: function(selection){
                selection.select(".tl-dot-circle")
                    .attr("fill","#ABB2B9")
                    .attr("stroke","#ABB2B9");
            }
        },

        "import-pending": {
            create: function(selection){
                selection.append("circle")
                    .attr("class","tl-dot-circle")
                    .attr("r", documentVisualize.parameters.dotRadius)
                    .attr("fill","#dd4814")
                    .attr("stroke-width","2.0")
                    .attr("stroke","#dd4814");
            },
            applyDefaultColors: function(selection){
                selection.select(".tl-dot-circle")
                    .attr("fill","#dd4814")
                    .attr("stroke","#dd4814");
            },
            applySelectionColors: function(selection){
                selection.select(".tl-dot-circle")
                    .attr("fill","#4EBE7C")
                    .attr("stroke","#4EBE7C");
            },
            applyDisabledColors: function(selection){
                selection.select(".tl-dot-circle")
                    .attr("fill","LightGrey")
                    .attr("stroke","LightGrey");
            }
        },

        "decision": {
            create: function(selection){
                var radius = documentVisualize.parameters.dotRadius;
                selection.append("path")
                    .attr("class","tl-dot-diamond")
                    .attr("d","M "+(-(radius+0.5))+" 0 L 0 "+(radius+0.5)+" L "+(radius+0.5)+" 0 L 0 "+(-(radius+0.5))+" Z")
                    .attr("fill","#5C2334").attr("stroke","black").attr("stroke-width",1);
            },
            applyDefaultColors: function(selection){
                selection.select(".tl-dot-diamond")
                    .attr("fill","#5C2334").attr("stroke","Black");
            },
            applySelectionColors: function(selection){
                selection.select(".tl-dot-diamond")
                    .attr("fill","DodgerBlue").attr("stroke","Black");
            },
            applyDisabledColors: function(selection){
                selection.select(".tl-dot-diamond")
                    .attr("fill","#ABB2B9").attr("stroke","Black");
            }
        },

        "document-creation": {
            create: function(selection){
                selection.append("circle")
                    .attr("class","tl-circle-outer")
                    .attr("r",documentVisualize.parameters.dotRadius+1)
                    .attr("fill","White")
                    .attr("stroke-width",1.5)
                    .attr("stroke","#E0BC80");
                selection.append("circle")
                    .attr("class","tl-circle-inner")
                    .attr("r",documentVisualize.parameters.dotRadius-2)
                    .attr("fill","#E0BC80");
            },
            applyDefaultColors: function(selection){
                selection.select(".tl-circle-outer")
                    .attr("fill","White")
                    .attr("stroke","#E0BC80");
                selection.select(".tl-circle-inner")
                    .attr("fill","#E0BC80");
            },
            applySelectionColors: function(selection){
                selection.select(".tl-circle-outer")
                    .attr("fill","White")
                    .attr("stroke","DodgerBlue");
                selection.select(".tl-circle-inner")
                    .attr("fill","DodgerBlue");
            },
            applyDisabledColors: function(selection){
                selection.select(".tl-circle-outer")
                    .attr("fill","White")
                    .attr("stroke","LightGrey");
                selection.select(".tl-circle-inner")
                    .attr("fill","LightGrey");
            }
        },

        "child-creation": {
            create: function(selection){
                selection.append("circle")
                    .attr("class","tl-circle-outer")
                    .attr("r",documentVisualize.parameters.dotRadius+1)
                    .attr("fill","white")
                    .attr("stroke-width",1.5)
                    .attr("stroke","#dd4814");
                selection.append("circle")
                    .attr("class","tl-circle-inner")
                    .attr("r",documentVisualize.parameters.dotRadius-2)
                    .attr("fill","#dd4814");
            },
            applyDefaultColors: function(selection){
                selection.select(".tl-circle-outer")
                    .attr("fill","white")
                    .attr("stroke","#dd4814");
                selection.select(".tl-circle-inner")
                    .attr("fill","#dd4814");
            },
            applySelectionColors: function(selection){
                selection.select(".tl-circle-outer")
                    .attr("fill","White")
                    .attr("stroke","DodgerBlue");
                selection.select(".tl-circle-inner")
                    .attr("fill","DodgerBlue");
            },
            applyDisabledColors: function(selection){
                selection.select(".tl-circle-outer")
                    .attr("fill","White")
                    .attr("stroke","LightGrey");
                selection.select(".tl-circle-inner")
                    .attr("fill","LightGrey");
            }
        }
    },

    //Calculates how often keywords appear in events
    calculateKeywordScores: function(events){
        var keywordSet = {};
        events.creation.keywords.map(function(k){
            if (k.id in keywordSet) {keywordSet[k.id].score++; keywordSet[k.id].events.push(events.creation);}
            else keywordSet[k.id] = {id: k.id, word: k.word, score: 1, events: [events.creation]};
        }); //should we be checking for keywords in decisions/debates for creation events as well?
        events.proposals.map(function(pr){
            pr.keywords.map(function(k){
                if (k.id in keywordSet) {keywordSet[k.id].score++; keywordSet[k.id].events.push(pr);}
                else keywordSet[k.id] = {id: k.id, word: k.word, score: 1, events: [pr]};
            });
            pr.decisions.map(function(d){
                d.keywords.map(function(k){
                    if (k.id in keywordSet) {keywordSet[k.id].score++; keywordSet[k.id].events.push(pr);}
                    else keywordSet[k.id] = {id: k.id, word: k.word, score: 1, events: [pr]};
                })
            });
            pr.debates.map(function(d){
                d.keywords.map(function(k){
                    if (k.id in keywordSet) {keywordSet[k.id].score++; keywordSet[k.id].events.push(pr);}
                    else keywordSet[k.id] = {id: k.id, word: k.word, score: 1, events: [pr]}; 
                })
            });
            //we can change from pushing pr to pushing individual decision/debate events if we want to display them
        });
        return Object.values(keywordSet);
    },

    //virtually the same but for a different attribute. could be a single generalized function at some point, probably
    calculatePersonScores: function(events){
        var personSet = {};
        events.creation.people.map(function(p){
            if (p.id in personSet) {personSet[p.id].score++; personSet[p.id].events.push(events.creation);}
            else personSet[p.id] = {id: p.id, name:p.name, score: 1, events: [events.creation]};
        });
        events.proposals.map(function(pr){
            pr.people.map(function(p){
                if (p.id in personSet) {personSet[p.id].score++; personSet[p.id].events.push(pr);}
                else personSet[p.id] = {id: p.id, name:p.name, score: 1, events: [pr]};
            });
            pr.decisions.map(function(d){
                d.people.map(function(p){
                    if (p.id in personSet) {personSet[p.id].score++; personSet[p.id].events.push(pr);}
                    else personSet[p.id] = {id: p.id, name:p.name, score: 1, events: [pr]};
                })
            });
            pr.debates.map(function(d){
                d.people.map(function(p){
                    if (p.id in personSet) {personSet[p.id].score++; personSet[p.id].events.push(pr);}
                    else personSet[p.id] = {id: p.id, name:p.name, score: 1, events: [pr]};
                })
            });
        });
        return Object.values(personSet);
    },

    //Grayed-out colors for interface
    disableColors: function(){
        d3.selectAll(".document_text").style("background-color","rgba(0,0,0,0)");

        d3.selectAll(".person-item").style("background-color","rgba(0,0,0,0)");
        d3.selectAll(".keyword-item").style("background-color","rgba(0,0,0,0)");

        documentVisualize.variables.selectionTLEvents.each(function(e){
            var s = d3.select(this);
            documentVisualize.prototype.timelineDotLibrary[s.attr("dot-type")].applyDisabledColors(s);
        });

        d3.selectAll(".tl-dot-session")
            .attr("fill","#e1e4e7")
            .attr("stroke","black");
        d3.select("#tl-sessions-line")
        .attr("stroke","black")
    },

    //applies a selection color over text, people, timeline and keywords that are related to events in a list
    applySelectionColors: function(eventIds){
        d3.selectAll(".document_text").style("background-color",function(){
            var refIds = this.getAttribute("data-amendment-ids").split(" ");
            var score = refIds.reduce(function(acc,rid){if (eventIds.includes(parseInt(rid))) return acc+1; else return acc;},0);
            if (score > 0) return "#6EB7FF";
            else return "rgba(0,0,0,0)";
        });

        documentVisualize.variables.selectionPeople.style("background-color",function(p){
            var score = p.events.reduce(function(acc,e){if (eventIds.includes(e.id)) return acc+1; else return acc;},0);
            if (score > 0) return "#6EB7FF";
            else return null;
        });
        documentVisualize.variables.selectionKeywords.style("background-color",function(k){
            var score = k.events.reduce(function(acc,e){if (eventIds.includes(e.id)) return acc+1; else return acc;},0);
            if (score > 0) return "#6EB7FF";
            else return null;
        });

        documentVisualize.variables.selectionTLEvents.each(function(e){
            var s = d3.select(this);
            //is it faster to do this check here or to apply a d3 filter and then call applyColors once to the whole selection?
            if (eventIds.includes(e.id))
                documentVisualize.prototype.timelineDotLibrary[s.attr("dot-type")].applySelectionColors(s);
            else
                documentVisualize.prototype.timelineDotLibrary[s.attr("dot-type")].applyDisabledColors(s);
        });

        documentVisualize.variables.selectionTLSessions.each(function(s){
            var circles = d3.select(this).select(".tl-dot-session");
            var score = s.events.reduce(function(acc,e){if (eventIds.includes(e.id)) return acc+1; else return acc;},0);
            if (score > 0)
                circles.attr("fill","#5fafff").attr("stroke","Black");
            else 
                circles.attr("fill","#e1e4e7").attr("stroke","black");         
        })

        d3.select("#tl-sessions-line")
            .attr("stroke","black")
    },

    //Returns the interface to default colors
    applyDefaultColors: function(){
        d3.selectAll(".document_text").style("background-color",null);

        d3.selectAll(".person-item").style("background-color",null);
        d3.selectAll(".keyword-item").style("background-color",null);

        documentVisualize.variables.selectionTLEvents.each(function(e){
            var s = d3.select(this);
            documentVisualize.prototype.timelineDotLibrary[s.attr("dot-type")].applyDefaultColors(s);
        });
        
        d3.selectAll(".tl-dot-session")
            .attr("fill","#fbdace")
            .attr("stroke","#dd4814");
        d3.select("#tl-sessions-line")
            .attr("stroke","#dd4814")
    },

    //Sets up event functionality for text components
    setupTextInteractivity: function(){
        d3.selectAll(".document_text").on("click",function(){
            if (documentVisualize.prototype.checkReclickingElement(this)) return;
            else {
                documentVisualize.variables.selectedElement = this;
                var refIds = this.getAttribute("data-amendment-ids").split(" ");
                refIds = refIds.map(function(d){return parseInt(d);});
                documentVisualize.prototype.disableColors();
                documentVisualize.prototype.applySelectionColors(refIds);
                documentVisualize.variables.selectedIds = refIds;
            }
        });
    },

    //Updates detail information panel
    updateInfoView: function(data){
        var hierarchyMargin = 10;

        var selInfo = d3.select("#document-info-view");

        var relTable = selInfo.append("table")
            .attr("class","table table-condensed")
            .attr("id","document-relationship-table");

        var ancestors = d3.select("#table-doc-ancestors").select("tbody").selectAll("tr")
            .data(data.relationships.ancestors)
            .join("tr")
                .style("font-size","12px")
                .style("cursor","pointer")
                .on("click",function(d){location.href = "/document_visualize2/"+d.id});

        ancestors.append("td")
            .style("width","35px")//; vertical-align: top; 
            .style("max-height","35px")
            .style("padding-top", "10px")
            .append("div").style("position","relative")
            .each(function(d){
                d3.select(this).append("img")
                    .attr("src",function(d){
                        if (d.type == "CREATE") return ICON_PATHS["DOC_COPY"];
                        if (d.type == "CREATE_FROM") return ICON_PATHS["DOC_IMPORT"];
                    })
                    .attr("width","21px")
                    .attr("height","21px");

                if (d.committee_id != data.events.creation.committee_id)
                    d3.select(this).append("img")
                        .attr("src", ICON_PATHS["DEC_REFER"])
                        .attr("width","14px")
                        .attr("height","14px")
                        .style("bottom","0px")
                        .style("left","0px")
                        .style("position","absolute");                  
            });

        ancestors.append("td")
            .style("padding-left", "8px")
            .append("div")
                .html(function(d){return d.name+"<br><strong>Committee: </strong> "+d.committee_name;});
        
        var children = d3.select("#table-doc-children").select("tbody").selectAll("tr")
            .data(data.relationships.children)
            .join("tr")
                .style("font-size","12px")
                .style("cursor","pointer")
                .on("click",function(d){location.href = "/document_visualize2/"+d.id});

        children.append("td")
            .style("width","35px") 
            .style("padding-top", "10px")
            .append("div").style("position","relative")
            .each(function(d){
                d3.select(this).append("img")
                    .attr("src",function(d){
                        if (d.type == "CREATE") return ICON_PATHS["DOC_COPY"];
                        if (d.type == "CREATE_FROM") return ICON_PATHS["DOC_IMPORT"];
                    })
                    .attr("width","21px")
                    .attr("height","21px");
                    
                if (d.committee_id != data.events.creation.committee_id)
                    d3.select(this).append("img")
                        .attr("src", ICON_PATHS["DEC_REFER"])
                        .attr("width","14px")
                        .attr("height","14px")
                        .style("bottom","0px")
                        .style("left","0px")
                        .style("position","absolute");                  
            });

        children.append("td")
            .style("padding-left", "8px")
            .append("div")
                .html(function(d){return d.name+"<br><strong>Committee: </strong> "+d.committee_name;});


        var outcomes = d3.select("#table-doc-outcomes").select("tbody").selectAll("tr")
            .data(data.events.creation.decisions)
            .join("tr")
                .style("font-size","12px")
                .style("cursor","default");

        outcomes.append("td")
            .style("width","35px") 
            .style("padding-top", "10px")
            .append("img")
                .attr("src",function(d){
                    if (d.type == "REPORT_PROPOSAL") return ICON_PATHS["DEC_REFER"];
                    if (d.type == "DROP_PROPOSAL") return ICON_PATHS["DEC_DROP"];
                })
                .attr("width","21px")
                .attr("height","21px");
        outcomes.append("td")
            .style("padding-left", "8px")
            .append("div")
                .html(function(d){
                    if (d.type == "REPORT_PROPOSAL") return "Proposal reported to another committee. <br> <strong>Date: </strong> "+d.date.slice(0,-13);
                    if (d.type == "DROP_PROPOSAL") return "Proposal was dropped. <br> <strong>Date: </strong> "+d.date.slice(0,-13);
                });
        
    },

    setupWindowResize: function(){
        $(window).resize(function() {
            clearTimeout($.data(this, 'resizeTimer'));
            documentVisualize.variables.timelineWidth = $('#timeline-view').parent().width();
            $.data(this, 'resizeTimer', setTimeout(function() {
                resizeTimeline();
                resizeGlobalTimeline();
            }, 250));
        });

        function resizeTimeline() {
            if (documentVisualize.variables.timelineData != undefined){
                documentVisualize.prototype.drawTimeline(
                    d3.select("#timeline-view").select("svg"),
                    documentVisualize.variables.timelineData.sessions,
                    documentVisualize.variables.timelineData.ppr);

                if (documentVisualize.variables.selectedIds != null)
                    documentVisualize.prototype.applySelectionColors(documentVisualize.variables.selectedIds);
            }
        }

        function resizeGlobalTimeline(){
            if (documentVisualize.variables.globalTimelineData != undefined){
                documentVisualize.prototype.drawGlobalTimeline(
                    d3.select("#global-timeline-view").select("svg"),
                    documentVisualize.variables.globalTimelineData.committees,
                    documentVisualize.variables.globalTimelineData.documents,
                    documentVisualize.variables.globalTimelineData.transfers,
                    documentVisualize.variables.globalTimelineData.documents[0]);
            
            }
        }
    },

    checkReclickingElement: function(element){
        if (documentVisualize.variables.selectedElement == element) {
            documentVisualize.prototype.resetSelection();
            return true;
        }
        else return false;
    },

    resetSelection: function(){
        documentVisualize.prototype.disableColors();
        documentVisualize.prototype.applyDefaultColors();
        documentVisualize.variables.selectedIds = null;
        documentVisualize.variables.selectedElement = null;
    }

}

documentVisualize.prototype.init(63571,114);

