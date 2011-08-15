<?php
/**
 * @file
 * Take the user when they return from Twitter. Get access tokens.
 * Verify credentials and redirect to based on response from Twitter.
 */

/* Start session and load lib */
require_once('twitteroauth/twitteroauth.php');
require_once('config.php');
require_once('lib.php');

/* Create TwitteroAuth object with app key/secret and token key/secret from default phase */
$connection = new TwitterOAuth(CONSUMER_KEY, CONSUMER_SECRET, $_SESSION['oauth_token'], $_SESSION['oauth_token_secret']);

/* Request access tokens from twitter */
$access_token = $connection->getAccessToken($_GET['oauth_verifier']);


/* Save the access tokens. Normally these would be saved in a database for future use. */
set_access_token($access_token);

/* Remove no longer needed request tokens */
unset($_SESSION['oauth_token']);
unset($_SESSION['oauth_token_secret']);


/* If HTTP response is 200 continue otherwise send to connect page to retry */
if (200 == $connection->http_code) {	
    header('Location: ../mobile.php?twitter_success'); 
} else {

    header('Location: ../index.html?twitter_error' ); 

}

?>
