# &lt;u1-tabs&gt; - element
rendering tabs

## Features

- Minimal
- Use markup as usual
- Navigateable through keys
- Content is searchable (using `hidden=until-found`)

## Usage

```html
<u1-tabs>
    <h4>Tab 1</h4>
    <article>content 1</article>
    <div slot="title" selected>Tab 2</div>
    <div>
        content 2, lorem ipsum dolor sit amet, consectetur adipisicing elit
        sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
        nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
        reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
    </div>
</u1-tabs>
```

```css
u1-tabs {
    max-height:30rem;
}
```

## Install

```html
<link href="https://cdn.jsdelivr.net/gh/u1ui/tabs.el@x.x.x/tabs.min.css" rel=stylesheet>
<script src="https://cdn.jsdelivr.net/gh/u1ui/tabs.el@x.x.x/tabs.min.js" type=module></script>
```

## Demos

[minimal.html](http://gcdn.li/u1ui/tabs.el@main/tests/minimal.html)  
[test.html](http://gcdn.li/u1ui/tabs.el@main/tests/test.html)  

## About

- MIT License, Copyright (c) 2022 <u1> (like all repositories in this organization) <br>
- Suggestions, ideas, finding bugs and making pull requests make us very happy. ♥

