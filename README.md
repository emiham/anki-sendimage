https://addons.mozilla.org/en-US/firefox/addon/send-image-to-anki/

This a small Firefox addon that let's you right click an image and directly add
it to an [Anki](https://apps.ankiweb.net/) card.

Requires [AnkiConnect](https://ankiweb.net/shared/info/2055492159). 

The intended workflow is this:
1. Start reviewing your Anki cards.
2. When you encounter a card that doesn't have an image (or has an image you
   would like to change), open Firefox and search for an image.
3. Right click your desired image and choose "Send image to Anki".
4. It will be added to the field named "Image" on the currently displayed card.

You can make step 2 a lot quicker by adding a link to an image search to your card. 

For example:
```html
<a href="https://duckduckgo.com/?hps=1&q={{Expression}}&iax=images&ia=images">
  {{#Image}}<div class="crop">{{Image}}</div>{{/Image}}
  {{^Image}}<img src="_no_image.png"/>{{/Image}}
</a>
```
