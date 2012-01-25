var txt_processor=function(){
	
	var pub={};
	
	pub.process=function(settings)
	{		

		var book=settings.book;
		var content=settings.content;

		var phantom_page=settings.phantom_page;
		var max_height=settings.max_height;
		var treshold=settings.treshold;
		var amount_of_words_per_load_initial=settings.amount_of_words_per_load_initial;
		var amount_of_words_per_load=settings.amount_of_words_per_load;
		var processing_chunk_size=settings.processing_chunk_size;
		var success_callback=settings.success_callback;
		var progress_callback=settings.progress_callback;	

		var html="",last_html="",last_content="";
		var total_length=content.length;	
		var content_length=total_length;

		var _content=content.substring(0,processing_chunk_size);
		var _next=content.substring(processing_chunk_size);

		var regex=/[\,\;\s\.\!\?\"\)]+/;
		var chapter_regex=/<div class='chapter_title'\>(.+)\<\/div\>/;

		var cut,space_sep,chapter_sep,sep;
	
		var _amount_of_words_per_load=amount_of_words_per_load_initial;

		paginate();
	
	
		function paginate()
		{	
			for(var i=0; i<_amount_of_words_per_load;i++)
			{
			
				if(_content.length<420 && _next!="")
				{
						_content+=_next.substring(0,processing_chunk_size);
						_next=_next.substring(processing_chunk_size);
						sep=_next.indexOf("<br>");
						if(sep!=-1)
						{
							_content+=_next.substring(0,sep);
							_next=_next.substring(sep);						
						}					

				}
						
				space_sep=_content.match(regex);
				chapter_sep=_content.match(chapter_regex);	
			
				if(space_sep!=null || chapter_sep!=null)
				{
					sep=space_sep;
					if(chapter_sep!=null && chapter_sep.index<space_sep.index)
					{
						sep=chapter_sep;
						book.chapters[book.chapters.length]=[book.content.length,sep[1].replace(/\"/g,"&quot;")]
					}

					last_content=_content;
					last_html=phantom_page.innerHTML;

					phantom_page.innerHTML+=_content.substring(0,sep.index+sep[0].length);
				
					_content=_content.substring(sep.index+sep[0].length);
					content_length=content_length-sep.index-sep[0].length;

				
					if(phantom_page.offsetHeight>max_height)
					{		

							if(chapter_sep!=null && chapter_sep.index<space_sep.index)
							{
								book.chapters.pop();
							}
						
							progress_callback(100-(content_length*100/total_length).toFixed(0));
							book.content[book.content.length]=last_html;
							_content=last_content;
							phantom_page.innerHTML="";							

						
							space=_content.match(/^(<br>)+/);
							if(space)
							{
								_content=_content.substring(space[0].length);
							}


							cut=_content.indexOf('<');
							if(cut!=-1 && cut<treshold)
							{
								phantom_page.innerHTML=_content.substring(0,cut);								
								_content=_content.substring(cut);																
							}
							else
							{
								phantom_page.innerHTML=_content.substring(0,treshold*0.6);								
								_content=_content.substring(treshold*0.6);				
							}							
						
	
																		
					  }				
				}
				else if(_next=="")			
				{
						if(!_content.match(/^\s+$/))
						{
							phantom_page.innerHTML+=_content;
							book.content[book.content.length]=phantom_page.innerHTML;
						}
						content="";	
						content_length=0;	
						success_callback(book);
						return;
				}	
	
			}
			_amount_of_words_per_load=amount_of_words_per_load;
			if(content_length<1)
			{
				success_callback(book);
			}
			else
			{
				setTimeout(paginate,10);	
			}
		}	
	};
	return pub;
};