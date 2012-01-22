<?php

/* Load required lib files. */

require_once('twitteroauth/twitteroauth.php');
require_once('config.php');
require_once('lib.php');

$access_token = get_access_token();

header ("Content-Type:text/xml"); 
/* If access tokens are not available redirect to connect page. */
if (!isset($access_token)) {
    error_to_client("no access token available, need to connect");
}
else
{
	/* Create a TwitterOauth object with consumer/user tokens. */
	$connection = new TwitterOAuth(CONSUMER_KEY, CONSUMER_SECRET, $access_token['oauth_token'], $access_token['oauth_token_secret']);

	$connection->format='xml';
	$status = $connection->post('statuses/update', array('status' => str_replace("\\","",$_POST['message'])));
	
	
	/* If last connection failed don't display authorization link. */
	switch ($connection->http_code) {
	  case 200:    	
	    echo success_to_client("");
		break;
	  default:
		//STAN COMMENT
		error_log($status);
		if(isset($status)  )
		{			
			echo error_to_client("error happened while posting an tweet.");			
		}
		else
		{
			echo error_to_client("error happened while posting an tweet");			
		}
		
	}
}

?>