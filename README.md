# Google Images Metadata Scraper

### Summary
- A very basic image metadata scraper for google images.
- This scraper's ***main feature*** is the ability to ***get the related images link*** for an image.
- This scraper also allows for search by image via url

### Setup
- Spin up an ubuntu based server distro.
- Clone the project using git.
- Run `bash setup.sh`

### Usage
Query the server with the following format:

`http://myserver.com/?keywords=saturn+rain`

You can query related image results as well.

`http://myserver.com/?keywords=saturn+rain&rimg=123foo_BAR_098_baz`

You can search by image as well.

`http://myserver.com/?sbi=http://www.foo.com/bar.jpg`


You can use your favorite XHR library as well

```javascript
axios.get('http://myserver.com/?keywords=diamon+rain')
.then(function (response) {
    console.log(response);
})
.catch(function (error) {
    console.log(error);
});
```
### 
### Todo
- [ ] Ability to limit the number of results returned.
- [ ] Ability to get the second and following page of results. (Currently only gets the first 100 images)
- [ ] More fine grained querying options for image results (Such as color, safe search options, image type, size ect)
- [ ] Caching for previously queried results.
- [ ] Throttling and proxying to prevent getting flagged. (This hasn't been a problem yet)

### 
### What's it using?
- Node JS for the base.
- Puppeteer for scraping.
- Axios for XHR.
