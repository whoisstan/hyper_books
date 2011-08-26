
var conf=
{
	_log:function(){console.log.apply(console, arguments)},	

	processors:{
		txt:  txt_processor()
	},

	storage:{
		sqlite: sqlite_storage({
					short_name:'_library_' ,
					display_name : 'books' ,
					version : '1.0' ,					
					max_size : 5*1024*1024
		})
	}			
};
