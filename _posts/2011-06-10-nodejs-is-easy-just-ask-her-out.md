---
title: NodeJS is easy, just ask her out
date: 10/06/2011
notable: true
layout: post
---

NodeJS is the hot new girl on the block. You've flirted a few times at meetups,
and you think you could probably get a date with her if you asked. However, you
still have doubts. She's smart, but sometimes it feels like her Inception-esque
nested callback conversation is out of your league. Maybe you'd be better off
getting back together with Rails. You find yourself missing her concise,
imperative style during tedious stretches of smalltalk on dates with other
programming languages. She was nice, and she loved you. ~

You tell yourself, "No, she was nice, but limited." You remind yourself that you
put yourself back in the web development market for a reason. But you worry that
your years of blissful content with Rails have dulled your ability to satisfy
new frameworks.

Well, fear not. She's easy. I don't even mean that in a pejorative sense, she's
easy in a way that will make you feel good about yourself. What's that? Too much
information, but you want to hear how we got together anyway? Well, alright.

### Hooking Up

I started [MultiplayerSet][1] with the intention of making a realtime game that
my non-savvy friends could play with nothing more than a browser. I thought
about how I might do this. Canonical options for realtime behavior in a browser
were limited. You could do something with [Juggernaut][3] and Rails, but, ugh.
Flash on every page? But what about the server side? How do you architect that?
A controller action for every game action? But actions have context, game state,
oh no am I going to have to make a model just to represent the state of every
game oh god session management I already have a day job.

I figured I might as well ask NodeJS out. She seemed worldy, yet content. Her
mantra of "Javascript on the server, Javascript on the client" just *jived* with
me. She had simple answers to all my questions. Just build the server game
states in memory, just hack together jQuery on the client side for interaction.
Let [Socket.IO][8] take care of the heavy lifting. All these things are great,
but the reason they are all great gravitate around one reason: *NodeJS is
fundamentally unstructured*. Everything you might ever want to do in the context
of a web service is present at every layer of abstraction in NodeJS *because
there is basically no abstraction*. Rails is nice because she is fundamentally
structured by convention. Doing anything that Rails isn't already comfortable
with doing is hard.

### Doing it Right (the Wrong Way)

[Some people][4] are just [not going to get it][5]. They'll point at how
disorganized Node is, and ask why you didn't go for the more classy Erlang or at
least stay with the more successful Rails. What they're missing is that Node
doesn't care that you don't know what you doing. *Node is always ready to
party*.

There's no configuration, no convention. Sure, you can have those things if you
want them, but Node doesn't care. She'll let you go from zero to highly
performant (if somewhat kludgy) web service in a tiny amount of code. Writing a
game? Sure, you could set up a structured [RPC framework][7], or you could just
say *fuck it*, drop in some websocket support and hit the ground running. Giant
switch statement in a master method that runs on your server? Rubyists cringe,
but if you're smart you understand that all that fancy routing is just so you
can pretend you won't have to do some regexes later. *Just do it*. Node gets
that you are a [programming motherfucker][9].

Picking Node means understanding that the value of a framework is the difference
between the time savings of its useful abstractions and the tedium of its
[useless ones][11]. Picking Node means understanding that for the intersection
of certain classes of problems and the majority of web frameworks that value is
actually negative. Node doesn't have any baggage and she expects that you leave
yours behind, too.

### Common Misgivings

Alright, I can see you have some reservations about the relationship working out
long term. You raise excellent points about commonJS pain, callback hell, and
having to reinvent various wheels. You point to Rails and her higly streamlined
experience when coding a certain class of project. I say yes, you have a point.
Doing a lot of things you might do in a couple lines in Rails can be aggravating
in Node. She's not very refined, and you have to explain things to her in a very
specific way, and this can be frustrating.

But you know the truth, right? You can see the writing on the wall. The web is
getting more complicated. The hard things that need doing at scale aren't just
serving web pages and responding to REST requests anymore. The hard problems are
now dealing with a huge amount of varied data, different levels of cache
liveness, and varying levels of acceptable asynchronicity. If you subscribe to
convention over configuration, that means having a canonical answer to
everything. That means the default system needs to be able to do anything. That
means that the people who make Rails are going to have to work pretty hard.

There's another way, though. *Fuck* the framework, go for the [lingua
franca][10] and ensure that it works, fast. Ensure that if you need a specific
tool you can [get it][6] in a hurry. Develop on a platform you know can
comfortably handle everything. Make sure nothing's hidden behind the magic veil
of abstraction and that you get to pick what gets done fast and what gets done
slow.

Sure, you won't have fancy syntactic sugar. Sure, Node's no ballroom dancer. But
she works everywhere, and she doesn't care. Just ask her out.

[1]: http://multiplayerset.com
[2]: http://www.travisglines.com/web-coding/webgl-node-js-websockets-a-web-technology-perfect-storm
[3]: http://juggernaut.rubyforge.org/
[4]: http://blog.ankurgoyal.com/post/6433642218/node-js-is-backwards
[5]: http://yehudakatz.com/2011/06/14/what-the-hell-is-happening-to-rails/
[6]: http://npmjs.org/
[7]: http://nowjs.com/
[8]: http://socket.io/
[9]: http://programming-motherfucker.com/
[10]: http://en.wikipedia.org/wiki/JavaScript
[11]: http://steve-yegge.blogspot.com/2010/07/wikileaks-to-leak-5000-open-source-java.html