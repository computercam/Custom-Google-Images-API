# Google Images third party API
[API Demo](https://bit.ly/2nkL69z)

### Summary
- A very basic image metadata scraper for google images.
- Query a set of keywords, get a json object back, with related image search handlers.

### Setup
- Spin up an ubuntu based server distro.
- Clone the project using git.
- Run `bash setup.sh`

### Usage
Query the server with the following format:

`http://myserver.com/?keywords=saturn+rain`

You can query related image results as well.
- Queries will contain a property called rimg per result, query the api with the value of this property.

`http://myserver.com/?keywords=saturn+rain&rimg=123foo_BAR_098_baz`

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
- [x] Ability to limit the number of results returned.
- [ ] Ability to get the second and following page of results. (Currently only gets the first 100 images)
- [ ] More fine grained querying options for image results (Such as color, safe search options, image type, size ect)
- [ ] Caching for previously queried results.

### 
### What's it using?
- Node with Express for the backend.
- Puppeteer for content scraping.
- Axios for XHR.
