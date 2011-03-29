<?php

/* Load required lib files. */
session_start();
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
	$status = $connection->get('account/verify_credentials');

	
	/* If last connection failed don't display authorization link. */
	if ($connection->http_code==200 && strpos($status,'screen_name')>0) {
   	
	    echo success_to_client("");
	}
	else if ($connection->http_code==401 ) {
   	
	    echo error_to_client("need_token");
	}	
	else
	{
		echo error_to_client("general");
	}
}

?>