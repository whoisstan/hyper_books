require 'rubygems'
require 'closure-compiler'
require 'fileutils'

DEPLOY='dist/'

desc "Remove all generate files"
task :clean do
  FileUtils.remove_dir DEPLOY if File.exist? DEPLOY
end

task :prepare do
end

task :all => [:clean,:build_js,:combine_css,:build_manifest] do end

desc "Combine js files into one"
task :combine_js => :prepare do
  FileUtils.mkdir_p DEPLOY+'js'
  File.open(DEPLOY+'js/all.js','w') do |out|
      ["js/book_processing.js","js/book_storage.js","js/config.js","js/book.js"].each do |file| 
        out << File.readlines(file).join
      end
  end
  FileUtils.copy_file "js/jquery.js",DEPLOY+'js/jquery.js'
end


desc "Use the Closure Compiler to compress all.js"
task :build_js  => :combine_js do
  source  = File.read(DEPLOY+'js/all.js')
  header  = source.match(/((^\s*\/\/.*\n)+)/)
  #:compilation_level => 'ADVANCED_OPTIMIZATIONS'
  min     = Closure::Compiler.new().compress(source)
  File.open(DEPLOY+'js/all.build.js', 'w') do |file|
    file.write header[1].squeeze(' ') + min
  end

end

desc "Combine and compress js files into one"
task :combine_css => :prepare do
  FileUtils.mkdir_p DEPLOY+'style'
  File.open(DEPLOY+'style/all.css','w') do |out|
    ["style/book.css"].each do |file| 
      out << File.readlines(file).join.gsub(/\s+/, " ") .gsub(/\} /, "}\n").gsub(/\n$/, "").gsub(/ \{ /, " {").gsub(/; \}/, "}").gsub(/\n/, "")
    end
  end
end

desc "Create a manifest for deployment with updated version manifest buster"
task :build_manifest => :prepare do
  File.open('build.manifest','w') do |out|
      out << File.readlines('manifest/cache.manifest').join.gsub(/VERSION/,Time.new.to_s)
  end    
end


