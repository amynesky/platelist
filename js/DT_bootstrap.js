/* Set the defaults for DataTables initialisation */
$.extend( true, $.fn.dataTable.defaults, {
	"sDom": "<'row'<'col-lg-6'l><'col-lg-6'f>r>t<'row'<'col-lg-6'i><'col-lg-6'p>>",
	"sPaginationType": "bootstrap",
	/*"sPaginationType": "full_numbers",*/
	//"iDisplayLength": 50,  /*default number of rows per page*/
	"oLanguage": {
	"sLengthMenu": "_MENU_ records per page",
	
	}
} );



/* Default class modification */
$.extend( $.fn.dataTableExt.oStdClasses, {
	"sWrapper": "dataTables_wrapper form-inline"
} );
 
 
/* API method to get paging information */
$.fn.dataTableExt.oApi.fnPagingInfo = function ( oSettings ){
	
	/*this makes the search bar respond to the enter key*/
    $('#project_table_filter input').unbind('keypress keyup');
   	$('#project_table_filter input').bind('keypress keyup', function(e) {
   		if ($(this).val().length < 3 && e.keyCode != 13) {return;}	
       	//if(e.keyCode == 13) {
       	else{
        	oTable.fnFilter($(this).val());   
    	}
    		
    });
    return {
        "iStart":         oSettings._iDisplayStart,
        "iEnd":           oSettings.fnDisplayEnd(),
        "iLength":        oSettings._iDisplayLength,
        "iTotal":         oSettings.fnRecordsTotal(),
        "iFilteredTotal": oSettings.fnRecordsDisplay(),
		"iPage":          oSettings._iDisplayLength === -1 ?
			0 : Math.ceil( oSettings._iDisplayStart / oSettings._iDisplayLength ),
		"iTotalPages":    oSettings._iDisplayLength === -1 ?
			0 : Math.ceil( oSettings.fnRecordsDisplay() / oSettings._iDisplayLength )
	};

        /*
        "iPage":          Math.ceil( oSettings._iDisplayStart / oSettings._iDisplayLength ),
        "iTotalPages":    Math.ceil( oSettings.fnRecordsDisplay() / oSettings._iDisplayLength )
    };
    */
}

/* pagination control */
$.extend( $.fn.dataTableExt.oPagination, {
    "bootstrap": {
        "fnInit": function( oSettings, nPaging, fnDraw ) {
            var oLang = oSettings.oLanguage.oPaginate;
            var fnClickHandler = function ( e ) {
                e.preventDefault();
                if ( oSettings.oApi._fnPageChange(oSettings, e.data.action) ) {
                    fnDraw( oSettings );
                }
            };
 
            $(nPaging).addClass('pagination pagination-right').append(
                '<ul id="toggleList">' +
                    '<li class="prev disabled"><a href="#">&larr; ' + oLang.sFirst + '</a></li>' +
                    '<li class="prev disabled"><a href="#">&larr; '+oLang.sPrevious+'</a></li>'+
                    '<li class="next disabled"><a href="#">' + oLang.sNext + ' &rarr; </a></li>' +
                    '<li class="next disabled"><a href="#">' + oLang.sLast + ' &rarr; </a></li>' +
                '</ul>'
            );
            var els = $('a', nPaging);
            $(els[0]).bind('click.DT', { action: "first" }, fnClickHandler);
            $(els[1]).bind( 'click.DT', { action: "previous" }, fnClickHandler );
            $(els[2]).bind('click.DT', { action: "next" }, fnClickHandler);
            $(els[3]).bind('click.DT', { action: "last" }, fnClickHandler);
        },
 
        "fnUpdate": function ( oSettings, fnDraw ) {
            var iListLength = 5;
            var oPaging = oSettings.oInstance.fnPagingInfo();
            var an = oSettings.aanFeatures.p;
            var i, j, sClass, iStart, iEnd, iHalf=Math.floor(iListLength/2);
 
            if ( oPaging.iTotalPages < iListLength) {
                iStart = 1;
                iEnd = oPaging.iTotalPages;
            }
            else if ( oPaging.iPage <= iHalf ) {
                iStart = 1;
                iEnd = iListLength;
            } else if ( oPaging.iPage >= (oPaging.iTotalPages-iHalf) ) {
                iStart = oPaging.iTotalPages - iListLength + 1;
                iEnd = oPaging.iTotalPages;
            } else {
                iStart = oPaging.iPage - iHalf + 1;
                iEnd = iStart + iListLength - 1;
            }
 
            for ( i=0, iLen=an.length ; i<iLen ; i++ ) {
                // Remove the middle elements
                $('li:gt(1)', an[i]).filter(':not(.next)').remove();
 
                // Add the new list items and their event handlers
                for ( j=iStart ; j<=iEnd ; j++ ) {
			sClass = (j==oPaging.iPage+1) ? 'class="active"' : '';
                    $('<li '+sClass+'><a href="#">'+j+'</a></li>')
                        .insertBefore( $('li.next:first', an[i])[0] )
                        .bind('click', function (e) {
                            e.preventDefault();
                            oSettings._iDisplayStart = (parseInt($('a', this).text(),10)-1) * oPaging.iLength;
                            fnDraw( oSettings );
                        } );
                }
 
                // Add / remove disabled classes from the static elements
                if ( oPaging.iPage === 0 ) {
                    $('li.prev', an[i]).addClass('disabled');
                } else {
                    $('li.prev', an[i]).removeClass('disabled');
                }
 
                if ( oPaging.iPage === oPaging.iTotalPages-1 || oPaging.iTotalPages === 0 ) {
                    $('li.next', an[i]).addClass('disabled');
                } else {
                    $('li.next', an[i]).removeClass('disabled');
                }
            }
        }
    }
} );



/*
 * TableTools Bootstrap compatibility
 * Required TableTools 2.1+
 */
if ( $.fn.DataTable.TableTools ) {
	// Set the classes that TableTools uses to something suitable for Bootstrap
	$.extend( true, $.fn.DataTable.TableTools.classes, {
		"container": "DTTT btn-group",
		"buttons": {
			"normal": "btn",
			"disabled": "disabled"
		},
		"collection": {
			"container": "DTTT_dropdown dropdown-menu",
			"buttons": {
				"normal": "",
				"disabled": "disabled"
			}
		},
		"print": {
			"info": "DTTT_print_info modal"
		},
		"select": {
			"row": "active"
		}
	} );

	// Have the collection use a bootstrap compatible dropdown
	$.extend( true, $.fn.DataTable.TableTools.DEFAULTS.oTags, {
		"collection": {
			"container": "ul",
			"button": "li",
			"liner": "a"
		}
	} );
}


/* Table initialisation */
var oTable;


function fnShowHide( iCol ){
	/* Get the DataTables object again - this is not a recreation, just a get of the object */
	var oTable = $('#project_table').dataTable();
	
	var bVis = oTable.fnSettings().aoColumns[iCol].bVisible;
	oTable.fnSetColumnVis( iCol, bVis ? false : true );
}

function fnShowColumn( iCol ){
	/* Get the DataTables object again - this is not a recreation, just a get of the object */
	var oTable = $('#project_table').dataTable();
	
	var bVis = oTable.fnSettings().aoColumns[iCol].bVisible;
	oTable.fnSetColumnVis( iCol, true );
}

function fnHideColumn( iCol ){
	/* Get the DataTables object again - this is not a recreation, just a get of the object */
	var oTable = $('#project_table').dataTable();
	
	var bVis = oTable.fnSettings().aoColumns[iCol].bVisible;
	oTable.fnSetColumnVis( iCol, false );
}


$(document).ready(function() {
	var queryString = window.location.search;
	if (queryString === "") {
		$.extend( $.fn.dataTable.defaults, {
			"iDisplayLength": 100,  /*default number of rows per page*/
    	} );
	} else {
		$.extend( $.fn.dataTable.defaults, {
			"iDisplayLength": -1,  /*default number of rows per page*/
    	} );
	}
	oTable = $('#project_table').dataTable( {
		"sDom": "<'row'<'col-lg-6'f><'col-lg-6'l>r>t<'row'<'col-lg-6'i><'col-lg-6'p>>",
		"sPaginationType": "bootstrap",
		"bPaginate": true,
		"bLengthChange": true, /*records per page drop down*/
		"bDeferRender": true, /*defers rendering till after.. what?*/
		"sScrollY": "500px",
		"sScrollX": "100%",
		"sScrollXInner": "275%",
		"bScrollCollapse": true,
		"bFilter": true,
		"bSort": true,
		"bInfo": true, /*Showing 1 to 2,194 of 2,194 entries*/
		"bAutoWidth": false,
		"bSortClasses": false,
		"bProcessing": true,
		"sAjaxSource": "data/platelist_original.json",
		"aLengthMenu": [[ 50, 100, 500, 1000, -1], [ 50, 100, 500, 1000, "All"]], /*records per page drop down*/
   		"aoColumns": [
			{ "mData": "PLATE", "sWidth": "50px"},
			{ "mData": "MJD", "sWidth": "50px"},      
			{ "mData": "TILEID" , "sWidth": "55px"},  
			{ "mData": "RUN2D" ,"bSearchable": false, "sWidth": "65px"}, 
			{ "mData": "RUN1D" ,"bSearchable": false, "sWidth": "65px"}, 
			{ "mData": "RACEN" ,"bSearchable": false, "sWidth": "50px"}, /*5*/
			{ "mData": "DECCEN" ,"bSearchable": false, "sWidth": "75px"},
			{ "mData": "EPOCH" ,"bSearchable": false, "bVisible": false},
			{ "mData": "CARTID" ,"bSearchable": false, "bVisible": false},
			{ "mData": "TAI" ,"bSearchable": false, "bVisible": false},
			{ "mData": "TAI_BEG" ,"bSearchable": false, "bVisible": false}, /*10*/
			{ "mData": "TAI_END" ,"bSearchable": false, "bVisible": false},
			{ "mData": "AIRMASS" ,"bSearchable": false, "bVisible": false},
			{ "mData": "EXPTIME" ,"bSearchable": false, "bVisible": false},
			{ "mData": "MAPNAME" ,"bSearchable": false, "bVisible": false},
			{ "mData": "SURVEY" , "sWidth": "65px"},  /*15*/
			{ "mData": "PROGRAMNAME" , "sWidth": "100px"}, 
			{ "mData": "CHUNK" , "sWidth": "60px"},
			{ "mData": "PLATEQUALITY" , "sWidth": "60px"},
			{ "mData": "PLATESN2" , "sWidth": "50px"}, 
			{ "mData": "DEREDSN2" ,"bSearchable": false, "bVisible": false}, /*20*/
			{ "mData": "QSURVEY" ,"bSearchable": false, "bVisible": false},
			{ "mData": "MJDLIST" ,"bSearchable": false, "bVisible": false},
			{ "mData": "NEXP" ,"bSearchable": false, "bVisible": false},
			{ "mData": "NEXP_B1" ,"bSearchable": false, "bVisible": false},
			{ "mData": "NEXP_B2" ,"bSearchable": false, "bVisible": false}, /*25*/
			{ "mData": "NEXP_R1" ,"bSearchable": false, "bVisible": false},
			{ "mData": "NEXP_R2" ,"bSearchable": false, "bVisible": false},
			{ "mData": "EXPT_B1" ,"bSearchable": false, "bVisible": false},
			{ "mData": "EXPT_B2" ,"bSearchable": false, "bVisible": false},
			{ "mData": "EXPT_R1" ,"bSearchable": false, "bVisible": false}, /*30*/
			{ "mData": "EXPT_R2" ,"bSearchable": false, "bVisible": false},
			{ "mData": "SN2_G1" ,"bSearchable": false, "bVisible": false},
			{ "mData": "SN2_R1" ,"bSearchable": false, "bVisible": false},
			{ "mData": "SN2_I1" ,"bSearchable": false, "bVisible": false},
			{ "mData": "SN2_G2" ,"bSearchable": false, "bVisible": false}, /*35*/
			{ "mData": "SN2_R2" ,"bSearchable": false, "bVisible": false},
			{ "mData": "SN2_I2" ,"bSearchable": false, "bVisible": false},
			{ "mData": "DERED_SN2_G1" ,"bSearchable": false, "sWidth": "60px"}, 
			{ "mData": "DERED_SN2_R1" ,"bSearchable": false, "bVisible": false},
			{ "mData": "DERED_SN2_I1" ,"bSearchable": false, "sWidth": "60px"}, /*40*/
			{ "mData": "DERED_SN2_G2" ,"bSearchable": false, "sWidth": "60px"},
			{ "mData": "DERED_SN2_R2" ,"bSearchable": false, "bVisible": false}, 
			{ "mData": "DERED_SN2_I2" ,"bSearchable": false, "sWidth": "60px"},
			{ "mData": "GOFFSTD" ,"bSearchable": false, "bVisible": false},
			{ "mData": "GRMSSTD" ,"bSearchable": false, "bVisible": false}, /*45*/
			{ "mData": "ROFFSTD" ,"bSearchable": false, "bVisible": false},
			{ "mData": "RRMSSTD" ,"bSearchable": false, "bVisible": false},
			{ "mData": "IOFFSTD" ,"bSearchable": false, "bVisible": false},
			{ "mData": "IRMSSTD" ,"bSearchable": false, "bVisible": false},
			{ "mData": "GROFFSTD" ,"bSearchable": false, "bVisible": false}, /*50*/
			{ "mData": "GRRMSSTD" ,"bSearchable": false, "bVisible": false},
			{ "mData": "RIOFFSTD" ,"bSearchable": false, "bVisible": false},
			{ "mData": "RIRMSSTD" ,"bSearchable": false, "bVisible": false},
			{ "mData": "GOFFGAL" ,"bSearchable": false, "bVisible": false},
			{ "mData": "GRMSGAL" ,"bSearchable": false, "bVisible": false}, /*55*/
			{ "mData": "ROFFGAL" ,"bSearchable": false, "bVisible": false},
			{ "mData": "RRMSGAL" ,"bSearchable": false, "bVisible": false},
			{ "mData": "IOFFGAL" ,"bSearchable": false, "bVisible": false},
			{ "mData": "IRMSGAL" ,"bSearchable": false, "bVisible": false},
			{ "mData": "GROFFGAL" ,"bSearchable": false, "bVisible": false}, /*60*/
			{ "mData": "GRRMSGAL" ,"bSearchable": false, "bVisible": false},
			{ "mData": "RIOFFGAL" ,"bSearchable": false, "bVisible": false},
			{ "mData": "RIRMSGAL" ,"bSearchable": false, "bVisible": false},
			{ "mData": "NGUIDE" ,"bSearchable": false, "bVisible": false},
			{ "mData": "SEEING20" ,"bSearchable": false, "bVisible": false}, /*65*/
			{ "mData": "SEEING50" ,"bSearchable": false, "bVisible": false},
			{ "mData": "SEEING80" ,"bSearchable": false, "bVisible": false},
			{ "mData": "RMSOFF20" ,"bSearchable": false, "bVisible": false},
			{ "mData": "RMSOFF50" ,"bSearchable": false, "bVisible": false},
			{ "mData": "RMSOFF80" ,"bSearchable": false, "bVisible": false}, /*70*/
			{ "mData": "AIRTEMP" ,"bSearchable": false, "bVisible": false},
			{ "mData": "XSIGMA" ,"bSearchable": false, "bVisible": false},
			{ "mData": "XSIGMIN" ,"bSearchable": false, "bVisible": false},
			{ "mData": "XSIGMAX" ,"bSearchable": false, "bVisible": false}, 
			{ "mData": "WSIGMA" ,"bSearchable": false, "bVisible": false}, /*75*/
			{ "mData": "WSIGMIN" ,"bSearchable": false, "bVisible": false},
			{ "mData": "WSIGMAX" ,"bSearchable": false, "bVisible": false},
			{ "mData": "XCHI2" ,"bSearchable": false, "bVisible": false},
			{ "mData": "XCHI2MIN" ,"bSearchable": false, "bVisible": false}, 
			{ "mData": "XCHI2MAX" ,"bSearchable": false, "bVisible": false}, /*80*/
			{ "mData": "SKYCHI2" ,"bSearchable": false, "bVisible": false},
			{ "mData": "SCHI2MIN" ,"bSearchable": false, "bVisible": false},
			{ "mData": "SCHI2MAX" ,"bSearchable": false, "bVisible": false},
			{ "mData": "FBADPIX" ,"bSearchable": false, "sWidth": "75px"}, 
			{ "mData": "FBADPIX1" ,"bSearchable": false, "bVisible": false}, /*85*/
			{ "mData": "FBADPIX2" ,"bSearchable": false, "bVisible": false},
			{ "mData": "N_TOTAL" ,"bSearchable": false, "bVisible": false},
			{ "mData": "N_GALAXY" ,"bSearchable": false, "bVisible": false},
			{ "mData": "N_QSO" ,"bSearchable": false, "bVisible": false}, 
			{ "mData": "N_STAR" ,"bSearchable": false, "sWidth": "40px"}, /*90*/
			{ "mData": "N_UNKNOWN" ,"bSearchable": false, "sWidth": "60px"},
			{ "mData": "N_SKY" ,"bSearchable": false, "sWidth": "40px"},
			{ "mData": "N_TARGET_MAIN" ,"bSearchable": false, "bVisible": false},
			{ "mData": "N_TARGET_LRG1" ,"bSearchable": false, "sWidth": "40px"}, 
			{ "mData": "N_TARGET_LRG2" ,"bSearchable": false, "sWidth": "40px"}, /*95*/
			{ "mData": "N_TARGET_QSO" ,"bSearchable": false, "sWidth": "40px"},
			{ "mData": "SUCCESS_MAIN" ,"bSearchable": false, "bVisible": false}, 
			{ "mData": "SUCCESS_LRG1" ,"bSearchable": false, "sWidth": "60px"}, 
			{ "mData": "SUCCESS_LRG2" ,"bSearchable": false, "sWidth": "60px"},  
			{ "mData": "SUCCESS_QSO" ,"bSearchable": false, "sWidth": "60px"}, /*100*/
			{ "mData": "STATUS2D" , "sWidth": "30px"}, 
			{ "mData": "STATUSCOMBINE" , "sWidth": "60px"}, 
			{ "mData": "STATUS1D" , "sWidth": "30px"}, 
			{ "mData": "PUBLIC" , "sWidth": "60px"}, 
			{ "mData": "QUALCOMMENTS" }, /*105*/	
		],

		/*makes cells content sensitive*/
		"fnRowCallback": function( nRow, aData, iDisplayIndex,iDisplayIndexFull) {
	        $(nRow).children().each(function(index, td) {
				if(index ==10)  {
		            if ($(td).html() === "bad") {
		                $(td).css("background-color", "#FF3229");
		            } 
		        }
		    });                        
		    return nRow;
	    },
	} );
	new FixedColumns(oTable);
	//, {
		//"iLeftColumns": 2,
		//"sLeftWidth": 'relative',
		//"iLeftWidth": 160
	//} );

	$(window).resize( function () {
  		oTable.fnAdjustColumnSizing();
	} );
	








	/*Adding plots*/
	var dataset;
	d3.json("data/platelist_original.json", function(error, json){
		if(error){
			console.log(error);
		}else{
			dataset = json;
			//console.log(dataset);

			//Width and height
			var w = 200;
			var h = 200;
			var padding = 10;

		//Create SVG element for %LRG1v%LRG2
			var svg = d3.select("#plots")
						.append("svg")
						.attr({
							width: w,
							height: h,
						});

			var xMin = d3.min(dataset.aaData, function(d){return d.SUCCESS_LRG1;});
			var xMax = d3.max(dataset.aaData, function(d){return d.SUCCESS_LRG1;});
			var yMin = d3.min(dataset.aaData, function(d){return d.SUCCESS_LRG2;});
			var yMax = d3.max(dataset.aaData, function(d){return d.SUCCESS_LRG2;});

			var xScale = d3.scale.linear()
								 .domain([xMin,xMax])
								 .range([4.5 * padding,w-padding]);
			var yScale = d3.scale.linear()
								 .domain([yMin,yMax])
								 .range([h-(3.5 * padding),padding]);
			var xAxis= d3.svg.axis()
							 .scale(xScale)
							 .orient("bottom");
			var yAxis= d3.svg.axis()
						 .scale(yScale)
						 .orient("left");
		/*axis*/
			svg.append("g")
			   .attr({
			   		class: "axis",
			   		transform: "translate(0," + (h-(3.5 * padding)) + ")",
				})
			   .call(xAxis);

			svg.append("g")
			   .attr({
			   		class: "axis",
			   		transform: "translate(" + (4.5 * padding) + ",0)",
				})
			   .call(yAxis);

			/*label x-axis*/
			svg.append("text")
			   .attr("class", "x label")
			   .attr("text-anchor", "middle")
			   .attr("x", w /2 )
			   .attr("y", h - 6)
			   .text("%LRG1")
			   .attr("font-family", "sans-serif")
			   .attr("font-size", "11px")
			   .attr("fill", "black");

			/*label y-axis*/
			svg.append("text")
			   .attr("class", "y label")
			   .attr("text-anchor", "middle")
			   .attr("x", 0- h/2 )
			   .attr("y", 6)
			   .attr("dy", ".75em")
			   .attr("transform", "rotate(-90)")
			   .text("%LRG2")
			   .attr("font-family", "sans-serif")
			   .attr("font-size", "11px")
			   .attr("fill", "black");
						
		//scatter plot
			svg.selectAll("circle")
			    .data(dataset.aaData)
			    .enter()
			    .append("circle")
			    .attr({
			   		cx: function(d) {
			   			var x= xScale(d.SUCCESS_LRG1); 
			   			//console.log(x);
			   			return x;
			   		},
			   		cy: function(d) {				   			
			   			var y= yScale(d.SUCCESS_LRG2); 
			   			//console.log(""+ y); 
			   			return y;
			   		},
			   		r: 2,
			   		fill: function(d){
			   			if(d.MJD<55171){
			   				return "#b3b3b3";
			   			}else{
			   				if(d.PLATEQUALITY=="good"){
			   					return "rgba(11, 128, 0, 0.85)";
			   				}
			   				else{
			   					return "red";
			   				}
			   			}
			   		}
				});







		//Create SVG element for %LRG2v%QSO
		    var svg = d3.select("#plots")
					.append("svg")
					.attr({
						width: w,
						height: h,
					});

			var xMin = d3.min(dataset.aaData, function(d){return d.SUCCESS_LRG2;});
			var xMax = d3.max(dataset.aaData, function(d){return d.SUCCESS_LRG2;});
			var yMin = d3.min(dataset.aaData, function(d){return d.SUCCESS_QSO;});
			var yMax = d3.max(dataset.aaData, function(d){return d.SUCCESS_QSO;});

			var xScale = d3.scale.linear()
								 .domain([xMin,xMax])
								 .range([4.5 * padding,w-padding]);
			var yScale = d3.scale.linear()
								 .domain([yMin,yMax])
								 .range([h-(3.5 * padding),padding]);
			var xAxis= d3.svg.axis()
							 .scale(xScale)
							 .orient("bottom");
			var yAxis= d3.svg.axis()
						 .scale(yScale)
						 .orient("left");
		/*axis*/
			svg.append("g")
			   .attr({
			   		class: "axis",
			   		transform: "translate(0," + (h-(3.5 * padding)) + ")",
				})
			   .call(xAxis);

			svg.append("g")
			   .attr({
			   		class: "axis",
			   		transform: "translate(" + (4.5 * padding) + ",0)",
				})
			   .call(yAxis);

			/*label x-axis*/
			svg.append("text")
			   .attr("class", "x label")
			   .attr("text-anchor", "middle")
			   .attr("x", w /2 )
			   .attr("y", h - 6)
			   .text("%LRG2")
			   .attr("font-family", "sans-serif")
			   .attr("font-size", "11px")
			   .attr("fill", "black");

			/*label y-axis*/
			svg.append("text")
			   .attr("class", "y label")
			   .attr("text-anchor", "middle")
			   .attr("x", 0- h/2 )
			   .attr("y", 6)
			   .attr("dy", ".75em")
			   .attr("transform", "rotate(-90)")
			   .text("%QSO")
			   .attr("font-family", "sans-serif")
			   .attr("font-size", "11px")
			   .attr("fill", "black");
						
		//scatter plot
			svg.selectAll("circle")
			    .data(dataset.aaData)
			    .enter()
			    .append("circle")
			    .attr({
			   		cx: function(d) {
			   			var x= xScale(d.SUCCESS_LRG2); 
			   			//console.log(x);
			   			return x;
			   		},
			   		cy: function(d) {				   			
			   			var y= yScale(d.SUCCESS_QSO); 
			   			//console.log(""+ y); 
			   			return y;
			   		},
			   		r: 2,
			   		fill: function(d){
			   			if(d.MJD<55171){
			   				return "#b3b3b3";
			   			}else{
			   				if(d.PLATEQUALITY=="good"){
			   					return "rgba(11, 128, 0, 0.85)";
			   				}
			   				else{
			   					return "red";
			   				}
			   			}
			   		}
				});







		//Create SVG element for SN2_G1vSN2_I1 on top of SN2_G2vSN2_I2
		    var svg = d3.select("#plots")
					.append("svg")
					.attr({
						width: w,
						height: h,
					});

			var xMin = d3.min([d3.min(dataset.aaData, function(d){return d.DERED_SN2_G1;}), 
							  d3.min(dataset.aaData, function(d){return d.DERED_SN2_G2;})]);
			var xMax = d3.max([d3.max(dataset.aaData, function(d){return d.DERED_SN2_G1;}), 
							  d3.max(dataset.aaData, function(d){return d.DERED_SN2_G2;})]);
			var yMin = d3.min([d3.min(dataset.aaData, function(d){return d.DERED_SN2_I1;}), 
							  d3.min(dataset.aaData, function(d){return d.DERED_SN2_I2;})]);
			var yMax = d3.max([d3.max(dataset.aaData, function(d){return d.DERED_SN2_I1;}), 
							  d3.max(dataset.aaData, function(d){return d.DERED_SN2_I2;})]);

			var xScale = d3.scale.linear()
								 .domain([xMin,xMax])
								 .range([4.5 * padding,w-padding]);
			var yScale = d3.scale.linear()
								 .domain([yMin,yMax])
								 .range([h-(3.5 * padding),padding]);
			var xAxis= d3.svg.axis()
							 .scale(xScale)
							 .orient("bottom");
			var yAxis= d3.svg.axis()
						 .scale(yScale)
						 .orient("left");
		/*axis*/
			svg.append("g")
			   .attr({
			   		class: "axis",
			   		transform: "translate(0," + (h-(3.5 * padding)) + ")",
				})
			   .call(xAxis);

			svg.append("g")
			   .attr({
			   		class: "axis",
			   		transform: "translate(" + (4.5 * padding) + ",0)",
				})
			   .call(yAxis);

			/*label x-axis*/
			svg.append("text")
			   .attr("class", "x label")
			   .attr("text-anchor", "middle")
			   .attr("x", w /2 -25)
			   .attr("y", h - 6)
			   .text("SN2_G1")
			   .attr("font-family", "sans-serif")
			   .attr("font-size", "11px")
			   .attr("fill", "blue");

			svg.append("text")
			   .attr("class", "x label")
			   .attr("text-anchor", "middle")
			   .attr("x", w /2 + 25)
			   .attr("y", h - 6)
			   .text("SN2_G2")
			   .attr("font-family", "sans-serif")
			   .attr("font-size", "11px")
			   .attr("fill", "#ff6600");

			/*label y-axis*/
			svg.append("text")
			   .attr("class", "y label")
			   .attr("text-anchor", "middle")
			   .attr("x", 0- h/2 - 25)
			   .attr("y", 6)
			   .attr("dy", ".75em")
			   .attr("transform", "rotate(-90)")
			   .text("SN2_I1")
			   .attr("font-family", "sans-serif")
			   .attr("font-size", "11px")
			   .attr("fill", "blue");

			svg.append("text")
			   .attr("class", "y label")
			   .attr("text-anchor", "middle")
			   .attr("x", 0- h/2 + 25)
			   .attr("y", 6)
			   .attr("dy", ".75em")
			   .attr("transform", "rotate(-90)")
			   .text("SN2_I2")
			   .attr("font-family", "sans-serif")
			   .attr("font-size", "11px")
			   .attr("fill", "#ff6600");
						
		//scatter plot
		
			svg.selectAll("circle")
			    .data(dataset.aaData)
			    .enter()
			    .append("circle")
			    .attr({
			   		cx: function(d) {
			   			var x= xScale(d.DERED_SN2_G1); 
			   			//console.log(x);
			   			return x;
			   		},
			   		cy: function(d) {				   			
			   			var y= yScale(d.DERED_SN2_I1); 
			   			//console.log(""+ y); 
			   			return y;
			   		},
			   		r: 2,
			   		fill: "rgba(0, 0, 255, 0.85)"
				});
			    
			
			svg.selectAll("ellipse")
			    .data(dataset.aaData)
			    .enter()
			    .append("ellipse")
			    .attr({
			   		cx: function(d) {
			   			var x= xScale(d.DERED_SN2_G2); 
			   			//console.log(x);
			   			return x;
			   		},
			   		cy: function(d) {				   			
			   			var y= yScale(d.DERED_SN2_I2); 
			   			//console.log(""+ y); 
			   			return y;
			   		},
			   		rx: 2,
			   		ry:2,
			   		fill: "rgba(255, 145, 0, 0.85)"
				});
				

			/*making the plots interactive*/
			d3.select("#project_table_filter input")
			  .on("keypress keyup", function(){
			  	console.log("successfully communicating with d3");
			  });

		}
	});
	
} );

	

			


