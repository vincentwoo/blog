---
title: Cheap Toto Pagination
layout: post
---

[Toto](http://cloudhead.io/toto) is a great tiny blogging platform for
Ruby/Rack. However, it doesn't expose much in the way of a MVC structure
and it can be just annoying enough when you want to add some feature
that isn't there. In this case, I wanted to add some simple older/newer
pagination to the front page. To my chagrin, I couldn't find a way to
pass variables to a Toto page without using the GET variable syntax
(i.e. ?page=1) and I still wanted to hold onto the rails RESTful
paradigm of /page/1, so I monkey patched the Toto::Site dispatcher, like
so:

{% highlight ruby %}
# in config.ru
class Toto::Site
    alias_method :old_go, :go

    def go route, env = {}, type = :html
        if not route.first =~ /\d{4}/ and route.size == 2 and route.last =~ /(\d+)/
            @config[:id] = route.last.to_i
            route.pop
        end
        ret = old_go route, env, type
        @config.delete :id
        ret
    end
end
...
# and in the config initializer block:
set :root, "page"                                           # page to load on /
{% endhighlight %}

You can see that we intercept routes that look like name/1234 and pass
the numeric portion of the route in @config[:id], and then clear
@config[:id] (because @config is persistent). This is pretty hacky and
only really acceptable in the context of Heroku caching everything.

and in templates/pages/page.rhtml...

{% highlight rhtml %}
<%
    page = @config[:id]
    per_page = @config[:articles_per_page]
    page = 1 if (page.nil? or (page-1) * per_page > @articles.length) or page < 1
    page_results = @articles[(page-1) * per_page .. page * per_page - 1]
    prev_page = page > 1 ? page - 1 : nil
    next_page = @articles.length > page * per_page ? page + 1 : nil
%>
...
<p id="footer">
<% if prev_page %>
    <a href="/page/<%=prev_page%>">&laquo; newer</a>
    <% if next_page  %>|<% end %>
<% end %>
<% if next_page %>
    <a href="/page/<%=next_page%>">older &raquo;</a>
<% end %>
</p>
{% endhighlight %}

Also, syntax highlighting brought to you by [highlight.js](http://softwaremaniacs.org/soft/highlight/en/).
