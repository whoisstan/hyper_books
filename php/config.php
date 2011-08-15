<?php
session_start();

define('CONSUMER_KEY', '');
define('CONSUMER_SECRET', '');
define('OAUTH_CALLBACK',"http://localhost/hyper_books/php/callback.php");

$dbCredentials = array('host' => 'localhost', 'username' => 'root', 'password' => '', 'db'=> 'hyper_books');
define('OAUTH_CALLBACK',"http://localhost/hyper_books/php/callback.php");


$link = mysql_connect($dbCredentials['host'],$dbCredentials['username'],$dbCredentials['password']);

if (!$link) {
	error_to_client("DB Error [Connect] " . mysql_error());
	exit(1);
}	
else if (!mysql_select_db($dbCredentials['db'], $link)) {
	error_to_client("DB Error [SelectDB] - " . mysql_error());
	exit(1);			
}

$result = mysql_query('CREATE TABLE IF NOT EXISTS twitter_tokens (session_id varchar(140) PRIMARY KEY, value varchar(255),created_at DATETIME);');
if (!$result) {
    error_to_client('Invalid query: ' . mysql_error());
	exit(1);
}

$result = mysql_query('CREATE TABLE IF NOT EXISTS book_configurations ( id INT AUTO_INCREMENT, book_id VARCHAR(100) NOT NULL, page_css_crc32 INT NOT NULL, page_css VARCHAR(1000) NOT NULL, chapter_css_crc32 INT NOT NULL, chapter_css VARCHAR(1000) NOT NULL, pages_array text NOT NULL,chapter_json text NOT NULL, created_at DATETIME NOT NULL, PRIMARY KEY (id), UNIQUE KEY book_configurations_key (book_id,page_css_crc32,chapter_css_crc32) );');
if (!$result) {
    error_to_client('Invalid query: ' . mysql_error());
	exit(1);
}

?>