---
title: Sutro Tower in 3D
layout: post
notable: true
---

If you've lived in San Francisco for a while, you may have gotten curious about the big red triangular tower at the top of Twin Peaks. Most of us know that it's called Sutro Tower, and that it has something to do with broadcasting TV and radio for the Bay Area.

I thought it would be nice to bring San Franciscans closer to our most prominent landmark with a really beautiful model of the tower that you can fly through at your own pace. There are many little tidbits about the tower's workings and history to discover. If you're on a phone, you can also engage AR mode by clicking the little cube, but the model is best experienced on a computer.

<div style="padding-bottom:75%; margin-bottom: 1em; position:relative; display:block; width: 100%">
  <iframe width="100%" height="100%"
    src="/3d/sutro_tower?skip"
    allow="autoplay" frameborder="0" allowfullscreen="true" style="position:absolute; top:0; left: 0">
  </iframe>
</div>

If you have trouble loading the model on this page, you can also [viewing it directly](/3d/sutro_tower).

This scan is made possible by recent advances in [Gaussian Splatting](https://en.wikipedia.org/wiki/Gaussian_splatting). This is an emerging technology that lets us quickly create very detailed models just from photographs. For this model (or splat, as we call them), my friend Daylen and I flew our drones around Sutro Tower at a respectful distance for an afternoon until we had collected a few thousand photographs.

I then aligned these pictures in free software called [RealityCapture](https://www.capturingreality.com). Alignment is the process that teaches the computer that a bunch of points in different images all actually correspond with the same point in real life. Then I used another piece of free software called [gsplat](https://github.com/nerfstudio-project/gsplat) to produce the 3D model itself.

Normally these models would be too large to share with you easily, but thanks to [advances](https://fraunhoferhhi.github.io/Self-Organizing-Gaussians/) in the last year, we've developed new compression techniques. This model only weighs about 30 megabytes, which is about the same as a couple minutes of TikTok video!

Sutro Tower is a wonderful building, and I hope you enjoy learning a bit about it here. If you want to learn more, check out the much more thorough [official digital tour](https://explore.sutrotower.com/).



