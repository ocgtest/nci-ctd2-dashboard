(function ($) {
    // This is strictly coupled to the homepage design!
    var numOfStoriesHomePage = 4;
    var numOfCartGene = 25;

    // These seperators are for replacing items within the observation summary
    var leftSep = "<";
    var rightSep = ">";

    // To make URL constructing more configurable
    var CORE_API_URL = "./";

    // This is for the moustache-like templates
    // prevents collisions with JSP tags <%...%>
    _.templateSettings = {
        interpolate: /\{\{(.+?)\}\}/g
    };

    // Get these options from the page
    var maxNumberOfEntities = $("#maxNumberOfEntites").html() * 1;

    // Datatables fix
    $.extend($.fn.dataTableExt.oStdClasses, {
        "sWrapper": "dataTables_wrapper form-inline"
    });

    $.extend(true, $.fn.dataTable.defaults, {
        "oLanguage": { // "search" -> "filter"
            "sSearch": "Filter Table:"
        },
        "search": { // simple searching
            "smart": false
        },
        // These are for bootstrap-styled datatables
        "sDom": "<'row'<'span6'i><'span6'f>r>t<'row'<'span6'l><'span6'p>>",
        "sPaginationType": "bootstrap"
    });

    // Let datatables know about our date format
    $.extend($.fn.dataTable.ext.order, {
        "dashboard-date": function (settings, col) {
            return this.api().column(col, {
                order: 'index'
            }).nodes().map(
                function (td, i) {
                    return (new Date($('a', td).html())).getTime();
                }
            );
        }
    });

    // Let datatables know about dashboard rank (for sorting)
    $.extend($.fn.dataTable.ext.order, {
        "dashboard-rank": function (settings, col) {
            return this.api().column(col, {
                order: 'index'
            }).nodes().map(
                function (td, i) {
                    return $('ul', td).attr("data-score");
                }
            );
        }
    });

    // Let datatables know about observation count (for sorting)
    $.extend($.fn.dataTable.ext.type.order, {
        "observation-count-pre": function (d) {
            if (d == null || d == "") return 0;
            var start = d.indexOf(">");
            var end = d.indexOf("<", start);
            if (end <= start) return 0;
            var count_text = d.substring(start + 1, end);
            var count = 0;
            if (count_text != undefined) count = parseInt(count_text);
            return count;
        }
    });

    $.fn.dataTable.Api.register('order.neutral()', function () {
        return this.iterator('table', function (s) {
            s.aaSorting.length = 0;
            s.aiDisplay.sort(function (a, b) {
                return a - b;
            });
            s.aiDisplayMaster.sort(function (a, b) {
                return a - b;
            });
        });
    });

    /* Models */
    var SubmissionCenter = Backbone.Model.extend({
        urlRoot: CORE_API_URL + "get/center"
    });
    var SubmissionCenters = Backbone.Collection.extend({
        url: CORE_API_URL + "list/center/?filterBy=",
        model: SubmissionCenter
    });

    var Submission = Backbone.Model.extend({
        urlRoot: CORE_API_URL + "get/submission"
    });

    var CenterSubmissions = Backbone.Collection.extend({
        url: CORE_API_URL + "list/submission/?filterBy=",
        model: Submission,

        initialize: function (attributes) {
            this.url += attributes.centerId;
        }
    });

    var StorySubmissions = Backbone.Collection.extend({
        url: CORE_API_URL + "stories/?limit=",
        model: Submission,

        initialize: function (attributes) {
            if (attributes != undefined && attributes.limit != undefined) {
                this.url += attributes.limit;
            } else {
                this.url += numOfStoriesHomePage;
            }
        }

    });

    var Observation = Backbone.Model.extend({
        urlRoot: CORE_API_URL + "get/observation"
    });

    var Observations = Backbone.Collection.extend({
        url: CORE_API_URL + "list/observation/?filterBy=",
        model: Observation,

        initialize: function (attributes) {
            if (attributes.subjectId != undefined) {
                this.url += attributes.subjectId;
                if (attributes.role != undefined) {
                    this.url += "&role=" + attributes.role;
                }
                if (attributes.tier != undefined) {
                    this.url += "&tier=" + attributes.tier;
                }
            } else {
                this.url += attributes.submissionId;
            }

            if (attributes.getAll != undefined) {
                this.url += "&getAll=" + attributes.getAll;
            }
        }
    });

    var SubjectRole = Backbone.Model.extend({});
    var SubjectRoles = Backbone.Collection.extend({
        url: CORE_API_URL + "list/role?filterBy=",
        model: SubjectRole
    });

    var ObservedEvidence = Backbone.Model.extend({
        urlRoot: CORE_API_URL + "get/observedevidence"
    });

    var ObservedEvidences = Backbone.Collection.extend({
        url: CORE_API_URL + "list/observedevidence/?filterBy=",
        model: ObservedEvidence,

        initialize: function (attributes) {
            this.url += attributes.observationId;
        }
    });

    var ObservedSubject = Backbone.Model.extend({
        urlRoot: CORE_API_URL + "get/observedsubject"
    });

    var ObservedSubjects = Backbone.Collection.extend({
        url: CORE_API_URL + "list/observedsubject/?filterBy=",
        model: ObservedSubject,

        initialize: function (attributes) {
            if (attributes.subjectId != undefined) {
                this.url += attributes.subjectId;
            } else {
                this.url += attributes.observationId;
            }
        }
    });

    var SearchResult = Backbone.Model.extend({});

    var SearchResults = Backbone.Collection.extend({
        url: CORE_API_URL + "search/",
        model: SearchResult,

        initialize: function (attributes) {
            this.url += encodeURIComponent(attributes.term.toLowerCase());
        }
    });

    var AnimalModel = Backbone.Model.extend({
        urlRoot: CORE_API_URL + "get/animal-model"
    });

    var Gene = Backbone.Model.extend({
        urlRoot: 'get/gene',

        initialize: function (attributes) {
            this.url = this.urlRoot + "/" + attributes.species + "/" + attributes.symbol;
        }
    });

    var CellSample = Backbone.Model.extend({
        urlRoot: CORE_API_URL + "get/cell-sample",
    });

    var Compound = Backbone.Model.extend({
        urlRoot: CORE_API_URL + "get/compound",
    });

    var Protein = Backbone.Model.extend({
        urlRoot: CORE_API_URL + "get/protein",
    });

    var ShRna = Backbone.Model.extend({
        urlRoot: CORE_API_URL + "get/rna",
    });

    var TissueSample = Backbone.Model.extend({
        urlRoot: CORE_API_URL + "get/tissue",
    });

    var Transcript = Backbone.Model.extend({
        urlRoot: CORE_API_URL + "get/transcript",
    });

    var Subject = Backbone.Model.extend({
        urlRoot: CORE_API_URL + "get/subject"
    });

    var SubjectWithSummaryCollection = Backbone.Collection.extend({
        url: CORE_API_URL + "explore/",

        initialize: function (attributes) {
            this.url += attributes.roles;
        }
    });

    /* Views */
    var HomeView = Backbone.View.extend({
        el: $("#main-container"),
        template: _.template($("#home-tmpl").html()),
        render: function () {
            // Load the template
            $(this.el).html(this.template({}));
            $("#tierTooltip").tooltip({
                title: "A CTD<sup>2</sup> Network-defined ranking system for evidence that is based on the extent of characterization associated with a particular study." +
                    "<ul><li><b><i>Tier 1</i></b>: Preliminary results of screening campaigns." +
                    "<li><b><i>Tier 2</i></b>: Confirmation of primary results <i>in vitro</i>." +
                    "<li><b><i>Tier 3</i></b>: Validation of results in a cancer relevant <i>in vivo</i> model.</ul>",
                html: true,
            });

            // and load the stories
            var storySubmissions = new StorySubmissions();
            storySubmissions.fetch({
                success: function () {
                    var counter = 1;
                    _.each(storySubmissions.models, function (aStory) {
                        var storyView = new StorySubmissionView({
                            el: $("#story-" + counter),
                            model: aStory.toJSON()
                        });
                        storyView.render();
                        counter++;
                    });

                    Holder.run();

                    $('.stories-pagination a.story-link').click(function (e) {
                        e.preventDefault();
                        $(this).tab('show');
                    });
                }
            });

            $('#myCarousel').carousel('pause');
            $("#omni-search-form").submit(function () {
                var searchTerm = $("#omni-search").val();
                window.location.hash = "search/" + searchTerm;
                return false;
            });

            $("#homepage-help-navigate").click(function (e) {
                e.preventDefault();
                (new HelpNavigateView()).render();
            });

            $("#video-link1").click(function (e) {
                e.preventDefault();
                (new VideoPopupView({
                    model: {
                        videoid: "UD40bbg2ISU",
                        description: this.title
                    }
                })).render();
            });
            $("#video-link2").click(function (e) {
                e.preventDefault();
                (new VideoPopupView({
                    model: {
                        videoid: "_hpDlXMAYMs",
                        description: this.title
                    }
                })).render();
            });
            $("#video-link3").click(function (e) {
                e.preventDefault();
                (new VideoPopupView({
                    model: {
                        videoid: "RsHTBX_CeNw",
                        description: this.title
                    }
                })).render();
            });

            return this;
        }
    });

    var VideoPopupView = Backbone.View.extend({
        template: _.template($("#video-popup-tmpl").html()),
        render: function () {
            var content = this.template(this.model);

            $.fancybox(
                content, {
                    'autoDimensions': false,
                    'width': '820px',
                    'height': '420px',
                    'centerOnScroll': true,
                    'transitionIn': 'none',
                    'transitionOut': 'none'
                }
            );

            return this;
        }
    });

    var HelpNavigateView = Backbone.View.extend({
        template: _.template($("#help-navigate-tmpl").html()),

        render: function () {
            var content = this.template({});

            $.fancybox(
                content, {
                    'autoDimensions': false,
                    'width': '75%',
                    'height': '99%',
                    'centerOnScroll': true,
                    'transitionIn': 'none',
                    'transitionOut': 'none'
                }
            );

            return this;
        }
    });

    var HtmlStoryView = Backbone.View.extend({
        el: $("#main-container"),
        template: _.template($("#html-story-container-tmpl").html()),
        render: function () {
            var storyView = this;
            var thatEl = $(this.el);
            var url = this.model.url;
            var observation = this.model.observation;

            $.post("html", {
                url: url
            }).done(function (summary) {
                summary = summary.replace(
                    new RegExp("#submission_center", "g"),
                    "#" + observation.submission.observationTemplate.submissionCenter.stableURL
                );

                var observedSubjects = new ObservedSubjects({
                    observationId: observation.id
                });
                observedSubjects.fetch({
                    success: function () {
                        _.each(observedSubjects.models, function (observedSubject) {
                            observedSubject = observedSubject.toJSON();

                            if (observedSubject.observedSubjectRole == null || observedSubject.subject == null)
                                return;

                            summary = summary.replace(
                                new RegExp("#" + observedSubject.observedSubjectRole.columnName + "\"", "g"),
                                "#" + observedSubject.subject.stableURL + "\""
                            );
                        });

                        var observedEvidences = new ObservedEvidences({
                            observationId: observation.id
                        });
                        observedEvidences.fetch({
                            success: function () {
                                _.each(observedEvidences.models, function (observedEvidence) {
                                    observedEvidence = observedEvidence.toJSON();

                                    if (observedEvidence.observedEvidenceRole == null ||
                                        observedEvidence.evidence == null ||
                                        observedEvidence.evidence.class != "UrlEvidence") {
                                        return;
                                    }

                                    summary = summary.replace(
                                        new RegExp("#" + observedEvidence.observedEvidenceRole.columnName, "g"),
                                        observedEvidence.evidence.url.replace(/^\//, '')
                                    );
                                });

                                // clean up outer html tags
                                summary = summary.replace(new RegExp("<!DOCTYPE\\b[^>]*>\\n"), "");
                                summary = summary.replace(new RegExp("<html>\\n"), "");
                                summary = summary.replace(new RegExp("<head\\b[^>]*>\\n"), "");
                                summary = summary.replace(new RegExp("<title\\b[^>]*>(.*?)</title>\\n"), ""); // remove title element
                                summary = summary.replace(new RegExp("<meta\\b[^>]*>\\n"), ""); // remove meta tag
                                summary = summary.replace(new RegExp("</head>\\n"), "");
                                summary = summary.replace(new RegExp("<body>\\n"), "");
                                summary = summary.replace(new RegExp("</body>\\n"), "");
                                summary = summary.replace(new RegExp("</html>\\n"), "");

                                $(thatEl).html(storyView.template({ story: summary, centerName: observation.submission.observationTemplate.submissionCenter.displayName}));
                            }
                        });
                    }
                });
            });

            return this;

        }
    });

    var StoryListItemView = Backbone.View.extend({
        template: _.template($("#stories-tbl-row-tmpl").html()),

        render: function () {
            var mainContainer = $(this.el);
            mainContainer.append(this.template(this.model));

            var summary = this.model.submission.observationTemplate.observationSummary;
            var thatModel = this.model;
            var thatEl = $("#story-list-summary-" + this.model.id);
            var observedSubjects = new ObservedSubjects({
                observationId: this.model.id
            });
            observedSubjects.fetch({
                success: function () {
                    _.each(observedSubjects.models, function (observedSubject) {
                        observedSubject = observedSubject.toJSON();

                        if (observedSubject.observedSubjectRole == null || observedSubject.subject == null)
                            return;

                        summary = summary.replace(
                            new RegExp(leftSep + observedSubject.observedSubjectRole.columnName + rightSep, "g"),
                            _.template($("#summary-subject-replacement-tmpl").html(), observedSubject.subject)
                        );
                    });

                    var observedEvidences = new ObservedEvidences({
                        observationId: thatModel.id
                    });
                    observedEvidences.fetch({
                        success: function () {
                            _.each(observedEvidences.models, function (observedEvidence) {
                                observedEvidence = observedEvidence.toJSON();

                                if (observedEvidence.observedEvidenceRole == null || observedEvidence.evidence == null)
                                    return;

                                // If there are more than one file evidences, then we might have a problem here
                                if (observedEvidence.evidence.class == "FileEvidence" &&
                                    (observedEvidence.evidence.mimeType.toLowerCase().search("html") > -1 || observedEvidence.evidence.mimeType.toLowerCase().search("pdf") > -1)) {
                                    // If this is a summary, then it should be a pdf/html file evidence
                                    if (observedEvidence.evidence.mimeType.toLowerCase().search("html") < 0) {
                                        console.log(observedEvidence.evidence.mimeType + ": pdf case, no handled. ");
                                    }
                                }

                                summary = summary.replace(
                                    new RegExp(leftSep + observedEvidence.observedEvidenceRole.columnName + rightSep, "g"),
                                    _.template($("#summary-evidence-replacement-tmpl").html(), observedEvidence.evidence)
                                );
                            });

                            $(thatEl).html(summary);
                        }
                    });
                }
            });

            return this;
        }
    });

    var StorySubmissionView = Backbone.View.extend({
        template: _.template($("#story-homepage-tmpl").html()),
        render: function () {
            $(this.el).append(this.template(this.model));

            var summary = this.model.submission.observationTemplate.observationSummary;
            var thatModel = this.model;
            var thatEl = $("#story-summary-" + this.model.id);
            var observedSubjects = new ObservedSubjects({
                observationId: this.model.id
            });
            observedSubjects.fetch({
                success: function () {
                    _.each(observedSubjects.models, function (observedSubject) {
                        observedSubject = observedSubject.toJSON();

                        if (observedSubject.observedSubjectRole == null || observedSubject.subject == null)
                            return;

                        summary = summary.replace(
                            new RegExp(leftSep + observedSubject.observedSubjectRole.columnName + rightSep, "g"),
                            _.template($("#summary-subject-replacement-tmpl").html(), observedSubject.subject)
                        );
                    });

                    var observedEvidences = new ObservedEvidences({
                        observationId: thatModel.id
                    });
                    observedEvidences.fetch({
                        success: function () {
                            _.each(observedEvidences.models, function (observedEvidence) {
                                observedEvidence = observedEvidence.toJSON();

                                if (observedEvidence.observedEvidenceRole == null || observedEvidence.evidence == null)
                                    return;

                                // If there are more than one file evidences, then we might have a problem here
                                if (observedEvidence.evidence.class == "FileEvidence" &&
                                    (observedEvidence.evidence.mimeType.toLowerCase().search("html") > -1 || observedEvidence.evidence.mimeType.toLowerCase().search("pdf") > -1)) {
                                    // If this is a summary, then it should be a pdf/html file evidence
                                    if (observedEvidence.evidence.mimeType.toLowerCase().search("html") > -1) {
                                        // console.log("html case. expected");
                                    } else {
                                        console.log(observedEvidence.evidence.mimeType + ": pdf case, no handled. ");
                                    }
                                }

                                summary = summary.replace(
                                    new RegExp(leftSep + observedEvidence.observedEvidenceRole.columnName + rightSep, "g"),
                                    _.template($("#summary-evidence-replacement-tmpl").html(), observedEvidence.evidence)
                                );
                            });

                            $(thatEl).html(summary);
                        }
                    });
                }
            });

            return this;
        }
    });

    /// TODO: encode these into the DB instead
    var ecoMappings = [{
            "evidence": "file",
            "role": "background",
            "eco_term": "inference from background scientific knowledge",
            "eco_id": "ECO:0000001"
        },
        {
            "evidence": "file",
            "role": "computed",
            "eco_term": "computational combinatorial evidence",
            "eco_id": "ECO:0000053"
        },
        {
            "evidence": "file",
            "role": "literature",
            "eco_term": "traceable author statement",
            "eco_id": "ECO:0000033"
        },
        {
            "evidence": "file",
            "role": "measured",
            "eco_term": "direct assay evidence",
            "eco_id": "ECO:0000002"
        },
        {
            "evidence": "file",
            "role": "observed",
            "eco_term": "experimental phenotypic evidence",
            "eco_id": "ECO:0000059"
        },
        {
            "evidence": "file",
            "role": "written",
            "eco_term": "author statement",
            "eco_id": "ECO:0000204"
        },
        {
            "evidence": "label",
            "role": "background",
            "eco_term": "inference from background scientific knowledge",
            "eco_id": "ECO:0000001"
        },
        {
            "evidence": "label",
            "role": "computed",
            "eco_term": "computational combinatorial evidence",
            "eco_id": "ECO:0000053"
        },
        {
            "evidence": "label",
            "role": "observed",
            "eco_term": "ad-hoc qualitative phenotype observation evidence",
            "eco_id": "ECO:0005673"
        },
        {
            "evidence": "label",
            "role": "species",
            "eco_term": "biological system reconstruction evidence by experimental evidence from single species",
            "eco_id": "ECO:0005553"
        },
        {
            "evidence": "numeric",
            "role": "background",
            "eco_term": "inference from background scientific knowledge",
            "eco_id": "ECO:0000001"
        },
        {
            "evidence": "numeric",
            "role": "computed",
            "eco_term": "computational combinatorial evidence",
            "eco_id": "ECO:0000053"
        },
        {
            "evidence": "numeric",
            "role": "measured",
            "eco_term": "experimental phenotypic evidence",
            "eco_id": "ECO:0000059"
        },
        {
            "evidence": "numeric",
            "role": "observed",
            "eco_term": "ad-hoc quantitative phenotype observation evidence",
            "eco_id": "ECO:0005675"
        },
        {
            "evidence": "url",
            "role": "computed",
            "eco_term": "computational combinatorial evidence",
            "eco_id": "ECO:0000053"
        },
        {
            "evidence": "url",
            "role": "link",
            "eco_term": "combinatorial evidence",
            "eco_id": "ECO:0000212"
        },
        {
            "evidence": "url",
            "role": "measured",
            "eco_term": "experimental phenotypic evidence",
            "eco_id": "ECO:0000059"
        },
        {
            "evidence": "url",
            "role": "reference",
            "eco_term": "traceable author statement",
            "eco_id": "ECO:0000033"
        },
        {
            "evidence": "url",
            "role": "resource",
            "eco_term": "imported information",
            "eco_id": "ECO:0000311"
        }
    ];

    var ObservationView = Backbone.View.extend({
        el: $("#main-container"),
        template: _.template($("#observation-tmpl").html()),
        render: function () {
            var result = this.model.toJSON();
            $(this.el).html(this.template(result));

            // We will replace the values in this summary
            var summary = result.submission.observationTemplate.observationSummary;

            // Load Subjects
            var observedSubjects = new ObservedSubjects({
                observationId: result.id
            });
            var thatEl = $("#observed-subjects-grid");
            observedSubjects.fetch({
                success: function () {
                    _.each(observedSubjects.models, function (observedSubject) {
                        observedSubject = observedSubject.toJSON();

                        var observedSubjectRowView = new ObservedSubjectSummaryRowView({
                            el: $(thatEl).find("tbody"),
                            model: observedSubject
                        });
                        observedSubjectRowView.render();


                        var subject = observedSubject.subject;
                        var thatEl2 = $("#subject-image-" + observedSubject.id);
                        var imgTemplate = $("#search-results-unknown-image-tmpl");
                        if (subject.class == "Compound") {
                            var compound = new Subject({
                                id: subject.id
                            });
                            compound.fetch({
                                success: function () {
                                    compound = compound.toJSON();
                                    _.each(compound.xrefs, function (xref) {
                                        if (xref.databaseName == "IMAGE") {
                                            compound.imageFile = xref.databaseId;
                                        }
                                    });

                                    imgTemplate = $("#search-results-compound-image-tmpl");
                                    thatEl2.append(_.template(imgTemplate.html(), compound));
                                }
                            });
                        } else if (subject.class == "AnimalModel") {
                            imgTemplate = $("#search-results-animalmodel-image-tmpl");
                            thatEl2.append(_.template(imgTemplate.html(), subject));
                        } else if (subject.class == "CellSample") {
                            imgTemplate = $("#search-results-cellsample-image-tmpl");
                            thatEl2.append(_.template(imgTemplate.html(), subject));
                        } else if (subject.class == "TissueSample") {
                            imgTemplate = $("#search-results-tissuesample-image-tmpl");
                            thatEl2.append(_.template(imgTemplate.html(), subject));
                        } else if (subject.class == "Gene") {
                            imgTemplate = $("#search-results-gene-image-tmpl");
                            thatEl2.append(_.template(imgTemplate.html(), subject));
                        } else if (subject.class == "ShRna" && subject.type.toLowerCase() == "sirna") {
                            subject.class = "SiRNA";
                            imgTemplate = $("#search-results-sirna-image-tmpl");
                            thatEl2.append(_.template(imgTemplate.html(), subject));
                        } else if (subject.class == "ShRna") {
                            imgTemplate = $("#search-results-shrna-image-tmpl");
                            thatEl2.append(_.template(imgTemplate.html(), subject));
                        } else if (subject.class == "Protein") {
                            imgTemplate = $("#search-results-protein-image-tmpl");
                            thatEl2.append(_.template(imgTemplate.html(), subject));
                        } else {
                            thatEl2.append(_.template(imgTemplate.html(), subject));
                        }

                        if (observedSubject.observedSubjectRole == null || observedSubject.subject == null)
                            return;

                        summary = summary.replace(
                            new RegExp(leftSep + observedSubject.observedSubjectRole.columnName + rightSep, "g"),
                            _.template($("#summary-subject-replacement-tmpl").html(), observedSubject.subject)
                        );

                        $("#observation-summary").html(summary);
                    });
                }
            });

            // Load evidences
            var observedEvidences = new ObservedEvidences({
                observationId: result.id
            });
            var thatEl2 = $("#observed-evidences-grid");
            observedEvidences.fetch({
                success: function () {
                    var storyFilePath = "";
                    _.each(observedEvidences.models, function (observedEvidence) {
                        observedEvidence = observedEvidence.toJSON();

                        var observedEvidenceRowView = new ObservedEvidenceRowView({
                            el: $(thatEl2).find("tbody"),
                            model: observedEvidence
                        });

                        observedEvidenceRowView.render();
                        summary = summary.replace(
                            new RegExp(leftSep + observedEvidence.observedEvidenceRole.columnName + rightSep, "g"),
                            _.template($("#summary-evidence-replacement-tmpl").html(), observedEvidence.evidence)
                        );

                        $("#observation-summary").html(summary);
                        if (observedEvidence.evidence.class == "FileEvidence") {
                            // observedEvidence.observedEvidenceRole.attribute is always text/html in known cases
                            if (observedEvidence.observedEvidenceRole.columnName == "story_location") {
                                storyFilePath = observedEvidence.evidence.filePath;
                            }
                        }
                    });

                    var tableLength = (observedEvidences.models.length > 25 ? 10 : 25);
                    var oTable = $('#observed-evidences-grid').dataTable({
                        "iDisplayLength": tableLength
                    });

                    oTable.fnSort([
                        [1, 'asc'],
                        [2, 'asc']
                    ]);

                    $('.desc-tooltip').tooltip({
                        placement: "left"
                    });

                    $("a.evidence-images").fancybox({
                        titlePosition: 'inside'
                    });
                    $("div.expandable").expander({
                        slicePoint: 50,
                        expandText: '[...]',
                        expandPrefix: ' ',
                        userCollapseText: '[^]'
                    });

                    $(".numeric-value").each(function (idx) {
                        var val = $(this).html();
                        var vals = val.split("e"); // capture scientific notation
                        if (vals.length > 1) {
                            $(this).html(_.template($("#observeddatanumericevidence-val-tmpl").html(), {
                                firstPart: vals[0],
                                secondPart: vals[1].replace("+", "")
                            }));
                        }
                    });
                    $(".cytoscape-view").click(function (event) {
                        event.preventDefault();

                        var sifUrl = $(this).attr("data-sif-url");
                        var sifDesc = $(this).attr("data-description");
                        $.ajax({
                            url: "sif/",
                            data: {
                                url: sifUrl
                            },
                            dataType: "json",
                            contentType: "json",
                            success: function (data) {
                                $.fancybox(
                                    _.template($("#cytoscape-tmpl").html(), {
                                        description: sifDesc
                                    }), {
                                        'autoDimensions': false,
                                        'width': '100%',
                                        'height': '100%',
                                        'transitionIn': 'none',
                                        'transitionOut': 'none'
                                    }
                                );

                                // load cytoscape
                                //var div_id = "cytoscape-sif";

                                var container = $('#cytoscape-sif');
                                var cyOptions = {
                                    layout: {
                                        name: 'arbor',
                                        liveUpdate: false,
                                        maxSimulationTime: 1000,
                                        stop: function () {
                                            this.stop();
                                        } // callback on layoutstop 
                                    },
                                    elements: data,
                                    style: cytoscape.stylesheet()
                                        .selector("node")
                                        .css({
                                            "content": "data(id)",
                                            "border-width": 3,
                                            "background-color": "#DDD",
                                            "border-color": "#555"
                                        })
                                        .selector("edge")
                                        .css({
                                            "width": "mapData(weight, 0, 100, 1, 4)",
                                            "target-arrow-shape": "triangle",
                                            "source-arrow-shape": "circle",
                                            "line-color": "#444"
                                        })
                                        .selector(":selected")
                                        .css({
                                            "background-color": "#000",
                                            "line-color": "#000",
                                            "source-arrow-color": "#000",
                                            "target-arrow-color": "#000"
                                        })
                                        .selector(".ui-cytoscape-edgehandles-source")
                                        .css({
                                            "border-color": "#5CC2ED",
                                            "border-width": 3
                                        })
                                        .selector(".ui-cytoscape-edgehandles-target, node.ui-cytoscape-edgehandles-preview")
                                        .css({
                                            "background-color": "#5CC2ED"
                                        })
                                        .selector("edge.ui-cytoscape-edgehandles-preview")
                                        .css({
                                            "line-color": "#5CC2ED"
                                        })
                                        .selector("node.ui-cytoscape-edgehandles-preview, node.intermediate")
                                        .css({
                                            "shape": "rectangle",
                                            "width": 15,
                                            "height": 15
                                        }),

                                    ready: function () {
                                        window.cy = this; // for debugging
                                    }
                                };

                                container.cy(cyOptions);
                                // end load cytoscape
                            }
                        });

                    }); // END OF .cytoscape-view").click

                    if (result.submission.observationTemplate.isSubmissionStory && storyFilePath.length > 0) {
                        // show the link
                    } else {
                        $("#view-full-story").hide();
                    }
                }
            });

            $("#small-show-sub-details").click(function (event) {
                event.preventDefault();
                $("#obs-submission-details").slideDown();
                $("#small-show-sub-details").hide();
                $("#small-hide-sub-details").show();
            });

            $("#small-hide-sub-details").click(function (event) {
                event.preventDefault();
                $("#obs-submission-details").slideUp();
                $("#small-hide-sub-details").hide();
                $("#small-show-sub-details").show();
            });


            if (result.submission.observationTemplate.submissionDescription == "") {
                $("#obs-submission-summary").hide();
            }

            return this;
        }
    });

    var ObservedEvidenceRowView = Backbone.View.extend({
        render: function () {
            var result = this.model;
            var type = result.evidence.class;
            result.evidence.type = type;

            if (result.observedEvidenceRole == null) {
                result.observedEvidenceRole = {
                    displayText: "-",
                    evidenceRole: {
                        displayName: "unknown"
                    }
                };
            }

            var templateId = "#observedevidence-row-tmpl";
            var isHtmlStory = false;
            var mEvidence = "";

            if (type == "FileEvidence") {
                result.evidence.filePath = result.evidence.filePath.replace(/\\/g, "/");
                if (result.evidence.mimeType.toLowerCase().search("image") > -1) {
                    templateId = "#observedimageevidence-row-tmpl";
                } else if (result.evidence.mimeType.toLowerCase().search("gct") > -1) {
                    templateId = "#observedgctfileevidence-row-tmpl";
                } else if (result.evidence.mimeType.toLowerCase().search("pdf") > -1) {
                    templateId = "#observedpdffileevidence-row-tmpl";
                } else if (result.evidence.mimeType.toLowerCase().search("sif") > -1) {
                    templateId = "#observedsiffileevidence-row-tmpl";
                } else if (result.evidence.mimeType.toLowerCase().search("mra") > -1) {
                    templateId = "#observedmrafileevidence-row-tmpl";
                } else if (result.evidence.mimeType.toLowerCase().search("html") > -1) {
                    templateId = "#observedhtmlfileevidence-row-tmpl";
                    isHtmlStory = true;
                } else {
                    templateId = "#observedfileevidence-row-tmpl";
                }

                mEvidence = "file";
            } else if (type == "UrlEvidence") {
                templateId = "#observedurlevidence-row-tmpl";
                mEvidence = "url";
            } else if (type == "LabelEvidence") {
                templateId = "#observedlabelevidence-row-tmpl";
                mEvidence = "label";
            } else if (type == "DataNumericValue") {
                templateId = "#observeddatanumericevidence-row-tmpl";
                mEvidence = "numeric";
            }

            var mRole = result.observedEvidenceRole.evidenceRole.displayName;
            result.eco =
                _.chain(ecoMappings)
                .filter(function (m) {
                    return m.evidence == mEvidence && m.role == mRole;
                })
                .first()
                .value();

            this.template = _.template($(templateId).html());
            var thatEl = $(this.el);
            $(this.el).append(this.template(result));

            if (isHtmlStory) {
                thatEl.find(".html-story-link").attr("href", "#"+result.observation.submission.stableURL.replace("submission", "story"));
            }

            $(".img-rounded").tooltip({
                placement: "left"
            });
            return this;
        }
    });

    var CenterListRowView = Backbone.View.extend({
        template: _.template($("#centers-tbl-row-tmpl").html()),
        render: function () {
            $(this.el).append(this.template(this.model));
            return this;
        }

    });

    var CenterListView = Backbone.View.extend({
        el: $("#main-container"),
        template: _.template($("#centers-tmpl").html()),
        render: function () {
            $(this.el).html(this.template({}));

            var centers = new SubmissionCenters();
            var thatEl = this.el;
            var cTable = null;
            centers.fetch({
                success: function () {
                    var tableEl = $(thatEl).find("table");

                    _.each(centers.toJSON(), function (aCenter) {
                        var centerListRowView = new CenterListRowView({
                            el: $(thatEl).find("#centers-tbody"),
                            model: aCenter
                        });
                        centerListRowView.render();

                        $.ajax("count/submission/?filterBy=" + aCenter.id).done(function (count) {
                            var cntContent = _.template(
                                $("#count-submission-tmpl").html(), {
                                    count: count
                                }
                            );

                            var countCellId = "#submission-count-" + aCenter.id;
                            $(countCellId).html(cntContent);
                            tableEl.DataTable().cells(countCellId).invalidate();
                        });

                        $.ajax("list/observationtemplate/?filterBy=" + aCenter.id).done(function (templates) {
                            var pis = [];
                            _.each(templates, function (template) {
                                pis.push(template.principalInvestigator);
                            });
                            var piCellId = "#center-pi-" + aCenter.id;
                            $(piCellId).html(_.uniq(pis).join(", "));
                            tableEl.DataTable().cells(piCellId).invalidate();
                        });
                    });

                    cTable = tableEl.dataTable({
                        // might want to increase this number if we have incredible number of centers
                        "iDisplayLength": 25
                    });

                    cTable.fnSort([
                        [1, 'asc']
                    ]);
                }
            });
            return this;
        }
    });

    var StoriesListView = Backbone.View.extend({
        el: $("#main-container"),
        template: _.template($("#stories-tmpl").html()),

        render: function () {
            $(this.el).html(this.template({}));

            // and load the stories
            var storySubmissions = new StorySubmissions({
                limit: -1
            });
            storySubmissions.fetch({
                success: function () {
                    var counter = 1;
                    _.each(storySubmissions.models, function (aStory) {
                        var storyView = new StoryListItemView({
                            el: $("#stories-list #stories-tbody"),
                            model: aStory.toJSON()
                        });
                        storyView.render();
                        counter++;
                    });

                    Holder.run();
                }
            });

            return this;
        }
    });

    var CenterSubmissionRowView = Backbone.View.extend({
        template: _.template($("#center-submission-tbl-row-tmpl").html()),
        render: function () {
            $(this.el).append(this.template(this.model));
            return this;
        }
    });

    var SearchSubmissionRowView = Backbone.View.extend({
        el: "#searched-submissions tbody",
        template: _.template($("#search-submission-tbl-row-tmpl").html()),
        render: function () {
            $(this.el).append(this.template(this.model));
            return this;
        }
    });

    var SubmissionDescriptionView = Backbone.View.extend({
        el: "#optional-submission-description",
        template: _.template($("#submission-description-tmpl").html()),
        render: function () {
            $(this.el).html(this.template(this.model));
            return this;
        }
    });

    var CompoundView = Backbone.View.extend({
        el: $("#main-container"),
        template: _.template($("#compound-tmpl").html()),
        render: function () {
            var thatModel = this.model;
            var result = thatModel.subject.toJSON();

            result.drugbank = result.pubchem = result.cas = false;

            _.each(result.xrefs, function (xref) {
                if (xref.databaseName == "IMAGE") {
                    result.imageFile = xref.databaseId;
                } else if (xref.databaseName == "PUBCHEM") {
                    result.pubchem = xref.databaseId;
                } else if (xref.databaseName == "DRUG BANK") {
                    result.drugbank = xref.databaseId;
                } else if (xref.databaseName == "CAS") {
                    result.cas = xref.databaseId;
                }

            });
            result.type = result.class;

            $(this.el).html(this.template($.extend(result, {
                tier: thatModel.tier ? thatModel.tier : null,
                role: thatModel.role ? thatModel.role : null
            })));

            var thatEl = $("ul.synonyms");
            _.each(result.synonyms, function (aSynonym) {
                if (aSynonym.displayName == result.displayName) return;

                var synonymView = new SynonymView({
                    model: aSynonym,
                    el: thatEl
                });
                synonymView.render();
            });

            var subjectObservationView = new SubjectObservationsView({
                model: {
                    subjectId: result.id,
                    tier: thatModel.tier,
                    role: thatModel.role
                },
                el: "#compound-observation-grid"
            });
            subjectObservationView.render();

            $("a.compound-image").fancybox({
                titlePosition: 'inside'
            });
            return this;
        }
    });

    var SubjectObservationsView = Backbone.View.extend({
        render: function () {
            var thatEl = $(this.el);
            var thatModel = this.model;
            var subjectId = thatModel.subjectId;
            var tier = thatModel.tier; // possibly undefined
            var role = thatModel.role; // possibly undefined

            var countUrl = "count/observation/?filterBy=" + subjectId;
            if (role != undefined) {
                countUrl += "&role=" + role;
            }
            if (tier != undefined) {
                countUrl += "&tier=" + tier;
            }

            $.ajax(countUrl).done(function (count) {
                var observations = new Observations({
                    subjectId: subjectId,
                    role: role,
                    tier: tier
                });
                observations.fetch({
                    success: function () {
                        $(".subject-observations-loading", thatEl).remove();
                        _.each(observations.models, function (observation) {
                            observation = observation.toJSON();
                            var observationRowView = new ObservationRowView({
                                el: $(thatEl).find("tbody"),
                                model: observation
                            });
                            observationRowView.render();
                        });

                        var oTable = $(thatEl).dataTable({
                            'dom': 'iBfrtlp',
                            "sPaginationType": "bootstrap",
                            "columns": [{
                                    "orderDataType": "dashboard-date"
                                },
                                null,
                                null,
                                null
                            ],
                            'buttons': [{
                                extend: 'excelHtml5',
                                text: 'Export as Spreadsheet',
                                className: "extra-margin",
                                customizeData: function (data) {
                                    var body = data.body;
                                    for (var i = 0; i < body.length; i++) {
                                        var raw_content = body[i][1].split(/ +/);
                                        raw_content.pop();
                                        raw_content.pop();
                                        body[i][1] = raw_content.join(' ');
                                    }
                                },
                            }],
                        });

                        oTable.fnSort([
                            [2, 'desc']
                        ]);

                    }
                });

                if (count > maxNumberOfEntities) {
                    var moreObservationView = new MoreObservationView({
                        model: {
                            role: role,
                            tier: tier,
                            numOfObservations: maxNumberOfEntities,
                            numOfAllObservations: count,
                            subjectId: subjectId,
                            tableEl: thatEl,
                            rowView: ObservationRowView,
                            columns: [{
                                    "orderDataType": "dashboard-date"
                                },
                                null,
                                null,
                                null
                            ]
                        }
                    });
                    moreObservationView.render();
                }
            });

            return this;
        }
    });

    var GeneView = Backbone.View.extend({
        el: $("#main-container"),
        template: _.template($("#gene-tmpl").html()),
        render: function () {
            var thatModel = this.model;
            var result = thatModel.subject.toJSON();
            // Find out the UniProt ID

            result.type = result.class;
            $(this.el).html(this.template($.extend(result, {
                tier: thatModel.tier ? thatModel.tier : null,
                role: thatModel.role ? thatModel.role : null
            })));

            var thatEl = $("ul.synonyms");
            _.each(result.synonyms, function (aSynonym) {
                if (aSynonym.displayName == result.displayName) return;

                var synonymView = new SynonymView({
                    model: aSynonym,
                    el: thatEl
                });
                synonymView.render();
            });

            thatEl = $("ul.refs");
            $.getJSON("findProteinFromGene/" + result.id, function (proteins) {
                _.each(proteins, function (protein) {
                    thatEl.append(_.template($("#gene-uniprot-tmpl").html(), {
                        uniprotId: protein.uniprotId
                    }));
                });
            });

            var subjectObservationView = new SubjectObservationsView({
                model: {
                    subjectId: result.id,
                    tier: thatModel.tier,
                    role: thatModel.role
                },
                el: "#gene-observation-grid"
            });
            subjectObservationView.render();

            var currentGene = result.displayName;
            $(".addGene-" + currentGene).click(function (e) {
                e.preventDefault();
                updateGeneList(currentGene);
                return this;
            }); //end addGene

            return this;
        }
    });

    var ProteinView = Backbone.View.extend({
        el: $("#main-container"),
        template: _.template($("#protein-tmpl").html()),
        render: function () {
            var thatModel = this.model;
            var result = thatModel.subject.toJSON();
            result.type = result.class;
            $(this.el).html(this.template($.extend(result, {
                tier: thatModel.tier ? thatModel.tier : null,
                role: thatModel.role ? thatModel.role : null
            })));

            var thatEl = $("ul.synonyms");
            _.each(result.synonyms, function (aSynonym) {
                if (aSynonym.displayName == result.displayName) return;

                var synonymView = new SynonymView({
                    model: aSynonym,
                    el: thatEl
                });
                synonymView.render();
            });

            thatEl = $("ul.transcripts");
            _.each(result.transcripts, function (aTranscript) {
                var transcriptItemView = new TranscriptItemView({
                    model: aTranscript,
                    el: thatEl
                });
                transcriptItemView.render();
            });


            var subjectObservationView = new SubjectObservationsView({
                model: {
                    subjectId: result.id,
                    tier: thatModel.tier,
                    role: thatModel.role
                },
                el: "#protein-observation-grid"
            });
            subjectObservationView.render();

            return this;
        }
    });

    var ShrnaView = Backbone.View.extend({
        el: $("#main-container"),
        template: _.template($("#shrna-tmpl").html()),
        render: function () {
            var thatModel = this.model;
            var result = thatModel.subject.toJSON();
            result.type = result.class;
            $(this.el).html(this.template($.extend(result, {
                tier: thatModel.tier ? thatModel.tier : null,
                role: thatModel.role ? thatModel.role : null
            })));

            var subjectObservationView = new SubjectObservationsView({
                model: {
                    subjectId: result.id,
                    tier: thatModel.tier,
                    role: thatModel.role
                },
                el: "#shrna-observation-grid"
            });
            subjectObservationView.render();

            return this;
        }
    });

    var SirnaView = Backbone.View.extend({
        el: $("#main-container"),
        template: _.template($("#sirna-tmpl").html()),
        render: function () {
            var thatModel = this.model;
            var result = thatModel.subject.toJSON();
            result.type = "sirna";
            $(this.el).html(this.template($.extend(result, {
                tier: thatModel.tier ? thatModel.tier : null,
                role: thatModel.role ? thatModel.role : null
            })));

            var subjectObservationView = new SubjectObservationsView({
                model: {
                    subjectId: result.id,
                    tier: thatModel.tier,
                    role: thatModel.role
                },
                el: "#sirna-observation-grid"
            });
            subjectObservationView.render();

            return this;
        }
    });

    var TranscriptView = Backbone.View.extend({
        el: $("#main-container"),
        template: _.template($("#transcript-tmpl").html()),
        render: function () {
            var thatModel = this.model;
            var result = thatModel.subject.toJSON();
            result.type = result.class;
            $(this.el).html(this.template($.extend(result, {
                tier: thatModel.tier ? thatModel.tier : null,
                role: thatModel.role ? thatModel.role : null
            })));

            var subjectObservationView = new SubjectObservationsView({
                model: {
                    subjectId: result.id,
                    tier: thatModel.tier,
                    role: thatModel.role
                },
                el: "#transcript-observation-grid"
            });
            subjectObservationView.render();

            return this;
        }
    });

    var TissueSampleView = Backbone.View.extend({
        el: $("#main-container"),
        template: _.template($("#tissuesample-tmpl").html()),
        render: function () {
            var thatModel = this.model;
            var result = thatModel.subject.toJSON();
            result.type = result.class;
            $(this.el).html(this.template($.extend(result, {
                tier: thatModel.tier ? thatModel.tier : null,
                role: thatModel.role ? thatModel.role : null
            })));

            var thatEl = this.el;
            if (result.xrefs.length == 0) {
                $(thatEl).find("#tissue-refs").hide();
            }
            _.each(result.xrefs, function (xref) {
                //if(xref.databaseName == "NCI_PARENT_THESAURUS" || xref.databaseName == "NCI_THESAURUS") {
                if (xref.databaseName == "NCI_THESAURUS") {
                    var ids = xref.databaseId.split(";");
                    _.each(ids, function (xrefid) {
                        $(thatEl).find("ul.xrefs").append(
                            _.template($("#ncithesaurus-tmpl").html(), {
                                nciId: xrefid
                            })
                        );
                    });
                }
            });

            if (result.synonyms.length == 0) {
                $(thatEl).find("#tissue-synonyms").hide();
            }
            var synonymEl = $("ul.synonyms");
            _.each(result.synonyms, function (aSynonym) {
                if (aSynonym.displayName == result.displayName) return;

                var synonymView = new SynonymView({
                    model: aSynonym,
                    el: synonymEl
                });
                synonymView.render();
            });

            var subjectObservationView = new SubjectObservationsView({
                model: {
                    subjectId: result.id,
                    tier: thatModel.tier,
                    role: thatModel.role
                },
                el: "#tissuesample-observation-grid"
            });
            subjectObservationView.render();

            return this;
        }
    });

    var AnimalModelView = Backbone.View.extend({
        el: $("#main-container"),
        template: _.template($("#animalmodel-tmpl").html()),
        render: function () {
            var thatModel = this.model;
            var result = thatModel.subject.toJSON();
            result.type = result.class;
            $(this.el).html(this.template($.extend(result, {
                tier: thatModel.tier ? thatModel.tier : null,
                role: thatModel.role ? thatModel.role : null
            })));

            var thatEl = $("ul.synonyms");
            _.each(result.synonyms, function (aSynonym) {
                if (aSynonym.displayName == result.displayName) return;

                var synonymView = new SynonymView({
                    model: aSynonym,
                    el: thatEl
                });
                synonymView.render();
            });

            var thatEl2 = $("#annotations ul");
            _.each(result.annotations, function (annotation) {
                annotation.displayName = annotation.displayName.replace(/_/g, " ");
                var annotationView = new AnnotationView({
                    model: annotation,
                    el: thatEl2
                });
                annotationView.render();
            });

            var subjectObservationView = new SubjectObservationsView({
                model: {
                    subjectId: result.id,
                    tier: thatModel.tier,
                    role: thatModel.role
                },
                el: "#animalmodel-observation-grid"
            });
            subjectObservationView.render();

            return this;
        }
    });

    var AnnotationView = Backbone.View.extend({
        template: _.template($("#annotation-tmpl").html()),
        render: function () {
            $(this.el).append(this.template(this.model));
        }
    });

    var CellSampleView = Backbone.View.extend({
        el: $("#main-container"),
        template: _.template($("#cellsample-tmpl").html()),
        render: function () {
            var thatModel = this.model;
            var result = thatModel.subject.toJSON();
            result.type = result.class;

            // Look for cbioPortal Id
            var cbioPortalId = null;
            _.each(result.xrefs, function (xref) {
                if (xref.databaseName == "CBIO_PORTAL") {
                    cbioPortalId = xref.databaseId;
                }
            });

            result.cbioPortalId = cbioPortalId;
            result.type = result.class;

            $(this.el).html(this.template($.extend(result, {
                tier: thatModel.tier ? thatModel.tier : null,
                role: thatModel.role ? thatModel.role : null
            })));

            if (!cbioPortalId) {
                $("#cbiolink").css("display", "none");
            }

            var thatEl = $("ul.synonyms");
            _.each(result.synonyms, function (aSynonym) {
                if (aSynonym.displayName == result.displayName) return;

                var synonymView = new SynonymView({
                    model: aSynonym,
                    el: thatEl
                });
                synonymView.render();
            });

            var thatEl2 = $("#annotations ul");
            _.each(result.annotations, function (annotation) {
                annotation.displayName = annotation.displayName.replace(/_/g, " ");
                var annotationView = new AnnotationView({
                    model: annotation,
                    el: thatEl2
                });
                annotationView.render();
            });

            var subjectObservationView = new SubjectObservationsView({
                model: {
                    subjectId: result.id,
                    tier: thatModel.tier,
                    role: thatModel.role
                },
                el: "#cellsample-observation-grid"
            });
            subjectObservationView.render();

            return this;
        }
    });

    var ObservationRowView = Backbone.View.extend({
        template: _.template($("#observation-row-tmpl").html()),
        render: function () {
            var tableEl = this.el;
            $(tableEl).append(this.template(this.model));
            var summary = this.model.submission.observationTemplate.observationSummary;

            var thatModel = this.model;
            var cellId = "#observation-summary-" + this.model.id;
            var thatEl = $(cellId);
            var observedSubjects = new ObservedSubjects({
                observationId: this.model.id
            });
            observedSubjects.fetch({
                success: function () {
                    _.each(observedSubjects.models, function (observedSubject) {
                        observedSubject = observedSubject.toJSON();

                        if (observedSubject.observedSubjectRole == null || observedSubject.subject == null)
                            return;

                        summary = summary.replace(
                            new RegExp(leftSep + observedSubject.observedSubjectRole.columnName + rightSep, "g"),
                            _.template($("#summary-subject-replacement-tmpl").html(), observedSubject.subject)
                        );
                    });

                    var observedEvidences = new ObservedEvidences({
                        observationId: thatModel.id
                    });
                    observedEvidences.fetch({
                        success: function () {
                            _.each(observedEvidences.models, function (observedEvidence) {
                                observedEvidence = observedEvidence.toJSON();

                                if (observedEvidence.observedEvidenceRole == null || observedEvidence.evidence == null)
                                    return;

                                summary = summary.replace(
                                    new RegExp(leftSep + observedEvidence.observedEvidenceRole.columnName + rightSep, "g"),
                                    _.template($("#summary-evidence-replacement-tmpl").html(), observedEvidence.evidence)
                                );
                            });

                            summary += _.template($("#submission-obs-tbl-row-tmpl").html(), thatModel);
                            $(thatEl).html(summary);
                            var dataTable = $(tableEl).parent().DataTable();
                            dataTable.cells(cellId).invalidate();
                            dataTable.order([
                                [2, 'desc'],
                                [0, 'desc'],
                                [1, 'asc']
                            ]).draw();
                        }
                    });
                }
            });

            return this;
        }
    });

    var ObservedSubjectSummaryRowView = Backbone.View.extend({
        template: _.template($("#observedsubject-summary-row-tmpl").html()),
        render: function () {
            var result = this.model;
            if (result.subject == null) return;
            if (result.subject.type == undefined) {
                result.subject.type = result.subject.class;
            }

            if (result.subject.class != "Gene") {
                this.template = _.template($("#observedsubject-summary-row-tmpl").html());
                $(this.el).append(this.template(result));
            } else {
                this.template = _.template($("#observedsubject-gene-summary-row-tmpl").html());
                $(this.el).append(this.template(result));
                var currentGene = result.subject.displayName;

                $(".addGene-" + currentGene).click(function (e) {
                    e.preventDefault();
                    updateGeneList(currentGene);
                    return this;
                }); //end addGene
            }

            return this;
        }
    });

    var CenterView = Backbone.View.extend({
        el: $("#main-container"),
        tableEl: '#center-submission-grid',
        template: _.template($("#center-tmpl").html()),
        render: function (filterProject) {
            var urlMap = {};
            var centerModel = this.model.toJSON();
            $(this.el).html(this.template(centerModel));

            var thatEl = this.el;
            var thatTableEl = this.tableEl;
            var centerSubmissions = new CenterSubmissions({
                centerId: centerModel.id
            });
            centerSubmissions.fetch({
                success: function () {
                    var tableElId = thatTableEl;
                    _.each(centerSubmissions.toJSON(), function (submission) {
                        var centerSubmissionRowView = new CenterSubmissionRowView({
                            el: $(thatEl).find("tbody"),
                            model: submission
                        });

                        $.ajax("count/observation/?filterBy=" + submission.id, {
                            "async": false
                        }).done(function (count) {
                            var tmplName = submission.observationTemplate.isSubmissionStory ?
                                "#count-story-tmpl" :
                                "#count-observations-tmpl";
                            submission.details = _.template(
                                $(tmplName).html(), {
                                    count: count
                                }
                            );
                        });

                        centerSubmissionRowView.render();
                    });

                    $(".template-description").tooltip();
                    $(tableElId).dataTable({
                        "columns": [
                            null,
                            {
                                "visible": false
                            },
                            null,
                            {
                                "orderDataType": "dashboard-date"
                            },
                            null
                        ],
                        "drawCallback": function (settings) {
                            var api = this.api();
                            var rows = api.rows({
                                page: 'current'
                            }).nodes();
                            var last = null;

                            api.column(1, {
                                    page: 'current'
                                })
                                .data()
                                .each(function (group, i) {
                                    var project_url = group.toLowerCase().replace(/[^a-zA-Z0-9]/g, "-");
                                    urlMap[project_url] = group;
                                    if (last != group) {
                                        $(rows)
                                            .eq(i)
                                            .before(
                                                _.template($("#tbl-project-title-tmpl").html(), {
                                                    project: group,
                                                    project_url: project_url,
                                                    centerStableURL: centerModel.stableURL
                                                })
                                            );

                                        last = group;
                                    }
                                });
                        }
                    }).fnSort([
                        [0, 'desc']
                    ]);

                    if (filterProject != null) {
                        $(tableElId).DataTable().search(urlMap[filterProject]).draw();
                        var mpModel = {
                            filterProject: urlMap[filterProject],
                            centerStableURL: centerModel.stableURL
                        };
                        var moreProjectsView = new MoreProjectsView({
                            model: mpModel
                        });
                        moreProjectsView.render();
                    }
                }
            });

            $($("#center-specific-information-tmpl").html()).each(function () {
                if (centerModel.displayName == $(this).attr("data-center")) {
                    $(thatEl).find("span.center-link").append($(this));
                }
            });

            return this;
        }

    });

    var MoreProjectsView = Backbone.View.extend({
        template: _.template($("#more-projects-tmpl").html()),
        el: "#more-project-container",

        render: function () {
            $(this.el).append(this.template(this.model));
        }
    });

    var SubmissionRowView = Backbone.View.extend({
        template: _.template($("#submission-tbl-row-tmpl").html()),
        render: function () {
            $(this.el).append(this.template(this.model));
            var sTable = $(this.el).parent();

            var summary = this.model.submission.observationTemplate.observationSummary;

            var thatModel = this.model;
            var cellId = "#submission-observation-summary-" + this.model.id;
            var thatEl = $(cellId);
            var observedSubjects = new ObservedSubjects({
                observationId: this.model.id
            });
            observedSubjects.fetch({
                success: function () {
                    _.each(observedSubjects.models, function (observedSubject) {
                        observedSubject = observedSubject.toJSON();

                        if (observedSubject.observedSubjectRole == null || observedSubject.subject == null)
                            return;

                        summary = summary.replace(
                            new RegExp(leftSep + observedSubject.observedSubjectRole.columnName + rightSep, "g"),
                            _.template($("#summary-subject-replacement-tmpl").html(), observedSubject.subject)
                        );
                    });

                    var observedEvidences = new ObservedEvidences({
                        observationId: thatModel.id
                    });
                    observedEvidences.fetch({
                        success: function () {
                            _.each(observedEvidences.models, function (observedEvidence) {
                                observedEvidence = observedEvidence.toJSON();

                                if (observedEvidence.observedEvidenceRole == null || observedEvidence.evidence == null)
                                    return;

                                summary = summary.replace(
                                    new RegExp(leftSep + observedEvidence.observedEvidenceRole.columnName + rightSep, "g"),
                                    _.template($("#summary-evidence-replacement-tmpl").html(), observedEvidence.evidence)
                                );
                            });

                            summary += _.template($("#submission-obs-tbl-row-tmpl").html(), thatModel);
                            $(thatEl).html(summary);

                            // let the datatable know about the update
                            $(sTable).DataTable().cells(cellId).invalidate();
                        }
                    });

                }
            });

            return this;
        }
    });

    var SubmissionView = Backbone.View.extend({
        el: $("#main-container"),
        template: _.template($("#submission-tmpl").html()),
        render: function () {
            var submission = this.model.toJSON();
            $(this.el).html(this.template(submission));

            if (submission.observationTemplate.submissionDescription.length > 0) {
                var submissionDescriptionView = new SubmissionDescriptionView({
                    model: submission
                });
                submissionDescriptionView.render();
            }

            var thatEl = this.el;
            var submissionId = this.model.get("id");
            var sTable = '#submission-observation-grid';

            $.ajax("list/similar/" + submissionId).done(function (similarSubmissions) {
                if (similarSubmissions.length < 1) {
                    $("#similar-submission-info").hide();
                } else {
                    _.each(similarSubmissions, function (simSub) {
                        $(thatEl)
                            .find("ul.similar-submission-list")
                            .append(_.template($("#similar-submission-item-tmpl").html(), simSub));
                    });
                }
            });

            $.ajax("count/observation/?filterBy=" + submissionId).done(function (count) {
                var observations = new Observations({
                    submissionId: submissionId
                });
                observations.fetch({
                    success: function () {
                        $(".submission-observations-loading").hide();

                        _.each(observations.models, function (observation) {
                            observation = observation.toJSON();

                            var submissionRowView = new SubmissionRowView({
                                el: $(thatEl).find(".observations tbody"),
                                model: observation,
                                attributes: {
                                    table: sTable
                                }
                            });
                            submissionRowView.render();
                        });

                        $(sTable).dataTable();

                    }
                });

                if (count > maxNumberOfEntities) {
                    var moreObservationView = new MoreObservationView({
                        model: {
                            numOfObservations: maxNumberOfEntities,
                            numOfAllObservations: count,
                            submissionId: submissionId,
                            tableEl: sTable,
                            rowView: SubmissionRowView,
                            columns: [null]
                        }
                    });
                    moreObservationView.render();
                }

            });

            return this;
        }
    });

    var MoreObservationView = Backbone.View.extend({
        el: ".more-observations-message",
        template: _.template($("#more-observations-tmpl").html()),
        render: function () {
            var model = this.model;
            var role = model.role;
            var tier = model.tier;
            var thatEl = this.el;
            $(thatEl).html(this.template(model));
            $(thatEl).find("a.load-more-observations").click(function (e) {
                e.preventDefault();
                $(thatEl).slideUp();

                $(".submission-observations-loading").show();
                var sTableId = model.tableEl;

                var observations;
                if (model.submissionId != undefined) {
                    observations = new Observations({
                        submissionId: model.submissionId,
                        getAll: true
                    });
                } else if (model.subjectId != undefined) {
                    observations = new Observations({
                        subjectId: model.subjectId,
                        getAll: true,
                        role: role,
                        tier: tier
                    });
                } else {
                    console.log("something is wrong here!");
                }
                observations.fetch({
                    success: function () {
                        $(sTableId).DataTable().rows().remove().draw().destroy();

                        _.each(observations.models, function (observation, i) {
                            observation = observation.toJSON();

                            var submissionRowView = new model.rowView({
                                el: $(model.tableEl).find("tbody"),
                                model: observation
                            });
                            submissionRowView.render();
                        });

                        $(sTableId).dataTable({
                            "columns": model.columns
                        });

                    }
                });
            });
        }
    });

    var TranscriptItemView = Backbone.View.extend({
        template: _.template($("#transcript-item-tmpl").html()),
        render: function () {
            $(this.el).append(this.template(this.model));
            return this;
        }
    });

    var SynonymView = Backbone.View.extend({
        template: _.template($("#synonym-item-tmpl").html()),
        render: function () {
            $(this.el).append(this.template(this.model));
            return this;
        }
    });

    var RoleView = Backbone.View.extend({
        template: _.template($("#role-item-tmpl").html()),
        render: function () {
            $(this.el).append(this.template(this.model));
            return this;
        }
    });

    var EmptyResultsView = Backbone.View.extend({
        template: _.template($("#search-empty-tmpl").html()),
        render: function () {
            $(this.el).append(this.template(this.model));

            return this;
        }
    });

    var SearchResultsRowView = Backbone.View.extend({
        template: _.template($("#search-result-row-tmpl").html()),
        render: function () {
            var model = this.model;
            var result = model.dashboardEntity;

            if (result.class != "Gene") {
                this.template = _.template($("#search-result-row-tmpl").html());
                $(this.el).append(this.template(model));
            } else {
                this.template = _.template($("#search-result-gene-row-tmpl").html());
                $(this.el).append(this.template(model));
                var currentGene = result.displayName;

                $(".addGene-" + currentGene).click(function (e) {
                    e.preventDefault();
                    updateGeneList(currentGene);
                    return this;
                }); //end addGene
            }

            var thatEl = $("#synonyms-" + result.id);
            _.each(result.synonyms, function (aSynonym) {
                var synonymView = new SynonymView({
                    model: aSynonym,
                    el: thatEl
                });
                synonymView.render();
            });

            var roleEl = $("#roles-" + result.id);
            _.each(model.roles, function (aRole) {
                var roleView = new RoleView({
                    model: {
                        role: aRole
                    },
                    el: roleEl
                });
                roleView.render();
            });

            var searchEl = $("#search-image-" + result.id);
            var imgTemplate = $("#search-results-unknown-image-tmpl");
            if (result.class == "Compound") {
                _.each(result.xrefs, function (xref) {
                    if (xref.databaseName == "IMAGE") {
                        result.imageFile = xref.databaseId;
                    }
                });
                imgTemplate = $("#search-results-compound-image-tmpl");
            } else if (result.class == "AnimalModel") {
                imgTemplate = $("#search-results-animalmodel-image-tmpl");
            } else if (result.class == "CellSample") {
                imgTemplate = $("#search-results-cellsample-image-tmpl");
            } else if (result.class == "TissueSample") {
                imgTemplate = $("#search-results-tissuesample-image-tmpl");
            } else if (result.class == "Gene") {
                imgTemplate = $("#search-results-gene-image-tmpl");
            } else if (result.class == "ShRna" && result.type.toLowerCase() == "sirna") {
                imgTemplate = $("#search-results-sirna-image-tmpl");
            } else if (result.class == "ShRna") {
                imgTemplate = $("#search-results-shrna-image-tmpl");
            } else if (result.class == "Protein") {
                imgTemplate = $("#search-results-protein-image-tmpl");
            } else {
                result.subjectClass = result.class; // this is only to avoid using 'class' alone because it is a javascript keyword
            }
            searchEl.append(_.template(imgTemplate.html(), result));

            // some of the elements will be hidden in the pagination. Use magic-scoping!
            var updateElId = "#subject-observation-count-" + result.id;
            var updateEl = $(updateElId);
            var cntContent = _.template(
                $("#count-observations-tmpl").html(), {
                    count: model.observationCount
                }
            );
            updateEl.html(cntContent);

            return this;
        }
    });

    var tabulate_matching_observations = function (m_observations) {
        if (m_observations.length <= 0) return;

        $("#observation-search-results").fadeIn();
        var thatEl = $("#searched-observation-grid");

        $(".subject-observations-loading", thatEl).remove();
        _.each(m_observations, function (observation) {
            var observationRowView = new ObservationRowView({
                el: $(thatEl).find("tbody"),
                model: observation
            });
            observationRowView.render();
        });
    };

    var SearchView = Backbone.View.extend({
        el: $("#main-container"),
        template: _.template($("#search-tmpl").html()),
        render: function () {
            $(this.el).html(this.template(this.model));

            // update the search box accordingly
            $("#omni-input").val(decodeURIComponent(this.model.term));

            var thatEl = this.el;
            var thatModel = this.model;
            var searchResults = new SearchResults({
                term: this.model.term
            });

            searchResults.fetch({
                success: function () {
                    $("#loading-row").remove();
                    if (searchResults.models.length == 0) {
                        (new EmptyResultsView({
                            el: $(thatEl).find("tbody"),
                            model: thatModel
                        })).render();
                    } else {
                        var submissions = [];
                        var matching_observations = [];
                        _.each(searchResults.models, function (aResult) {
                            aResult = aResult.toJSON();
                            if (aResult.dashboardEntity.organism == undefined) {
                                aResult.dashboardEntity.organism = {
                                    displayName: "-"
                                };
                            }

                            if (aResult.dashboardEntity.class == "Submission") {
                                submissions.push(aResult);
                                return;
                            } else if (aResult.dashboardEntity.class == "Observation") {
                                matching_observations.push(aResult.dashboardEntity);
                                return;
                            }

                            var searchResultsRowView = new SearchResultsRowView({
                                model: aResult,
                                el: $(thatEl).find("tbody")
                            });
                            searchResultsRowView.render();
                        });

                        $(".search-info").tooltip({
                            placement: "left"
                        });
                        $(".obs-tooltip").tooltip();

                        var oTable = $("#search-results-grid").dataTable({
                            "columns": [
                                null,
                                null,
                                null,
                                null,
                                {
                                    "orderDataType": "dashboard-rank"
                                },
                                null
                            ]

                        });
                        oTable.fnSort([
                            [4, 'desc'],
                            [5, 'desc'],
                            [1, 'asc']
                        ]);

                        // OK done with the subjects; let's build the submissions table
                        if (submissions.length > 0) {
                            $("#submission-search-results").fadeIn();

                            _.each(submissions, function (submission) {
                                var searchSubmissionRowView = new SearchSubmissionRowView({
                                    model: submission
                                });
                                searchSubmissionRowView.render();

                                if (submission.observationTemplate === undefined) { // TODO why does this happen?
                                    submission.observationTemplate = {};
                                }
                                var tmplName = submission.observationTemplate.isSubmissionStory ?
                                    "#count-story-tmpl" :
                                    "#count-observations-tmpl";
                                var cntContent = _.template(
                                    $(tmplName).html(), {
                                        count: submission.observationCount
                                    }
                                );
                                $("#search-observation-count-" + submission.dashboardEntity.id).html(cntContent);
                            });

                            var sTable = $("#searched-submissions").dataTable({
                                "columns": [
                                    null,
                                    {
                                        "orderDataType": "dashboard-date"
                                    },
                                    null,
                                    null,
                                    null,
                                    null
                                ]
                            });
                            sTable.fnSort([
                                [4, 'desc'],
                                [2, 'desc']
                            ]);
                        }

                        tabulate_matching_observations(matching_observations);
                    }
                }
            });

            return this;
        }
    });

    //MRA View
    var MraView = Backbone.View.extend({
        el: $("#main-container"),
        template: _.template($("#mra-view-tmpl").html()),
        render: function () {
            var result = this.model.toJSON();
            var mra_data_url = $("#mra-view-tmpl").attr("mra-data-url") + result.evidence.filePath.replace(/\\/g, '/');
            $(this.el).html(this.template(result));
            $.ajax({
                url: "mra-data/",
                data: {
                    url: mra_data_url,
                    dataType: "mra",
                    filterBy: "none",
                    nodeNumLimit: 0,
                    throttle: ""
                },
                dataType: "json",
                contentType: "json",

                success: function (data) {
                    var thatEl = $("#master-regulator-grid");
                    var thatE2 = $("#mra-barcode-grid");
                    _.each(data, function (aData) {
                        var mraViewRowView = new MraViewRowView({
                            el: $(thatEl).find("tbody"),
                            model: aData
                        });
                        mraViewRowView.render();

                        var mraBarcodeRowView = new MraBarcodeRowView({
                            el: $(thatE2).find("tbody"),
                            model: aData
                        });
                        mraBarcodeRowView.render();

                    });

                    var oTable1 = $('#master-regulator-grid').dataTable({
                        "sDom": "<'row'<'span5'i><'span5'f>r>t<'row'<'span5'l><'span5'p>>",
                        "sScrollY": "200px",
                        "bPaginate": false
                    });

                    var oTable2 = $('#mra-barcode-grid').dataTable();
                }
            }); //ajax 

            $(".mra-cytoscape-view").click(function (event) {
                event.preventDefault();
                var mraDesc = $(this).attr("data-description");
                var throttle = $("#throttle-input").text();
                var layoutName = $("#cytoscape-layouts").val();
                var nodeLimit = $("#cytoscape-node-limit").val();

                var filters = "";
                $('input[type="checkbox"]:checked').each(function () {
                    filters = filters + ($(this).val() + ',');
                });

                if (filters.length == 0) {
                    showAlertMessage("Please select at least one master regulator.");
                    return;
                }

                $.ajax({
                    url: "mra-data/",
                    data: {
                        url: mra_data_url,
                        dataType: "cytoscape",
                        filterBy: filters,
                        nodeNumLimit: nodeLimit,
                        throttle: ""
                    },
                    dataType: "json",
                    contentType: "json",
                    success: function (data) {

                        if (data == null) {
                            showAlertMessage("The network is empty.");
                            return;
                        }

                        $.fancybox(
                            _.template($("#mra-cytoscape-tmpl").html(), {
                                description: mraDesc
                            }), {
                                'autoDimensions': false,
                                'width': '100%',
                                'height': '85%',
                                'transitionIn': 'none',
                                'transitionOut': 'none'
                            }
                        );

                        var container = $('#cytoscape');

                        var cyOptions = {
                            layout: {
                                name: layoutName,
                                fit: true,
                                liveUpdate: false,
                                maxSimulationTime: 8000, // max length in ms to run the layout
                                stop: function () {
                                    $("#mra_progress_indicator").hide();
                                    this.stop();
                                } // callback on layoutstop 

                            },
                            elements: data,
                            style: cytoscape.stylesheet()
                                .selector("node")
                                .css({
                                    "content": "data(id)",
                                    "shape": "data(shape)",
                                    "border-width": 2,
                                    "labelValign": "middle",
                                    "font-size": 10,
                                    "width": "25px",
                                    "height": "25px",
                                    "background-color": "data(color)",
                                    "border-color": "#555"
                                })
                                .selector("edge")
                                .css({
                                    "width": "mapData(weight, 0, 100, 1, 3)",
                                    "target-arrow-shape": "triangle",
                                    "source-arrow-shape": "circle",
                                    "line-color": "#444"
                                })
                                .selector(":selected")
                                .css({
                                    "background-color": "#000",
                                    "line-color": "#000",
                                    "source-arrow-color": "#000",
                                    "target-arrow-color": "#000"
                                })
                                .selector(".ui-cytoscape-edgehandles-source")
                                .css({
                                    "border-color": "#5CC2ED",
                                    "border-width": 2
                                })
                                .selector(".ui-cytoscape-edgehandles-target, node.ui-cytoscape-edgehandles-preview")
                                .css({
                                    "background-color": "#5CC2ED"
                                })
                                .selector("edge.ui-cytoscape-edgehandles-preview")
                                .css({
                                    "line-color": "#5CC2ED"
                                })
                                .selector("node.ui-cytoscape-edgehandles-preview, node.intermediate")
                                .css({
                                    "shape": "rectangle",
                                    "width": 15,
                                    "height": 15
                                }),

                            ready: function () {
                                window.cy = this; // for debugging
                            }
                        };

                        container.cy(cyOptions);

                    }
                }); //end ajax

            }); //end .cytoscape-view

            $("#master-regulator-grid").on("change", ":checkbox", function () {
                var nodeLimit = $("#cytoscape-node-limit").val();
                var filters = "";
                $('input[type="checkbox"]:checked').each(function () {
                    filters = filters + ($(this).val() + ',');
                });

                $.ajax({
                    url: "mra-data/",
                    data: {
                        url: mra_data_url,
                        dataType: "throttle",
                        filterBy: filters,
                        nodeNumLimit: nodeLimit,
                        throttle: ""
                    },
                    dataType: "json",
                    contentType: "json",
                    success: function (data) {
                        if (data != null)
                            $("#throttle-input").text(data);
                        else
                            $("#throttle-input").text("e.g. 0.01");
                        $("#throttle-input").css('color', 'grey');
                    }
                });


            }); //end mra-checked  

            $("#cytoscape-node-limit").change(function (evt) {
                //the following block code is same as above, shall make it as function,
                //but for somehow the function call does not work here for me. 
                var nodeLimit = $("#cytoscape-node-limit").val();
                var filters = "";
                $('input[type="checkbox"]:checked').each(function () {
                    filters = filters + ($(this).val() + ',');
                });

                $.ajax({
                    url: "mra-data/",
                    data: {
                        url: mra_data_url,
                        dataType: "throttle",
                        filterBy: filters,
                        nodeNumLimit: nodeLimit,
                        throttle: ""
                    },
                    dataType: "json",
                    contentType: "json",
                    success: function (data) {
                        if (data != null)
                            $("#throttle-input").text(data);
                        else
                            $("#throttle-input").text("e.g. 0.01");
                        $("#throttle-input").css('color', 'grey');
                    }
                });

            });

            return this;
        }
    });

    var MraViewRowView = Backbone.View.extend({
        render: function () {
            var result = this.model;

            var templateId = "#mra-view-row-tmpl";

            this.template = _.template($(templateId).html());
            $(this.el).append(this.template(result));

            return this;
        }
    });

    var MraBarcodeRowView = Backbone.View.extend({
        render: function () {
            var result = this.model;

            var templateId = "#mra-barcode-view-row-tmpl";

            this.template = _.template($(templateId).html());
            $(this.el).append(this.template(result));

            if (result.daColor != null)
                $(".da-color-" + result.entrezId).css({
                    "background-color": result.daColor
                });

            if (result.deColor != null)
                $(".de-color-" + result.entrezId).css({
                    "background-color": result.deColor
                });

            var canvasId = "draw-" + result.entrezId;
            var ctx = document.getElementById(canvasId).getContext("2d");

            _.each(result.mraTargets, function (mraTarget) {

                var colorIndex = 255 - mraTarget.colorIndex;
                if (mraTarget.arrayIndex == 0) {
                    ctx.fillStyle = 'rgb(255,' + colorIndex + ',' + colorIndex + ')';
                    ctx.fillRect(mraTarget.position, 0, 1, 15);
                } else {
                    ctx.fillStyle = 'rgb(' + colorIndex + ', ' + colorIndex + ', 255)';
                    ctx.fillRect(mraTarget.position, 15, 1, 15);
                }

            });

            return this;
        }
    });

    var reformattedClassName = {
        "Gene": "gene",
        "AnimalModel": "animal model",
        "Compound": "compound",
        "CellSample": "cell sample",
        "TissueSample": "tissue sample",
        "ShRna": "shRNA",
        "Transcript": "transcript",
        "Protein": "protein",
    };

    var ExploreView = Backbone.View.extend({
        el: $("#main-container"),
        template: _.template($("#explore-tmpl").html()),

        render: function () {
            var exploreLimit = 36;

            var thatModel = this.model;
            $(this.el).html(this.template(thatModel));
            var data_url = $("#explore-tmpl").attr("data-url");
            var subjectWithSummaryCollection = new SubjectWithSummaryCollection(thatModel);
            subjectWithSummaryCollection.fetch({
                success: function () {
                    $("#explore-items").html("");

                    var numberOfEls = subjectWithSummaryCollection.models.length;
                    var table_data = [];
                    _.each(subjectWithSummaryCollection.models, function (subjectWithSummary) {
                        var sModel = subjectWithSummary.toJSON();
                        var subject = sModel.subject;
                        if (subject.class == "Compound") {
                            _.each(subject.xrefs, function (xref) {
                                if (xref.databaseName == "IMAGE") {
                                    subject.imageFile = xref.databaseId;
                                }
                            });
                        }
                        var role = sModel.role;
                        var reformatted = reformattedClassName[subject.class];
                        if (subject.class == 'Compound') {
                            reformatted += " <span style='display:inline-block;width:100px'><a href='" + data_url + "compounds/" +
                                subject.imageFile + "' target='_blank' class='compound-image' title='Compound: " +
                                subject.displayName + "'><img class='img-polaroid' style='height:25px' src='" + data_url + "compounds/" +
                                subject.imageFile + "' alt='Compound: " + subject.displayName + "'></a></span>";
                        } else {
                            reformatted += " <img src='img/" + subject.class.toLowerCase() + ".png' style='height:25px' alt=''>";
                        }
                        var nameLink = "<a href='#" + subject.stableURL + "/" + role + "'>" + subject.displayName + "</a>";
                        var n3obv = sModel.numberOfTier3Observations;
                        var n3ctr = sModel.numberOfTier3SubmissionCenters;
                        var n3link = (n3obv == 0 ? "" : "<a href='#" + subject.stableURL + "/" + role + "/3'>" + n3obv + "</a>") +
                            (n3obv > 1 ? " (" + n3ctr + " center" + (n3ctr > 1 ? "s" : "") + ")" : "");
                        var n2obv = sModel.numberOfTier2Observations;
                        var n2ctr = sModel.numberOfTier2SubmissionCenters;
                        var n2link = (n2obv == 0 ? "" : "<a href='#" + subject.stableURL + "/" + role + "/2'>" + n2obv + "</a>") +
                            (n2obv > 1 ? " (" + n2ctr + " center" + (n2ctr > 1 ? "s" : "") + ")" : "");
                        var n1obv = sModel.numberOfTier1Observations;
                        var n1ctr = sModel.numberOfTier1SubmissionCenters;
                        var n1link = (n1obv == 0 ? "" : "<a href='#" + subject.stableURL + "/" + role + "/1'>" + n1obv + "</a>") +
                            (n1obv > 1 ? " (" + n1ctr + " center" + (n1ctr > 1 ? "s" : "") + ")" : "");
                        table_data.push([reformatted, nameLink, role, n3link, n2link, n1link]);
                    });
                    $("#explore-table").dataTable({
                        'dom': 'iBfrtlp',
                        'data': table_data,
                        "deferRender": true,
                        "columns": [
                            null,
                            null,
                            null,
                            {
                                "type": "observation-count"
                            },
                            {
                                "type": "observation-count"
                            },
                            {
                                "type": "observation-count"
                            }
                        ],
                        "drawCallback": function (settings) {
                            $("a.compound-image").fancybox({
                                titlePosition: 'inside'
                            });
                        },
                        'buttons': [{
                            extend: 'excelHtml5',
                            text: 'Export as Spreadsheet',
                            className: "extra-margin",
                        }],
                    });

                    $(".explore-thumbnail h4").tooltip();
                    var blurb = $("#text-blurb");
                    if (blurb.length > 0) {
                        $("#explore-blurb").append(_.template(blurb.html(), {
                            subject_type: subjectType[thatModel.type],
                            roles: thatModel.roles
                        }));
                        $("#explore-blurb .blurb-help").click(function (e) {
                            e.preventDefault();
                            (new HelpNavigateView()).render();
                        });
                    }
                    $("#reset-ordering").click(function () {
                        $("#explore-table").DataTable().order.neutral().draw();
                    });
                }
            });

            $("#customize-roles").click(function (e) {
                e.preventDefault();

                var subjectRoles = new SubjectRoles();
                subjectRoles.fetch({
                    success: function () {
                        $("#customized-roles-tbl tbody").html("");

                        var currentRoles = decodeURIComponent(thatModel.roles.toLowerCase());
                        _.each(subjectRoles.models, function (role) {
                            role = role.toJSON();
                            if (browseRole[thatModel.type].indexOf(role.displayName) == -1) return;
                            var checked = currentRoles.search(role.displayName.toLowerCase()) > -1;
                            role.checked = checked;
                            var roleName = role.displayName;
                            role.displayName = roleName.charAt(0).toUpperCase() + roleName.slice(1);
                            var customRoleItemView = new CustomRoleItemView({
                                model: role
                            });
                            customRoleItemView.render();
                        });

                        $("#role-modal").modal('show');

                        $("#select-roles-button").click(function (e) {
                            var newRoles = [];
                            $("#role-modal input").each(function () {
                                var aRole = $(this).attr("data-role");
                                if ($(this).attr("checked")) {
                                    newRoles.push(aRole);
                                }

                            });

                            $("#role-modal").modal('hide');
                            window.location.hash = "/explore/" + thatModel.type + "/" + newRoles.join(",");
                        });
                    }
                });
            });

            return this;
        }
    });

    var browseRole = {
        target: ["background", "biomarker", "candidate master regulator", "interactor", "master regulator", "oncogene", "target"],
        compound: ["candidate drug", "control compound", "perturbagen"],
        context: ["disease", "metastasis", "tissue"]
    };

    var subjectType = {
        target: "Biomarkers, Targets, Genes & Proteins (genes)",
        compound: "Compounds and Perturbagens (compounds, shRNA, genes)",
        context: "Disease Context (tissues)"
    };

    //customize-roles-item-tmpl
    var CustomRoleItemView = Backbone.View.extend({
        el: "#customized-roles-tbl tbody",
        template: _.template($("#customize-roles-item-tmpl").html()),

        render: function () {
            if (this.model.checked) {
                $(this.el).prepend(this.template(this.model));
            } else {
                $(this.el).append(this.template(this.model));
            }
            return this;
        }
    });

    //Gene List View
    var GeneListView = Backbone.View.extend({
        el: $("#main-container"),
        template: _.template($("#genelist-view-tmpl").html()),
        render: function () {

            var geneList = JSON.parse(localStorage.getItem("genelist"));
            if (geneList == null)
                geneList = [];
            else if (geneList.length > numOfCartGene) {
                var len = geneList.length;
                geneList.slice(numOfCartGene, len - 1);
                localStorage.genelist = JSON.stringify(geneList);
            }

            var html = "";
            $(this.el).html(this.template({}));
            $.each(geneList, function (aData) {
                var value = Encoder.htmlEncode(this.toString());
                $("#geneNames").append(_.template($("#gene-cart-option-tmpl").html(), {
                    displayItem: value
                }));
            });

            $("#addGene").click(function (e) {
                e.preventDefault();

                $("#gene-symbols").val("");
                $("#addgene-modal").modal('show');
            });

            $("#add-gene-symbols").click(function () {
                var inputGenes = $("#gene-symbols").val();
                var genes = Encoder.htmlEncode(inputGenes).split(/[\s,]+/);

                processInputGenes(genes);
            });

            $("#deleteGene").click(function (e) {
                e.preventDefault();
                var selectedGenes = [];
                $('#geneNames :selected').each(function (i, selected) {
                    selectedGenes[i] = $(selected).text();
                });

                if (selectedGenes == null || selectedGenes.length == 0) {
                    showAlertMessage("You haven't select any gene!");
                    return;
                }

                $.each(selectedGenes, function () {

                    var gene = $.trim(this.toString()).toUpperCase();
                    var index = $.inArray(gene, geneList);
                    if (index >= 0) geneList.splice(index, 1);

                });
                localStorage.genelist = JSON.stringify(geneList);
                sessionStorage.selectedGenes = JSON.stringify(geneList);
                $("#geneNames option:selected").remove();

            });


            $("#clearList").click(function (e) {
                e.preventDefault();
                $('#geneNames').html('');
                localStorage.removeItem("genelist");
                sessionStorage.removeItem("selectedGenes");

                geneList = [];
            });

            $("#loadGenes").click(function (e) {
                e.preventDefault();
                $('#geneFileInput').click();

            });

            if (window.FileReader) {
                $('#geneFileInput').on('change', function (e) {
                    var file = e.target.files[0];
                    if (file.size > 1000) {
                        showAlertMessage("Gene Cart can only contains " + numOfCartGene + " genes.");
                        return;
                    }
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        var genes = reader.result.split(/[\s,]+/);

                        processInputGenes(genes);
                    };
                    reader.readAsText(file);
                    $('#geneFileInput').each(function () {
                        $(this).after($(this).clone(true)).remove();
                    });
                });
            } else {
                showAlertMessage("Load Genes from file is not supported.");
            }

            $("#cnkb-query").click(function (e) {

                var selectedGenes = [];
                $('#geneNames :selected').each(function (i, selected) {
                    selectedGenes[i] = $(selected).text();
                });

                if (selectedGenes == null || selectedGenes.length == 0) {
                    sessionStorage.selectedGenes = JSON.stringify(geneList);
                } else {
                    sessionStorage.selectedGenes = JSON.stringify(selectedGenes);
                }

            });

            var processInputGenes = function (genes) {
                var geneNames = JSON.parse(localStorage.getItem("genelist"));
                if (geneNames == null)
                    geneNames = [];
                var num = genes.length + geneNames.length;
                if (num > numOfCartGene) {
                    showAlertMessage("Gene Cart can only contains " + numOfCartGene + " genes.");
                    return;
                }

                $.ajax({
                    url: "cnkb/validation",
                    data: {
                        geneSymbols: JSON.stringify(genes)
                    },
                    dataType: "json",
                    contentType: "json",
                    success: function (data) {
                        var invalidGenes = "";
                        _.each(data, function (aData) {
                            if (invalidGenes.length > 0)
                                invalidGenes = aData;
                            else
                                invalidGenes = invalidGenes + ", " + aData;
                            genes.splice(genes.indexOf(aData), 1);
                        });
                        if (data.length > 1) {
                            showInvalidMessage("\"" + data + "\" are invalid and not added to the cart.");
                        } else if (data.length == 1) {
                            showInvalidMessage("\"" + data + "\" is invalid and not added to the cart.");
                        } else {
                            $("#addgene-modal").modal('hide');
                        }

                        addGenes(genes);

                    }
                }); //ajax   
            };

            var addGenes = function (genes) {
                var alreadyHave = [];
                var newGenes = [];
                $.each(genes, function () {
                    var eachGene = Encoder.htmlEncode($.trim(this.toString())).toUpperCase();
                    if (geneList.indexOf(eachGene) > -1)
                        alreadyHave.push(eachGene);
                    else if (newGenes.indexOf(eachGene.toUpperCase()) == -1 && eachGene != "") {
                        newGenes.push(eachGene);
                        geneList.push(eachGene);
                    }
                });

                if (newGenes.length > 0) {
                    localStorage.genelist = JSON.stringify(geneList);
                    $.each(newGenes, function () {
                        var value = this.toString();
                        $("#geneNames").append(_.template($("#gene-cart-option-tmpl").html(), {
                            displayItem: value
                        }));
                    });

                }
            };

            return this;
        }

    });

    var CnkbQueryView = Backbone.View.extend({
        el: $("#main-container"),
        template: _.template($("#cnkb-query-tmpl").html()),
        render: function () {
            var selectedGenes = JSON.parse(sessionStorage.getItem("selectedGenes"));
            var count = 0;
            if (selectedGenes != null)
                count = selectedGenes.length;
            var description;
            if (count == 0 || count == 1)
                description = "Query with " + count + " gene from cart";
            else
                description = "Query with " + count + " genes from cart";

            $(this.el).html(this.template({}));
            $('#queryDescription').html("");
            $('#queryDescription').html(description);
            $.ajax({
                url: "cnkb/query",
                data: {
                    dataType: "interactome-context",
                    interactome: "",
                    version: "",
                    selectedGenes: "",
                    interactionLimit: 0,
                    throttle: ""
                },
                dataType: "json",
                contentType: "json",
                success: function (data) {
                    var list = data.interactomeList;
                    _.each(list, function (aData) {
                        if (aData.toLowerCase().startsWith("preppi")) {
                            $("#interactomeList").prepend(_.template($("#gene-cart-option-tmpl-preselected").html(), {
                                displayItem: aData
                            }));
                            var interactome = aData.split("(")[0].trim();
                            $.ajax({ // query the description
                                url: "cnkb/query",
                                data: {
                                    dataType: "interactome-version",
                                    interactome: interactome,
                                    version: "",
                                    selectedGenes: "",
                                    interactionLimit: 0,
                                    throttle: ""
                                },
                                dataType: "json",
                                contentType: "json",
                                success: function (data) {
                                    $('#interactomeDescription').html("");
                                    $('#interactomeDescription').html(convertUrl(data.description));
                                    $('#interactomeVersionList').html("");
                                    _.each(data.versionDescriptorList, function (aData) {
                                        $("#interactomeVersionList").append(_.template($("#gene-cart-option-tmpl").html(), {
                                            displayItem: aData.version
                                        }));
                                    });
                                    $('#interactomeVersionList').disabled = false;
                                    $('#selectVersion').css('color', '#5a5a5a');
                                    $('#versionDescription').html("");
                                }
                            }); //ajax
                        } else
                            $("#interactomeList").append(_.template($("#gene-cart-option-tmpl").html(), {
                                displayItem: aData
                            }));
                    });
                    $('#interactomeVersionList').disabled = true;
                }
            }); //ajax   

            var versionDescriptors;
            $('#interactomeList').change(function () {
                var selectedInteractome = $('#interactomeList option:selected').text().split("(")[0].trim();
                $.ajax({
                    url: "cnkb/query",
                    data: {
                        dataType: "interactome-version",
                        interactome: selectedInteractome,
                        version: "",
                        selectedGenes: "",
                        interactionLimit: 0,
                        throttle: ""
                    },
                    dataType: "json",
                    contentType: "json",
                    success: function (data) {
                        versionDescriptors = data.versionDescriptorList;
                        var description = data.description;
                        $('#interactomeDescription').html("");
                        $('#interactomeDescription').html(convertUrl(description));
                        var list = data.versionDescriptorList;
                        $('#interactomeVersionList').html("");
                        _.each(list, function (aData) {
                            $("#interactomeVersionList").append(_.template($("#gene-cart-option-tmpl").html(), {
                                displayItem: aData.version
                            }));
                        });
                        $('#interactomeVersionList').disabled = false;
                        $('#selectVersion').css('color', '#5a5a5a');
                        $('#versionDescription').html("");

                    }
                }); //ajax

            }); //end $('#interactomeList').change()

            $('#interactomeVersionList').change(function () {
                var selectedVersion = $('#interactomeVersionList option:selected').text().trim();
                _.each(versionDescriptors, function (aData) {
                    if (aData.version === selectedVersion) {
                        $('#versionDescription').html("");
                        $('#versionDescription').html(aData.versionDesc);
                    }
                });

            }); //end $('#interactomeList').change()

            $("#cnkb-result").click(function (e) {

                var selectedInteractome = $('#interactomeList option:selected').text().split("(")[0].trim();
                var selectedVersion = $('#interactomeVersionList option:selected').text().trim();

                if (selectedInteractome == null || $.trim(selectedInteractome).length == 0) {
                    e.preventDefault();
                    showAlertMessage("Please select an interactome name");

                } else if (selectedVersion == null || $.trim(selectedVersion).length == 0) {
                    e.preventDefault();
                    showAlertMessage("Please select an interactome version.");
                } else {
                    sessionStorage.selectedInteractome = JSON.stringify(selectedInteractome);
                    sessionStorage.selectedVersion = JSON.stringify(selectedVersion);
                }

            });

            return this;
        }

    });

    var CnkbResultView = Backbone.View.extend({
        el: $("#main-container"),
        template: _.template($("#cnkb-result-tmpl").html()),
        render: function () {
            var selectedgenes = JSON.parse(sessionStorage.getItem("selectedGenes"));
            var selectedInteractome = JSON.parse(sessionStorage.getItem("selectedInteractome"));
            var selectedVersion = JSON.parse(sessionStorage.getItem("selectedVersion"));

            if (selectedgenes.length > numOfCartGene) {
                var len = selectedgenes.length;
                selectedgenes.slice(numOfCartGene, len - 1);
                sessionStorage.selectedGenes = JSON.stringify(selectedgenes);
            }

            $(this.el).html(this.template({}));
            $.ajax({
                url: "cnkb/query",
                data: {
                    dataType: "interaction-result",
                    interactome: selectedInteractome,
                    version: selectedVersion,
                    selectedGenes: JSON.stringify(selectedgenes),
                    interactionLimit: 0,
                    throttle: ""
                },
                dataType: "json",
                contentType: "json",
                success: function (data) {
                    $("#cnkb_data_progress").hide();
                    var cnkbElementList = data.cnkbElementList;
                    var interactionTypes = data.interactionTypeList;
                    _.each(interactionTypes, function (aData) {
                        var type = aData.toUpperCase();
                        $('#cnkb-result-grid thead tr').append('<th>' + type + '</th>');
                    });

                    var thatEl = $("#cnkb-result-grid");
                    _.each(cnkbElementList, function (aData) {
                        var cnkbResultRowView = new CnkbResultRowView({
                            el: $(thatEl).find("tbody"),
                            model: aData
                        });
                        cnkbResultRowView.render();

                    });

                    var oTable1 = $('#cnkb-result-grid').dataTable({
                        "sDom": "<'row'<'span5'i><'span5'f>r>t<'row'<'span5'l><'span5'p>>",
                        "sScrollY": "200px",
                        "bPaginate": false
                    });

                }

            }); //ajax  

            $('#cnkbExport').click(function (e) {
                e.preventDefault();
                var filters = "";
                $('input[type="checkbox"]:checked').each(function () {
                    filters = filters + ($(this).val() + ',');
                });
                if (filters.length == 0 || $.trim(filters) === 'on,') {
                    showAlertMessage("Please select at least one row to export to a SIF file.");
                    return;
                }

                $("#interactome").val(selectedInteractome);
                $("#version").val(selectedVersion);
                $("#selectedGenes").val(filters);
                $("#interactionLimit").val("0");
                $("#throttle").val("");
                $('#cnkbExport-form').submit();

            }); //end $('#interactomeList').change()

            var getThrottleValue = function () {

                var interactionLimit = $("#cytoscape-node-limit").val();
                var filters = "";
                $('input[type="checkbox"]:checked').each(function () {
                    filters = filters + ($(this).val() + ',');
                });

                $.ajax({
                    url: "cnkb/query",
                    data: {
                        dataType: "interaction-throttle",
                        interactome: selectedInteractome,
                        version: selectedVersion,
                        selectedGenes: filters,
                        interactionLimit: interactionLimit,
                        throttle: ""
                    },
                    dataType: "json",
                    contentType: "json",
                    success: function (data) {
                        if (data != null && data.threshold != -1) {
                            if (data.threshold == 0)
                                $("#throttle-input").text("0.0");
                            else
                                $("#throttle-input").text(data.threshold);
                        } else
                            $("#throttle-input").text("e.g. 0.01");
                        $("#throttle-input").css('color', 'grey');
                    }
                });

            };

            $("#cnkb-result-grid").on("change", ":checkbox", function () {
                getThrottleValue();
            }); //end cnkb-checked

            $("#cytoscape-node-limit").change(function (evt) {
                getThrottleValue();
            });


            $('#checkbox_selectall').click(function (event) { //on click
                if (this.checked) { // check select status
                    $('.cnkb_checkbox').each(function () { //loop through each checkbox
                        this.checked = true; //select all checkboxes with class "checkbox1"
                    });
                    getThrottleValue();
                } else {
                    $('.cnkb_checkbox').each(function () { //loop through each checkbox
                        this.checked = false; //deselect all checkboxes with class "checkbox1"
                    });
                    $("#throttle-input").text("e.g. 0.01");
                    $("#throttle-input").css('color', 'grey');
                }
            });

            $('#createnetwork').click(function (event) {
                event.preventDefault();
                var throttle = $("#throttle-input").text();
                var layoutName = $("#cytoscape-layouts").val();
                var interactionLimit = $("#cytoscape-node-limit").val();

                var n = $("input:checked").length;

                var filters = "";
                $('input[type="checkbox"]:checked').each(function () {
                    filters = filters + ($(this).val() + ',');

                });

                if (filters.length == 0 || $.trim(filters) === 'on,') {
                    showAlertMessage("Please select at least one row to create a network.");
                    return;
                }
                $('#createnw_progress_indicator').show();
                $.ajax({
                    url: "cnkb/network",
                    data: {
                        interactome: selectedInteractome,
                        version: selectedVersion,
                        selectedGenes: filters,
                        interactionLimit: interactionLimit,
                        throttle: throttle
                    },
                    dataType: "json",
                    contentType: "json",
                    success: function (data) {
                        $('#createnw_progress_indicator').hide();
                        if (data == null) {
                            showAlertMessage("The network is empty.");
                            return;
                        }
                        var cnkbDescription = selectedInteractome + " (v" + selectedVersion + ")";
                        drawCNKBCytoscape(data, Encoder.htmlEncode(cnkbDescription));

                    } //end success
                }); //end ajax

            }); //end createnetwork

            return this;
        }

    });

    var CnkbResultRowView = Backbone.View.extend({
        render: function () {
            var result = this.model;

            var templateId = "#cnkb-result-row-tmpl";

            this.template = _.template($(templateId).html());
            $(this.el).append(this.template(result));
            var geneName = Encoder.htmlEncode(result.geneName);

            var numList = result.interactionNumlist;
            _.each(numList, function (aData) {
                $("#tr_" + geneName).append('<td>' + aData + '</td>');
            });


            return this;
        }
    });

    var GeneCartHelpView = Backbone.View.extend({
        el: $("#main-container"),
        template: _.template($("#gene-cart-help-tmpl").html()),
        render: function () {
            $(this.el).html(this.template({}));
            return this;
        }
    });

    var updateGeneList = function (addedGene) {
        var geneNames = JSON.parse(localStorage.getItem("genelist"));
        if (geneNames == null)
            geneNames = [];

        if (geneNames.length >= numOfCartGene) {
            showAlertMessage("Gene Cart can only contains " + numOfCartGene + " genes.");
            return;
        }

        if (geneNames.indexOf(addedGene) > -1) {
            showAlertMessage(addedGene + " is already in the Gene Cart.");
        } else {
            //Not in the array
            geneNames.push(addedGene);
            localStorage.genelist = JSON.stringify(geneNames);
            showAlertMessage(addedGene + " added to the Gene Cart.");
        }
    };

    var showAlertMessage = function (message) {
        $("#alertMessage").text(message);
        $("#alertMessage").css('color', '#5a5a5a');
        $("#alert-message-modal").modal('show');
    };

    var showInvalidMessage = function (message) {
        $("#alertMessage").text(message);
        $("#alertMessage").css('color', 'red');
        $("#alert-message-modal").modal('show');
    };

    var convertUrl = function (description) {
        if (description.indexOf("http:") > -1) {
            var word = description.split("http:");
            var temp = $.trim(word[1]);
            if (temp.match(/.$/))
                temp = temp.substring(0, temp.length - 1);
            temp = $.trim(temp);
            var link = "<a target=\"_blank\" href=\"" + temp + "\">" + temp + "</a>";
            return word[0] + link;
        } else
            return description;

    };

    var drawCNKBCytoscape = function (data, description) {
        var svgHtml = "";
        var interactions = data.interactions;
        var x1 = 20 + 90 * (3 - interactions.length),
            x2 = 53 + 90 * (3 - interactions.length);
        _.each(interactions, function (aData) {
            svgHtml = svgHtml + '<rect x="' + x1 + '" y="15" width="30" height="2" fill="' + aData.color + '" stroke="grey" stroke-width="0"/><text x="' + x2 + '" y="20" fill="grey">' + aData.type + '</text>';
            x1 = x1 + aData.type.length * 11;
            x2 = x2 + aData.type.length * 11;
        });

        $.fancybox(
            _.template($("#cnkb-cytoscape-tmpl").html(), {
                description: description,
                svgHtml: svgHtml
            }), {
                'autoDimensions': false,
                'width': '100%',
                'height': '85%',
                'transitionIn': 'none',
                'transitionOut': 'none'
            }
        );

        var container = $('#cytoscape');
        var layoutName = $("#cytoscape-layouts").val();

        var cy = cytoscape({

            container: document.getElementById("cytoscape"),
            layout: {
                name: layoutName,
                fit: true,
                liveUpdate: false,
                maxSimulationTime: 4000, // max length in ms to run the layout
                stop: function () {
                    $("#cnkb_cytoscape_progress").remove();
                    this.stop();

                } // callback on layoutstop 

            },
            elements: data,
            style: cytoscape.stylesheet()
                .selector("node")
                .css({
                    "content": "data(id)",
                    "border-width": 2,
                    "labelValign": "middle",
                    "font-size": 10,
                    "width": "25px",
                    "height": "25px",
                    "background-color": "data(color)",
                    "border-color": "#555"
                })
                .selector("edge")
                .css({
                    "width": "mapData(weight, 0, 100, 1, 3)",
                    "target-arrow-shape": "circle",
                    "source-arrow-shape": "circle",
                    "line-color": "data(color)"
                })
                .selector(":selected")
                .css({
                    "background-color": "#000",
                    "line-color": "#000",
                    "source-arrow-color": "#000",
                    "target-arrow-color": "#000"
                })
                .selector(".ui-cytoscape-edgehandles-source")
                .css({
                    "border-color": "#5CC2ED",
                    "border-width": 2
                })
                .selector(".ui-cytoscape-edgehandles-target, node.ui-cytoscape-edgehandles-preview")
                .css({
                    "background-color": "#5CC2ED"
                })
                .selector("edge.ui-cytoscape-edgehandles-preview")
                .css({
                    "line-color": "#5CC2ED"
                })
                .selector("node.ui-cytoscape-edgehandles-preview, node.intermediate")
                .css({
                    "shape": "rectangle",
                    "width": 15,
                    "height": 15
                }),

            ready: function () {
                window.cy = this; // for debugging
            }
        });

        cy.on('cxttap', 'node', function () {

            $.contextMenu('destroy', '#cytoscape');
            var sym = this.data('id');
            $.contextMenu({
                selector: '#cytoscape',

                callback: function (key, options) {
                    var m = "clicked: " + key + " on " + sym;
                    if (!key || 0 === key.length) {
                        $.contextMenu('destroy', '#cytoscape');
                        return;
                    }

                    var linkUrl = "";
                    switch (key) {
                        case 'gene':
                            linkUrl = "http://www.ncbi.nlm.nih.gov/gene?cmd=Search&term=" + sym;
                            break;
                        case 'protein':
                            linkUrl = "http://www.ncbi.nlm.nih.gov/protein?cmd=Search&term=" + sym + "&doptcmdl=GenPept";
                            break;
                        case 'pubmed':
                            linkUrl = "http://www.ncbi.nlm.nih.gov/pubmed?cmd=Search&term=" + sym + "&doptcmdl=Abstract";
                            break;
                        case 'nucleotide':
                            linkUrl = "http://www.ncbi.nlm.nih.gov/nucleotide?cmd=Search&term=" + sym + "&doptcmdl=GenBank";
                            break;
                        case 'alldatabases':
                            linkUrl = "http://www.ncbi.nlm.nih.gov/gquery/?term=" + sym;
                            break;
                        case 'structure':
                            linkUrl = "http://www.ncbi.nlm.nih.gov/structure?cmd=Search&term=" + sym + "&doptcmdl=Brief";
                            break;
                        case 'omim':
                            linkUrl = "http://www.ncbi.nlm.nih.gov/omim?cmd=Search&term=" + sym + "&doptcmdl=Synopsis";
                            break;
                        case 'genecards':
                            linkUrl = "http://www.genecards.org/cgi-bin/carddisp.pl?gene=" + sym + "&alias=yes";
                            break;
                        case 'ctd2-dashboard':
                            linkUrl = CORE_API_URL + "#search/" + sym;

                    }
                    window.open(linkUrl);
                    $.contextMenu('destroy', '#cytoscape');
                },
                items: {
                    "linkout": {
                        "name": 'LinkOut'
                    },
                    "sep1": "---------",
                    "entrez": {
                        "name": "Entrez",
                        "items": {
                            "gene": {
                                "name": "Gene"
                            },
                            "protein": {
                                "name": "Protein"
                            },
                            "pubmed": {
                                "name": "PubMed"
                            },
                            "nucleotide": {
                                "name": "Nucleotide"
                            },
                            "alldatabases": {
                                "name": "All Databases"
                            },
                            "structure": {
                                "name": "Structure"
                            },
                            "omim": {
                                "name": "OMIM"
                            }
                        }
                    },
                    "genecards": {
                        "name": "GeneCards"
                    },
                    "ctd2-dashboard": {
                        "name": "CTD2-Dashboard"
                    }

                }

            });

        });

    };


    /* Routers */
    AppRouter = Backbone.Router.extend({
        routes: {
            "centers": "listCenters",
            "stories": "listStories",
            "explore": "scrollToExplore",
            "explore/:type/:roles": "explore",
            "center/:name/:project": "showCenterProject",
            "center/:name": "showCenter",
            "submission/:id": "showSubmission",
            "observation/:id": "showObservation",
            "search/:term": "search",
            "story/:submission_name": "showStory",
            "animal-model/:name": "showAnimalModel",
            "animal-model/:name/:role": "showAnimalModel",
            "animal-model/:name/:role/:tier": "showAnimalModel",
            "cell-sample/:name": "showCellSample",
            "cell-sample/:name/:role": "showCellSample",
            "cell-sample/:name/:role/:tier": "showCellSample",
            "compound/:name": "showCompound",
            "compound/:name/:role": "showCompound",
            "compound/:name/:role/:tier": "showCompound",
            "gene/:species/:symbol": "showGene",
            "gene/:species/:symbol/:role": "showGene",
            "gene/:species/:symbol/:role/:tier": "showGene",
            "protein/:name": "showProtein",
            "protein/:name/:role": "showProtein",
            "protein/:name/:role/:tier": "showProtein",
            "rna/:name": "showShRna",
            "rna/:name/:role": "showShRna",
            "rna/:name/:role/:tier": "showShRna",
            "tissue/:name": "showTissueSample",
            "tissue/:name/:role": "showTissueSample",
            "tissue/:name/:role/:tier": "showTissueSample",
            "transcript/:name": "showTranscript",
            "transcript/:name/:role": "showTranscript",
            "transcript/:name/:role/:tier": "showTranscript",
            "mra/:filename": "showMraView",
            "about": "helpNavigate",
            "genes": "showGeneList",
            "cnkb-query": "showCnkbQuery",
            "cnkb-result": "showCnkbResult",
            "gene-cart-help": "showGeneCartHelp",
            "help-navigate": "helpNavigate",
            "*actions": "home"
        },

        home: function (actions) {
            var homeView = new HomeView();
            homeView.render();
        },

        helpNavigate: function () {
            var homeView = new HomeView();
            homeView.render();
            var helpNavigateView = new HelpNavigateView();
            helpNavigateView.render();
        },

        scrollToExplore: function () {
            var homeView = new HomeView();
            homeView.render();

            var whereTo = $(".ctd2-boxes").offset().top - 5;
            $('html, body').animate({
                scrollTop: whereTo
            }, 500);
        },

        search: function (term) {
            var searchView = new SearchView({
                model: {
                    term: decodeURI(term)
                        .replace(new RegExp("<", "g"), "")
                        .replace(new RegExp(">", "g"), "")
                }
            });
            searchView.render();
        },

        explore: function (type, roles) {
            var exploreView = new ExploreView({
                model: {
                    roles: roles.replace(new RegExp("<", "g"), "").replace(new RegExp(">", "g"), ""),
                    type: type.replace(new RegExp("<", "g"), "").replace(new RegExp(">", "g"), ""),
                    customized: false
                }
            });
            exploreView.render();
        },

        showStory: function (submission_name) {
            var storySubmissions = new StorySubmissions({
                limit: -1
            });
            storySubmissions.fetch({
                success: function () {
                    var counter = 1;
                    _.each(storySubmissions.models, function (aStory) {
                        var observation = aStory.toJSON();
                        var id = observation.submission.stableURL.replace("submission/", "");
                        if(id!==submission_name) {
                            //console.log("NOT MATCH"); // no-op
                            return;
                        }
                        // if it is the queried submission, ...
                        var observedEvidences = new ObservedEvidences({
                            observationId: observation.id
                        });
                        observedEvidences.fetch({
                            success: function () {
                                var url = "";

                                _.each(observedEvidences.models, function (observedEvidence) {
                                    observedEvidence = observedEvidence.toJSON();
    
                                    if (observedEvidence.observedEvidenceRole == null || observedEvidence.evidence == null)
                                        return;

                                    if (observedEvidence.evidence.class == "FileEvidence" &&
                                        (observedEvidence.evidence.mimeType.toLowerCase().search("html") > -1 || observedEvidence.evidence.mimeType.toLowerCase().search("pdf") > -1)) {
                                        // If this is a summary, then it should be a pdf/html file evidence
                                        if (observedEvidence.evidence.mimeType.toLowerCase().search("html") > -1) {
                                            url = $("#explore-tmpl").attr("data-url") + observedEvidence.evidence.filePath.replace(/\\/g, '/');
                                        } else {
                                            console.log(observedEvidence.evidence.mimeType + ": pdf case, no handled. ");
                                        }
                                    }
                                });

                                var storyView = new HtmlStoryView({
                                    model: {
                                        observation: observation,
                                        url: url,
                                    }
                                });
                                storyView.render();
                            }
                        });
                        counter++; // only one match is expected
                    });
                }
            });
        },

        showAnimalModel: function (name, role, tier) {
            var animalModel = new AnimalModel({
                id: name
            });
            animalModel.fetch({
                success: function () {
                    var animalModelView = new AnimalModelView({
                        model: {
                            subject: animalModel,
                            tier: tier,
                            role: role
                        }
                    });
                    animalModelView.render();
                }
            });
        },

        showCellSample: function (name, role, tier) {
            var cellSample = new CellSample({
                id: name
            });
            cellSample.fetch({
                success: function () {
                    var cellSampleView = new CellSampleView({
                        model: {
                            subject: cellSample,
                            tier: tier,
                            role: role
                        }
                    });
                    cellSampleView.render();
                }
            });
        },

        showCompound: function (name, role, tier) {
            var compound = new Compound({
                id: name
            });
            compound.fetch({
                success: function () {
                    var compoundView = new CompoundView({
                        model: {
                            subject: compound,
                            tier: tier,
                            role: role
                        }
                    });
                    compoundView.render();
                }
            });
        },

        showProtein: function (name, role, tier) {
            var protein = new Protein({
                id: name
            });
            protein.fetch({
                success: function () {
                    var proteinView = new ProteinView({
                        model: {
                            subject: protein,
                            tier: tier,
                            role: role
                        }
                    });
                    proteinView.render();
                }
            });
        },

        showShRna: function (name, role, tier) {
            var shRna = new ShRna({
                id: name
            });
            shRna.fetch({
                success: function () {
                    // shRna covers both siRNA and shRNA
                    var rnaView;
                    if (shRna.get("type").toLowerCase() == "sirna") {
                        rnaView = new SirnaView({
                            model: {
                                subject: shRna,
                                tier: tier,
                                role: role
                            }
                        });
                    } else {
                        rnaView = new ShrnaView({
                            model: {
                                subject: shRna,
                                tier: tier,
                                role: role
                            }
                        });
                    }
                    rnaView.render();
                }
            });
        },

        showTissueSample: function (name, role, tier) {
            var tissueSample = new TissueSample({
                id: name
            });
            tissueSample.fetch({
                success: function () {
                    var tissueSampleView = new TissueSampleView({
                        model: {
                            subject: tissueSample,
                            tier: tier,
                            role: role
                        }
                    });
                    tissueSampleView.render();
                }
            });
        },

        showTranscript: function (name, role, tier) {
            var transcript = new Transcript({
                id: name
            });
            transcript.fetch({
                success: function () {
                    var transcriptView = new TranscriptView({
                        model: {
                            subject: transcript,
                            tier: tier,
                            role: role
                        }
                    });
                    transcriptView.render();
                }
            });
        },

        showGene: function (species, symbol, role, tier) {
            var gmodel = new Gene({
                species: species,
                symbol: symbol
            });
            gmodel.fetch({
                success: function () {
                    var modelView = new GeneView({
                        model: {
                            subject: gmodel,
                            tier: tier,
                            role: role
                        }
                    });
                    modelView.render();
                }
            });
        },

        showCenter: function (name) {
            var center = new SubmissionCenter({
                id: name
            });
            center.fetch({
                success: function () {
                    var centerView = new CenterView({
                        model: center
                    });
                    centerView.render(null);
                }
            });
        },

        showCenterProject: function (name, project) {
            var center = new SubmissionCenter({
                id: name
            });
            center.fetch({
                success: function () {
                    var centerView = new CenterView({
                        model: center
                    });
                    project = decodeURI(project)
                        .replace(new RegExp("<", "g"), "")
                        .replace(new RegExp(">", "g"), "");
                    centerView.render(project);
                }
            });
        },


        showSubmission: function (id) {
            var submission = new Submission({
                id: id
            });
            submission.fetch({
                success: function () {
                    var submissionView = new SubmissionView({
                        model: submission
                    });
                    submissionView.render();
                }
            });
        },

        showObservation: function (id) {
            var observation = new Observation({
                id: id
            });
            observation.fetch({
                success: function () {
                    var observationView = new ObservationView({
                        model: observation
                    });
                    observationView.render();
                }
            });
        },

        listCenters: function () {
            var centerListView = new CenterListView();
            centerListView.render();
        },

        listStories: function () {
            var storiesListView = new StoriesListView();
            storiesListView.render();
        },

        showMraView: function (filename) {
            var observedEvidence = new ObservedEvidence({
                id: filename
            });
            observedEvidence.fetch({
                success: function () {
                    var mraView = new MraView({
                        model: observedEvidence
                    });
                    mraView.render();
                }
            });
        },

        showGeneList: function () {
            var geneListView = new GeneListView();
            geneListView.render();
        },

        showCnkbQuery: function () {
            var cnkbQueryView = new CnkbQueryView();
            cnkbQueryView.render();
        },

        showCnkbResult: function () {
            var cnkbResultView = new CnkbResultView();
            cnkbResultView.render();
        },

        showGeneCartHelp: function () {
            var geneCartHelpView = new GeneCartHelpView();
            geneCartHelpView.render();
        },

    });

    $(function () {
        new AppRouter();
        Backbone.history.start();

        $("#omnisearch").submit(function () {
            var searchTerm = $("#omni-input").val();
            window.location.hash = "search/" + encodeURI(encodeURIComponent(searchTerm));
            return false;
        });

        $("#omni-input").popover({
            placement: "bottom",
            trigger: "manual",
            html: true,
            title: function () {
                $(this).attr("title");
            },
            content: function () {
                return $("#search-help-content").html();
            },
        }).on("mouseenter", function () {
            var _this = this;
            $(this).popover("show");
            $(".popover").on("mouseleave", function () {
                $(_this).popover('hide');
            });
        }).on("mouseleave", function () {
            var _this = this;
            setTimeout(function () {
                if (!$(".popover:hover").length) {
                    $(_this).popover("hide");
                }
            }, 300);
        });

        $("a.help-navigate").click(function (e) {
            e.preventDefault();
            (new HelpNavigateView()).render();
        });
    });

    var subjectWithSummaryCollection = new SubjectWithSummaryCollection({
        roles: "Perturbagen,Candidate Drug",
        type: "compound",
        customized: false
    });
    subjectWithSummaryCollection.fetch({
        success: function () {
            console.log('long query pre-prepared ' + performance.now());
        }
    });
})(window.jQuery);