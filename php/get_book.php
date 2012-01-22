<?php
require_once('lib.php');
require_once('config.php');

$result = mysql_query(sprintf("select pages_array,chapter_json from book_configurations where book_id='%s' and page_css='%s' and chapter_css='%s';",mysql_real_escape_string($_POST['book_id']),mysql_real_escape_string($_POST['page_css']),mysql_real_escape_string($_POST['chapter_css'])));

if ($row = mysql_fetch_assoc($result))
{
	echo json_encode(array('pages_array'=>$row['pages_array'],'chapter_json'=>$row['chapter_json']));
}
else
{
	echo "{}";
}

?>