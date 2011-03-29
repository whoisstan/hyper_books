<?php


function get_access_token()
{
	$result = mysql_query("SELECT value FROM twitter_tokens where session_id='".mysql_escape_string($_COOKIE["_ID_"])."';");
	if ($result) 
	{
		$row = mysql_fetch_assoc($result);
		if($row)
		{
			return unserialize($row['value']);
		}
	}
	return false;

}

function set_access_token($value)
{
	$result = mysql_query("INSERT INTO twitter_tokens (session_id,value,created_at) VALUES('".mysql_escape_string(session_id())."','".mysql_escape_string(serialize($value))."',now()) on DUPLICATE KEY UPDATE value='".mysql_escape_string(serialize($value))."'");
	setcookie("_ID_", session_id(), time()+3600*24*7); //1 week
	if (!$result) {
	    error_to_client('Invalid query: ' . mysql_error());
		exit(1);
	}	
}



function error_to_client($message)
{
	echo json_encode(array ('status'=>'error','message'=>$message));
	error_log($message);
}	

function success_to_client($message)
{
	echo json_encode(array ('status'=>'success','message'=>$message));

}

?>