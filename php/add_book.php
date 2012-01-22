<?php

require_once('lib.php');
require_once('config.php');


$result = mysql_query(sprintf("INSERT INTO book_configurations (book_id,page_css_crc32,page_css,chapter_css_crc32,chapter_css,pages_array,chapter_json,created_at) VALUES ('%s',crc32('%s'),'%s',crc32('%s'),'%s','%s','%s',now())   ON DUPLICATE KEY UPDATE book_id=book_id;",
	mysql_real_escape_string($_POST['book_id']),
	mysql_real_escape_string($_POST['page_css']),
	mysql_real_escape_string($_POST['page_css']),	
	mysql_real_escape_string($_POST['chapter_css']),
	mysql_real_escape_string($_POST['chapter_css']),
	mysql_real_escape_string($_POST['pages_array']),
	mysql_real_escape_string($_POST['chapter_json'])	
	));



if (!$result) {
    $message  = 'Invalid query: ' . mysql_error() . "\n";
    $message .= 'Whole query: ' . $query;
    die($message);
}

?>

