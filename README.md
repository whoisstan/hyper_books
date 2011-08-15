# Hyper Books Intro

Hyper Books is a free mobile web based e‑book reader. The  available books (added to git repo) are a selection of copyright free classics from digital libraries such as Project Gutenberg in Australia, Germany and the USA. Goal was to provide an attractive alternative to Amazon Kindle, B&N Nook and Apple iBooks. A live version can be viewed at http://hyper-books.com/. Hyper Books is designed to work on modern webkit based mobile browsers on platform such as Android, Blackberry OS 6 and iOS 

# Quickstart

Clone the repository into your webserver root, create a database called "hyper_books" in your mysql database, open php/config.php and provide your database credentials. Then open http://localhost/hyper_books/dev.html in your browser. I strongly recommend using dev.html for development since it is using the not minimized css/js files and is therefore better suited for development. 

# Architecture

The project has an HTML5 based front-end. Its using a HTML5 database to store downloaded books on the device for fast access and offline availability. Its also using a HTML5 Manifest for true offline mode. The front-end is supporting simple click and go as well as touch based interactions. It keeps track of your reading progress and your current book. 

The server provides a list of available books. Since parsing of books on the client side can consume a lot of time the backend is also providing a service to deliver a pre-parsed book formatted for the readers device. 


# Book Storage Process

The client side database contains the list of all available books, contained in config.js. The body and chapters of a book are set once a book is downloaded. The maximize storage books are compressed with a LZW compression algorithm. 

When a user downloads a book the client side checks if the book is already available pre-formatted for the user device. If the book is not pre formatted the client is doing the formatting of the book and then sending over the page marks to the server. The next time a user with the same device comes the book will be available pre-formatted. This saves a lot of time for the users. 

A device is not identified by its user agent but by the css definition of a page the client side chose for the device. This way we can ensure that we are always looking for the correct version of a pre-formatted book.

# Formatting

The client side is formatting books by filling a not visible panel word by word from the document containing the book until the page is full and continues on to next page until all book content is formatted. The formatting is also using regular expressions to detect chapters in books and their respective location in the book.

