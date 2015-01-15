---
title: Creating Google Hangouts With Apps via URL
layout: post
---

If you've tried to make a Google Hangouts app, you probably already know that it
sucks pretty badly. [Famously terrible documentation][1], crazy bloated
JavaScript, and [mandated UX requirements][2]. You *also* might know that you
can craft a URL to open a new hangout without any of the bloat like so:

`https://plus.google.com/hangouts/_`

But what if you want to make a hangout with your app and set its `app_type` to
`ROOM_APP` so that your app is loaded for everyone by default?

~

Well, some digging on the internet suggests that you can write a URL of the form

`.../_/?gid=YOUR_GID&gd=INITIAL_DATA`

to open a new hangout session with your app loaded and data passed to it.
Unfortunately, this does not set the `app_type` flag specified in Google's
[initial app parameters][3] API. The only way to do so at this time appears to
be Google's official `platform.js` API to render an
"Official G+ Hangouts Button".

**Fuck that.**

There's a bunch of reasons you might not want to play nice, but before going
further you should take note of the [Google buttons policy][4]. Yes, they have
an official policy on buttons. It's a bit murky about whether you are allowed to
programatically generate links to create Hangouts sessions, but the thrust of
the policy is mostly about not misleading users and not snooping their data, so
I assume this is mostly fine.

### Reverse Engineering the Hangouts Button

Google's example for generating a hangouts button via the JS API is:

{% highlight js %}
  gapi.hangout.render('placeholder-rr', {
    render: 'createhangout',
    initial_apps: [{
      app_id:     '184219133185',
      start_data: 'dQw4w9WgXcQ',
      app_type:   'ROOM_APP'
    }]
});
{% endhighlight %}

which renders a button that, when clicked on, briefly opens a window with this
URL:

```
https://talkgadget.google.com/hangouts/_/?hl=en&hcb=0&lm1=1421214770979
&hs=92&hscid=1421214770977081840&ssc=WyIiLDAsbnVsbCxudWxsLG51bGwsW10sbn
VsbCxudWxsLG51bGwsbnVsbCxudWxsLDkyLG51bGwsbnVsbCxudWxsLFsxNDIxMjE0NzcwO
Tc5XSxudWxsLG51bGwsW10sbnVsbCwiMTQyMTIxNDc3MDk3NzA4MTg0MCIsbnVsbCxudWxs
LG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxbXSxbXSxudWxsLG51bGwsbnVsbCxbXSxudWx
sLG51bGwsbnVsbCxbXSxudWxsLG51bGwsW1siMTg0MjE5MTMzMTg1IiwiZFF3NHc5V2dYY1
EiLDJdXV0.
```

which then redirects to a normal hangouts URL where your app is embedded as a
full room app. Let's break apart what's going on here. The params in that URL
are:

```
param | value
------|------
hl    | en
hcb   | 0
lm1   | 1421214770979
hs    | 92
hscid | 1421214770977081840
ssc   | WyIiLDAsbnVsbCxudWxsLG51bGwsW10sbnVsbCxudWxsLG51bGwsbnVsbCxudWx
      | sLDkyLG51bGwsbnVsbCxudWxsLFsxNDIxMjE0NzcwOTc5XSxudWxsLG51bGwsW1
      | 0sbnVsbCwiMTQyMTIxNDc3MDk3NzA4MTg0MCIsbnVsbCxudWxsLG51bGwsbnVsb
      | CxudWxsLG51bGwsbnVsbCxbXSxbXSxudWxsLG51bGwsbnVsbCxbXSxudWxsLG51
      | bGwsbnVsbCxbXSxudWxsLG51bGwsW1siMTg0MjE5MTMzMTg1IiwiZFF3NHc5V2d
      | YY1EiLDJdXV0.
```

`hl` seems obviously to be locale, and `lb1` and `hscid` both seem to be
timestamp-related. A bit of experimentation proves that everything works as long
as `ssc` is included, so we can drop the rest of the params. But what is `ssc`?

It looks suspiciously like a Base 64 encoded blob, so we decode it:

```
["",0,null,null,null,[],null,null,null,null,null,92,null,null,null,
[1421214770979],null,null,[],null,"1421214770977081840",null,null,
null,null,null,null,null,[],[],null,null,null,[],null,null,null,[],
null,null,[["184219133185","dQw4w9WgXcQ",2]]]
```

This looks like a big serialized protobuf or something like it to me. Most of
the fields are unused, and even the obvious timestamp fields are unnecessary.
The following blob works just as well:

```
["",0,null,null,null,[],null,null,null,null,null,0,null,null,null,
[0],null,null,[],null,"0",null,null,null,null,null,null,null,[],
[],null,null,null,[],null,null,null,[],null,null,
[["184219133185","dQw4w9WgXcQ",2]]]
```

We've removed the timestamps and the magic number "92" (I have no idea what
it's for). All that we have left is the app ID, the initial data, and "2" to
signify `ROOM_APP`. Erego, to create a URL to open a hangouts session to an
app with `APP_ID`, `INITIAL_DATA` as a `ROOM_APP` in Ruby:

{% highlight ruby %}
BASE_URL = 'https://plus.google.com/hangouts/_'
ssc_blob = '["",0,null,null,null,[],null,null,null,null,null,0,null,'\
  'null,null,[0],null,null,[],null,"0",null,null,null,null,null,null,'\
  'null,[],[],null,null,null,[],null,null,null,[],null,null,'\
  "[[\"#{APP_ID}\",\"#{INITIAL_DATA}\",2]]]"
BASE_URL + '?ssc=' + Base64.strict_encode64(ssc_blob)
{% endhighlight %}

It works, but no promises on for how long. Good luck out there.

[1]: https://developers.google.com/+/hangouts/getting-started
[2]: https://developers.google.com/+/hangouts/button#button_sizes
[3]: https://developers.google.com/+/hangouts/button#initial_app_parameters
[4]: https://developers.google.com/+/web/buttons-policy
