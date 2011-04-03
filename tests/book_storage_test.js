test("basic compress/decompres test", function() {
  ok( decompress(compress("test"))=="test"	, "this test is fine" );
});

test("basic german text compress/decompres test", function() {
  var str="Die Frontlinie in Libyen verschiebt sich jeden Tag, Zehntausende Menschen sind aus der Kampfzone geflüchtet. Nun leben sie in Notunterkünften - wie die Familie Elalwani. Angespannt verfolgen Vater, Mutter und Kinder die Nachrichten aus der alten Heimat, an eine rasche Rückkehr glaubt kaum einer. Aus Bengasi berichtet Matthias Gebauer mehr... ";
  ok( decompress(compress(str))==str, "this test is fine" );
});

test("basic japanese text compress/decompres test - expected to fail", function() {
  var str=" 消息情報、避難所、義援金受付など ";	
  ok( decompress(compress(str))==str, "EXPECTED TO FAIL FOR NOW" );
});

test("sample book text compress/decompres test", function() {

	stop();
	$.get("../data/gutenberg_526.txt?"+Math.random(),function(data){
		start();	
		ok(decompress(compress(data))==data, "this test is fine" );
	});  
});


		
test(" books text compress/decompress test", function() {
	for (var id in conf.book_list)
	{
		stop();
		$.get("../data/"+id+".txt?"+Math.random(),function(data){
			start();
			ok(decompress(compress(data))==data, "testing "+id );
		}); 
	}
	
});


