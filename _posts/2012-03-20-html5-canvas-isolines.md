---
title: HTML5 canvas isolines
date: 20/3/2012
layout: post
---

Here's a little page that [draws isolines in a canvas element](/js/isolines.html).
It uses the [marching squares algorithm](http://en.wikipedia.org/wiki/Marching_squares)
and can take dynamic data in the form of a tab separated value file (.tsv). ~

Such a file should be formatted thusly:

    10	90	30	10	50	40
    0	70	20	0	5	10
    20	30	10	20	70	30
    50	60	70	100	10	20
    80	20	40	35	60	15
    20	10	40	50	30	40