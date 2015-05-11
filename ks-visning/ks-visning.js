

$(window).load(function() {
 
  var table = $('#example').dataTable({
    'processing': true,
    'paging': true,
    'pagingType': 'full_numbers', //full
    'serverSide': true,
    'ajax': 
      {
        url:'http://beta.mygeocloud.cowi.webhouse.dk/apps/custom/datatables/jsonp.php',
        'dataType':'jsonp'
      },
    'columnDefs': 
    [
      {
        "render": function (data, type, row) {
        return '<a href="http://mobreg.cowi.webhouse.dk/dk/middelfart/ks/intern_visning_ks.htm?rowid='+ row[7]+'">Link</a>';
      },
        "targets": 7
      },
      {
        "render": function (data, type, row) {
          if (row[4] == "1") {
            return 'ja';
          } else {
            return 'nej';
          }
        },
          "targets": 4
      }
    ],
    "dom": 'T<"clear">lfrtip',
    "tableTools": {
      "sSwfPath": "http://beta.mygeocloud.cowi.webhouse.dk/apps/custom/datatables/copy_csv_xls_pdf.swf"
    },
    "lengthMenu": [ [10, 25, 50,100,500,1000, -1], [10, 25, 50,100,500,1000, "All"] ],
    "aoSearchCols": [
      null,
      null,
      null,
      null,
      { "sSearch": "0"},
      null,
      { "sSearch": "2015"}
    ],
    responsive: true
  }); 
  
  $('#example thead th').each( function () {
    
    var title = $('#example thead th').eq( $(this).index() ).text();
    
    if (title != "Link" && title!="KS" && title!="Bevaring" && title!="Dato"){
      $(this).html( '<input type="text" placeholder="Søg" /><br/>'+title );
    }
    if (title=="KS"){
      $(this).html( '<select><option value=""></option><option value="1">Ja</option><option value="0" selected>Nej</option></select><br/>'+title );
    }
    if (title=="Bevaring"){
      $(this).html( '<select><option value="">Alle</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option></select><br/>'+title );
    }
    if (title=="Dato"){
      $(this).html(  '<input type="text" placeholder="Søg" value="2015" /><br/>'+title  );
    }
  });
 
  // DataTable
  //var table = $('#example').DataTable();

  // Apply the search
  table.columns().eq( 0 ).each( function ( colIdx ) {
    $( 'input', table.column( colIdx ).header() ).on( 'keyup change', function () {
      table
        .column( colIdx )
        .search( this.value )
        .draw();
    } );

    $( 'select', table.column( colIdx ).header() ).on( 'change', function () {
      table
        .column( colIdx )
        .search( this.value )
        .draw();
    } );

    $('input', table.column(colIdx).header()).on('click', function(e) {
        e.stopPropagation();
    });

    $('select', table.column(colIdx).header()).on('click', function(e) {
        e.stopPropagation();
    });
  });

  $("#example_filter").hide();

});
