
var conf={
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
				},
				'pdf_benjamin_kunstwerk':{
					authors:['Walter Benjamin'],
					title:'Das Kunstwerk im Zeitalter seiner technischen Reproduzierbarkeit',
					language:'de',
					purchase_links:{'amazon':'http://amzn.to/j8LNeO'}
				},
				'gutenberg_au_0600031':{
					authors:['H. P. Lovecraft'],
					title:'The Call of Cthulhu',
					language:'en',
					purchase_links:{'amazon':'http://amzn.to/jsTbbO'}
				},
				'gutenberg_de_5358':{
					authors:['Arthur Schnitzler'],
					title:'Die Traumnovelle',
					language:'de',
					purchase_links:{'amazon':'http://amzn.to/kUMdWH'}
				},	
				'gutenberg_de_326':{
					authors:['Lew Tolstoi'],
					title:'Die Kreutzersonate',
					language:'de',
					purchase_links:{'amazon':'http://amzn.to/jV5qpq'}
				},
					
				'gutenberg_en_28215':{
					authors:['Clifford Donald Simak'],
					title:'Empire',
					language:'en',
					purchase_links:{'amazon':'http://amzn.to/jshApR'}																																					
				}
																																		
													
			}
			
		 };
