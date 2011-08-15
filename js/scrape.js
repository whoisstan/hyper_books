if (phantom.state.length === 0) {
    if (phantom.args.length !== 1) {
        console.log('Usage: scrape.js URL ');
        phantom.exit();
    } else {
		
		phantom.state = 'scrape';
		phantom.viewportSize.width=100;
        open(phantom.args[0]);
		
    }
} else {
	
	if(phantom.state!='scrape')
	{
		var childs=document.getElementById('gutenb').childNodes;
	    for (var i = 0; i < childs.length; ++i) {
		    if(childs[i].nodeName=='H3')
			{
				console.log("\n\n<div class='chapter_title'>"+childs[i].innerHTML.replace(/[»«]/g,'"').replace(/&amp;/g,"&")+"</div>\n\n");
			}
			else if(childs[i].nodeName=='P')
			{
				console.log(childs[i].innerHTML.replace(/[»«]/g,'"').replace(/&amp;/g,"&").replace(/<a[^>]+><\/a>/g,"")+"\n");
			}
        
	    }
		phantom.state++;
		if(phantom.state>document.getElementById('chapters').options.length)
		{
			phantom.exit();
		}
		else
		{
			open(phantom.args[0].replace(/\/\d+$/,"/"+phantom.state));		
		}	
	}
	else
	{	
		phantom.state=1;		
		open(phantom.args[0].replace(/\/\d+$/,"/"+phantom.state));
	}

}

function open(url)
{
	
    phantom.viewportSize = { width: 600, height: 600 };
    phantom.open(url);
}