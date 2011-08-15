<?php
/**
 * @file
 * Clears PHP sessions and redirects to the connect page.
 */
 
/* Load and clear sessions */

require_once('config.php');
require_once('lib.php');

session_start();
session_destroy();
setcookie("_ID_", "", time()-3600); //delete cookie
 
header ("Content-Type:text/xml"); 
echo success_to_client("logged out");

?>
