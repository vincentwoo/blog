require "fileutils"

Jekyll::Hooks.register :site, :post_write do |site|
  relative = "3d"
  source   = File.join(site.source, relative)
  dest     = File.join(site.dest, relative)

  FileUtils.rm_rf(dest)
  FileUtils.mkdir_p(File.dirname(dest))
  FileUtils.cp_r(source, dest)
end