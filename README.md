# visual-memorize

Visual Memorize helps you to learn associations with images.

Drop a PDF and it will show you the first image of a random page from the PDF.
Then click or tap on the image or press the right arrow key and you'll see the full page.

This is helpful when you need to learn visual identification of things from images, where the images and
information about them is embedded into a PDF document.

## Contributing

Run `pre-commit install` before commiting please.

## Usage

A docker image is published with every release. Run

```
docker run --rm -p 8080:80 ghcr.io/morremeyer/visual-memorize:latest
```

And then open [localhost:8080](http://localhost:8080) in your browser.
