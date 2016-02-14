# ember-ic-you

ember-ic-you is a simple scroll listener that sends an action when the element is in view.

See a demo here: [http://vestorly.github.io/ember-ic-you](http://vestorly.github.io/ember-ic-you)

### Installation

`ember install ember-ic-you`

### Installation for ember-cli 0.1.5 - 0.2.2

`ember install:addon ember-ic-you`

### Usage

At a basic level, you can use the listener in any template.

```
// template.hbs

{{ember-ic-you}}

// containing component or route (or controller)

actions: {
  crossedTheLine(above) {
    // do lots of cool stuff
  }
}

```

### Advanced

ember-ic-you is customizable!

* `crossedTheLine` - action that is sent when the line is crossed
  * default: `'crossedTheLine'`

* `enabled` - whether the listeners should be enabled
  * default: `true`

* `triggerDistance` - the distance from the bottom at which `crossedTheLine` fires
  * default: `0`

* `scrollContainer` - selector for the container that will be scrolled
  * default: `null` (will select `window`)