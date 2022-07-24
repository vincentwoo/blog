#!/bin/sh
set -e

echo "Installing gems"
bundle config path vendor/bundle
bundle install
echo "Gems installed"

echo "Jekyll building"
bundle exec jekyll build
echo "Jekyll build done"
