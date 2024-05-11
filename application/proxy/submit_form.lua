local http = require "resty.http"
local httpc = http.new()
local reqType = ngx.var.request_method
if reqType == "POST"
then
    ngx.req.read_body()
    local request_body = ngx.req.get_body_data()
    local res, err = httpc:request_uri("http://localhost:8080/trackedEntityInstances.json", {
        method = "POST",
        body = request_body
    })
    ngx.say(err)
else
    ngx.say("Not Allowed Method " .. reqType .. ngx.HTTP_POST)
end
