<?php

/*
 * DataTables example server-side processing script.
 *
 * Please note that this script is intentionally extremely simply to show how
 * server-side processing can be implemented, and probably shouldn't be used as
 * the basis for a large complex system. It is suitable for simple use cases as
 * for learning.
 *
 * See http://datatables.net/usage/server-side for full details on the server-
 * side processing requirements of DataTables.
 *
 * @license MIT - http://datatables.net/license_mit
 */

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Easy set variables
 */

// DB table to use
$table = 'middelfart_save.eksternvisning';

// Table's primary key
$primaryKey = 'irowid';

// Array of database columns which should be read and sent back to DataTables.
// The `db` parameter represents the column name in the database, while the `dt`
// parameter represents the DataTables column identifier. In this case object
// parameter names
$columns = array(
	array( 'db' => 'adresse','dt' => 0 ),
	array( 'db' => 'ejendomsnummer','dt' => 1 ),
	array( 'db' => 'bygningsnummer','dt' => 2 ),
	array( 'db' => 'bevaring','dt' => 3 ),
  array( 'db' => 'ok','dt' => 4 ),
  array( 'db' => 'registrator','dt' => 5 ),
  array( 'db' => 'date','dt' => 6 ),
  array( 'db' => 'irowid','dt' => 7 )
);

// SQL server connection information
$sql_details = array(
	'user' => 'postgres',
	'pass' => '1234',
	'db'   => 'mobreg',
	'host' => '127.0.0.1'
);



/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * If you just want to use the basic configuration for DataTables with PHP
 * server-side, there is no need to edit below this line.
 */
require( 'ssp.class.php' );

echo $_GET['callback'].'('.json_encode(
	SSP::simple($_GET, $sql_details, $table, $primaryKey, $columns )
).');';

