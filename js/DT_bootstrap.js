/* Set the defaults for DataTables initialisation */
$.extend( true, $.fn.dataTable.defaults, {
	"sDom": "<'row'<'col-lg-6'l><'col-lg-6'f>r>t<'row'<'col-lg-6'i><'col-lg-6'p>>",
	"sPaginationType": "bootstrap",
	/*"sPaginationType": "full_numbers",*/
	"iDisplayLength": 5000,  /*default number of rows*/
	"oLanguage": {
	"sLengthMenu": "_MENU_ records per page"
	}
} );



/* Default class modification */
$.extend( $.fn.dataTableExt.oStdClasses, {
	"sWrapper": "dataTables_wrapper form-inline"
} );
 
 
/* API method to get paging information */
$.fn.dataTableExt.oApi.fnPagingInfo = function ( oSettings )
{
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

/* Bootstrap style pagination control */
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
                '<ul>' +
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



$(document).ready(function() {
	$('#example').dataTable( {
		"sScrollY": "200px",
		"bPaginate": false
	} );
} );

$(document).ready(function() {
	oTable = $('#project_table').dataTable( {
		"sDom": "<'row'<'col-lg-6'f><'col-lg-6'l>r>t<'row'<'col-lg-6'i><'col-lg-6'p>>",
		"sPaginationType": "bootstrap",
		"bPaginate": true,
		"bLengthChange": false,
		"bDeferRender": true, /*defers rendeing till after.. what?*/
		"bFilter": true,
		"bSort": true,
		"bInfo": false,
		"bAutoWidth": false,
		"bSortClasses": false,
		"bProcessing": true,
		/*
		"sAjaxSource": "platelist_original.txt",
        "aoColumns": [
			{ "mData": "PLATE" },
			{ "mData": "TILEID" },
			{ "mData": "MJD" },
			{ "mData": "RUN2D" },
			{ "mData": "RUN1D" },
			{ "mData": "RACEN" },
			{ "mData": "DECCEN" },
			{ "mData": "EPOCH" },
			{ "mData": "CARTID" },
			{ "mData": "TAI" },
			{ "mData": "TAI_BEG" },
			{ "mData": "TAI_END" },
			{ "mData": "AIRMASS" },
			{ "mData": "EXPTIME" },
			{ "mData": "MAPNAME" },
			{ "mData": "SURVEY" },
			{ "mData": "PROGRAMNAME" },
			{ "mData": "CHUNK" },
			{ "mData": "PLATEQUALITY" },
			{ "mData": "PLATESN2" },
			{ "mData": "DEREDSN2" },
			{ "mData": "QSURVEY" },
			{ "mData": "MJDLIST" },
			{ "mData": "NEXP" },
			{ "mData": "NEXP_B1" },
			{ "mData": "NEXP_B2" },
			{ "mData": "NEXP_R1" },
			{ "mData": "NEXP_R2" },
			{ "mData": "EXPT_B1" },
			{ "mData": "EXPT_B2" },
			{ "mData": "EXPT_R1" },
			{ "mData": "EXPT_R2" },
			{ "mData": "SN2_G1" },
			{ "mData": "SN2_R1" },
			{ "mData": "SN2_I1" },
			{ "mData": "SN2_G2" },
			{ "mData": "SN2_R2" },
			{ "mData": "SN2_I2" },
			{ "mData": "DERED_SN2_G1" },
			{ "mData": "DERED_SN2_R1" },
			{ "mData": "DERED_SN2_I1" },
			{ "mData": "DERED_SN2_G2" },
			{ "mData": "DERED_SN2_R2" },
			{ "mData": "DERED_SN2_I2" },
			{ "mData": "GOFFSTD" },
			{ "mData": "GRMSSTD" },
			{ "mData": "ROFFSTD" },
			{ "mData": "RRMSSTD" },
			{ "mData": "IOFFSTD" },
			{ "mData": "IRMSSTD" },
			{ "mData": "GROFFSTD" },
			{ "mData": "GRRMSSTD" },
			{ "mData": "RIOFFSTD" },
			{ "mData": "RIRMSSTD" },
			{ "mData": "GOFFGAL" },
			{ "mData": "GRMSGAL" },
			{ "mData": "ROFFGAL" },
			{ "mData": "RRMSGAL" },
			{ "mData": "IOFFGAL" },
			{ "mData": "IRMSGAL" },
			{ "mData": "GROFFGAL" },
			{ "mData": "GRRMSGAL" },
			{ "mData": "RIOFFGAL" },
			{ "mData": "RIRMSGAL" },
			{ "mData": "NGUIDE" },
			{ "mData": "SEEING20" },
			{ "mData": "SEEING50" },
			{ "mData": "SEEING80" },
			{ "mData": "RMSOFF20" },
			{ "mData": "RMSOFF50" },
			{ "mData": "RMSOFF80" },
			{ "mData": "AIRTEMP" },
			{ "mData": "XSIGMA" },
			{ "mData": "XSIGMIN" },
			{ "mData": "XSIGMAX" },
			{ "mData": "WSIGMA" },
			{ "mData": "WSIGMIN" },
			{ "mData": "WSIGMAX" },
			{ "mData": "XCHI2" },
			{ "mData": "XCHI2MIN" },
			{ "mData": "XCHI2MAX" },
			{ "mData": "SKYCHI2" },
			{ "mData": "SCHI2MIN" },
			{ "mData": "SCHI2MAX" },
			{ "mData": "FBADPIX" },
			{ "mData": "FBADPIX1" },
			{ "mData": "FBADPIX2" },
			{ "mData": "N_TOTAL" },
			{ "mData": "N_GALAXY" },
			{ "mData": "N_QSO" },
			{ "mData": "N_STAR" },
			{ "mData": "N_UNKNOWN" },
			{ "mData": "N_SKY" },
			{ "mData": "N_TARGET_MAIN" },
			{ "mData": "N_TARGET_LRG1" },
			{ "mData": "N_TARGET_LRG2" },
			{ "mData": "N_TARGET_QSO" },
			{ "mData": "SUCCESS_MAIN" },
			{ "mData": "SUCCESS_LRG1" },
			{ "mData": "SUCCESS_LRG2" },
			{ "mData": "SUCCESS_QSO" },
			{ "mData": "STATUS2D" },
			{ "mData": "STATUSCOMBINE" },
			{ "mData": "STATUS1D" },
			{ "mData": "PUBLIC" },
			{ "mData": "QUALCOMMENTS" },	
		]
		*/
	} );
	
	 /*Add a click handler to the rows - this could be used as a callback */
    $("#project_table tbody tr").click( function( e ) {
        if ( $(this).hasClass('row_selected') ) {
            $(this).removeClass('row_selected');
        }
        else {
            oTable.$('tr.row_selected').removeClass('row_selected').removeClass('warning');
            $(this).addClass('row_selected');
			$(this).addClass('warning');
		    $('.btn-project').removeAttr("disabled");   
		
        }
    });
} );

			


