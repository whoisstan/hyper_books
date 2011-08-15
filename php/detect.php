<?php

if( (strpos($_SERVER['HTTP_USER_AGENT'],'Android')!=false ||  strpos($_SERVER['HTTP_USER_AGENT'],'android')!=false || strpos($_SERVER['HTTP_USER_AGENT'],'iPhone')!=false || strpos($_SERVER['HTTP_USER_AGENT'],'iPad')!=false || strpos($_SERVER['HTTP_USER_AGENT'],'iPod')!=false) && strpos($_SERVER['REQUEST_URI'],'book.php')==false)
{
	header('Location: book.php');	
	exit(1);
}
elseif (!(strpos($_SERVER['HTTP_USER_AGENT'],'Android')!=false || strpos($_SERVER['HTTP_USER_AGENT'],'android')!=false || strpos($_SERVER['HTTP_USER_AGENT'],'iPhone')!=false || strpos($_SERVER['HTTP_USER_AGENT'],'iPad')!=false || strpos($_SERVER['HTTP_USER_AGENT'],'iPod')!=false) & strpos($_SERVER['REQUEST_URI'],'index.php')==false)
{
	header('Location: index.php');
	exit(1);	
}

?>