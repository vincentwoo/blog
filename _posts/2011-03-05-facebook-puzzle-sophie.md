---
title: "Facebook Puzzle: sophie"
date: 05/03/2011
layout: post
---

This week: Facebook's [sophie
puzzle](http://www.facebook.com/careers/puzzles.php?puzzle_id=11). This
one is "buffet" difficulty, which translates roughly to "the underlying
problem is NP-complete," which explains why I have such a hard time
choosing food at sushi buffets. In any case, the problem is to find your
cat in your apartment, where you know where the cat is likely to be, as
well as the transit times between the various locations in your home.

I'll document here the various bad solutions I came up with on my way to
a decent one, and as a bonus: an optimized-ish version in C++! ~

### About the math
The problem asks you to minimize the expected time to find sophie. What
does this mean? Take a look at the example input (comments mine).

    4
    #node name    #probability sophie is there
    front_door    .2
    in_cabinet    .3
    under_bed     .4
    behind_blinds .1
    5
    #node x    #node y       #time between x and y
    front_door under_bed     5
    under_bed  behind_blinds 9
    front_door behind_blinds 5
    front_door in_cabinet    2
    in_cabinet behind_blinds 6

This says there are four nodes and five edges between those nodes, and
that 40% of the time, sophie is going to be under the bed. If sophie was
under the bed 100% of the time, the optimal path to minimize the
expected time to find her would be just the path that takes you to the
bed in the shortest amount of time. But since some nodes are unlikely to
hide sophie, you can afford to take your sweet time getting to them.

For this sample input, the optimal path is front_door, in_cabinet,
under_bed, behind_blind. Note that to go from in_cabinet to under_bed,
you should pass through the front_door node. The expectation for this
path is 6.00 seconds, as explained from this snippet from [David
Eisenstat's site](http://www.davideisenstat.com/fbpfaq/#sophie):

    Pr(front_door) * 0
    + Pr(in_cabinet) * Distance(front_door, in_cabinet)
    + Pr(under_bed) * (Distance(front_door, in_cabinet)
                       + Distance(in_cabinet, under_bed))
    + Pr(behind_blinds) * (Distance(front_door, in_cabinet)
                           + Distance(in_cabinet, under_bed)
                           + Distance(under_bed, behind_blinds))
        = .2 * 0 + .3 * 2 + .4 * (2 + 7) + .1 * (2 + 7 + 9) = 6.00

### Building the graph

The input only includes edges between particular nodes. In order to know
that, say, the distance between the cabinet and the bed is 7 (through
the front door), you have to build up the shortest distances between
every node in the graph. This is known as the "all pairs shortest path"
problem. There exists a quite famous dynamic programming algorithm to
solve this, the [Floyd Warshall
algorithm](http://en.wikipedia.org/wiki/Floyd%E2%80%93Warshall_algorithm
). Trivially implemented in Ruby:



    # note that $weights[x][y] is initialized to either
    # Float::MAX if there is no edge between x and y, or
    # to whatever the length of the edge is if there is.
    def floyd_warshall
        for k in 0..$num-1
        for i in 0..$num-1
        for j in 0..$num-1
            if $weights[i][k] + $weights[k][j] < $weights[i][j]
                $weights[i][j] = $weights[i][k] + $weights[k][j]
                $next[i][j] = k
            end
        end
        end
        end
    end

    # links menoizes the list of nodes you need to traverse
    # between nodes i and j
    def links(i, j)
        k = $next[i][j]
        return k if k.class == Set
        $next[j][i] = $next[i][j] = (k.nil? or i == j) ?
            Set.new([]) :
            (links(i, k) + Set.new([k]) + links(k, j))
    end

This gives a good starting point for actually trying to start solving
the problem.

### BFS solution
In my hubris, I figured a breadth first search where you expand on the
path with the lowest current expected time would work. Here's what it
looks like:

    def solve
        queue = MinHeap.new
        queue.push 0.0, [[0], Set.new((1..$num-1).select {|n| $probs[n] > 0}), 0.0, 0.0]
        while not queue.empty?
            node, remain, time, expected = queue.pop
            if remain.empty?
                p node
                return expected
            end
            # only iterate remaining nodes that you don't need to
            # go through other remaining ndoes to reach
            remain.select {|n|
                (links(node.last, n) & remain).empty?
            }.each do |n|
                new_time = time + $weights[node.last][n]
                new_expected = expected + $probs[n] * new_time
                queue.push new_expected, [node + [n], remain - [n], new_time, new_expected]
            end
        end
    end

In my defense I hadn't yet realized that the sophie problem is a variant
of the traveling salesman problem and that a BFS search would take
forever on large graphs. This doesn't work because you incrementally
build all the bad paths on your way to finding the first path to
complete. Complexity: proportional to the number of paths, or O(n!).

### DP Solution

Hitting upon the realization that the problem is a variant of the
[traveling salesman
problem](http://en.wikipedia.org/wiki/Traveling_salesman_problem) I
decided to try the canonical dynamic programming solution to TSP.

The DP solution requires that you build a structure like

    C[subset][j]

where subset is some subset of all nodes, and j is a node in that
subset. The value of this entry should be the minimum expected time to
proceed from node 0 to node j and through all the nodes in the subset.
The problem then reduces to finding the minimum of:

    C[subset - [j]][i] # for all i in subset

There are some problems here, but first, some code:

    def solve
        relevant = (1..$num-1).select {|n| $probs[n] > 0}
        hash = {}
        hash[[0]] = {0 => [0, 0]}
        for size in 1..relevant.size
            relevant.combination(size).each do |subset|
                subset.insert 0, 0
                hash[subset] = {0 => [Float::MAX, Float::MAX]}
                for j in subset
                    next if j == 0
                    reduced = subset - [j]
                    hash[subset][j] = reduced.collect {|i|
                        e, t = hash[reduced][i]
                        t += $weights[i][j]
                        [e + t * $probs[j], t]
                    }.min {|a,b| a.first <=> b.first}
                end
            end
        end
        hash[[0] + relevant].values.collect {|x| x.first}.min
    end

This works, but isn't fast. A 17 node graph took me about 10 minutes to
finish. The problem is that since subsets aren't ordered, there is no
convenient way to represent them as array indices and you must therefore
hash entire subsets. Since there are 2<sup>n</sup> subsets, and you must
compute the path that ends in each node in each subset, which itself
requires examining all other previous paths of the subset minus one of
its elements (breathe), the complexity here is
O(2<sup>n</sup>n<sup>2</sup>).

### Recursive Backtracking (Pruning) Solution

[Backtracking](http://en.wikipedia.org/wiki/Backtracking) can be thought
of as essentially a DFS search with fast failure. For example, say you
have found a complete path that you know will give you an expected time
of 30 seconds. Now you are attempting to build another path, and halfway
through you know your partial expected time is already 31 seconds. You
can abandon building this path, saving yourself the hassle of expanding
all of that partial path's children.

Skipping entire subtrees is known as pruning, and you can achieve some
pretty massive savings depending on how well you implement it. My
solution was to very conservatively estimate the remaining expectation
of a partial path. For instance, if you are halfway through a path with
a current expected time of 10 seconds, a path length of 20 seconds and
you have covered 60% of the places where sophie can be, then even in the
perfect case where the next node was 0 seconds away and had a 40%
probability of hiding sophie, you would still incur an additional 20 *
.4 = .8 seconds of expected time. If you have already found a minimum
path length of say, 10.5, you can prune this subtree where you could not
have before.

And without further ado, here's the code.

    $min = Float::MAX
    def solve(node, remain, unseen, expect = 0, time = 0)
        return if expect + unseen * time >= $min
        return ($min = expect) if remain.empty?
        remain.each do |n|
            next_time  = time + $weights[node][n]
            solve n,
                  remain - [n],
                  unseen - $probs[n],
                  expect + next_time * $probs[n],
                  next_time
        end
        $min
    end

This works fairly well. We can do that 17 node graph in 30 seconds now.
I don't have a good estimate of the complexity improvement here, since
you can generate corner cases that can prevent any pruning from
happening.

### Optimizations!

Ruby is slow. At least, Cygwin's default Ruby 1.8.7 interpreter is slow.
I decided to reimplement the whole deal in C++ and see what kind of
speedups I could achieve. Here is my initial implementation in C++:

    double solve(int node, set<int> &remain, double unseen,
            double expect = 0.0, double time = 0.0) {
        static double min = numeric_limits<double>::max();
        if (expect + unseen * time >= min)
            return -1;
        if (remain.size() == 0) {
            min = expect;
            return -1;
        }
        for (set<int>::iterator n = remain.begin(); n != remain.end(); n++) {
            int next = *n;
            double next_time = time + weights[node][next];
            set<int> next_remain = remain;
            next_remain.erase(next);
            solve(next, next_remain, unseen - probs[next],
                expect + next_time * probs[next], next_time);
        }
        return min;
    }

However, the speedup here was only a factor of two or so. Where are the
bottlenecks? Turns out, a big one in both Ruby and C++ is the constant
recreation of the remainder set at

    set<int> next_remain = remain;

It's much faster to just do:

    set<int> next_remain = remain;
    for (set<int>::iterator n = remain.begin(); n != remain.end(); n++) {
        int next = *n;
        double next_time = time + weights[node][next];
        next_remain.erase(next);
        solve(next, next_remain, unseen - probs[next],
            expect + next_time * probs[next], next_time);
        next_remain.insert(next);
    }

This way, you only do one set copy per recursion, and then just pass
around to all of your children. "But Vincent," you say, "why even
bother recreating the set at each recursion? Can't you just pass alone
one set of remaining nodes and add and remove from it?" Sure, but its
very annoying to not invalidate iterators to a set that is constantly
shrinking and growing through iteration and recursion. Here's what I
came up with:

    double solve(int node, vector<node_entry> &remain, double unseen,
            double expect = 0.0, double time = 0.0) {
        static double min = numeric_limits<double>::max();
        if (expect + unseen * time >= min)
            return -1;

        bool empty = true;
        for (vector<node_entry>::iterator n = remain.begin(); n != remain.end(); n++) {
            if (!n->active)
                continue;
            empty = false;
            int next = n->index;
            double next_time = time + weights[node][next];
            n->active = false;
            solve(next, remain, unseen - probs[next],
                expect + next_time * probs[next], next_time);
            n->active = true;
        }
        if (empty) min = expect;
        return min;
    }

This way we just store whether an element is active or not in the data
model itself, instead of representing that information with presence in
a set. This is nice because adding/removing from a set, while O(log(n))
fast, ain't no O(1). This gets us (for our 17 node graph):

    $ make && time ./sophie in_sophie5.txt
    make: `sophie' is up to date.
    38.20

    real    0m0.220s
    user    0m0.156s
    sys     0m0.030s

Hooray!

### Final Thoughts

I didn't talk about any of the edge cases, but you need to check for if
it's actually possible to be sure to find sophie. In particular, if
there are nodes that aren't reachable from the first node that sophie
has a chance of being in then you need to fail.

> Dear submitter,
>
> Thank you for your submission of a puzzle solution
> to Facebook! After running your solution to sophie (received on March 5,
> 2011, 8:14 pm), I have determined it to be correct. Your solution ran
> for 25.118 ms on its longest test case.



Also, full source and some plagiarized test cases are all on
[github](https://github.com/vincentwoo/rubycode/tree/master/sophie).
