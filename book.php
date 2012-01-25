<html manifest='build.manifest'>
	<head>
		<title>Hyper Books</title>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<meta name="apple-mobile-web-app-capable" content="yes">
		<meta name="apple-mobile-web-app-status-bar-style" content="black" />
		<meta name="viewport" content="initial-scale=1.0;maximum-scale=1.0;user-scalable=no;width=device-width">

		<link rel="apple-touch-icon-precomposed" href="images/touch-icon-precomposed.png" />
		<link rel="apple-touch-icon-precomposed" sizes="72x72" href="images/touch-icon-72-precomposed.png" />
		<link rel="apple-touch-icon-precomposed" sizes="114x114" href="images/touch-icon-114-precomposed.png" />
		<link rel="apple-touch-icon" href="images/touch-icon-precomposed.png">

		<link rel="apple-touch-startup-image" href="images/startup.png">	
		<link rel="apple-touch-startup-image" sizes="640x960" href="img/startup-640x960.png" />	

        <link rel="stylesheet" href="dist/style/all.css" type="text/css" media="screen" title="no title" charset="utf-8">
		<script type="text/javascript" src="dist/js/jquery.js"></script>

			
			
		<script>
			function addResourceElements(cached)
			{
				var head = document.getElementsByTagName("head")[0];         
				var cssNode = document.createElement('link');
				cssNode.type = 'text/css';
				cssNode.rel = 'stylesheet';
				cssNode.href = 'dist/style/all.css';
				cssNode.media = 'screen';
				head.appendChild(cssNode);	
				
				var newScript = document.createElement('script');
				newScript.type = 'text/javascript';
				newScript.src = 'dist/js/all.build.js';
				head.appendChild(newScript);		
				

			}
			window.onload=function()
			{
				if (window.applicationCache.status==window.applicationCache.UPDATEREADY)
				{
					window.applicationCache.update();
					window.applicationCache.swapCache();
					addResourceElements();
					window.location.reload();
				}
				else
				{
					addResourceElements();
				}	
			}
		</script>
	</head>
	<body class="width">
		<div id='bar' class="width">
		<div class='top'><div id='home' class='button'>Library</div><div id='hide_bar' class='button'>Back</div>		
		<div style='clear:both'></div><div  class='title'>Book Title</div><div  class='authors'>Book Title</div>
		</div>		
		<div class="menu"><div class="menu_buttons"><div class='menu_button selected' target='locations'>Chapters</div><div class='menu_button selected' target='more_options'>Options</div></div><div class="menu_panels width">
		<ul id='locations' class='menu_panel width' ></ul>
		<ul id='more_options' class='menu_panel width' ></ul></div></div><br/></div>
		<div id='line' ></div><div id='splash' class="panel"><img src="images/startup.png" ></div>	
		<div id='rotate'  ><canvas width="355" height="181"></canvas></div>
		<div id='loading' class="panel"><div style="padding-top:20px"><div class='cover'>
		<h1 class="title"></h1>by<h3 class="authors"></h3><br/></div></div><div id="cover_message" class="width"></div><div id="help" class="width">Touch to flip through the book. <br/>Touch + Hold for menu.</div>		
		</div>	<div id='deck' class="panel"></div>		<div id='all_books' class="panel width"><div class="menu"><div class="menu_buttons" >
		<canvas width="100" height="100" id='logo'></canvas><div class='menu_button selected' target='my_books'>My Books</div><div class='menu_button' target='available_for_download'>Download Books</div><div style="clear:both"></div>
		</div><div class="menu_panels width"><ul  id='my_books' class='menu_panel width' style='left:0px;z-index:100;'></ul>
		<ul  id='available_for_download' class='menu_panel width' ><div class="menu"><div class="menu_buttons"><div class='menu_button' target='available_for_download_en'>English</div><div class='menu_button' target='available_for_download_de'>Deutsch</div></div>
		<div class="menu_panels width"><ul  id='available_for_download_en' class='menu_panel width' ></ul><ul  id='available_for_download_de' class='menu_panel width' ></ul>	</ul></div></div></div><script>setTimeout(function(){window.scroll(0,1)},10);</script>

	</body>
	
</html>