---
title: The Affirm Programming Puzzle
layout: post
---


<script src="http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML"></script>

The latest startup from internet luminary [Max Levchin][1] recently launched,
and they have a very entertaining programming puzzle up on their [jobs page][2].

You should read the page for some background, but in summary the problem is to
find the distances between any two cells in a hexagonal grid numbered in the
following manner:

![The hexagonal grid][3]~

### Approach

The problem is interesting because the problem seems like a traditional graph
theory approach, but Affirm hints that your solution should work at the
scale of ten billion nodes. These two ideas don't really jive, so one wonders if
there's an analytic solution that doesn't involve any graph traversal.

It seems plausible that there is one, since the problem seems very similar to
calculating the [Manhattan Distance][4] between any two nodes in a rectangular
grid, except in this case we have a hexagonal grid where there are six ways to
move between neighboring nodes instead of four. These six neighboring cells lie
along three axes of movement.

picture of axes of movement

If you play around with the axes in your head, you can see that you can
represent any hexagon in terms of any two of the three axes of movement. The
corollary to that conclusion is that any translation down one axis of movement
can be thought of as some combination of the other two. Essentially, we have one
almost-unnecessary axis.

picture of axes with grid

This suggests an approach:

* Turn a hex's number into its grid coordinates
* Figure out the distance between two arbitrary grid coordinates

### Translating a hex number into coordinates

Going from an arbitrary hex number to coordinates seems a bit tricky at first.
You can't modulo or divide by anything obvious to get some aspect of the
geometry. The hex at position 1000 could be almost anywhere. What does seem obvious,
though, is that higher numbers must be on larger "rings" of hexagons. Indeed,
closer examination shows that each larger ring of hexagons has 6 more nodes than
the last. Therefore:

<p>$$ MaxNumberOnRing(i) = ‎{ ‎\sum\limits_{ring=0}^i 6ring } + 1  $$</p>

{% highlight ruby %}
require 'matrix'

UNIT_HEXAGON = {
  0 => Vector[-1,  0],
  1 => Vector[ 0,  1],
  2 => Vector[ 1,  1],
  3 => Vector[ 1,  0],
  4 => Vector[ 0, -1],
  5 => Vector[-1, -1]
}

def ring_to_max_num ring
  3 * ring**2 + 3 * ring + 1
end

def num_to_ring num
  (Math.sqrt((4 * num - 1) / 12.0) - 0.5).ceil
end

def num_to_coords num
  return Vector[0, 0] if num == 1

  ring = num_to_ring num
  offset = ring_to_max_num(ring) - num

  side_number = offset / ring
  side_offset = offset % ring

  translation = UNIT_HEXAGON[side_number]
  transition = UNIT_HEXAGON[(side_number + 1) % 6] - translation
  (translation * ring) + (transition * side_offset)
end

def length_of_delta delta
  delta = -1 * delta if delta.all? {|i| i < 0}
  [delta.max, delta.max - delta.min].max
end

def distance_between num1, num2
  delta = num_to_coords(num1) - num_to_coords(num2)
  length_of_delta delta
end

{% endhighlight %}


[1]: http://en.wikipedia.org/wiki/Max_Levchin
[2]: https://affirm.com/jobs
[3]: /images/affirm/hexgrid.png
[4]: http://en.wikipedia.org/wiki/Taxicab_geometry