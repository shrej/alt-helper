/*
Copyright 2019 Shreyans Jain

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

/*
This sample chrome extension is to demonstrate how can build AI powered apps that can be used 
to fix inaccessible images. This is sample code and should be modified to make it production ready.
*/

// Add your EINSTEIN BASE URL here. It should take take 1 query param text
// EG: https://example.com/api/vision/predict

const EINSTEIN_VISION_URL = "YOUR_EINSTEIN_URL_HERE";
document.addEventListener("DOMContentLoaded", () => {
  function executeChromeScript(code, callback) {
    chrome.tabs.query({ active: true }, function(tabs) {
      const tab = tabs[0];
      chrome.tabs.executeScript(
        tab.id,
        {
          code: code
        },
        callback
      );
    });
  }

  document.getElementById("predict").addEventListener("click", () => {
    const selectedModelId = document.getElementById("selectedModel").value;
    const GET_ALL_IMAGES =
      'Array.prototype.slice.call(document.querySelectorAll("img")).map(function(item){if(!item.alt){return item.src}})';

    executeChromeScript(GET_ALL_IMAGES, getImagePredictions);

    function getImagePredictions(results) {
      results[0].map(function(url) {
        if (url && url.length > 0) {
          getPrediction(url, selectedModelId);
        }
      });
    }

    function getPrediction(imgurl, modelId) {
      fetch(`${EINSTEIN_VISION_URL}?imgurl=${imgurl}&modelId=${modelId}`)
        .then(resp => resp.json())
        .then(d => setImageAlterativeTextCode(imgurl, d));
    }

    function setImageAlterativeTextCode(url, label) {
      const filename = url.substring(url.lastIndexOf("/") + 1);
      if (!label.error) {
        const code =
          'var selectedImage = document.querySelector(`img[src*="' +
          filename +
          '"]`);selectedImage.setAttribute("alt","Image may contain ' +
          label.prediction +
          '");';
        executeChromeScript(code);
      }
    }
  });
});
