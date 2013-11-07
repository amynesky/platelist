/* Set the defaults for DataTables initialisation */
$.extend( true, $.fn.dataTable.defaults, {
	"sDom": "<'row'<'col-lg-6'l><'col-lg-6'f>r>t<'row'<'col-lg-6'i><'col-lg-6'p>>",
	"sPaginationType": "bootstrap",
	"oLanguage": {
	"sLengthMenu": "_MENU_ records per page",
	}
} );



/* Default class modification */
$.extend( $.fn.dataTableExt.oStdClasses, {
	"sWrapper": "dataTables_wrapper form-inline"
} );


 var nNodes;
 var filteredPlots = false;
 
/* API method to get paging information */
$.fn.dataTableExt.oApi.fnPagingInfo = function ( oSettings ){
	/*this makes the search bar respond to the enter key*/
    $('#project_table_filter input').unbind('keypress keyup');
   	$('#project_table_filter input').bind('keypress keyup', function(e) {
   		if ($(this).val().length < 3 && e.keyCode != 13) {return;}	
       	else{
        	oTable.fnFilter($(this).val()); 
    	}
    	if(e.keyCode == 13) {
    		filteredPlots = true;
    		/* this is a hook to retrieve the nodes that are filters */ 
        	nNodes = oTable._('tr', {"filter":"applied"}); /* get all the filtered table rows */
    		addFilteredPlotPoints(nNodes, true, "#00780e", "#ff0000", "#1e00b3", "#ff5900");
    				/*
    				var w = $(window);
    				var row = $('table').find('tr')
        							.removeClass('hover')
       								 .eq( +$('#project_table_filter input').val())
        							.addClass(function(){
        								console.log("hi");
        								return 'hover';
        							});
    
    				if (row.length){
    					console.log("should move window");
        				w.scrollTop( row.offset().top - (w.height()/2) );
    				}
    				*/
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
                    '<li class="prev disabled pages"><a href="#">&larr; ' + oLang.sFirst + '</a></li>' +
                    '<li class="prev disabled pages"><a href="#">&larr; '+oLang.sPrevious+'</a></li>'+
                    '<li class="next disabled pages"><a href="#">' + oLang.sNext + ' &rarr; </a></li>' +
                    '<li class="next disabled pages"><a href="#">' + oLang.sLast + ' &rarr; </a></li>' +
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



$.fn.dataTableExt.oApi.fnGetTd  = function ( oSettings, iTd ){  
	// Looking at both visible and hidden TD elements - convert to visible index, if not present
    // then it must be hidden. Return as appropriate
    var iCalcVis = oSettings.oApi._fnColumnIndexToVisible( oSettings, iTd );
	return iCalcVis;
};

function getVisibleIndexofColumn(index){
	var nTd = oTable.fnGetTd( index );
	return nTd;
}

/*clear search bar button*/
if ( typeof $.fn.dataTable == "function" && typeof $.fn.dataTableExt.fnVersionCheck == "function" && $.fn.dataTableExt.fnVersionCheck('1.9.2')/*older versions should work too*/ )
{
    $.fn.dataTableExt.oApi.clearSearch = function ( oSettings )
    {
 
        var table = this;
         
        //any browser, must include your own file
        //var clearSearch = $('<img src="/images/delete.png" style="vertical-align:text-bottom;cursor:pointer;" alt="Delete" title="Delete"/>');
         
        //no image file needed, css embedding must be supported by browser
        var clearSearch = $('<img title="Delete" alt="" src="data:image/png;data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAD2SURBVHjaxFM7DoMwDH2pOESHHgDPcB223gKpAxK34EAMMIe1FCQOgFQxuflARVBSVepQS5Ht2PHn2RHMjF/ohB8p2gSZpprtyxEHX8dGTeMG0A5UlsD5rCSGvF55F4SpqpSm1GmCzPO3LXJy1LXllwvodoMsCpNVy2hbYBjCLRiaZ8u7Dng+QXlu9b4H7ncvBmKbwoYBWR4kaXv3YmAMyoEpjv2PdWUHcP1j1ECqFpyj777YA6Yss9KyuEeDaW0cCsCUJMDjYUE8kr5TNuOzC+JiMI5uz2rmJvNWvidwcJXXx8IAuwb6uMqrY2iVgzbx99/4EmAAarFu0IJle5oAAAAASUVORK5CYII=" style="vertical-align:text-bottom;cursor:pointer;" />');
        $(clearSearch).click( function ()
                {
                    table.fnFilter('');
                    if(filteredPlots){
						removePlotPointsWithClass(".filter");
						filteredPlots = false;

					}
                });
        $(oSettings.nTableWrapper).find('div.dataTables_filter').append(clearSearch);
        $(oSettings.nTableWrapper).find('div.dataTables_filter label').css('margin-right', '-16px');//16px the image width
        $(oSettings.nTableWrapper).find('div.dataTables_filter input').css('padding-right', '16px');
        $("#project_table_filter").append("<span>  Press enter to plot filtered results.</span>");
    }
 
    //auto-execute, no code needs to be added
    $.fn.dataTable.models.oSettings['aoInitComplete'].push( {
        "fn": $.fn.dataTableExt.oApi.clearSearch,
        "sName": 'whatever'
    } );
}


/* Table initialisation */
var oTable;
var dataset;

/*plot width, height and padding*/
var w = 200;
var RAvDECwidth = 400;
var h = 200;
var padding = 10;
/*plot scales*/
var xScaleLRG1vLRG2;
var yScaleLRG1vLRG2;
var xScaleLRG2vQSO;
var yScaleLRG2vQSO;
var xScaleSN2_G12vSN2_I12;
var yScaleSN2_G12vSN2_I12;
var xScaleRAvDEC;
var yScaleRAvDEC;
var colorAxis;


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

function selectLink(event){ 
	$(event.target).parent().find("a").removeClass("current");
	$(event.target).addClass("current");
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
					"sDom": "<'row'<'col-lg-6'f><'col-lg-6'l>r>t<'row'<ip>>",
					"sPaginationType": "bootstrap",
					"aaSorting": [[ 1, "desc" ]], /*default sort rows by second column in descending order*/
					"bPaginate": true,
					"bLengthChange": true, /*records per page drop down*/
					"bDeferRender": false, 
					/* false, so that it renders the entire table on load vs only 
					   the visible table elements; this is needed to retrieve 
					    all filtered items, not just the visible filtered items */
					"sScrollY": "340px",
					"sScrollX": "100%",
					"sScrollXInner": "275%",
					"bScrollCollapse": true,
					"bFilter": true,
					"bSort": true,
					"bInfo": true, /*Showing 1 to 2,194 of 2,194 entries*/
					"bAutoWidth": false,
					"bSortClasses": false,
					"bProcessing": true,
					"sAjaxSource": "data/platelist.json",
					"aLengthMenu": [[ 50, 100, 500, 1000, -1], [ 50, 100, 500, 1000, "All"]], /*records per page drop down*/
			   		"aoColumns": [
						{ "mData": "PLATE", "sWidth": "40px"},
						{ "mData": "MJD", "sWidth": "40px"},      
						{ "mData": "TILEID" , "bVisible": false, "sWidth": "45px"},  
						{ "mData": "RUN2D" ,"bSearchable": false, "sWidth": "55px"}, 
						{ "mData": "RUN1D" ,"bSearchable": false, "sWidth": "55px"}, 
						{ "mData": "RACEN" ,"bSearchable": false, "bVisible": false, "sWidth": "50px"}, /*5*/
						{ "mData": "DECCEN" ,"bSearchable": false, "bVisible": false, "sWidth": "65px"},
						{ "mData": "EPOCH" ,"bSearchable": false, "bVisible": false},
						{ "mData": "CARTID" ,"bSearchable": false, "bVisible": false},
						{ "mData": "TAI" ,"bSearchable": false, "bVisible": false},
						{ "mData": "TAI_BEG" ,"bSearchable": false, "bVisible": false}, /*10*/
						{ "mData": "TAI_END" ,"bSearchable": false, "bVisible": false},
						{ "mData": "AIRMASS" ,"bSearchable": false, "bVisible": false},
						{ "mData": "EXPTIME" ,"bSearchable": false, "bVisible": false},
						{ "mData": "MAPNAME" ,"bSearchable": false, "bVisible": false},
						{ "mData": "SURVEY" , "bVisible": false, "sWidth": "55px"},  /*15*/
						{ "mData": "PROGRAMNAME" , "bVisible": false, "sWidth": "175px"}, 
						{ "mData": "CHUNK" , "bVisible": false, "sWidth": "60px"},
						{ "mData": "PLATEQUALITY" , "sWidth": "50px"},
						{ "mData": "PLATESN2" , "bVisible": false, "sWidth": "50px"}, 
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
						{ "mData": "N_STAR" ,"bSearchable": false, "bVisible": false, "sWidth": "40px"}, /*90*/
						{ "mData": "N_UNKNOWN" ,"bSearchable": false, "bVisible": false, "sWidth": "70px"},
						{ "mData": "N_SKY" ,"bSearchable": false, "bVisible": false, "sWidth": "40px"},
						{ "mData": "N_TARGET_MAIN" ,"bSearchable": false, "bVisible": false, "bVisible": false},
						{ "mData": "N_TARGET_LRG1" ,"bSearchable": false, "bVisible": false, "sWidth": "40px"}, 
						{ "mData": "N_TARGET_LRG2" ,"bSearchable": false, "bVisible": false, "sWidth": "40px"}, /*95*/
						{ "mData": "N_TARGET_QSO" ,"bSearchable": false, "bVisible": false, "sWidth": "40px"},
						{ "mData": "SUCCESS_MAIN" ,"bSearchable": false, "bVisible": false}, 
						{ "mData": "SUCCESS_LRG1" ,"bSearchable": false, "sWidth": "65px"}, 
						{ "mData": "SUCCESS_LRG2" ,"bSearchable": false, "sWidth": "65px"},  
						{ "mData": "SUCCESS_QSO" ,"bSearchable": false, "sWidth": "60px"}, /*100*/
						{ "mData": "STATUS2D" , "sWidth": "30px"}, 
						{ "mData": "STATUSCOMBINE" , "sWidth": "60px"}, 
						{ "mData": "STATUS1D" , "sWidth": "30px"}, 
						{ "mData": "PUBLIC" , "bVisible": false, "sWidth": "60px"}, 
						{ "mData": "QUALCOMMENTS" }, /*105*/	
					],
					/*makes cells content sensitive*/
					"fnRowCallback": function( nRow, aData, iDisplayIndex,iDisplayIndexFull) {
				        $(nRow).children().each(function(index, td) {
				        	var visibleQualityIndex = getVisibleIndexofColumn (18);
				        	if(index == visibleQualityIndex){ /*quality*/
					            if ($(td).html() === "bad") {
					                $(td).css("color", "#FF3229");
					            };
					        } 
				        	var visibleSN2_G1Index = getVisibleIndexofColumn (38);
					    	if(index == visibleSN2_G1Index){ /*sn2_g1*/
					            if ($(td).html() < 10.0) {
					                $(td).css("color", "#FF3229");
					            };
					        } 
				        	var visibleSN2_I1Index = getVisibleIndexofColumn (40); 
					    	if(index == visibleSN2_I1Index){ /*sn2_i1*/
					            if ($(td).html() < 10.0) {
					                $(td).css("color", "#FF3229");
					            };
					        } 
				        	var visibleSN2_G2Index = getVisibleIndexofColumn (41);
					    	if(index == visibleSN2_G2Index){ /*sn2_g2*/
					            if ($(td).html() < 22.0) {
					                $(td).css("color", "#FF3229");
					            };
					        } 
				        	var visibleSN2_I2Index = getVisibleIndexofColumn (43);
					    	if(index == visibleSN2_I2Index){ /*sn2_i2*/
					            if ($(td).html() < 22.0) {
					                $(td).css("color", "#FF3229");
					            };
					        } 
				        	var visibleFBADPIXIndex = getVisibleIndexofColumn (84);
					        if(index == visibleFBADPIXIndex){ /*fbadpix*/
					            if ($(td).html() <0.1 && $(td).html() > 0.05) {
					                $(td).css("color", "#FF8800");
					            };
					            if ($(td).html()>0.1) {
					                $(td).css("color", "#FF3229");
					            };
					        } 
				        	var visibleLRG1Index = getVisibleIndexofColumn (98);
					        if(index == visibleLRG1Index){ /*%LRG1*/
					            if ($(td).html() >92 && $(td).html() < 95) {
					                $(td).css("color", "#FF8800");
					            };
					            if ($(td).html() <92) {
					                $(td).css("color", "#FF3229");
					            };		            
					        } 
				        	var visibleLRG2Index = getVisibleIndexofColumn (99);
					        if(index == visibleLRG2Index){ /*%LRG2*/
					            if ($(td).html() >80 && $(td).html() < 88) {
					                $(td).css("color", "#FF8800");
					            };
					            if ($(td).html() < 80) {
					                $(td).css("color", "#FF3229");
					            };		            
					        }
					        var visibleSTATUS1DIndex = getVisibleIndexofColumn (103);
				        	if(index == visibleSTATUS1DIndex){ /*STATUS1D*/
					            if ($(td).html() === "Pending") {
					                $(td).css("color", "#FF8800");
					            };
					            if ($(td).html() === "RUNNING") {
					                $(td).css("color", "#FF8800");
					            };
					            if ($(td).html() === "FAILED") {
					                $(td).css("color", "#FF3229");
					            };
					        } 
					        var visibleSTATUSCOMBINEIndex = getVisibleIndexofColumn (102);
				        	if(index == visibleSTATUSCOMBINEIndex){ /*STATUSCOMBINE*/
					            if ($(td).html() === "Pending") {
					                $(td).css("color", "#FF8800");
					            };
					            if ($(td).html() === "RUNNING") {
					                $(td).css("color", "#FF8800");
					            };
					            if ($(td).html() === "FAILED") {
					                $(td).css("color", "#FF3229");
					            };	            
					        } 
					        var visibleSTATUS2DIndex = getVisibleIndexofColumn (101);
				        	if(index == visibleSTATUS2DIndex){ /*STATUS2D*/
					            if ($(td).html() === "Pending") {
					                $(td).css("color", "#FF8800");
					            };
					            if ($(td).html() === "RUNNING") {
					                $(td).css("color", "#FF8800");
					            };
					            if ($(td).html() === "FAILED") {
					                $(td).css("color", "#FF3229");
					            };		            
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
				d3.json("data/platelist.json", function(error, json){
					if(error){
						console.log(error);
					}else{
						dataset = json;
						//%LRG1v%LRG2
						//scale
						var xMin = d3.min(dataset.aaData, function(d){return d.SUCCESS_LRG1;});
						var xMax = d3.max(dataset.aaData, function(d){return d.SUCCESS_LRG1;});
						var yMin = d3.min(dataset.aaData, function(d){return d.SUCCESS_LRG2;});
						var yMax = d3.max(dataset.aaData, function(d){return d.SUCCESS_LRG2;});

						xScaleLRG1vLRG2 = d3.scale.linear()
											 .domain([xMin,xMax])
											 .range([4.5 * padding,w-padding]);
						yScaleLRG1vLRG2 = d3.scale.linear()
											 .domain([yMin,yMax])
											 .range([h-(3.5 * padding),padding]);

						//%LRG2vQSO			
						xMin = d3.min(dataset.aaData, function(d){return d.SUCCESS_LRG2;});
						xMax = d3.max(dataset.aaData, function(d){return d.SUCCESS_LRG2;});
						yMin = d3.min(dataset.aaData, function(d){return d.SUCCESS_QSO;});
						yMax = d3.max(dataset.aaData, function(d){return d.SUCCESS_QSO;});

						xScaleLRG2vQSO = d3.scale.linear()
											 .domain([xMin,xMax])
											 .range([4.5 * padding,w-padding]);
						yScaleLRG2vQSO = d3.scale.linear()
											 .domain([yMin,yMax])
											 .range([h-(3.5 * padding),padding]);

						//SN2_G12vSN2_I12
						//scale
						xMin = d3.min([d3.min(dataset.aaData, function(d){return d.DERED_SN2_G1;}), 
										   d3.min(dataset.aaData, function(d){return d.DERED_SN2_G2;})]);
						xMax = d3.max([d3.max(dataset.aaData, function(d){return d.DERED_SN2_G1;}), 
										  d3.max(dataset.aaData, function(d){return d.DERED_SN2_G2;})]);
						yMin = d3.min([d3.min(dataset.aaData, function(d){return d.DERED_SN2_I1;}), 
										  d3.min(dataset.aaData, function(d){return d.DERED_SN2_I2;})]);
						yMax = d3.max([d3.max(dataset.aaData, function(d){return d.DERED_SN2_I1;}), 
										  d3.max(dataset.aaData, function(d){return d.DERED_SN2_I2;})]);

						xScaleSN2_G12vSN2_I12 = d3.scale.linear()
											 .domain([xMin,xMax])
											 .range([4.5 * padding,w-padding]);
						yScaleSN2_G12vSN2_I12 = d3.scale.linear()
											 .domain([yMin,yMax])
											 .range([h-(3.5 * padding),padding]);

						
						//RAvDEC
						//scale
						xMin = d3.min(dataset.aaData, function(d){return d.RACEN;});
						xMax = d3.max(dataset.aaData, function(d){return d.RACEN;});
						yMin = d3.min(dataset.aaData, function(d){return d.DECCEN;});
						yMax = d3.max(dataset.aaData, function(d){return d.DECCEN;});

						xScaleRAvDEC = d3.scale.linear()
											 .domain([xMin,xMax])
											 .range([4.5 * padding,RAvDECwidth-padding]);
						yScaleRAvDEC = d3.scale.linear()
											 .domain([yMin,yMax])
											 .range([h-(3.5 * padding),padding]);

						createSVGs();
						drawAxes();
						drawData(dataset.aaData);	
					}
											

				});

				$("a.togglelinks").click(function(e) {
					selectLink(e);
				});

				$("a.RAvDECLinks").click(function(e) {
					selectLink(e);
				});
			} )
		.on({ /*hovering over table row highlights row and plot points*/
		    mouseenter: function () {
		        trIndex = $(this).index()+1;
		        try{
		        	var plate = $(this).find('td').eq(0).html();
		        	var mjd = $(this).find('td').eq(1).html();
		        	var identifier = plate + "_" + mjd;
		        	highlightPlots(identifier);
		   		}catch(err){};
		        $("table.dataTable").each(function(index) {
		            $(this).find("tr:eq("+trIndex+")").addClass("hover") 
		        });
		    },
		    mouseleave: function () {
		        trIndex = $(this).index()+1;
		        $("table.dataTable").each(function(index) {
		            $(this).find("tr:eq("+trIndex+")").removeClass("hover")
		        });
		        removePlotPointsWithClass(".highlighter");
		    }
		}, ".dataTables_wrapper tr");

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function createSVGs(){
	//Create SVG element for %LRG1v%LRG2
	var LRG1vLRG2 = d3.select("#plots")
					.append("svg")
					.attr("class", "plot")
					.attr("id", "LRG1vLRG2")
					.attr({
						width: w,
						height: h,
					});  


	//Create SVG element for %LRG2v%QSO
    var LRG2vQSO = d3.select("#plots")
			.append("svg")
			.attr({
				width: w,
				height: h,
			})
			.attr("class", "plot")
			.attr("id", "LRG2vQSO");

	//Create SVG element for SN2_G1vSN2_I1 on top of SN2_G2vSN2_I2
    var SN2_G12vSN2_I12 = d3.select("#plots")
			.append("svg")
			.attr({
				width: w,
				height: h,
			})
			.attr("class", "plot")
			.attr("id", "SN2_G12vSN2_I12");

	//Create SVG element for RAvDEC
    var RAvDEC = d3.select("#plots")
			.append("svg")
			.attr({
				width: RAvDECwidth,
				height: h,
			})
			.attr("class", "plot")
			.attr("id", "RAvDEC");

	var colorBar = d3.select("#plots")
			.append("svg")
			.attr({
				width: 50,
				height: h,
			})
			.attr("id", "colorBar");
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function drawAxes(){
	//%LRG1v%LRG2
	var xAxis= d3.svg.axis()
					 .scale(xScaleLRG1vLRG2)
					 .orient("bottom");
	var yAxis= d3.svg.axis()
				 .scale(yScaleLRG1vLRG2)
				 .orient("left");
	/*axes*/
	d3.select(LRG1vLRG2).append("g")
	   .attr({
	   		class: "axis",
	   		transform: "translate(0," + (h-(3.5 * padding)) + ")",
		})
	   .call(xAxis);

	d3.select(LRG1vLRG2).append("g")
	   .attr({
	   		class: "axis",
	   		transform: "translate(" + (4.5 * padding) + ",0)",
		})
	   .call(yAxis);

	/*label x-axis*/
	d3.select(LRG1vLRG2).append("text")
	   .attr("class", "x label")
	   .attr("text-anchor", "middle")
	   .attr("x", w /2 )
	   .attr("y", h - 6)
	   .text("%LRG1")
	   .attr("font-family", "sans-serif")
	   .attr("font-size", "11px")
	   .attr("fill", "black");

	/*label y-axis*/
	d3.select(LRG1vLRG2).append("text")
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

	//%LRG2vQSO

	var xAxis= d3.svg.axis()
					 .scale(xScaleLRG2vQSO)
					 .orient("bottom");
	var yAxis= d3.svg.axis()
				 .scale(yScaleLRG2vQSO)
				 .orient("left");
	/*axes*/
	d3.select(LRG2vQSO).append("g")
	   .attr({
	   		class: "axis",
	   		transform: "translate(0," + (h-(3.5 * padding)) + ")",
		})
	   .call(xAxis);

	d3.select(LRG2vQSO).append("g")
	   .attr({
	   		class: "axis",
	   		transform: "translate(" + (4.5 * padding) + ",0)",
		})
	   .call(yAxis);

	/*label x-axis*/
	d3.select(LRG2vQSO).append("text")
	   .attr("class", "x label")
	   .attr("text-anchor", "middle")
	   .attr("x", w /2 )
	   .attr("y", h - 6)
	   .text("%LRG2")
	   .attr("font-family", "sans-serif")
	   .attr("font-size", "11px")
	   .attr("fill", "black");

	/*label y-axis*/
	d3.select(LRG2vQSO).append("text")
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

	//SN2_G12vSN2_I12
	var xAxis= d3.svg.axis()
					 .scale(xScaleSN2_G12vSN2_I12)
					 .orient("bottom");
	var yAxis= d3.svg.axis()
				 .scale(yScaleSN2_G12vSN2_I12)
				 .orient("left");
	/*axis*/
	d3.select(SN2_G12vSN2_I12).append("g")
	   .attr({
	   		class: "axis",
	   		transform: "translate(0," + (h-(3.5 * padding)) + ")",
		})
	   .call(xAxis);

	d3.select(SN2_G12vSN2_I12).append("g")
	   .attr({
	   		class: "axis",
	   		transform: "translate(" + (4.5 * padding) + ",0)",
		})
	   .call(yAxis);

	/*label x-axis*/
	d3.select(SN2_G12vSN2_I12).append("text")
	   .attr("class", "x label")
	   .attr("text-anchor", "middle")
	   .attr("x", w /2 -25)
	   .attr("y", h - 6)
	   .text("SN2_G1")
	   .attr("font-family", "sans-serif")
	   .attr("font-size", "11px")
	   .attr("fill", "blue");

	d3.select(SN2_G12vSN2_I12).append("text")
	   .attr("class", "x label")
	   .attr("text-anchor", "middle")
	   .attr("x", w /2 + 25)
	   .attr("y", h - 6)
	   .text("SN2_G2")
	   .attr("font-family", "sans-serif")
	   .attr("font-size", "11px")
	   .attr("fill", "#ff6600");

	/*label y-axis*/
	d3.select(SN2_G12vSN2_I12).append("text")
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

	d3.select(SN2_G12vSN2_I12).append("text")
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

	//RAvDEC
	var xAxis= d3.svg.axis()
					 .scale(xScaleRAvDEC)
					 .orient("bottom");
	var yAxis= d3.svg.axis()
				 .scale(yScaleRAvDEC)
				 .orient("left");
	/*axes*/
	d3.select(RAvDEC).append("g")
	   .attr({
	   		class: "axis",
	   		transform: "translate(0," + (h-(3.5 * padding)) + ")",
		})
	   .call(xAxis);

	d3.select(RAvDEC).append("g")
	   .attr({
	   		class: "axis",
	   		transform: "translate(" + (4.5 * padding) + ",0)",
		})
	   .call(yAxis);

	/*label x-axis*/
	d3.select(RAvDEC).append("text")
	   .attr("class", "x label")
	   .attr("text-anchor", "middle")
	   .attr("x", RAvDECwidth /2 )
	   .attr("y", h - 6)
	   .text("RA")
	   .attr("font-family", "sans-serif")
	   .attr("font-size", "11px")
	   .attr("fill", "black");

	/*label y-axis*/
	d3.select(RAvDEC).append("text")
	   .attr("class", "y label")
	   .attr("text-anchor", "middle")
	   .attr("x", 0- h/2 )
	   .attr("y", 6)
	   .attr("dy", ".75em")
	   .attr("transform", "rotate(-90)")
	   .text("DEC")
	   .attr("font-family", "sans-serif")
	   .attr("font-size", "11px")
	   .attr("fill", "black");

}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function drawData(nNodes, filter, goodColoring, badColoring, SN2_GI1color, SN2_GI2color , radius){
	//colors
	if(typeof(goodColoring) === "undefined"){ goodColoring = "#5cba57";}
	if(typeof(badColoring) === "undefined"){badColoring = "#f76060";}
	if(typeof(SN2_GI1color) === "undefined"){SN2_GI1color = "#5c69ff";}
	if(typeof(SN2_GI2color) === "undefined"){SN2_GI2color = "#ffa85c";}
	greyedOut = "#c4c4c4";
	highlighterColor1 = "#fffb00"; /*yellow*/
	highlighterColor2 = "#ff00fb"; /*purple*/

	if(typeof(filter) === "undefined"){filter = false;}

	if(typeof(radius) === "undefined"){radius = 2;}
	highlightRadius = radius + 1;

	//LRG1vLRG2
	d3.select(LRG1vLRG2).selectAll("ellipse")
	    .data(nNodes)
	    .enter()
	    .append("circle")
	    .attr("id", function(d) {return "LRG1vLRG2_"+d.PLATE+"_"+d.MJD;})
	    .attr("class", function() {
	  		if(filter){
	  			return "filter";
	  		};
  		})
	    .attr({
	   		cx: function(d) {
	   			var x= xScaleLRG1vLRG2(d.SUCCESS_LRG1); 
	   			return x;
	   		},
	   		cy: function(d) {				   			
	   			var y= yScaleLRG1vLRG2(d.SUCCESS_LRG2); 
	   			return y;
	   		},
	   		r: radius,
	   		fill: function(d){
	   			//if(d.MJD<55171){
	   				//return greyedOut;
	   		//	}else{
	   				if(d.PLATEQUALITY=="good"){
	   					return goodColoring;
	   				}
	   				else{
	   					return badColoring;
	   				}
	   			//}
	   		},
		})
	   .on("mouseover", function(d) {
			//Update the tooltip value
			d3.select("#tooltip")						
				.select("#tooltipLine1")
				.text("Plate: " + d.PLATE);

			d3.select("#tooltip")					
				.select("#tooltipLine2")
				.text(", MJD: " + d.MJD);

			//draw highlighter dots
			d3.select(LRG2vQSO).append("circle")
			  		.attr("class", "highlighter")
			   		.attr({
				   		cx: xScaleLRG2vQSO(d.SUCCESS_LRG2),
				   		cy: yScaleLRG2vQSO(d.SUCCESS_QSO),
				   		r: highlightRadius,
				   		fill: highlighterColor1,
				   		stroke: "black",
					});
			d3.select(RAvDEC).append("circle")
			  		.attr("class", "highlighter")
			   		.attr({
				   		cx: xScaleRAvDEC(d.RACEN),
				   		cy: yScaleRAvDEC(d.DECCEN),
				   		r: highlightRadius,
				   		fill: highlighterColor1,
				   		stroke: "black",
					});

			d3.select(SN2_G12vSN2_I12).append("circle")
			  		.attr("class", "highlighter")
			   		.attr({
				   		cx: xScaleSN2_G12vSN2_I12(d.DERED_SN2_G2),
				   		cy: yScaleSN2_G12vSN2_I12(d.DERED_SN2_I2),
				   		r: highlightRadius,
				   		fill: highlighterColor1,
				   		stroke: "black",
					});

			d3.select(SN2_G12vSN2_I12).append("circle")
			  		.attr("class", "highlighter")
			   		.attr({
				   		cx: xScaleSN2_G12vSN2_I12(d.DERED_SN2_G1),
				   		cy: yScaleSN2_G12vSN2_I12(d.DERED_SN2_I1),
				   		r: highlightRadius,
				   		fill: highlighterColor2,
				   		stroke: "black",
					});

	   })
	   .on("click", function(d) {
			d3.select("#tooltip")				
				.select("#selectedTooltipLine1")
				.text(" Plate: " + d.PLATE)

			d3.select("#tooltip")					
				.select("#selectedTooltipLine2")
				.text(", MJD: " + d.MJD);
	   })
	   .on("mouseout", function() {
			removePlotPointsWithClass(".highlighter");
			
	   });
	


	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	//LRG2vQSO
	d3.select(LRG2vQSO).selectAll("ellipse")
	    .data(nNodes)
	    .enter()
	    .append("circle")
	    .attr("id", function(d) {return "LRG2vQSO_"+d.PLATE+"_"+d.MJD;})
	    .attr("class", function() {
	  		if(filter){
	  			return "filter";
	  		};
  		})
	    .attr({
	   		cx: function(d) {
	   			var x= xScaleLRG2vQSO(d.SUCCESS_LRG2); 
	   			return x;
	   		},
	   		cy: function(d) {				   			
	   			var y= yScaleLRG2vQSO(d.SUCCESS_QSO); 
	   			return y;
	   		},
	   		r: radius,
			fill: function(d){
	   			//if(d.MJD<55171){
	   				//return greyedOut;
	   			//}else{
	   				if(d.PLATEQUALITY=="good"){
	   					return goodColoring;
	   				}
	   				else{
	   					return badColoring;
	   				}
	   			//}
	   		},
		})
	   .on("mouseover", function(d) {

			//Update the tooltip value
			d3.select("#tooltip")					
				.select("#tooltipLine1")
				.text("Plate: " + d.PLATE)

			d3.select("#tooltip")				
				.select("#tooltipLine2")
				.text(", MJD: " + d.MJD);

			//draw highlighter dots
			d3.select(LRG1vLRG2).append("circle")
			  		.attr("class", "highlighter")
			   		.attr({
				   		cx: xScaleLRG1vLRG2(d.SUCCESS_LRG1),
				   		cy: yScaleLRG1vLRG2(d.SUCCESS_LRG2),
				   		r: highlightRadius,
				   		fill: highlighterColor1,
				   		stroke: "black",
					});
			d3.select(RAvDEC).append("circle")
			  		.attr("class", "highlighter")
			   		.attr({
				   		cx: xScaleRAvDEC(d.RACEN),
				   		cy: yScaleRAvDEC(d.DECCEN),
				   		r: highlightRadius,
				   		fill: highlighterColor1,
				   		stroke: "black",
					});

			d3.select(SN2_G12vSN2_I12).append("circle")
			  		.attr("class", "highlighter")
			   		.attr({
				   		cx: xScaleSN2_G12vSN2_I12(d.DERED_SN2_G2),
				   		cy: yScaleSN2_G12vSN2_I12(d.DERED_SN2_I2),
				   		r: highlightRadius,
				   		fill: highlighterColor1,
				   		stroke: "black",
					});

			d3.select(SN2_G12vSN2_I12).append("circle")
			  		.attr("class", "highlighter")
			   		.attr({
				   		cx: xScaleSN2_G12vSN2_I12(d.DERED_SN2_G1),
				   		cy: yScaleSN2_G12vSN2_I12(d.DERED_SN2_I1),
				   		r: highlightRadius,
				   		fill: highlighterColor2,
				   		stroke: "black",
					});
			
	   })
	   .on("click", function(d) {
			//Update the tooltip value
			d3.select("#tooltip")				
				.select("#selectedTooltipLine1")
				.text(" Plate: " + d.PLATE)

			d3.select("#tooltip")				
				.select("#selectedTooltipLine2")
				.text(", MJD: " + d.MJD);
			
	   })
	   .on("mouseout", function() {
			removePlotPointsWithClass(".highlighter");
	   });



	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

					
	//scatter plot
	d3.select(SN2_G12vSN2_I12).selectAll("ellipse")
	    .data(nNodes)
	    .enter()
	    .append("circle")
	    .attr("id", function(d) {return "SN2_G1vSN2_I1_"+d.PLATE+"_"+d.MJD;})
	    .attr("class", function() {
	  		if(filter){
	  			return "filter";
	  		};
  		})
	    .attr({
	   		cx: function(d) {
	   			var x= xScaleSN2_G12vSN2_I12(d.DERED_SN2_G1); 
	   			//console.log(x);
	   			return x;
	   		},
	   		cy: function(d) {				   			
	   			var y= yScaleSN2_G12vSN2_I12(d.DERED_SN2_I1); 
	   			//console.log(""+ y); 
	   			return y;
	   		},
	   		r: radius,
	   		fill: SN2_GI1color
		})
		.on("mouseover", function(d) {
			//Update the tooltip value
			d3.select("#tooltip")				
				.select("#tooltipLine1")
				.text("Plate: " + d.PLATE)

			d3.select("#tooltip")				
				.select("#tooltipLine2")
				.text(", MJD: " + d.MJD);

			//hightlighter dots
			d3.select(LRG1vLRG2).append("circle")
			  		.attr("class", "highlighter")
			   		.attr({
				   		cx: xScaleLRG1vLRG2(d.SUCCESS_LRG1),
				   		cy: yScaleLRG1vLRG2(d.SUCCESS_LRG2),
				   		r: highlightRadius,
				   		fill: highlighterColor1,
				   		stroke: "black",
					});

			d3.select(LRG2vQSO).append("circle")
			  		.attr("class", "highlighter")
			   		.attr({
				   		cx: xScaleLRG2vQSO(d.SUCCESS_LRG2),
				   		cy: yScaleLRG2vQSO(d.SUCCESS_QSO),
				   		r: highlightRadius,
				   		fill: highlighterColor1,
				   		stroke: "black",
					});

			d3.select(SN2_G12vSN2_I12).append("circle")
			  		.attr("class", "highlighter")
			   		.attr({
				   		cx: xScaleSN2_G12vSN2_I12(d.DERED_SN2_G2),
				   		cy: yScaleSN2_G12vSN2_I12(d.DERED_SN2_I2),
				   		r: highlightRadius,
				   		fill: highlighterColor1,
				   		stroke: "black",
					});					
			d3.select(RAvDEC).append("circle")
			  		.attr("class", "highlighter")
			   		.attr({
				   		cx: xScaleRAvDEC(d.RACEN),
				   		cy: yScaleRAvDEC(d.DECCEN),
				   		r: highlightRadius,
				   		fill: highlighterColor1,
				   		stroke: "black",
					});
		

	   })
	   .on("click", function(d) {
			//Update the tooltip value
			d3.select("#tooltip")					
				.select("#selectedTooltipLine1")
				.text(" Plate: " + d.PLATE)

			d3.select("#tooltip")					
				.select("#selectedTooltipLine2")
				.text(", MJD: " + d.MJD);
			
	   })
	   .on("mouseout", function() {
			removePlotPointsWithClass(".highlighter");
			
	   });

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////			    
		

	d3.select(SN2_G12vSN2_I12).selectAll("ellipse")
	    .data(nNodes)
	    .enter()
	    .append("circle")
	    .attr("id", function(d) {return "SN2_G2vSN2_I2_"+d.PLATE+"_"+d.MJD;})
	    .attr("class", function() {
	  		if(filter){
	  			return "filter";
	  		};
  		})			    
  		.attr({
	   		cx: function(d) {
	   			var x= xScaleSN2_G12vSN2_I12(d.DERED_SN2_G2); 
	   			return x;
	   		},
	   		cy: function(d) {				   			
	   			var y= yScaleSN2_G12vSN2_I12(d.DERED_SN2_I2); 
	   			return y;
	   		},
	   		r: radius,
	   		fill: SN2_GI2color
		})
		.on("mouseover", function(d) {
			//Update the tooltip value
			d3.select("#tooltip")				
				.select("#tooltipLine1")
				.text("Plate: " + d.PLATE)

			d3.select("#tooltip")					
				.select("#tooltipLine2")
				.text(", MJD: " + d.MJD);

			//highlighter dots
			d3.select(LRG1vLRG2).append("circle")
			  		.attr("class", "highlighter")
			   		.attr({
				   		cx: xScaleLRG1vLRG2(d.SUCCESS_LRG1),
				   		cy: yScaleLRG1vLRG2(d.SUCCESS_LRG2),
				   		r: highlightRadius,
				   		fill: highlighterColor1,
				   		stroke: "black",
					});

			d3.select(LRG2vQSO).append("circle")
			  		.attr("class", "highlighter")
			   		.attr({
				   		cx: xScaleLRG2vQSO(d.SUCCESS_LRG2),
				   		cy: yScaleLRG2vQSO(d.SUCCESS_QSO),
				   		r: highlightRadius,
				   		fill: highlighterColor1,
				   		stroke: "black",
					});
			d3.select(SN2_G12vSN2_I12).append("circle")
			  		.attr("class", "highlighter")
			   		.attr({
				   		cx: xScaleSN2_G12vSN2_I12(d.DERED_SN2_G1),
				   		cy: yScaleSN2_G12vSN2_I12(d.DERED_SN2_I1),
				   		r: highlightRadius,
				   		fill: highlighterColor2,
				   		stroke: "black",
					});	
			d3.select(RAvDEC).append("circle")
			  		.attr("class", "highlighter")
			   		.attr({
				   		cx: xScaleRAvDEC(d.RACEN),
				   		cy: yScaleRAvDEC(d.DECCEN),
				   		r: highlightRadius,
				   		fill: highlighterColor1,
				   		stroke: "black",
					});	

	   })
	   .on("click", function(d) {
			//Update the tooltip value
			d3.select("#tooltip")				
				.select("#selectedTooltipLine1")
				.text(" Plate: " + d.PLATE)

			d3.select("#tooltip")					
				.select("#selectedTooltipLine2")
				.text(", MJD: " + d.MJD);
			
	   })
	   .on("mouseout", function() {
			removePlotPointsWithClass(".highlighter");
			
	   });

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	drawRAvDECData(nNodes, "DEREDSN2", filter, goodColoring, badColoring, SN2_GI1color, SN2_GI2color , radius);


	var increments = (h - (2* padding))/3;

    var colorBarScale = d3.scale.linear()
      							.domain([0, increments])
								.range([0, 510]);
	for(var i=0; i< increments; i++){
		d3.select(colorBar).selectAll("ellipse")
		    .data(nNodes)
		    .enter()
		    .append("rect")
		    .attr({
		   		x: 30,
		   		y: function(d) {				   			
		   			return (3*i + padding);
		   		},
		   		width: 20,
		   		height: 5,
		   		fill: function(d){
	   				if(colorBarScale(i) < 255){
	   					return "rgb("+ (255- d3.round(colorBarScale(i))) +","+ (d3.round(colorBarScale(i))) +", 0)";
	   				}else{
						return "rgb(0,"+ (510 - d3.round(colorBarScale(i))) +","+ (d3.round(colorBarScale(i)) - 255) +")";
	   				};
		   			
		   		}
			})
	}

}

function sortAndDrawRAvDECData(columnName){
	d3.select(colorBar).select("#colorAxis").remove();
	d3.select(RAvDEC).selectAll("circle").remove();
	drawRAvDECData(dataset.aaData, columnName);

}



function drawRAvDECData(nNodes, columnName, filter, goodColoring, badColoring, SN2_GI1color, SN2_GI2color , radius){

	//colors
	if(typeof(goodColoring) === "undefined"){ goodColoring = "#5cba57";}
	if(typeof(badColoring) === "undefined"){badColoring = "#f76060";}
	if(typeof(SN2_GI1color) === "undefined"){SN2_GI1color = "#5c69ff";}
	if(typeof(SN2_GI2color) === "undefined"){SN2_GI2color = "#ffa85c";}
	greyedOut = "#c4c4c4";
	highlighterColor1 = "#fffb00"; /*yellow*/
	highlighterColor2 = "#ff00fb"; /*purple*/

	if(typeof(filter) === "undefined"){filter = false;}

	if(typeof(radius) === "undefined"){radius = 2;}
	highlightRadius = radius + 1;
	var nodes = nNodes.sort(function(a, b){ 
    							return d3.descending(a[columnName], b[columnName]); 
    						});

	var Min = d3.min(dataset.aaData, function(d){return d[columnName];});
	var Max = d3.max(dataset.aaData, function(d){return d[columnName];});
	var middle = Min + (Max - Min) / 2;
	//var colors = ["red", "#ff6200", "orange", "#ffcc00","yellow","#bbff00", "#2bff00","#00ff77","#00fbff","#00a6ff","#006eff", "blue"];
	var colorScale = d3.scale.linear()
      							.domain([Min, Max])
      							.range([0, 510]);	
      								/*				 
	var colorScale = d3.scale.linear()
      						.domain([0, 1, 2, 3, 4,5,6,7,8,9,11])
      						.range(colors);
      						*/
	//scatter plot
	d3.select(RAvDEC).selectAll("ellipse")
	    .data(nodes)
	    .enter()
	    .append("circle")
	    .attr("id", function(d) {return "RAvDEC_"+d.PLATE+"_"+d.MJD;})
	    .attr("class", function() {
	  		if(filter){
	  			return "filter";
	  		};
  		})
	    .attr({
	   		cx: function(d) {
	   			var x= xScaleRAvDEC(d.RACEN); 
	   			return x;
	   		},
	   		cy: function(d) {				   			
	   			var y= yScaleRAvDEC(d.DECCEN); 
	   			return y;
	   		},
	   		r: radius,
	   		fill: function(d){
	   			if(filter){
		   			//if(d.MJD<55171){
		   				//return greyedOut;
		   			//}else{
		   				if(d.PLATEQUALITY=="good"){
		   					return goodColoring;
		   				}
		   				else{
		   					return badColoring;
		   				}
		   			//}
	   			}else{
	   				if(d[columnName] < middle){
	   					return "rgb("+ (255- d3.round(colorScale(d[columnName]))) +","+ (d3.round(colorScale(d[columnName]))) +", 0)";
	   				}else{
						return "rgb(0,"+ (510 - d3.round(colorScale(d[columnName]))) +","+ (d3.round(colorScale(d[columnName])) - 255) +")";
	   				};
	   			}
	   		}
		})
	   .on("mouseover", function(d) {
			//Update the tooltip value
			d3.select("#tooltip")					
				.select("#tooltipLine1")
				.text("Plate: " + d.PLATE)

			d3.select("#tooltip")				
				.select("#tooltipLine2")
				.text(", MJD: " + d.MJD);
	   
			//highlighter dots
			d3.select(LRG1vLRG2).append("circle")
			  		.attr("class", "highlighter")
			   		.attr({
				   		cx: xScaleLRG1vLRG2(d.SUCCESS_LRG1),
				   		cy: yScaleLRG1vLRG2(d.SUCCESS_LRG2),
				   		r: highlightRadius,
				   		fill: highlighterColor1,
				   		stroke: "black",
					});


			d3.select(LRG2vQSO).append("circle")
			  		.attr("class", "highlighter")
			   		.attr({
				   		cx: xScaleLRG2vQSO(d.SUCCESS_LRG2),
				   		cy: yScaleLRG2vQSO(d.SUCCESS_QSO),
				   		r: highlightRadius,
				   		fill: highlighterColor1,
				   		stroke: "black",
					});

			d3.select(SN2_G12vSN2_I12).append("circle")
			  		.attr("class", "highlighter")
			   		.attr({
				   		cx: xScaleSN2_G12vSN2_I12(d.DERED_SN2_G2),
				   		cy: yScaleSN2_G12vSN2_I12(d.DERED_SN2_I2),
				   		r: highlightRadius,
				   		fill: highlighterColor1,
				   		stroke: "black",
					});

			d3.select(SN2_G12vSN2_I12).append("circle")
			  		.attr("class", "highlighter")
			   		.attr({
				   		cx: xScaleSN2_G12vSN2_I12(d.DERED_SN2_G1),
				   		cy: yScaleSN2_G12vSN2_I12(d.DERED_SN2_I1),
				   		r: highlightRadius,
				   		fill: highlighterColor2,
				   		stroke: "black",
					});
			
	   })
	   .on("click", function(d) {
			//Update the tooltip  value
			d3.select("#tooltip")					
				.select("#selectedTooltipLine1")
				.text(" Plate: " + d.PLATE)

			d3.select("#tooltip")					
				.select("#selectedTooltipLine2")
				.text(", MJD: " + d.MJD);
			
	   })
	   .on("mouseout", function() {
			removePlotPointsWithClass(".highlighter");
	   });

	var axisScale = d3.scale.linear()
      							.domain([Min, Max])
      							.range([h - padding, padding]);

	colorAxis= d3.svg.axis()
				 .scale(axisScale)
				 .orient("left");

	/*colorBar*/
	d3.select(colorBar).append("g")
	   .attr({
	   		class: "axis",
	   		id: "colorAxis",
	   		transform: "translate(" + (3 * padding) + ",0)",
		})
	   .call(colorAxis);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function changeExistingPlotPointColors(nNodes, gray, goodColoring, badColoring, SN2_GI1color, SN2_GI2color){
	if(typeof(badColoring) === "undefined"){badColoring = "#f76060";}
	if(typeof(SN2_GI1color) === "undefined"){SN2_GI1color = "#5c69ff";}
	if(typeof(SN2_GI2color) === "undefined"){SN2_GI2color = "#ffa85c";}
	greyedOut = "#c4c4c4";
	if(gray){
		d3.select(LRG1vLRG2).selectAll("circle").attr({fill: greyedOut});
		d3.select(LRG2vQSO).selectAll("circle").attr({fill: greyedOut});
		d3.select(SN2_G12vSN2_I12).selectAll("circle").attr({fill: greyedOut});
		d3.select(RAvDEC).selectAll("circle").attr({fill: greyedOut});
	}else{

	for (var d = 0; d < nNodes.length; d++) {
		d3.select("#LRG1vLRG2")
		  .select("#LRG1vLRG2"+"_"+nNodes[d].PLATE+"_"+nNodes[d].MJD)
	      .attr({
			  fill: function(){
				  if(nNodes[d].MJD<55171){
					  return greyedOut;
				  }else{
					  if(nNodes[d].PLATEQUALITY=="good"){
						  return goodColoring;
					  }
					  else{
						  return badColoring;
					  }
				  }
			  }
		  });

		d3.select("#LRG2vQSO")
		  .select("#LRG2vQSO"+"_"+nNodes[d].PLATE+"_"+nNodes[d].MJD)
	      .attr({
			  fill: function(){
				  if(nNodes[d].MJD<55171){
					  return greyedOut;
				  }else{
					  if(nNodes[d].PLATEQUALITY=="good"){
						  return goodColoring;
					  }
					  else{
						  return badColoring;
					  }
				  }
			  }
		  });

		d3.select("#SN2_G12vSN2_I12")
		  .select("#SN2_G12vSN2_I12_"+nNodes[d].PLATE+"_"+nNodes[d].MJD)
	      .attr({
				fill: SN2_GI1color
		  });

		d3.select("#SN2_G12vSN2_I12")
		  .select("#ellipse_SN2_G12vSN2_I12_"+nNodes[d].PLATE+"_"+nNodes[d].MJD)
	      .attr({
				fill: SN2_GI2color
		  });

		d3.select("#RAvDEC")
		  .select("#RAvDEC"+"_"+nNodes[d].PLATE+"_"+nNodes[d].MJD)
	      .attr({
			  fill: function(){
				  if(nNodes[d].MJD<55171){
					  return greyedOut;
				  }else{
					  if(nNodes[d].PLATEQUALITY=="good"){
						  return goodColoring;
					  }
					  else{
						  return badColoring;
					  }
				  }
			  }
		  });
		}
  	}
}

function addFilteredPlotPoints(nNodes, filter, goodColoring, badColoring, SN2_GI1color, SN2_GI2color){
	if(typeof(goodColoring) === "undefined"){ goodColoring = "#5cba57";}
	if(typeof(badColoring) === "undefined"){badColoring = "#f76060";}
	if(typeof(SN2_GI1color) === "undefined"){SN2_GI1color = "#5c69ff";}
	if(typeof(SN2_GI2color) === "undefined"){SN2_GI2color = "#ffa85c";}
	greyedOut = "#c4c4c4";
  	drawData(nNodes, filter, goodColoring, badColoring, SN2_GI1color, SN2_GI2color);

}


function highlightPlots(identifier){
	//colors
	highlighterColor1 = "#fffb00";
	highlighterColor2 = "#ff00fb";

	highlightRadius = 3;

	var xPosition = parseFloat(d3.select("#LRG1vLRG2").select("#LRG1vLRG2"+"_"+identifier).attr("cx")) ;
    var yPosition = parseFloat(d3.select("#LRG1vLRG2").select("#LRG1vLRG2"+"_"+identifier).attr("cy")) ;
	
	d3.select(LRG1vLRG2).append("circle")
  		.attr("class", "highlighter")
   		.attr({
	   		cx: xPosition,
	   		cy: yPosition,
	   		r: highlightRadius,
	   		fill: highlighterColor1,
	   		stroke: "black",
		});

	xPosition = parseFloat(d3.select("#LRG2vQSO").select("#LRG2vQSO"+"_"+identifier).attr("cx")) ;
    yPosition = parseFloat(d3.select("#LRG2vQSO").select("#LRG2vQSO"+"_"+identifier).attr("cy")) ;
	
	d3.select(LRG2vQSO).append("circle")
  		.attr("class", "highlighter")
   		.attr({
	   		cx: xPosition,
	   		cy: yPosition,
	   		r: highlightRadius,
	   		fill: highlighterColor1,
	   		stroke: "black",
		});

	xPosition = parseFloat(d3.select("#SN2_G12vSN2_I12").select("#SN2_G1vSN2_I1_"+identifier).attr("cx")) ;
    yPosition = parseFloat(d3.select("#SN2_G12vSN2_I12").select("#SN2_G1vSN2_I1_"+identifier).attr("cy")) ;
	
	d3.select(SN2_G12vSN2_I12).append("circle")
  		.attr("class", "highlighter")
   		.attr({
	   		cx: xPosition,
	   		cy: yPosition,
	   		r: highlightRadius,
	   		fill: highlighterColor2,
	   		stroke: "black",
		});

	xPosition = parseFloat(d3.select("#SN2_G12vSN2_I12").select("#SN2_G2vSN2_I2_"+identifier).attr("cx")) ;
    yPosition = parseFloat(d3.select("#SN2_G12vSN2_I12").select("#SN2_G2vSN2_I2_"+identifier).attr("cy")) ;
	
	d3.select(SN2_G12vSN2_I12).append("circle")
  		.attr("class", "highlighter")
   		.attr({
	   		cx: xPosition,
	   		cy: yPosition,
	   		r: highlightRadius,
	   		fill: highlighterColor1,
	   		stroke: "black",
		});


	xPosition = parseFloat(d3.select("#RAvDEC").select("#RAvDEC"+"_"+identifier).attr("cx")) ;
    yPosition = parseFloat(d3.select("#RAvDEC").select("#RAvDEC"+"_"+identifier).attr("cy")) ;
	
	d3.select(RAvDEC).append("circle")
  		.attr("class", "highlighter")
   		.attr({
	   		cx: xPosition,
	   		cy: yPosition,
	   		r: highlightRadius,
	   		fill: highlighterColor1,
	   		stroke: "black",
		});

}

function removePlotPointsWithClass(className){
	d3.select(LRG1vLRG2).selectAll(className).remove();
	d3.select(LRG2vQSO).selectAll(className).remove();
	d3.select(SN2_G12vSN2_I12).selectAll(className).remove();
	d3.select(RAvDEC).selectAll(className).remove();
}
