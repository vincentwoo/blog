require 'tmpdir'

desc 'Deploy to Github page'
task :deploy do
  system "bundle exec jekyll build"
  Dir.mktmpdir do |tmp|
    system "mv _site/* #{tmp}"
    system "git checkout -B gh-pages"
    system "rm -rf *"
    system "mv #{tmp}/* ."
    system "git add ."
    system "git commit -am \"Site updated at #{Time.now.utc}\""
    system "git push origin gh-pages --force"
    system "git checkout master"
    system "echo yolo"
  end
end

