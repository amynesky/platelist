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
   		//if ($(this).val().length < 3 && e.keyCode != 13) return;	
       	if(e.keyCode == 13) {
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
			{ "mData": "RACEN" ,"bSearchable": false, "sWidth": "40px"}, /*5*/
			{ "mData": "DECCEN" ,"bSearchable": false, "sWidth": "65px"},
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
	
			var dataset;
			d3.json("data/platelist_original.json", function(error, json){
				if(error){
					console.log(error);
				}else{
					dataset = json;
					//console.log(dataset);

					//Width and height
					var w = 600;
					var h = 600;

					//Create SVG element
					var svg = d3.select("body")
								.append("svg")
								.attr({
									width: w,
									height: h,
								});
								
					//scatter plot
					svg.selectAll("circle")
					    .data(dataset.aaData)
					    .enter()
					    .append("circle")
					    .attr({
					   		cx: function(d) {
					   			var x= d.SUCCESS_LRG1 *5; 
					   			//console.log(x);
					   			return x;
					   		},
					   		cy: function(d) {				   			
					   			var y= h - d.SUCCESS_LRG2*5; 
					   			//console.log(""+ y); 
					   			return y;
					   		},
					   		r: 3,
						});
				}
			});
	
} );

	

			


