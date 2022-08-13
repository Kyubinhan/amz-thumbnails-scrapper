## Thumbnail images scraper on Bezos's favorite website

A small JS project to download thumbnail images using [Puppeteer](https://pptr.dev/).

My friend needed a image scrapper to use in the e-commerce website. The requirements were quite simple so I decided to make one for him.

Note: most of code was reused from this [article](https://dev.to/microworlds/image-downloader-with-puppeteer-and-the-fetch-api-5b8e) and I added additional steps to download high resolution thumbnail images.

### How to run the script

1. run `npm install` to install dependencies
2. create a csv file named `data.csv` with the same format as `examples.csv`
3. run `npm start` or `node main.js`

run `node main.js --help` if you need to read the manual.
