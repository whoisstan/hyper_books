var book_storage=function() {

	try 
	{		
		var pub = {};
		var db = null;

		pub.init_storage=function(success,error)
		{
			if(db==null)
			{
				db=openDatabase(conf.db.short_name, conf.db.version, conf.db.display_name, conf.db.max_size);
				$.get("sql/create_book.sql", function(sql){db.transaction(function(transaction){transaction.executeSql(sql,[],success,error)})});
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
					transaction.executeSql("update books set is_current_book = 0;",[],function(){},function(transaction, error){ errorCallback(error)});
					transaction.executeSql("update books set content = ?,chapters=?,is_ready=?,is_current_book=1 where id = ?;", [compress(book.content.join('^&')),JSON.stringify(book.chapters),book.is_ready,book.id],successCallback,function(transaction, error){ errorCallback(error)} );
				});
				
		}
		pub.add_book=function(id,book,successCallback,errorCallback)
		{
			function nullDataHandler(transaction, results) { }
			db.transaction(
			    function(transaction){
				transaction.executeSql("select *  from books where id=?;",[id],
				function(transaction,results)
				{

					if(results.rows.length==0)
					{
						transaction.executeSql('insert into books (id, title, authors,authors_sort_key, language, cover_markup, cover_css, page_css, purchase_links, is_ready) VALUES (?,?,?,?,?,?,?,?,?,?);', 
							[id, book.title, book.authors.join(','),book.authors[0].split(' ').pop(), book.language, book.cover_markup!=null?book.cover_markup:"", book.cover_css!=null?book.cover_css:"", book.page_css!=null?book.page_css:"", JSON.stringify(book.purchase_links!=null?book.purchase_links:{}), 0 ], successCallback,function(transaction, error){ errorCallback(error)} );						
											
					}
				},
				function(transaction, error){ errorCallback(error)}
				)});
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
			        transaction.executeSql("SELECT id,title,authors,language,is_ready,purchase_links from books "+conditions+" order by authors_sort_key,title ;",[], _successCallback, function(transaction, error){ errorCallback(error)});			
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

					book=convert_to_mutable(results.rows.item(0));
					book.authors=book.authors.split(',');
					if(book.content!=null && book.content!="")
					{
						book.content=decompress(book.content).split('^&');
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
			        transaction.executeSql("SELECT * from books where id=? ;",[id], _successCallback, function(transaction, error){ errorCallback(error)});					
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
			        transaction.executeSql("update books set is_ready=0,current_page=0,content='' where id=?;",[id], _successCallback, function(transaction, error){ errorCallback(error)});

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
					book.content=decompress(book.content).split('^&');
					book.chapters=book.chapters!=''?JSON.parse(book.chapters):[];
					successCallback(book);
				}
			}
			db.transaction(
			    function (transaction) {
			        transaction.executeSql("SELECT * from books where is_current_book=1;",[], _successCallback, function(transaction, error){ errorCallback(error)});
			    }
			)
		}		
		pub.update_current_page=function(id,page)
		{
			db.transaction(
			    function (transaction) {			
			        transaction.executeSql("update books set is_current_book = 0;" );				
			        transaction.executeSql("update books set current_page = ? ,is_current_book = 1 where id = ?;",[page,id] );
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


    
    

function compress(s)
{
   var dict = {};
   var data = (s + "").split("");
   var out = [];
   var currChar;
   var phrase = data[0];
   var code = 256;
   for (var i=1; i<data.length; i++) {
       currChar=data[i];
       if (dict[phrase + currChar] != null) {
           phrase += currChar;
       }
       else {
           out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
           dict[phrase + currChar] = code;
           code++;
           phrase=currChar;
       }
   }
   out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
   for (var i=0; i<out.length; i++) {
       out[i] = String.fromCharCode(out[i]);
   }
   return out.join("");
}

function decompress(s){
    var dict = {};
      var data = (s + "").split("");
      var currChar = data[0];
      var oldPhrase = currChar;
      var out = [currChar];
      var code = 256;
      var phrase;
      for (var i=1; i<data.length; i++) {
          var currCode = data[i].charCodeAt(0);
          if (currCode < 256) {
              phrase = data[i];
          }
          else {
             phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
          }
          out.push(phrase);
          currChar = phrase.charAt(0);
          dict[code] = oldPhrase + currChar;
          code++;
          oldPhrase = phrase;
      }
      return out.join("");
}   


  function convert_to_mutable(book)
  {
	var mutable=new Object();
	for(var key in book){mutable[key]=book[key]};
	return 	mutable;
  }