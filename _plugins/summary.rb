module Jekyll
  module Summary
    def summary(post)
      post
    end
  end
end

Liquid::Template.register_filter(Jekyll::Summary)