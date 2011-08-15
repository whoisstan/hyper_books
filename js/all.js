var current_book=0;
var current_page,next_page,previous_page;
var page_width=0;
var new_page=0;


$(document).ready(function(){

	
	page_width=$('body').width();

	page_height=document.body.clientHeight;
	
	
	if(navigator.userAgent.match(/iPhone/i))
	{
		if(window.navigator.standalone==true)
		{
			page_height=460
		}
		else
		{
			page_height=416;			
		}
		$('body').css('min-height',page_height+"px");
	}
	$('#bar').css('min-height',page_height+"px");


	//media queries don't work everyhwhere to detect orientation
	var old_orientation=-1;
	setInterval(function (){
		if(old_orientation!=window.orientation)
		{old_orientation=window.orientation;
			if(window.orientation==90 || window.orientation==-90){window.scrollTo(0, 1);$('#rotate').show();}
			else{$('#rotate').hide();window.scrollTo(0,1);}}
			},300);
	
	var next_panel_delay=0;
	if(typeof(window.navigator.standalone)!='undefined' && window.navigator.standalone==false && localStorage.getItem("splash")==null)
	{
		localStorage.setItem("splash",true);
		show_panel('#splash');
		next_panel_delay=1000;			
	}
	else
	{
		show_panel('#splash');
		next_panel_delay=500;
	}	
		
	
	$('#loading').bind('touchstart click',function(e){e.preventDefault();})
	$('#deck').bind('click',click).bind('touchstart',touchstart).bind('touchmove',touchmove).bind('touchend',touchend);		
	$('#home').bind('touchstart click',function(e){show_library();e.preventDefault();});
	$('#hide_bar').bind('touchstart click',function(e){show_book_navigation_bar(false);e.preventDefault();})
	$('#line').bind('touchstart click',function(e){show_book_navigation_bar(true);e.preventDefault();});
	$('.menu_button').bind("click  touchstart",function(e){select_menu_item($(this).parent().parent(),$(this))});
	
    draw_logo($('#logo')[0].getContext("2d"));
    draw_rotate($('#rotate canvas')[0].getContext("2d"));	

	book_storage.init_storage(
		function() {
			
			
			//init storage with list of books
			for (var id in conf.book_list) { book_storage.add_book(id,conf.book_list[id],function(){console.log('book added')},handle_fatal_error); }
			//has the user already started a book
			book_storage.get_current_book(
				function(book){
					if(book!=null)
					{		
						//setTimeout(show_library,next_panel_delay);
						
						//setTimeout(show_library,next_panel_delay);	
						setTimeout(function(){display_book(book);},next_panel_delay);
					}
					else
					{
						setTimeout(show_library,next_panel_delay);								
					}
				},
			handle_fatal_error
			);										
		},
		handle_fatal_error);
	});
	
	//*****************************************
	//Iniate system to display the given book
	//*****************************************	
	function display_book(book)
	{	
		document.getElementById('deck').innerHTML="<div id='prev' class='page'></div><div id='current' class='page'></div><div id='next' class='page'></div>";

		//global static element references for performance
		current_page=document.getElementById('current');
		next_page=document.getElementById('next');
		previous_page=document.getElementById('prev');

		current_page.addEventListener( 'webkitTransitionEnd', function(){set_content(new_page);}, false );
		
		current_book=book;		
		current_book.pages_length=current_book.content.length;		
		var styles=current_book.page_css.split(';');
		
		// //give more top spacing in standalone mode
		// if(window.navigator.standalone!='undefined' && window.navigator.standalone==true);
		// {
		// 	styles.push('padding-top:5px !important');
		// }
				
		for(var member in styles)
		{
			style=styles[member].split(":");
			current_page.style[style[0]]=style[1];
			previous_page.style[style[0]]=style[1];
			next_page.style[style[0]]=style[1];
		}	
		goto_page(book.current_page,true);
		show_panel('#deck');	
	}
	//*****************************************
	//Show hide the nav bar when reading a book
	//*****************************************
	function show_book_navigation_bar(show)
	{
		if(show)
		{
			$('#line').addClass('in_bar');
			
			$('#locations').html('');
			$('#bar .title').html(current_book.title);			
			$('#bar .authors').html(current_book.authors.join(","));			
			$('#locations').append("<li page='0'>Cover</li>");
			for(var chapter in current_book.chapters)
			{
				$('#locations').append("<li page='"+current_book.chapters[chapter][0]+"'>"+current_book.chapters[chapter][1]+"</li>");
			}
			$('#locations').append("<li page='"+(current_book.pages_length-1)+"'>Last Page</li>");
			
			$('#locations li').click(function(){goto_page(parseInt($(this).attr('page')),true);$('#locations').html('');});

			
			
			$('#more_options').html("");
			$('#more_options').attr('book_id',current_book.id);
			$('#more_options').append("<li><div class='button remove' style='margin-right:5px;'>Remove Book</div></li>");
			
			if(conf.book_list[current_book.id].purchase_links && conf.book_list[current_book.id].purchase_links.amazon)
			{
				$('#more_options').append("<li ><div class='button amazon' url='"+conf.book_list[current_book.id].purchase_links.amazon+"' style='margin-right:5px;'>Buy on Amazon</div></li>");
			}
			
			$('#more_options').append("<li ><div class='button tweet' style='margin-right:5px;'>Tweet Book</div></li>");
			$('#more_options').append("<li ><div class='button email' style='margin-right:5px;'>Email Book</div></li>");
			
			
			

			$('[url]').bind('click',
				function(e){e.preventDefault();e.stopPropagation();window.location=$(this).attr('url');}
						);
			$('[book_id] .remove').bind('click',
				function(e){
					stop_event(e);					
					book_storage.remove_book( $(this).parents('[book_id]').attr('book_id'),show_library);
					});	
			$('[book_id] .tweet').bind('click',
				function(e){
					stop_event(e);					
					tweet_book_check($(this).parents('[book_id]').attr('book_id'));
					});						

			$('li.[book_id]').bind('click',
				function(e){
					stop_event(e);
					get_book($(this).attr('book_id'),handle_fatal_error);					
					});
					
			$('#bar').css('z-index',200);
			$('#bar').show();			
			select_menu_item($('#bar > .menu'),$('#bar [target="locations"]'));	
			$('#bar').css('height',($('#locations').height()+130)+"px !important");			

		}
		else
		{
			window.scrollTo(0,1);
			$('#line').removeClass('in_bar');
			$('#bar').css('z-index',-200);	
			$('#bar').css('height',0);			
			$('#bar').hide();
			$('#locations').html('');
		}
	}
	
	function select_menu_item(menu,item)
	{		
		setTimeout(function(){window.scrollTo(0,0);	},10);
		var previous=menu.children('.menu_buttons').children('.selected').removeClass('selected');		
		$(item[0]).addClass('selected');
		var item_index=menu.children('.menu_buttons').children('.menu_button').index(item);
		
		$('#'+item.attr('target')).show();	
		if(item.attr('target')!=previous.attr('target'))
		{
			setTimeout(function(){$('#'+previous.attr('target')).hide();},200);
	
		}		
		
		menu.children('.menu_panels').children('.menu_panel').css('-webkit-transform','translateX('+(item_index)*page_width+'px)');


	}	

	
	function stop_event(e)
	{
		e.preventDefault();
		e.stopPropagation();
	}
	function tweet_book_check(id)
	{
		$.getJSON('php/check.php', function(data) {
		if(data.status=='success')
		{
			tweet_book(id)
		}
		else
		{
			if(confirm("Go to twitter to connect your twitter account?"))
			{
				window.location='php/connect.php';
			}
		}
		
		})
	}
	function tweet_book(id)
	{	
		book_storage.get_book(id,function(book){		
			if(confirm("Tell your followers that you read "+book.title+"?"))
			{		
				var message=escape("I am reading '"+book.title+"' on http://hyper-books.com");
				$.getJSON('php/post.php', function(data) {

					if(data.status=='success')
					{
						alert("Twweet sent!");
					}
				}
				)
			}
		}
		)
	}

	//*****************************************
	//Shows the Library of Books Panel
	//*****************************************	
	function show_library()
	{		
		var list_amount=0;
		function interface()
		{
			if(list_amount==3)
			{
				$('[book_id] .details').bind('click',
					function(e)
					{
						stop_event(e);
						var id=$(this).parent('[book_id]').attr('book_id');			
						if(!$('#detail_panel_'+id).is(":visible"))
						{
							$('.detail_panel').hide();
							$('#all_books ul .details').css('-webkit-transform',' rotate(0deg)');										
							$('#detail_panel_'+id).show(200);
							$('#all_books li[book_id="'+id+'"] .details').css('-webkit-transform',' rotate(90deg)');				
						}
						else
						{
							$('.detail_panel').hide(200);
							$('#all_books ul .details').css('-webkit-transform',' rotate(0deg)');						
						}
					}
				);	
				$('[url]').bind('click',
					function(e){e.preventDefault();e.stopPropagation();window.location=$(this).attr('url');}
							);
				$('[book_id] .remove').bind('click',
					function(e){
						stop_event(e);					
						book_storage.remove_book( $(this).parents('[book_id]').attr('book_id'),show_library);
					
						});	
				$('[book_id] .tweet').bind('click',
					function(e){
						stop_event(e);					
						tweet_book_check($(this).parents('[book_id]').attr('book_id'));
						});						

				$('li.[book_id]').bind('click',
					function(e){
						stop_event(e);
						get_book($(this).attr('book_id'),handle_fatal_error);					
						});		
				select_menu_item($('#available_for_download .menu'),$('#all_books [target="available_for_download_en"]'));						
				show_panel('#all_books');
				select_menu_item($('#all_books > .menu'),$('#all_books [target="my_books"]'));

						
				
			}			
		}
		
		function render_list(list,if_empty_text)
		{
			list_amount++;
			if(list.length==0)
			{
				return if_empty_text;
			}
			var all=""
			for(var i=0;i<list.length;i++) 
			{
				var book=list[i];
				var li='<li book_id="'+book.id+'">';
				if(book.is_ready==1)
				{
					li+="<div class='state details' style='opacity:0.1'>&gt;</div><div class='title' >"+book.title+"</div><div class='authors'>"+book.authors+"</div>";
					li+="<div id='detail_panel_"+book.id+"' class='detail_panel'>";
					li+="<div class='button remove' style='margin-right:12px;'>Remove</div>";
					if(book.purchase_links && book.purchase_links.amazon)
					{
						li+="<div class='button amazon' url='"+book.purchase_links.amazon+"'>Buy on Amazon</div>";
					}
					li+="<div class='button tweet'>Tweet</div><div class='button email'>Email</div></div></li>";		
				}
				else
				{
					li+="<div class='title' >"+book.title+"</div><div class='authors'>"+book.authors+"</div>";			
				}
				
				all+=li+"</li>";
			}	
			return all;		
		}
			
		book_storage.get_all_books(1,'',
			function(list)
			{				
				$('#my_books').html(render_list(list,"<div class='intro'><p><b>Hyper Books</b> is a mobile browser based e-book reader. The featured books are copyright free classics from digital libraries such as Project Gutenberg in Australia, Germany and the United States.</p><p>All downloaded books are stored on your phone and available offline. Please bookmark this site so you can enjoy your books when you are off the grid. </p></div>"));
						
				interface();
			});

		book_storage.get_all_books(0,'de',
			function(list)
			{
				$('#available_for_download_de').html(render_list(list),"<li><blockquote><i>All verfuegbaren buecher sind bereits runtergeladen.</i></blockquote></li>");												
				interface();
			});
		book_storage.get_all_books(0,'en',
			function(list)
			{
				$('#available_for_download_en').html(render_list(list),"<li><blockquote><i>All books are already downloaded.</i></blockquote></li>");												
				interface();
			});									
	}
	
	//*****************************************
	//Get the book with the given ID, if the 
	//is not already existing it will loaded
	//*****************************************	
	function get_book(id)
	{
		book_storage.get_book(id,
			function(book){
				if(book.is_ready)
				{
					display_book(book);
				}
				else
				{
					load_book(book);
				}							
			});
	}
	

	function load_book(book)
	{
		document.getElementById('deck').innerHTML="<div id='prev' class='page'></div><div id='current' class='page'><div class='chapter_title' id='chapter_title_test'>test</div></div><div id='next' class='page'></div>";		
		$('.phantom').remove();  
		$('body').append("<div class='phantom' id='phantom_"+book.id+"' ><div class='page '><div></div></div></div>");
		var phantom_page=$('#phantom_'+book.id+' .page *')[0];
		
		var styles=book.page_css.split(';');
		for(var member in styles)
		{
			style=styles[member].split(":");
			phantom_page.style[style[0]]=style[1];
		}
		
		var styles=['font-size','line-height','width','height','font-family','border-top-width','border-bottom-width','border-bottom-width','border-right-width','padding-top','padding-right','padding-bottom','padding-left','margin-top','margin-right','margin-bottom','margin-left'];

		var page_css_string="";
		for(var style in styles)
		{
			if(window.getComputedStyle(document.getElementById('current'),null)[styles[style]]!="" && window.getComputedStyle(document.getElementById('current'),null)[styles[style]]!="auto")
			{
				page_css_string+=styles[style]+":"+window.getComputedStyle(document.getElementById('current'),null)[styles[style]]+";";
			}
			
		}
		
		
		
		var chapter_css_string="";
		for(var style in styles)
		{
			if(window.getComputedStyle(document.getElementById('chapter_title_test'),null)[styles[style]]!="" && window.getComputedStyle(document.getElementById('chapter_title_test'),null)[styles[style]]!="auto") 
			{
				chapter_css_string+=styles[style]+":"+window.getComputedStyle(document.getElementById('chapter_title_test'),null)[styles[style]]+";";
			}
			
		}


		if(book.cover_markup)
		{
			$('#loading .cover').html(book.cover_markup);
		}
		else
		{
			
			$('#loading .cover').html('<h1 class="title"></h1>by<h3 class="authors"></h3><br/>');
			if(book.title.length>50)
			{
				$('#loading .title').css('font-size','130%').html(book.title);	
			}
			else
			{
				$('#loading .title').html(book.title);	
			}
		}
		$('#loading .authors').html(book.authors.join('<br/>'));			

		$('#cover_message').html("Downloading book ...");		
		
		show_panel('#loading');
		
		$.get("data/"+book.id+".txt",function(data){
			$('#cover_message').html('Formatting book ...');
			
			if(data.match(/(^|\n)(APPENDIX\.?|INTRODUCTION\.?|INTRO\.?|PREFACE\.?)(\n)/ig))
			{
				data=data.replace(/(^|\n)(APPENDIX\.?|INTRODUCTION\.?|INTRO\.?|PREFACE\.?)(\n)/ig,"<div class='chapter_title'>$2</div>$3");				
			}
			
			if(data.match(/(^|\n)(PART.+CHAPTER.+|CHAPTER.+)(\n)/ig))
			{
				data=data.replace(/(^|\n)(PART.+CHAPTER.+|CHAPTER.+)(\n)/ig,"<div class='chapter_title'>$2</div>$3");				
			}
			else if(data.match(/(^|\n\n)(\d+\.?)(\n)/ig))
			{
				data=data.replace(/(^|\n\n)(\d+\.?)(\n)/ig,"<div class='chapter_title'>$2</div>$3");
			}
			else if(data.match(/(^|\n\n)([IVX]+\..+)(\n)/mg))
			{
				data=data.replace(/(^|\n\n)([IVX]+\..+)(\n)/mg,"<div class='chapter_title'>$2</div>$3");
			}
	
			else if(data.match(/(^|\n\n)([IVX]+)(\s*\n)/mg))
			{
				data=data.replace(/(^|\n\n)([IVX]+)(\s*\n)/mg,"<div class='chapter_title'>$2</div>$3");
			}
			else
			{
				data=data.replace(/(^|\n)([A-Z][A-Z 0-9\.\?\!\'\"\:\-]+)(\n)/g,"<div class='chapter_title'>$2</div>$3");
			}
			
			data=data.replace(/\n\n\n?/g,' <br><br>')
			
			$.post("php/get_book.php", {"book_id": book.id,"page_css": page_css_string, "chapter_css": chapter_css_string }, function(book_data) {
			
			  							
			  var _book=jQuery.parseJSON(book_data);
			  console.log(_book);
			  //do we have the layout of the book already
			  if(_book.pages_array)
			  {		
				var pages_array=_book.pages_array.split(',');		
				pages_array.shift();
				book.chapters=new Array();
				book.content=new Array("<div class='cover'>"+$('.cover').html()+"</div>");
				book.chapters=jQuery.parseJSON(_book.chapter_json.replace(/,\\"/g,',"').replace(/\\"\]/g,'"]'));
				for(page in pages_array)
				{
					var space=data.match(/^(<br>)+/);
					if(space)
					{
						data=data.substring(space[0].length);
					}
					book.content[book.content.length]=data.substring(0,pages_array[page]);
					data=data.substring(pages_array[page]);
				}
				display_book(book);
				ready_to_read=true;				
				book.is_ready=1;			
				current_book.current_page=0;				
				book_storage.book_update_content(book,
					function(){},
					handle_fatal_error														
					);
			  }
			  else
			  {
			//normalize data

				var time_start=new Date().getTime();

				function success_callback(book)
				{
					console.log(new Date().getTime()-time_start);
					$('#cover_message').html('Done, enjoy the book!');	
					display_book(book);
					ready_to_read=true;				
					book.is_ready=1;			
					current_book.current_page=0;				
					book_storage.book_update_content(book,
						function(){},
						handle_fatal_error														
						);	
					pages_array="";
					for(var page in book.content)
					{
						pages_array+=book.content[page].length+",";	
					}

					$.post("php/add_book.php", { "book_id": book.id, "page_css": page_css_string, "chapter_css": chapter_css_string, "pages_array":pages_array, "chapter_json":JSON.stringify(book.chapters) } );
							
				}
				var ready_to_read=false;
		
			
				function progress_callback(progress)
				{
					$('#progress').html(progress);
				}						

				var max_height=$('#deck > *').height();
				book.chapters=new Array();
				book.content=new Array("<div class='cover'>"+$('.cover').html()+"</div>");
			
			
				
				
				$('#cover_message').html('Formatting book ... <span id="progress">0</span>%<br/><small><br/>Only done once per book, thanks for your patience!<br/></small>');						
			
				var settings={
					'book':book,
					'content':data,
					'phantom_page':phantom_page,
					'max_height':max_height,
					'treshold':30,
					'amount_of_words_per_load_initial':500,
					'amount_of_words_per_load':500,
					'processing_chunk_size':1000,
					'success_callback':success_callback,
					'book_ready_to_read':null,
					'progress_callback':progress_callback
				}
			
				prepare_book(settings);
		}})});
	
	}
	
	
	function show_panel(id,time)
	{
		$('body').css('height',page_height);
		$('#deck').css('height',page_height);						
		show_book_navigation_bar(false);
		setTimeout(function(){window.scroll(0,1)},100);
		if(!$(id).is(":visible"))
		{
			$(".panel").hide();
			$(id).show(time);
			if(id=='#deck')
			{

				$('#home,#line').show();
			}
			else
			{
				$('#home,#line').hide();			
			}		
		}	

	}
	function goto_page(new_page,direct,time)
	{
		
		show_book_navigation_bar(false);

		if(time==null)
		{
			time='0.5s';
		}
		if(new_page>=0 && new_page<=current_book.pages_length)
		{
			if( direct )
			{	
				set_content(new_page);		
				if(new_page>0)
				{
					$('body').append("<div id='current_book' class='width' style='display:block'>"+current_book.title+"<div class='progress'>"+Math.ceil(new_page*100/current_book.pages_length)+"% into the Book</div></div>");
					$('#current_book').delay(1500).animate({'opacity':0},500,function(){$('#current_book').remove()});
				}
			}
			else
			{
				window.new_page=new_page;
				if(current_book.current_page<current_book.pages_length && new_page>current_book.current_page)
				{
					current_page.style['-webkit-transition-duration']=time;
					next_page.style['-webkit-transition-duration']=time;					
					current_page.style.webkitTransform='translate(-'+page_width+'px,0px)';
					next_page.style.webkitTransform='translate(0px,0px)';										
				}
				if(current_book.current_page!=0 && new_page<current_book.current_page)
				{
					current_page.style['-webkit-transition-duration']=time;
					previous_page.style['-webkit-transition-duration']=time;					
					current_page.style.webkitTransform='translate('+page_width+'px,0px)';
					previous_page.style.webkitTransform='translate(0px,0px)';
				}					
			}	
			current_book.current_page=new_page;			
			book_storage.update_current_page(current_book.id,new_page);
		}

	}		
	function set_content(page)
	{
		current_page.style['-webkit-transition-duration']='0s';
		previous_page.style['-webkit-transition-duration']='0s';
		next_page.style['-webkit-transition-duration']='0s';				

		current_page.style.webkitTransform='translate(0px,0px)';
		next_page.style.webkitTransform='translate('+page_width+'px,0px)';		
		previous_page.style.webkitTransform='translate(-'+page_width+'px,0px)';		
		

				
		document.getElementById('line').innerHTML="<div class='line' ><div style='width:"+(page*100/(current_book.pages_length-1)).toFixed(1)+"%' class='left'></div></div>";	

		current_page.innerHTML=current_book.content[page];
		if(page>0)
		{
			previous_page.innerHTML=current_book.content[page-1];			
		}
		if(page<(current_book.pages_length-1))
		{
			next_page.innerHTML=current_book.content[page+1];					
		}
		else
		{
			next_page.innerHTML="";					

		}		
	}


	//event handling
	var first_x,first_y,delta_x,consumed,fingers,show_book_navigation_bar_interval_id;
	function click(e)
	{

		clearInterval(show_book_navigation_bar_interval_id);
		duration=new Date().getTime();
		$('#current_book').remove();
		touch_time=new Date().getUTCMilliseconds();
		if(e.clientY<20)
		{
				show_book_navigation_bar(true);
		}
		else if($('#bar').css('display')=='block')
		{
			show_book_navigation_bar(false);
		}		
		else if(e.clientX>page_width/2)
		{	
			goto_page(current_book.current_page+1);
		}
		else
		{	
			goto_page(current_book.current_page-1);	
		}


	}
	function touchstart(e)
	{

		if(document.getElementById('current_book'))
		{
			$('#current_book').remove();
		}
		if(show_book_navigation_bar_interval_id!=null)
		{
			clearInterval(show_book_navigation_bar_interval_id);
			show_book_navigation_bar_interval_id=null;
		}
		fingers=event.touches.length;
		event.preventDefault();

		if(fingers == 2)
		{
				goto_page(0,true);
		}
		else if(fingers == 3)
		{
				show_library();
		}	
		else if(fingers == 1)
		{
			first_x = event.touches[0].pageX;
			first_y = event.touches[0].pageY;	
			delta_x=0;
			consumed=false;
			show_book_navigation_bar_interval_id=setInterval(function(){consumed=true;show_book_navigation_bar(true);clearInterval(show_book_navigation_bar_interval_id);},750);		
		}
	}
	function touchmove(e)
	{
		if(show_book_navigation_bar_interval_id!=null)
		{
			clearInterval(show_book_navigation_bar_interval_id);
			show_book_navigation_bar_interval_id=null;
		}	
		delta_x=event.touches[0].pageX-first_x;
		if( ((delta_x <0 && current_book.current_page != (current_book.pages_length-1))) || (delta_x >0 && current_book.current_page!=0) && fingers==1)
		{			
			current_page.style.webkitTransform='translate('+delta_x+'px,0px)';			
			if(delta_x < 0)
			{
				next_page.style.webkitTransform='translate('+(page_width+delta_x)+'px,0px)';
			}
			else
			{
				previous_page.style.webkitTransform='translate('+(-page_width+delta_x)+'px,0px)';
			}					
		}
		
	}
	function touchend(e)
	{
		clearInterval(show_book_navigation_bar_interval_id);
		if(!consumed && fingers==1)
		{			
			if(delta_x>0 && current_book.current_page!=0 )
			{
				goto_page(current_book.current_page-1,false,'0.1s');
			}
			else if(delta_x < 0 && current_book.current_page != (current_book.pages_length-1))
			{
				goto_page(current_book.current_page+1,false,'0.1s');
			}
			else if(delta_x==0 && fingers == 1)
			{
				if(first_y<20)
				{
						show_book_navigation_bar(true);
				}
				else if($('#bar').css('display')=='block')
				{
						show_book_navigation_bar(false);
				}
				else if(first_x>page_width/2)
				{
					goto_page(current_book.current_page+1,false,'0.1s');
				}
				else
				{
					goto_page(current_book.current_page-1,false,'0.1s');
				}
			}

		}

		
	}				





function handle_fatal_error(error)
{
	console.log(error);
	alert(error);
}

function draw_logo(ctx) {

  // layer1/Path
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(46.8, 29.3);
  ctx.bezierCurveTo(54.8, 29.3, 61.3, 22.7, 61.3, 14.6);
  ctx.bezierCurveTo(61.3, 6.5, 54.8, 0.0, 46.8, 0.0);
  ctx.bezierCurveTo(38.8, 0.0, 32.4, 6.5, 32.4, 14.6);
  ctx.bezierCurveTo(32.4, 22.7, 38.8, 29.3, 46.8, 29.3);
  ctx.closePath();
  ctx.fillStyle = "#cdcdcd";
  ctx.fill();

  // layer1/Compound Path
  ctx.beginPath();

  // layer1/Compound Path/Path
  ctx.moveTo(60.9, 30.8);
  ctx.bezierCurveTo(67.5, 31.0, 70.3, 36.4, 70.3, 36.4);
  ctx.lineTo(91.6, 66.0);
  ctx.bezierCurveTo(92.5, 67.3, 93.0, 68.9, 93.0, 70.7);
  ctx.bezierCurveTo(93.0, 75.3, 89.3, 79.0, 84.8, 79.0);
  ctx.bezierCurveTo(83.7, 79.0, 82.7, 78.8, 81.8, 78.4);
  ctx.lineTo(68.9, 74.8);
  ctx.lineTo(68.9, 87.8);
  ctx.lineTo(24.2, 87.8);
  ctx.lineTo(24.2, 74.8);
  ctx.lineTo(11.3, 78.4);
  ctx.bezierCurveTo(10.4, 78.8, 9.3, 79.0, 8.2, 79.0);
  ctx.bezierCurveTo(3.7, 79.0, 0.0, 75.3, 0.0, 70.7);
  ctx.bezierCurveTo(0.0, 68.9, 0.5, 67.3, 1.4, 66.0);
  ctx.lineTo(22.8, 36.4);
  ctx.bezierCurveTo(22.8, 36.4, 25.6, 31.0, 32.1, 30.8);
  ctx.lineTo(60.9, 30.8);
  ctx.lineTo(60.9, 30.8);
  ctx.closePath();

  // layer1/Compound Path/Path
  ctx.moveTo(46.5, 78.7);
  ctx.lineTo(46.5, 78.7);
  ctx.lineTo(63.2, 73.1);
  ctx.lineTo(62.8, 73.0);
  ctx.bezierCurveTo(51.3, 69.6, 55.8, 54.2, 67.3, 57.6);
  ctx.lineTo(68.9, 58.2);
  ctx.lineTo(68.9, 40.8);
  ctx.lineTo(46.5, 48.2);
  ctx.lineTo(24.2, 40.8);
  ctx.lineTo(24.2, 58.2);
  ctx.lineTo(25.7, 57.6);
  ctx.bezierCurveTo(37.2, 54.2, 41.7, 69.6, 30.2, 73.0);
  ctx.lineTo(29.8, 73.1);
  ctx.lineTo(46.5, 78.7);
  ctx.lineTo(46.5, 78.7);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function draw_rotate(ctx)
{

      // layer1/Group
      ctx.save();

      // layer1/Group/Compound Path
      ctx.save();
      ctx.beginPath();

      // layer1/Group/Compound Path/Path
      ctx.moveTo(0.0, 27.7);
      ctx.lineTo(0.0, 152.6);
      ctx.bezierCurveTo(0.0, 167.9, 12.4, 180.3, 27.7, 180.3);
      ctx.lineTo(326.3, 180.3);
      ctx.bezierCurveTo(341.6, 180.3, 354.0, 167.9, 354.0, 152.6);
      ctx.lineTo(354.0, 27.7);
      ctx.bezierCurveTo(354.0, 12.4, 341.6, 0.0, 326.3, 0.0);
      ctx.lineTo(27.7, 0.0);
      ctx.bezierCurveTo(12.4, 0.0, 0.0, 12.4, 0.0, 27.7);
      ctx.closePath();

      // layer1/Group/Compound Path/Path
      ctx.moveTo(292.0, 13.9);
      ctx.lineTo(292.0, 166.4);
      ctx.lineTo(62.0, 166.4);
      ctx.lineTo(62.0, 13.9);
      ctx.lineTo(292.0, 13.9);
      ctx.closePath();
      ctx.fill();

      // layer1/Group/Live Paint Group

      // layer1/Group/Live Paint Group/Group

      // layer1/Group/Live Paint Group/Group/Path
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(321.7, 72.8);
      ctx.bezierCurveTo(331.3, 72.8, 339.0, 80.6, 339.0, 90.2);
      ctx.bezierCurveTo(339.0, 99.7, 331.3, 107.5, 321.7, 107.5);
      ctx.bezierCurveTo(312.1, 107.5, 304.4, 99.7, 304.4, 90.2);
      ctx.bezierCurveTo(304.4, 80.6, 312.1, 72.8, 321.7, 72.8);
      ctx.closePath();
      ctx.fillStyle = "rgb(32, 32, 32)";
      ctx.fill();

      // layer1/Group/Live Paint Group/Group
      ctx.restore();

      // layer1/Group/Live Paint Group/Group/
      ctx.save();

      // layer1/Group
      ctx.restore();
      ctx.restore();

      // layer1/Group/Path
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(161.9, 91.4);
      ctx.lineTo(162.6, 90.7);
      ctx.lineTo(134.7, 62.9);
      ctx.lineTo(106.9, 90.7);
      ctx.lineTo(128.3, 90.7);
      ctx.bezierCurveTo(128.6, 103.0, 133.4, 115.1, 142.7, 124.4);
      ctx.bezierCurveTo(161.9, 143.6, 193.1, 143.6, 212.3, 124.4);
      ctx.bezierCurveTo(231.5, 105.2, 231.5, 74.0, 212.3, 54.8);
      ctx.bezierCurveTo(202.7, 45.2, 190.1, 40.4, 177.5, 40.4);
      ctx.lineTo(177.5, 53.8);
      ctx.bezierCurveTo(186.7, 53.8, 195.9, 57.3, 202.9, 64.2);
      ctx.bezierCurveTo(216.8, 78.2, 216.8, 101.0, 202.9, 114.9);
      ctx.bezierCurveTo(188.9, 128.9, 166.2, 128.9, 152.2, 114.9);
      ctx.bezierCurveTo(145.5, 108.2, 142.0, 99.5, 141.7, 90.7);
      ctx.lineTo(161.9, 90.7);
      ctx.lineTo(161.9, 91.4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      ctx.restore();
}
function inject_chapters(data)
{
	if(data.match(/(^|\n)(APPENDIX\.?|INTRODUCTION\.?|INTRO\.?|PREFACE\.?|THE PREFACE.?|Vorwort\s*|Nachwort\s*)(\n)/ig))
	{
		data=data.replace(/(^|\n)(APPENDIX\.?|INTRODUCTION\.?|INTRO\.?|PREFACE\.?)(\n)/ig,"<div class='chapter_title'>$2</div>$3");				
	}
	
	if(data.match(/(^|\n)(PART.+CHAPTER.+|CHAPTER.+)(\n)/ig))
	{
		data=data.replace(/(^|\n)(PART.+CHAPTER.+|CHAPTER.+)(\n)/ig,"<div class='chapter_title'>$2</div>$3");				
	}
	else if(data.match(/(^|\n\n)(\d+.*)(\n)/ig))
	{
		data=data.replace(/(^|\n\n)(\d+.*)(\n)/ig,"<div class='chapter_title'>$2</div>$3");
	}
	else if(data.match(/(^|\n\n)([IVX]+\..+)(\n)/mg))
	{
		data=data.replace(/(^|\n\n)([IVX]+\..+)(\n)/mg,"<div class='chapter_title'>$2</div>$3");
	}

	else if(data.match(/(^|\n\n)([IVX]+)(\s*\n)/mg))
	{
		data=data.replace(/(^|\n\n)([IVX]+)(\s*\n)/mg,"<div class='chapter_title'>$2</div>$3");
	}
	else
	{
		data=data.replace(/(^|\n)([A-Z][A-Z 0-9\.\?\!\'\"\:\-]+)(\n)/g,"<div class='chapter_title'>$2</div>$3");
	}
	
	return data;
}

function prepare_book(settings)
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

	var html="",last_html="",sep="",last_content="";
	var total_length=content.length;	
	var content_length=total_length;

	var _content=content.substring(0,processing_chunk_size);
	var _next=content.substring(processing_chunk_size);

	var regex=/[\,\;\s\.\!\?\"\)]+/;
	var chapter_regex=/<div class='chapter_title'\>(.+)\<\/div\>/;

	var old_content_length=0,length,cut,space_sep,chapter_sep,sep;
	
	var book_readable=false;
	var _amount_of_words_per_load=amount_of_words_per_load_initial;

	paginate();
	
	
	function paginate()
	{	
		for(var i=0; i<_amount_of_words_per_load;i++)
		{
			
			if(_content.length<300 && _next!="")
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
	
}var book_storage=function() {

	try 
	{		
		var pub = {};
		var db = null;
		
		var drop_sql="drop table if exists books;";
		var create_sql='CREATE TABLE IF NOT EXISTS books (id TEXT NOT NULL PRIMARY KEY, title TEXT NOT NULL, authors TEXT NOT NULL, authors_sort_key TEXT NOT NULL, content BLOB DEFAULT "", language TEXT NOT NULL, chapters TEXT DEFAULT "", bookmarks TEXT DEFAULT "", purchase_links TEXT DEFAULT "", page_background TEXT DEFAULT "", cover_markup TEXT DEFAULT "", cover_css TEXT DEFAULT "", page_css TEXT DEFAULT "", version TEXT DEFAULT "", is_ready INTEGER DEFAULT 0, current_page INTEGER DEFAULT 0, is_current_book INTEGER DEFAULT 0);';



		pub.book_content_array_to_string=function(content_array)
		{
			return content_array.join('^&');
		}

		pub.book_content_string_to_array=function(content_string)
		{
			return content_string.split('^&');
		}
		pub.init_storage=function(success,errorCallback,db_settings,reset)
		{
			if(db_settings==null)
			{
				db_settings=conf.db;
			}
			
			if(db==null)
			{
				db=openDatabase(db_settings.short_name, db_settings.version, db_settings.display_name, db_settings.max_size);
				if(reset==null)
				{
					db.transaction(function(transaction){transaction.executeSql(create_sql,[],success,function(transaction, error){ errorCallback('init_storage',error)})});
				}
				else
				{
					//TODO: needs to simplified, this is the test initiation only
					function create()
					{
						db.transaction(function(transaction){transaction.executeSql(create_sql,[],success,function(transaction, error){ errorCallback('init_storage',error)})});
					}
					db.transaction(function(transaction){transaction.executeSql(drop_sql,[],create,function(transaction, error){ errorCallback(error)})});
				}				
			}
			else
			{
				success();	
			}
		}
		

		pub.book_update_content=function(book,successCallback,errorCallback)
		{
			db.transaction(
			    function(transaction){			
					transaction.executeSql("update books set is_current_book = 0;",[],function(){},function(transaction, error){ errorCallback('book_update_content1',error)});
					transaction.executeSql("update books set content = ?,chapters=?,is_ready=?,is_current_book=1 where id = ?;", [compress(pub.book_content_array_to_string(book.content)),JSON.stringify(book.chapters),book.is_ready,book.id],successCallback,function(transaction, error){ errorCallback('book_update_content2',error)} );
				});
		}
		pub.add_book=function(id,book,successCallback,errorCallback)
		{
			try{
			function nullDataHandler(transaction, results) { }
			
			db.transaction(
			    function(transaction){
				transaction.executeSql("select id from books where id=?;",[id],
				function(transaction,results)
				{

					if(results.rows.length==0)
					{
						transaction.executeSql('insert into books (id, title, authors,authors_sort_key, language, cover_markup, cover_css, page_css, purchase_links, is_ready) VALUES (?,?,?,?,?,?,?,?,?,?);', 
							[id, book.title, book.authors.join(','),book.authors[0].split(' ').pop(), book.language, book.cover_markup!=null?book.cover_markup:"", book.cover_css!=null?book.cover_css:"", book.page_css!=null?book.page_css:"", JSON.stringify(book.purchase_links!=null?book.purchase_links:{}), 0 ], successCallback,function(transaction, error){ errorCallback('add_book_inner',error)} );						
											
					}
					else
					{
						successCallback();
					}
					
				},
				function(transaction, error){ errorCallback(error)}
				)});
			}
			catch(e)
			{
				errorCallback(e);
			}	
		}	
		
		//*****************************************
		//Return all books that 
		//match are either downloaded (is_ready)
		//or that are from a certain language
		//*****************************************	
		pub.get_all_books=function(is_ready,language,successCallback,errorCallback)
		{
			function _successCallback(transaction, results)
			{
					var booklist=[];
					for(var i=0;i<results.rows.length;i++)
					{
						var book=convert_to_mutable(results.rows.item(i));
						book.purchase_links=JSON.parse(book.purchase_links);
						booklist.push(book);
					}
					successCallback(booklist);
			}
			var conditions="";
			if(is_ready==1)
			{
				conditions=" where is_ready=1 "
			}
			else
			{
				conditions=" where is_ready=0 and language='"+language+"'";
			}
			
			db.transaction(
			    function (transaction) {
			        transaction.executeSql("SELECT id,title,authors,language,is_ready,purchase_links from books "+conditions+" order by authors_sort_key,title ;",[], _successCallback, function(transaction, error){ errorCallback('get_all_books',error)});			
			    }
			)	
		}
		//*****************************************
		//Get the book with the given ID
		//*****************************************		
		pub.get_book=function(id,successCallback,errorCallback)
		{
			function _successCallback(transaction, results)
			{

					var book=convert_to_mutable(results.rows.item(0));
					book.authors=book.authors.split(',');
					if(book.content!=null && book.content!="")
					{
						book.content=pub.book_content_string_to_array(decompress(book.content));
						book.chapters=book.chapters!=''?JSON.parse(book.chapters):[];					
						book.is_ready=true;						
					}
					else
					{
						book.is_ready=false;	
					}
					successCallback(book);					
				
			}
			db.transaction(
			    function (transaction) {
			        transaction.executeSql("SELECT * from books where id=? ;",[id], _successCallback, function(transaction, error){ errorCallback('get_book',error)});					
			    }
			)
		}
		pub.remove_book=function(id,successCallback,errorCallback)
		{
			function _successCallback(transaction, results)
			{
				successCallback();
			}
			db.transaction(
			    function (transaction) {
			        transaction.executeSql("update books set is_ready=0,current_page=0,content='',chapters='' where id=?;",[id], _successCallback, function(transaction, error){ errorCallback('remove_book',error)});

			    }
			)
		}		
		pub.get_current_book=function(successCallback,errorCallback)
		{
			function _successCallback(transaction, results)
			{
				if(results.rows.length==0 || results.rows.item(0).content==null || results.rows.item(0).content=="")
				{
					successCallback(null);	
				}
				else
				{
					book=convert_to_mutable(results.rows.item(0));
					book.authors=book.authors.split(',');
					book.content=pub.book_content_string_to_array(decompress(book.content));
					book.chapters=book.chapters!=''?JSON.parse(book.chapters):[];
					successCallback(book);
				}
			}
			db.transaction(
			    function (transaction) {
			        transaction.executeSql("SELECT * from books where is_current_book=1;",[], _successCallback, function(transaction, error){ errorCallback('get_current_book',error)});
			    }
			)
		}		
		pub.update_current_page=function(id,page)
		{
			db.transaction(
			    function (transaction) {			
			        transaction.executeSql("update books set is_current_book = 0;",[],function(){}, function(transaction, error){ errorCallback('update_current_page_1',error)} );				
			        transaction.executeSql("update books set current_page = ? ,is_current_book = 1 where id = ?;",[page,id],function(){}, function(transaction, error){ errorCallback('update_current_page_2',error)} );
			    }
			)	
		}

	 	return pub;
	}
	    catch (e){ 
	      if(typeof(console)!="undefined") {
		alert("Error="+e);
	        console.log(e);
	      }
	    }

}();


    
    

function compress(to_compress)
{
	var output = new OutStream();
	var compressor = new LZWCompressor(output);

	compressor.compress(to_compress);
	
	var s="";
	for (var i=0;i<output.bytestream.length;i++)
	{s+=String.fromCharCode(output.bytestream[i]+1)}
	
	return output.offset+","+s;
}

function decompress(s){
	
	var offset=parseInt(s.substring(0,s.indexOf(',')));
	s=s.substring(s.indexOf(',')+1);
	
	var bytes=[];
	for (var i=0;i<s.length;i++)
	{bytes.push(s.charCodeAt(i)-1)}
	
	var instream = new InStream(bytes,offset);
	var decompressor = new LZWDecompressor(instream);
	return decompressor.decompress();
	

}   


  function convert_to_mutable(book)
  {
	var mutable=new Object();
	for(var key in book){mutable[key]=book[key]};
	return 	mutable;
  }

/*
  lzwjs.js - Javascript implementation of LZW compress and decompress algorithm
  Copyright (C) 2009 Mark Lomas

  This program is free software; you can redistribute it and/or
  modify it under the terms of the GNU General Public License
  as published by the Free Software Foundation; either version 2
  of the License, or (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program; if not, write to the Free Software
  Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
*/

// Used to write values represented by a user specified number of bits into 
// a 'bytestream' array.
function OutStream()
{
    this.bytestream = new Array();
    this.offset = 0;

    this.WriteBit = function(val)
    {
       	this.bytestream[this.offset>>>3] |= val << (this.offset & 7);
        this.offset++;
    }

    this.Write = function(val, numBits)
    {
        // Write LSB -> MSB
        for(var i = 0; i < numBits; ++i)
            this.WriteBit((val >>> i) & 1);
    }
}

// Used to read values represented by a user specified number of bits from 
// a 'bytestream' array.
function InStream(bytestream, bitcount)
{
	this.bytestream = bytestream;
	this.bitcount = bitcount;
	this.offset = 0;

	this.ReadBit = function()
	{
	    var tmp = this.bytestream[this.offset>>>3] >> (this.offset & 7);
	    this.offset++;
	    return tmp&1;
	}

	this.Read = function(numBits)
	{
	    if((this.offset + numBits) > this.bitcount)
	        return null;

	    // Read LSB -> MSB
	    var val = 0;
	    for(var i = 0; i < numBits; ++i)
	        val |= this.ReadBit() << i;

	    return val;
	}
}


function LZWCompressor(outstream)
{
        this.output = outstream;

	// Hashtable dictionary used by compressor
	this.CompressDictionary = function() 
	{
	    this.hashtable = new Object();
	    this.nextcode = 0;

	    // Populate table with all possible character codes.
	    for(var i = 0; i < 256; ++i)
	    {
	        var str = String.fromCharCode(i);
	        this.hashtable[str] = this.nextcode++;
	    }    


	    this.Exists = function(str)
	    {
	        return (this.hashtable.hasOwnProperty(str));
	    }

	    this.Insert = function(str)
	    {
	        var numBits = this.ValSizeInBits();
	        this.hashtable[str] = this.nextcode++;
	        return numBits;
	    }

	    this.Lookup = function(str)
	    {
	        return (this.hashtable[str]);
	    }

	    this.ValSizeInBits = function()
	    {
	        // How many bits are we currently using to represent values?
	        var log2 = Math.log(this.nextcode + 1)/Math.LN2;
	        return Math.ceil(log2);
	    }
	};


	// LZW compression algorithm. See http://en.wikipedia.org/wiki/LZW
	this.compress = function(str)
	{
	   var length = str.length;
	   if(length == 0)
	       return output.bytestream;

	   var dict = new this.CompressDictionary();
	   var numBits = dict.ValSizeInBits();
	   var w = "";
	   for(var i = 0; i < length; ++i)
	   {
	       var c = str.charAt(i);
	       if(dict.Exists(w + c))
	       {
	           w = w + c;
	       }
	       else
	       {
	           numBits = dict.Insert(w + c);
	           this.output.Write(dict.Lookup(w), numBits); // Looks-up null on first interation.
	           w = c;
	       }
	   }
	   this.output.Write(dict.Lookup(w), numBits);
	};

} // end of LZWCompressor

function LZWDecompressor(instream)
{
	this.input = instream;

	this.DecompressDictionary = function()
	{
	    this.revhashtable = new Array();
	    this.nextcode = 0;

	    // Populate table with all possible character codes.
	    for(var i = 0; i < 256; ++i)
	    {
	        this.revhashtable[this.nextcode++] = String.fromCharCode(i);
  	    }

	    this.numBits = 9;

	    this.Size = function()
	    {
	        return (this.nextcode);
	    }

	    this.Insert = function(str)
	    {
	        this.revhashtable[this.nextcode++] = str;

	        // How many bits are we currently using to represent values?
		// Look ahead one value because the decompressor lags one iteration
		// behind the compressor.
	        var log2 = Math.log(this.nextcode + 2)/Math.LN2;
	        this.numBits = Math.ceil(log2);
	        return this.numBits;
	    }

	    this.LookupIndex = function(idx)
	    {
		return this.revhashtable[idx];
	    }

	    this.ValSizeInBits = function()
	    {
	        return this.numBits;
	    }
	}

	// LZW decompression algorithm. See http://en.wikipedia.org/wiki/LZW
	// Correctly handles the 'anomolous' case of 
	// character/string/character/string/character (with the same character 
	// for each character and string for each string).
	this.decompress = function(data, bitcount)
	{
	   if(bitcount == 0)
	       return "";

	   var dict = new this.DecompressDictionary();
	   var numBits = dict.ValSizeInBits();

	   var k = this.input.Read(numBits);
	   var output = String.fromCharCode(k);
	   var w = output;
	   var entry = "";

	   while ((k = this.input.Read(numBits)) != null)
	   {
	      if (k < dict.Size()) // is it in the dictionary?
	          entry = dict.LookupIndex(k); // Get corresponding string.
	      else 
	          entry = w + w.charAt(0);

	      output += entry;
	      numBits = dict.Insert(w + entry.charAt(0));
	      w = entry;
	   }

	   return output;
	};

} // end of LZWDecompressor

var conf={
			db:{
				short_name:'_library_' ,
				version : '1.0' ,
				display_name : 'books' ,
				max_size : 5*1024*1024
			},
			book_list:{
			
				'gutenberg_11':{
					authors:['Lewis Carroll'],
					title:'Alice\'s Adventures in Wonderland',
					language:'en',
					purchase_links:{'amazon':'http://amzn.to/gwi7FG'}
				},
				'gutenberg_526':{
					authors:['Joseph Conrad'],
					title:'Heart of Darkness',
					//page_css:'font-family: Helvetica !important;',
					language:'en',
					purchase_links:{'amazon':'http://amzn.to/eYrdHq'}
				},	
				'gutenberg_174':{
					authors:['Oscar Wilde'],
					url:'data/gutenberg_174.txt',
					title:'The Picture of Dorian Gray',
					//page_css:'font-family: Helvetica !important;font-size:0.9em; background: url("data:image/png;base64,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") top left repeat;',
					language:'en',
					purchase_links:{'amazon':'http://amzn.to/dJ7KWj'}
				},	
				'gutenberg_22367':{
					authors:['Franz Kafka'],
					title:'Die Verwandlung',
					language:'de',
					purchase_links:{'amazon':'http://amzn.to/ekKJBL'}
				},
				'gutenberg_14888':{
					authors:['Joseph Conrad','Ford Madox Ford'],
					title:'The Inheritors',
					language:'en',
					purchase_links:{'amazon':'http://amzn.to/hjRoU3'}
				},
				'gutenberg_35':{
					authors:['H.G. Wells'],
					title:'The Time Machine',
					language:'en',
					purchase_links:{'amazon':'http://amzn.to/gRWrMf'}
				},
				'gutenberg_159':{
					authors:['H.G. Wells'],
					title:'The Island of Doctor Moreau',
					language:'en',
					purchase_links:{'amazon':'http://amzn.to/gTd4ts'}
				},
				'gutenberg_689':{
					authors:['Leo Tolstoy'],
					title:'The Kreutzer Sonata',
					language:'en',
					purchase_links:{'amazon':'http://amzn.to/gnpdO1'}
				},					

				'gutenberg_55':{
					authors:['Frank Baum'],
					title:'The Wonderful Wizard of Oz',
					language:'en',
					purchase_links:{'amazon':'http://amzn.to/eu2Qt7'}
				},				

				
				'gutenberg_600':{
					authors:['Fyodor Dostoyevsky'],
					title:'Notes from the Underground',
					language:'en',
					purchase_links:{'amazon':'http://amzn.to/gO52oM'}
				}
				,								
				'gutenberg_2197':{
					authors:['Fyodor Dostoyevsky'],
					title:'The Gambler',
					language:'en',
					purchase_links:{'amazon':'http://amzn.to/h45S3a'}
				},								
				'gutenberg_35264':{
					authors:['Heinrich Mann'],
					title:'Professor Unrat',
					language:'de',
					purchase_links:{'amazon':'http://amzn.to/gO52oM'}
				},

				'gutenberg_12108':{
					authors:['Thomas Mann'],
					title:'Tod in Venedig',
					language:'de',
					purchase_links:{'amazon':'http://amzn.to/gwF8bc'}
				},	
				
				'gutenberg_au_0200051':{
					authors:['George Orwell'],
					title:'Burmese Days',
					language:'en',
					purchase_links:{'amazon':'http://amzn.to/gm1bvL'}
				},	
				
				'gutenberg_au_0200051':{
					authors:['George Orwell'],
					title:'Burmese Days',
					language:'en',
					purchase_links:{'amazon':'http://amzn.to/gm1bvL'}
				},
				'gutenberg_au_0100011':{
					authors:['George Orwell'],
					title:'Animal Farm',
					language:'en',
					purchase_links:{'amazon':'http://amzn.to/eHk5DX'}
				},	
				'gutenberg_au_0100021':{
					authors:['George Orwell'],
					title:'1984',
					language:'en',
					purchase_links:{'amazon':'http://amzn.to/eHk5DX'}
				},	
				'gutenberg_au_0100991':{
					authors:['Virginia Wolf'],
					title:'Mrs. Dalloway',
					language:'en',
					purchase_links:{'amazon':'http://amzn.to/go9aPA'}
				},	
				'gutenberg_de_159':{
					authors:['Franz Kafka'],
					title:'Das Schloß',
					language:'de',
					purchase_links:{'amazon':'http://amzn.to/gHuH0y'}
				},
				'digbib_1858':{
					authors:['Goerg Simmel'],
					title:'Über sociale Differenzierung',
					language:'de',
					purchase_links:{'amazon':'http://amzn.to/ib3V3e'}
				},
				'digbib_1817':{
					authors:['Theodor Storm'],
					title:'Der Schimmelreiter',
					language:'de',
					purchase_links:{'amazon':'http://amzn.to/ihl11S'}
				},
				'gutenberg_2500':{
					authors:['Herman Hesse'],
					title:'Siddhartha',
					language:'en',
					purchase_links:{'amazon':'http://amzn.to/dGfrP6'}
				}
				,
				'gutenberg_15396':{
					authors:['Gertrude Stein'],
					title:'Tender Buttons',
					language:'en',
					purchase_links:{'amazon':'http://amzn.to/dGfrP6'}
				}
				,
				'gutenberg_2814':{
					authors:['James Joyce'],
					title:'Dubliners',
					language:'en',
					purchase_links:{'amazon':'http://amzn.to/dGfrP6'}
				}	
				,
				'gutenberg_435':{
					authors:['Harry Houdini'],
					title:'The Miracle Mongers',
					language:'en',
					purchase_links:{'amazon':'http://amzn.to/fMIEEw'}
				}		
				,
				'gutenberg_20842':{
					authors:['Henri Bergson'],
					title:'Dreams',
					language:'en',
					purchase_links:{'amazon':'http://amzn.to/hxG3gB'}
				}													
				
																														
				
																																		
													
			}
			
		 };
