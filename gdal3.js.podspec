require "json"
package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.module_name  = "gdal3js"
  s.name         = package["name"]
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.author       = "Bugra SARI"
  s.source       = { :http => "https://gdal3.js.org" }
  s.vendored_frameworks = 'gdal3js.xcframework', 'gdal.xcframework'
end
