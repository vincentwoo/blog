# encoding: utf-8
require 'rubygems'
require 'nokogiri'

module Liquid
  module StandardFilters

    def truncatehtml(raw, max_length = 15, continuation_string = "…")
      raw.encode!('UTF-8')
      doc = Nokogiri::HTML.fragment(raw)
      current_length = 0
      deleting = false
      to_delete = []
      terminator = !!raw.index('~')

      depth_first(doc.children.first) do |node|
        if deleting
          to_delete << node
        end

        if terminator
          if !deleting && node.class == Nokogiri::XML::Text && idx = node.text.index('~')
            deleting = true
            if idx > 0
              node.content =  node.text[0..idx-1]
              node.content += continuation_string unless ['!', '.', '?'].include? node.text[-1, 1]
            else
              node.content = ''
            end
          end
        else
          if !deleting && node.class == Nokogiri::XML::Text
            current_length += node.text.length
          end

          if !deleting && current_length > max_length
            deleting = true

            trim_to_length = current_length - max_length + 1
            trim_to_length += 1 while node.text[trim_to_length] =~ /[[:alnum:]]/
            node.content = node.text[0..trim_to_length-1] + continuation_string
          end
        end
      end

      to_delete.each &:remove
      doc.inner_html
    end

  private

    def depth_first(root, &block)
      return unless root && root.parent
      parent = root.parent
      sibling = root.next
      first_child = root.children.first

      yield(root)

      if first_child
        depth_first(first_child, &block)
      else
        if sibling
          depth_first(sibling, &block)
        else
          # back up to the next sibling
          n = parent
          while n && n.next.nil? && n.name != "document"
            n = n.parent
          end

          # To the sibling - otherwise, we're done!
          if n && n.next
            depth_first(n.next, &block)
          end
        end
      end
    end

  end
end