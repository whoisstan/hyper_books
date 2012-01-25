var sqlite_storage=function(settings) {

	try 
	{		
		var pub = {};
		
		var drop_sql="drop table if exists books;";
		var create_sql='CREATE TABLE IF NOT EXISTS books (id TEXT NOT NULL PRIMARY KEY, title TEXT NOT NULL, authors TEXT NOT NULL, authors_sort_key TEXT NOT NULL, content BLOB DEFAULT "", language TEXT NOT NULL, chapters TEXT DEFAULT "", bookmarks TEXT DEFAULT "", purchase_links TEXT DEFAULT "", page_background TEXT DEFAULT "", cover_markup TEXT DEFAULT "", cover_css TEXT DEFAULT "", page_css TEXT DEFAULT "", version TEXT DEFAULT "", is_ready INTEGER DEFAULT 0, current_page INTEGER DEFAULT 0, is_current_book INTEGER DEFAULT 0);';

		var content_seperator='^&';

		pub.content_array_to_string=function(array)
		{
			return array.join(content_seperator);
		};

		pub.content_string_to_array=function(string)
		{
			return string.split(content_seperator);
		};

		pub.init=function(success,errorCallback)
		{
		
			db=openDatabase(settings.short_name, settings.version, settings.display_name, settings.max_size);
			db.transaction(function(transaction){transaction.executeSql(create_sql,[],success,function(transaction, error){ errorCallback('init',error)})});
		};
		

		pub.book_update_content=function(book,successCallback,errorCallback)
		{
			db.transaction(
			    function(transaction){			
					transaction.executeSql("update books set is_current_book = 0;",[],function(){},function(transaction, error){ errorCallback('book_update_content1',error)});
					transaction.executeSql("update books set content = ?,chapters=?,is_ready=?,is_current_book=1 where id = ?;", [pub.compress(pub.content_array_to_string(book.content)),JSON.stringify(book.chapters),book.is_ready,book.id],successCallback,function(transaction, error){ errorCallback('book_update_content2',error)} );
				});
		};
		pub.add_book=function(id,book,successCallback,errorCallback)
		{
			book.id=id;
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
							[id, book.title, book.authors.join(','),book.authors[0].split(' ').pop(), book.language, book.cover_markup!=null?book.cover_markup:"", book.cover_css!=null?book.cover_css:"", book.page_css!=null?book.page_css:"", JSON.stringify(book.purchase_links!=null?book.purchase_links:{}), 0 ], successCallback(book),function(transaction, error){ console.log(error); errorCallback('add_book_inner',error)} );						
											
					}
					else
					{
						successCallback(book);
					}
					
				},
				function(transaction, error){ errorCallback(error)}
				)});
			}
			catch(e)
			{
				errorCallback(e);
			}	
		};
		
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
				conditions=" where is_ready=1 ";
			}
			else if(is_ready==2)
			{
				conditions=" ";
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
		};
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
						book.content=pub.content_string_to_array(pub.decompress(book.content));
						book.chapters=book.chapters!=''?JSON.parse(book.chapters):[];		
						book.purchase_links=JSON.parse(book.purchase_links);			
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
		};
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
		};
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
					book.content=pub.content_string_to_array(pub.decompress(book.content));
					book.chapters=book.chapters!=''?JSON.parse(book.chapters):[];
					book.purchase_links=JSON.parse(book.purchase_links);
					successCallback(book);
				}
			}
			db.transaction(
			    function (transaction) {
			        transaction.executeSql("SELECT * from books where is_current_book=1;",[], _successCallback, function(transaction, error){ errorCallback('get_current_book',error)});
			    }
			)
		};
		pub.update_current_page=function(id,page)
		{
			db.transaction(
			    function (transaction) {			
			        transaction.executeSql("update books set is_current_book = 0;",[],function(){}, function(transaction, error){ errorCallback('update_current_page_1',error)} );				
			        transaction.executeSql("update books set current_page = ? ,is_current_book = 1 where id = ?;",[page,id],function(){}, function(transaction, error){ errorCallback('update_current_page_2',error)} );
			    }
			)	
		};
		//helper methods
		pub.compress=function(to_compress)
		{
			var output = new OutStream();
			var compressor = new LZWCompressor(output);

			compressor.compress(to_compress);

			var s="";
			for (var i=0;i<output.bytestream.length;i++)
			{s+=String.fromCharCode(output.bytestream[i]+1)}

			return output.offset+","+s;
		};

		pub.decompress=function(s){

			var offset=parseInt(s.substring(0,s.indexOf(',')));
			s=s.substring(s.indexOf(',')+1);

			var bytes=[];
			for (var i=0;i<s.length;i++)
			{bytes.push(s.charCodeAt(i)-1)}

			var instream = new InStream(bytes,offset);
			var decompressor = new LZWDecompressor(instream);
			return decompressor.decompress();


		};


		  function convert_to_mutable(book)
		  {
			var mutable=new Object();
			for(var key in book){mutable[key]=book[key]}
			return 	mutable;
		  };


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
			    };

			    this.Insert = function(str)
			    {
			        var numBits = this.ValSizeInBits();
			        this.hashtable[str] = this.nextcode++;
			        return numBits;
			    };

			    this.Lookup = function(str)
			    {
			        return (this.hashtable[str]);
			    };

			    this.ValSizeInBits = function()
			    {
			        // How many bits are we currently using to represent values?
			        var log2 = Math.log(this.nextcode + 1)/Math.LN2;
			        return Math.ceil(log2);
			    };
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
			    };

			    this.Insert = function(str)
			    {
			        this.revhashtable[this.nextcode++] = str;

			        // How many bits are we currently using to represent values?
				// Look ahead one value because the decompressor lags one iteration
				// behind the compressor.
			        var log2 = Math.log(this.nextcode + 2)/Math.LN2;
			        this.numBits = Math.ceil(log2);
			        return this.numBits;
			    };

			    this.LookupIndex = function(idx)
			    {
				return this.revhashtable[idx];
			    };

			    this.ValSizeInBits = function()
			    {
			        return this.numBits;
			    };
			};

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

	 	return pub;
	}
	    catch (e){ 
	      if(typeof(console)!="undefined") {
		alert("Error="+e);
	        console.log(e);
	      }
	    }

};
