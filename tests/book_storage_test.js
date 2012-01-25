test("basic compress/decompres test", function() {
  var storage=sqlite_storage({
						short_name:'_library_test' ,
						display_name : 'books_test' ,
						version : '1.0' ,					
						max_size : 5*1024*1024
			});
	
  ok( storage.decompress(storage.compress("test"))=="test"	, "this test is fine" );
});

test("basic german text compress/decompres test", function() {
    var storage=sqlite_storage({
  						short_name:'_library_test' ,
  						display_name : 'books_test' ,
  						version : '1.0' ,					
  						max_size : 5*1024*1024
  			});
	
  var str="Die Frontlinie in Libyen verschiebt sich jeden Tag, Zehntausende Menschen sind aus der Kampfzone geflüchtet. Nun leben sie in Notunterkünften - wie die Familie Elalwani. Angespannt verfolgen Vater, Mutter und Kinder die Nachrichten aus der alten Heimat, an eine rasche Rückkehr glaubt kaum einer. Aus Bengasi berichtet Matthias Gebauer mehr... ";
  ok( storage.decompress(storage.compress(str))==str, "this test is fine" );
});

test("basic japanese text compress/decompres test - expected to fail", function() {
    var storage=sqlite_storage({
  						short_name:'_library_test' ,
  						display_name : 'books_test' ,
  						version : '1.0' ,					
  						max_size : 5*1024*1024
  			});
	
  var str=" 消息情報、避難所、義援金受付など ";	
  ok( storage.decompress(storage.compress(str))==str, "EXPECTED TO FAIL FOR NOW" );
});

test("sample book text compress/decompres test", function() {
    var storage=sqlite_storage({
  						short_name:'_library_test' ,
  						display_name : 'books_test' ,
  						version : '1.0' ,					
  						max_size : 5*1024*1024
  			});

	
	$.get("../data/gutenberg_526.txt?"+Math.random(),function(data){
		start();	
		ok(storage.decompress(storage.compress(data))==data, "this test is fine" );
	});  
});


		
test(" books text compress/decompress test", function() {



    var storage=sqlite_storage({
  						short_name:'_library_test' ,
  						display_name : 'books_test' ,
  						version : '1.0' ,					
  						max_size : 5*1024*1024
  			});
			stop();
			$.get("../php/get_all_books.php", {}, function(book_data) {
		
				var book_list=jQuery.parseJSON(book_data);

				for (var id in book_list)
				{

					$.get("../data/"+id+".txt?"+Math.random(),function(data){						
						var result=storage.decompress(storage.compress(data))==data;
						start();						
						ok(result, "this test is fine" );
						stop();
					}); 
		
				}
	
});

	
});
















