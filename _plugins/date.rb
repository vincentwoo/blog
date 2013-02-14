require 'date'
require 'facets/integer/ordinal'

module Jekyll
  module DateFilter
    def pretty(date)
      "#{date.strftime('%B')} #{date.strftime('%e').to_i.ordinalize} #{date.strftime('%Y')}"
    end
  end
end

Liquid::Template.register_filter(Jekyll::DateFilter)