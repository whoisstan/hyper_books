<?php

/* Start session and load library. */
require_once('twitteroauth/twitteroauth.php');
require_once('lib.php');
require_once('config.php');


/* Build TwitterOAuth object with client credentials. */
$connection = new TwitterOAuth(CONSUMER_KEY, CONSUMER_SECRET);
 
/* Get temporary credentials. */
$request_token = $connection->getRequestToken(OAUTH_CALLBACK);

/* Save temporary credentials to session. */
$_SESSION['oauth_token'] = $token = $request_token['oauth_token'];
$_SESSION['oauth_token_secret'] = $request_token['oauth_token_secret'];
 
/* If last connection failed don't display authorization link. */
switch ($connection->http_code) {
  case 200:
    /* Build authorize URL and redirect user to Twitter. */
    header('Location: ' . $connection->getAuthorizeURL($token)); 
	break;
  default:
	//STAN COMMENT: Needs to go to error URL
    header('Location: index.html?error_please_replaceA' ); 
}

?>
