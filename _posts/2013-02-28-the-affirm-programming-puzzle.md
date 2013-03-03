---
title: The Affirm Programming Puzzle
layout: post
---

The latest startup from internet luminary [Max Levchin][1] recently launched,
and they have a very entertaining programming puzzle up on their [jobs page][2].

You should read the page for some background, but in summary the problem is to
find the distances between any two cells in a hexagonal grid numbered in the
following manner:

![The hexagonal grid][3]~

### Approach

The problem is interesting because the problem seems like a traditional graph
theory approach, but Affirm hints that your solution should work at the scale of
ten billion nodes. These two ideas don't really jive, so one wonders if there's
an analytic solution that doesn't involve any graph traversal.

It seems plausible that there is one, since the problem seems very similar to
calculating the [Manhattan Distance][4] between any two nodes in a rectangular
grid, except in this case we have a hexagonal grid where there are six ways to
move between neighboring nodes instead of four. These six neighboring cells lie
along three axes of movement.

![The grid with axes][5]

If you play around with the axes in your head, you can see that you can
represent any hexagon in terms of any two of the three axes of movement. The
corollary to that conclusion is that any translation down one axis of movement
can be thought of as some combination of the other two. Essentially, we have one
almost-unnecessary axis.

This suggests an approach:

* Turn a hex's number into its grid coordinates
* Figure out the distance between two arbitrary grid coordinates

### Translating a hex number into coordinates

Going from an arbitrary hex number to coordinates seems a bit tricky at first.
You can't modulo or divide by anything obvious to get some aspect of the
geometry. The hex at position 1000 could be almost anywhere. What does seem
obvious, though, is that higher numbers must be on larger "rings" of hexagons.
Closer examination shows that each larger ring of hexagons has 6 more nodes than
the last. Therefore:

<p>$$
  MaxNumOnRing(n) = ‎1 + ‎\sum\limits_{ring=0}^n 6ring        \\
  ... = 1 + 6\sum\limits_{ring=0}^n ring                    \\
  ... = 1 + 6 \frac{n + (n + 1)}{2}                         \\
  ... = 3n^2 + 3n + 1
$$</p>

The formula seems to check out, since the 0^th ring ends in 1, the 1^st ring in
7, the 2^nd ring in 19, and so on. Programatically, you could tell which ring a
hex falls on by finding which two "max-ring" numbers the hex is between. In the
case of say, 12, it would be the 2^nd ring, since it is greater than 7 and less
than 19. However, we can do better mathematically by simply inverting the
previous formula, to get one that takes a number and outputs a ring:

<p>$$
  num = 3n^2 + 3n + 1                                       \\
  num = 3(n^2 + n) + 1                                      \\
  num = 3(n^2 + n + \tfrac{1}{4} - \tfrac{1}{4}) + 1        \\
  num = 3((n + \tfrac{1}{2})^2 - \tfrac{1}{4}) + 1          \\
  \frac{num - 1}{3} + \tfrac{1}{4} = (n + \tfrac{1}{2})^2   \\
  \frac{4num - 1}{12} = (n + \tfrac{1}{2})^2\               \\
  \sqrt\frac{4num - 1}{12} - \tfrac{1}{2} = n
$$</p>

Plugging in num = 10 gets us a ring number of ~1.3, which we round up to 2.
Looks good! Now that we have the ring, we have to do the hard part: figure out
where exactly on the ring we are. It also means we need to finalize our axes.
I've illustrated the coordinate system I went with below. Why I choose this
particular configuration should become clear later:

![The grid with coordinates][6]

Following the pattern of coordinates here, you can see the largest number on
each ring occurs on the negative Y axis. Essentially we can say that if a number
is the largest number on ring n, its position will be (0, -n). After a bit more
thought, I figured that you could represent the various corners of the unit
hexagon as six vectors that all pointed to hexagons exactly one away from the
origin, like so:

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
{% endhighlight %}

You can get any number's position along its hexagon ring by figuring out which
of the six sides of the hexagon it is on, and its distance from the last corner
of the hexagon.

{% highlight ruby %}
def ring_to_max_num ring
  3 * ring**2 + 3 * ring + 1
end

def num_to_ring num
  (Math.sqrt((4 * num - 1) / 12.0) - 0.5).ceil
end

def num_to_coords num
  return Vector[0, 0] if num == 1

  side_length = ring = num_to_ring num # The length of a side is also the ring number
  offset = ring_to_max_num(ring) - num # How far away am I from the end of my ring?

  side_number = offset / side_length
  side_offset = offset % side_length

  translation = UNIT_HEXAGON[side_number]

  # The direction to the next corner is just the position of the next corner
  # minus the position of the current one.
  direction = UNIT_HEXAGON[(side_number + 1) % 6] - translation

  (translation * ring) + (direction * side_offset)
end
{% endhighlight %}

{% highlight ruby %}
def length_of_delta delta
  delta = -1 * delta if delta.all? {|i| i < 0}
  [delta.max, delta.max - delta.min].max
end

def distance_between num1, num2
  delta = num_to_coords(num1) - num_to_coords(num2)
  length_of_delta delta
end

{% endhighlight %}

<script type="text/x-mathjax-config">
  MathJax.Hub.Config({messageStyle: 'none'});
</script>
<script src="http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML"></script>

[1]: http://en.wikipedia.org/wiki/Max_Levchin
[2]: https://affirm.com/jobs
[3]: /images/affirm/hexgrid.png
[4]: http://en.wikipedia.org/wiki/Taxicab_geometry
[5]: /images/affirm/axes.png
[6]: /images/affirm/coordinates.png