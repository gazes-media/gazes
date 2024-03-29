local i = 1

request = function() 
   url_path = "/animes/" .. i
   i = i+1
   return wrk.format("GET", url_path)
end
