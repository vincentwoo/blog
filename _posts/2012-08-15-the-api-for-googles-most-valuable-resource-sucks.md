---
title: The API for Google's most valuable resource sucks
date: 15/08/2012
tags: notable
layout: post
---

> Disclosure: I recently worked for Google for about a year. It was alright.

Recently, Vic Gundotra of Google+ fame made a bold statement. He
[proclaimed](https://plus.google.com/107117483540235115863/posts/EstNjiL2uon)
that the lack of write API access to Google+ is born not out of lack of
foresight, planning, or even bandwidth, but out of trepidation, caution, and the
desire to do right by developers.

This is raw, barely-refined bullshit~ and I regret not being able to respond to
the thread with a pithier snarky comment. The truth is simpler: Google is
full-stop terrible at APIs.

![Vic Gundotra][vic]
#### Don't look at me, it says so right there

As a case study, let's examine what I had to do in order to use the most
powerful collection of user-generated content that Google makes available to
developers: a user's [email contact list][1]. People who work for consumer-
facing web companies probably know how deeply important having a user's email
address is for marketing. Despite being invented before I was born, email has
yet to be outmoded as the most effective way to push content to users on demand.

### The feature

Recently here at [Everlane][2], we thought it might be a good idea to have a
button a user could hit to view a list of their Gmail contacts with portraits,
select some of them, and then have us send those users an invitation email.
Simple, obvious stuff to want to do, right?

![import screen 1][screen]

![import screen 2][ui]
#### What we want to implement

Well, let's hit the [getting started page][3] of the contacts API documentation.
Reading closely seems to reveal that there might already be a library for doing
what we want, which is really nothing more than getting a bunch of names, faces,
and emails. Those geniuses at Google *have* to have something already made for
this, right? We head over to the [libraries and samples page][4]. Cool, a
[Javascript library][5]! This could be easy! *Nope*, they seem to support every
Google API but Contacts. The Google+ read API doesn't seem to have a good way to
grab emails, either.

That's fine -- we're pretty decent engineers and can call the Contacts API on
our own. We register our application with the [API Console][6] and start reading
about OAuth. Google provides a [few authorization schemes][7]. We probably want
the one titled "[Client-side Applications][8]", which saves us the complexity of
an application server having to be aware of any sensitive information.

### API woes

Now we can finally ask the Contacts API for a list of contacts! Easy enough,
right? We'll just do a JSONP request to get around the cross-domain
restrictions.

<pre><code class="javascript">var authParams = { access_token: ..., token_type: ... }; // from Google oAuth

$.ajax({
  url: 'https://www.google.com/m8/feeds/contacts/default/full',
  dataType: 'jsonp',
  data: authParams,
  success: function(data) { console.log(data); }
});
</code></pre>

What does this give us? To our slow and creeping horror, we get back something
like this for every contact:

    <entry gd:etag='&quot;QHc_fDVSLit7I2A9WhJXFUkDQQ0.&quot;'>
      <id>http://www.google.com/m8/feeds/contacts/your%40gmail.com/base/13659b580fe5686d</id>
      <updated>2012-08-09T22:01:31.944Z</updated>
      <app:edited xmlns:app='http://www.w3.org/2007/app'>2012-08-09T22:01:31.944Z</app:edited>
      <category scheme='http://schemas.google.com/g/2005#kind' term='http://schemas.google.com/contact/2008#contact'/>
      <title>Diane Duane</title>
      <link
        rel='http://schemas.google.com/contacts/2008/rel#photo'
        type='image/*'
        href='https://www.google.com/m8/feeds/photos/media/your%40gmail.com/13659b580fe5686d?v=3.0'
        gd:etag='&quot;UWlBIlclWit7I2A9AFQKRg9YFXoHL0oQSQA.&quot;'/>
      <link
        rel='self'
        type='application/atom+xml'
        href='https://www.google.com/m8/feeds/contacts/your%40gmail.com/full/13659b580fe5686d?v=3.0'/>
      <link
        rel='edit'
        type='application/atom+xml'
        href='https://www.google.com/m8/feeds/contacts/your%40gmail.com/full/13659b580fe5686d?v=3.0'/>
      <gd:name>
        <gd:fullName>Diane Duane</gd:fullName>
        <gd:givenName>Diane</gd:givenName>
        <gd:familyName>Duane</gd:familyName>
      </gd:name>
      <gd:email
        rel='http://schemas.google.com/g/2005#other'
        address='diane.duane@gmail.com'
        primary='true'/>
    </entry>

You take several deep breaths. You ignore the fact that you are fetching roughly
1kb of data per contact (out of potentially thousands) to get a name, an email,
and the URL of an image. "Okay", you think to yourself, "this is still
salvageable. I can parse XML on the client. In fact, jQuery can probably do it
for me." You take a quick stab at grabbing names and emails.

    success: function(data) {
      var xml = $.parseXML(data);
      $(xml).find('entry').each(function() {
        var entry = $(this);
        var name  = entry.find('title').text();
        var email = entry.find('email').attr('address');
      });
    }

A quick browser test shows that this only appears to work in Chrome. A bit more
digging turns up, to your chagrin, that jQuery has trouble finding namespaced
elements like "<gd:email>" in XML documents on different browsers. You Google
around and find a fix:


    var email = entry.find('email, gd\\:email').attr('address');

For now, you ignore [how inefficient this is][9], hoping merely to reach
functionality. It works! Now you want to add images. It looks like one of the
link elements under \<entry\> appears to point to an image for that contact. You
fiddle around on the console:

<pre><code class="javascript">entry.find('link[type="image/*"]').attr('href')
// => https://www.google.com/m8/feeds/photos/media/your%40gmail.com/13659b580fe5686d?v=3.0
</code></pre>

Attempting to load this in your browser gives you a 401. Taking a look a the
[photo management section of the docs][10] seems to suggest you need to
additionally apply auth credentials to this url. You amend your code:

    var href = entry.find('link[type="image/*"]').attr('href');
    var imageUrl = href + '&' + $.param(authParams);

This seems to produce a real photo in your browser. Success! Let's extrapolate:

    $(xml).find('entry').each(function() {
      var entry = $(this);
      var href = entry.find('link[type="image/*"]').attr('href');
      var imageUrl = href + '&' + $.param(authParams);
      $('body').append('<img src="' + imageUrl + '" />');
    });

### Image contortions

Unfortunately, only a few images load. What's going on? You squint at the docs
more closely.

> Note: If a contact does not have a photo, then the photo link element has no
> gd:etag attribute.

Great, so some image links have a magic attribute on them that says they're real
images. You wonder why Google even bothers returning image links for photos that
don't exist. You try something like the following:

<pre><code class="javascript">.find('link[type="image/*"][gd\\:etag]') // or even
.find('link[type="image/*"][gd:etag]') // nope? how about
.find('link[type="image/*"][etag]')
</code></pre>

But no, jQuery can't deal with namespaced attribute selection, at all, so you
arrive at:

<pre><code class="javascript">var link = entry.find('link[type="image/*"]');
if (entry.attr('gd:etag')) {
  var imageUrl = link.attr('href') + '&' + $.param(authParams);
  $('body').append('&lt;img src="' + imageUrl + '" /&gt;');
}
</code></pre>

This time, a few more photos load, but then they stop coming. The console shows
a few successful image loads, but most of the requests for images returned with
**503 (Service Unavailable)** errors. You realize, after an hour or so, that
each image load is being counted as an API call against you, and that there must
be some rate limiting in place.

Naturally, this fact is completely undocumented. Playing around with the
code, you find that Google doesn't like it if you have more than one in-flight
API request at a time. You come up with essentially the opposite of an image
preloader to stagger image loading:

    var imageUrls = ['https://...', ...];
    function staggerImages(index) {
      if (index == imageUrls.length) return;
      var img = new Image();
      img.onload = function() {
        setTimeout(function() {
          // Load the next image 100ms after this one finishes loading
          populateImages(index + 1);
        }, 100);
      };
      img.src = imageUrls[index];
      $('body').append(img);
    }
    populateImages(0);

Whew, that was fun, right? At this point it seems like a good idea to try to
sort contacts by some sort of relevance metric. Unfortunately, the Contacts API
doesn't support this at all. Oh well. You give up, having reached something
approximating your original goals.

### What have we learned?

* Google doesn't get JSON.
* Google can't design clean APIs or document them well.
* Despite their browser-first mantra, Google doesn't put out first-party
  Javascript libraries for the browser.
* Vic Gundotra is *soooooo* lying.

Developers waiting for Google+ to deliver on its full, API-wonderland potential:
you should probably just give up. What are the odds that this whole time,
they've been cooking up the perfect write API, replete with features, libraries,
and documentation? I'm betting that they're doing exactly what I did when I
worked for Google: *absolutely nothing of importance*.

> Lastly, we're always on the lookout for talented developers who are interested
in the fashion space here at [Everlane][2]. You don't need to own more than one
pair of shoes. My love of fashion is born of William Gibson novels and is almost
entirely academic. If you're interested, check out our [jobs page][jobs] or send
me an email at [me@vincentwoo.com][email].

> P.S. Yes, I am aware there is an older [gdata library][11] that can
potentially handle contacts. I might have used it if it wasn't deprecated or
Google had made any mention of it whatsoever on their Contacts API page.

[1]: https://developers.google.com/google-apps/contacts/v3/
[2]: https://www.everlane.com/about
[3]: https://developers.google.com/google-apps/contacts/v3/index#getting_started
[4]: https://developers.google.com/google-apps/tasks/downloads
[5]: http://code.google.com/p/google-api-javascript-client/
[6]: https://code.google.com/apis/console#access
[7]: https://developers.google.com/accounts/docs/OAuth2#scenarios
[8]: https://developers.google.com/accounts/docs/OAuth2UserAgent
[9]: http://www.steveworkman.com/html5-2/javascript/2011/improving-javascript-xml-node-finding-performance-by-2000/
[10]: https://developers.google.com/google-apps/contacts/v3/index#retrieving_a_contacts_photo
[11]: http://code.google.com/p/gdata-javascript-client/

[vic]: http://farm9.staticflickr.com/8440/7784924826_01c136c801.jpg "Vic Gundotra, ladies and gentlemen"
[screen]: http://farm9.staticflickr.com/8293/7784680274_968248f0fb_z.jpg
[ui]: http://farm9.staticflickr.com/8437/7785016330_cf1cf02710_z.jpg
[jobs]: https://www.everlane.com/jobs
[email]: mailto:me@vincentwoo.com
