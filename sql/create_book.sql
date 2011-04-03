CREATE TABLE IF NOT EXISTS books 
	(id TEXT NOT NULL PRIMARY KEY, 
	title TEXT NOT NULL, 
	authors TEXT NOT NULL, 
	authors_sort_key TEXT NOT NULL, 		
	content BLOB DEFAULT "", 	
	language TEXT NOT NULL, 	
	chapters TEXT DEFAULT "", 	
	bookmarks TEXT DEFAULT "",

	purchase_links TEXT DEFAULT "",	

	page_background TEXT DEFAULT "", 			
	cover_markup TEXT DEFAULT "", 	
	cover_css TEXT DEFAULT "", 		
	page_css TEXT DEFAULT "", 			
	version TEXT DEFAULT "",
	
	is_ready INTEGER DEFAULT 0,
	current_page INTEGER DEFAULT 0,		
	is_current_book INTEGER DEFAULT 0

	);